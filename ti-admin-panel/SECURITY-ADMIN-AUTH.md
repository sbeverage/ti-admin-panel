# Admin panel authentication

Written 2026-09-15 after finding the admin secret committed to this repo.
Updated 2026-11-16: the cutover is complete. `ADMIN_SECRET_KEY` has been
rotated, no code reads it, and a per-person token is the only credential that
opens an admin route. See "What is still open" for what this did not fix.

## What was wrong

`src/services/api.ts` and `src/services/supabaseStorage.ts` each carried a
hardcoded `ADMIN_SECRET_KEY` as a fallback for when `REACT_APP_ADMIN_SECRET` is
unset. This repository is **public** (`github.com/sbeverage/ti-admin-panel`), so
that fallback was a published credential for the live admin API. It also sat in
five files under `DEPLOYMENT_FILES/` and in `update-live-admin.sh`, all leftovers
from the April migration off the Render backend.

Fixed in September: both fallbacks resolve to `''`, and the seven files holding
the literal are gone.

**The git history still contains it.** Scrubbing `HEAD` does not remove a value
from earlier commits, and the repo has been public for months, so the only thing
that actually revokes the old secret is rotating `ADMIN_SECRET_KEY` in Supabase.
Treat that value as compromised regardless of whether it still authenticates.

## The larger problem, and why it could not just be removed

Keeping the secret out of git closed the GitHub exposure. It did not close the
bundle one. This is a Create React App build, and `REACT_APP_*` variables are
**inlined into the static bundle at build time**. Verified again 2026-11-13 by
building twice and grepping `build/static/js/main.*.js`: with the variable set
the secret is in the bundle in plain text, with it unset it is not.

So until now the model was one static shared secret, readable by anyone who
could load the panel URL, granting every `/admin/*` route: donors, vendors,
approvals, payouts, reporting. No per-user identity, so no audit trail and no
way to revoke one person without rotating for everyone.

The login screen did not help. `POST /admin/settings/team/login` checked a
bcrypt password and returned a profile with **no token**, and the panel's entire
gate was `localStorage.setItem('admin_authenticated', 'true')`. That gated the
screen, not the API.

And the login endpoint itself sat behind the shared-secret check, so you needed
the secret in order to log in — which is exactly why the secret had to be
shipped to the browser. That circle is what made this hard to fix piecemeal.

## What is now built

Option 1 from the original plan: per-user, short-lived tokens.

- `supabase/functions/api/lib/adminAuth.ts` — mints and verifies an HS256 admin
  token signed with `JWT_SECRET`, the same key and the same djwt primitives the
  donor app already uses. Eight-hour expiry.
- `POST /admin/settings/team/login` is now **outside** the shared-secret check,
  breaking the circle. It did its own bcrypt check all along. It returns
  `token`, `expires_at` and `must_reset_password`.
- `routes/adminRouter.ts` requires a valid admin token in
  `Authorization: Bearer`. It accepted `X-Admin-Secret` as well between
  2026-11-13 and 2026-11-16, as a bridge so the Edge Function and the panel
  did not have to deploy together. That branch is gone.
- `lib/adminAuth.ts` also exports `isAdminRequest()`, used by the four routes
  that sit **outside** the `/admin` router and gate on admin credentials:
  `DELETE /auth/delete-user`, the data-deletion handler, `POST` and `DELETE
  /charities`, and `/uploads`. Each used to carry its own copy of the secret
  comparison, so they did not learn about tokens when the router did, and
  `DELETE /auth/delete-user` broke the moment the panel stopped sending a
  secret. One helper now, so the next change cannot miss a copy.
- `src/services/adminSession.ts` — one place that stores the token and the
  profile. `api.ts` and `supabaseStorage.ts` send the token and nothing else.
- `hooks/useAuth.ts` treats "signed in" as holding an unexpired token rather
  than a localStorage flag that anyone could set from a console.

A donor's app token cannot be used as an admin token even though both are
signed with `JWT_SECRET`: admin tokens carry `kind: "admin"` and `sub`, and the
verifier requires both. Covered by the decision table below.

Two things fixed alongside, because they were part of the same weakness:

- The login used to set `must_reset_password: false` on **every** successful
  sign-in, so a temporary password emailed to a new admin silently became their
  permanent one. It is no longer cleared on login; only the reset-password
  endpoint clears it, and the panel warns while it is set.
- Failed sign-ins are now counted, and five failures lock the account for
  fifteen minutes. This did not matter while the secret gated the login route.
  It matters now that the route is public. Requires
  `supabase/migrations/RUN_ME_admin_login_lockout_2026-11-13.sql`; without it
  the lockout is inert and login still works.

### Verified

24-case decision table (`scratchpad/adminauthtest.mjs`): login reachable with
no credential; every other route refused with none; the shared secret refused,
alone and alongside a donor token; admin token accepted; expired, forged,
garbage and empty tokens refused; a donor app token refused; a donor token
whose `role` is `admin` refused; the Supabase anon key refused; DELETE on a
donor refused without a credential and allowed with a token; and the same
matrix again for the four routes outside the `/admin` router.

Against the live Edge Function after rotation (2026-11-16), the old secret is
now indistinguishable from sending nothing:

```
admin donors,        old secret -> 401
delete-user,         old secret -> 401 "Authentication required."
delete-user,         no cred    -> 401 "Authentication required."
hard DELETE charity, old secret -> 401
uploads,             old secret -> 401
public charities                -> 200   (function healthy)
login, no credential            -> 400   (still public, as intended)
```

## The cutover, as it was done

1. **Deploy the Edge Function.** Dual-accept meant nothing broke: the panel
   kept working on the secret.
2. **Run `RUN_ME_admin_login_lockout_2026-11-13.sql`** in the Supabase SQL
   editor. Not `supabase db push` — this project's migration history is out of
   sync.
3. **Deploy the panel.** Confirmed `admin_token` in localStorage and
   `Authorization: Bearer ey...` on admin requests.
4. **Delete `REACT_APP_ADMIN_SECRET` in Vercel** and redeploy. Verified the new
   bundle no longer contains the value, and that no environment (production,
   preview or development) still defines the variable.
5. **Rotate `ADMIN_SECRET_KEY`** in Supabase. This is the step that actually
   revoked the exposure; see below.
6. **Remove dual-accept** from `adminRouter.ts` and `isAdminRequest()`, and the
   `X-Admin-Secret` fallbacks from `api.ts` and `supabaseStorage.ts`.

### Why step 4 alone would not have been enough

Vercel keeps every past deployment permanently reachable at its own URL, and
each was built with `REACT_APP_ADMIN_SECRET` set, so each bundle still carries
the old key. Verified 2026-11-15: three historical deployments answered 200 and
served their original bundles. Deleting the variable and redeploying only
cleans the *next* bundle. It does not unpublish the previous ones, and those
URLs are not secret — they appear in build logs, dashboards and deploy
notifications. Together with the value sitting in this repo's public git
history, the old `ADMIN_SECRET_KEY` has to be treated as published forever.
Only rotation revoked it.

Those historical URLs are still public. **Vercel Deployment Protection** puts
them behind authentication and is worth enabling; it is not done.

A `.env.local` holding the old secret was kept on the maintainer's machine as a
way back in during the cutover. It is dead weight now.

## Still not solved

- **Vercel Deployment Protection is not enabled**, so every historical and
  preview deployment URL is still publicly loadable. They no longer leak a
  working credential, but they are old copies of the admin UI.
- The token lives in `localStorage`, so script running on this origin could read
  it. Bounded by the eight-hour expiry. A HttpOnly cookie would close it and
  needs the API and the panel on one domain, which they are not.
- There is still no audit trail of which admin did what. The token now carries
  `sub`, so the handlers finally *can* record it. Nothing does yet.
- Admin passwords have no strength requirement and no reset-on-first-use flow
  beyond the warning the panel now shows.
