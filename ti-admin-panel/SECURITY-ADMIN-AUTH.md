# Admin panel authentication

Written 2026-09-15 after finding the admin secret committed to this repo.
Updated 2026-11-13: option 1 below is now built. The cutover is not finished —
see "What is left" before assuming this is closed.

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
- `routes/adminRouter.ts` accepts **either** a valid admin token in
  `Authorization: Bearer` **or** the legacy `X-Admin-Secret`. Dual-accept is a
  bridge so the Edge Function and the panel do not have to deploy together.
- `src/services/adminSession.ts` — one place that stores the token and the
  profile. `api.ts` and `supabaseStorage.ts` send the token when there is one
  and fall back to the secret only when there is not.
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

16-case decision table (`scratchpad/adminauthtest.mjs`): login reachable with no
credential; every other route refused with none; legacy secret accepted; wrong
secret refused; admin token accepted; expired, forged, garbage and empty tokens
refused; a donor app token refused; a donor token whose `role` is `admin`
refused; the Supabase anon key refused; DELETE on a donor refused without a
credential and allowed with a token.

The decision table proves the predicate, not the deployment. The gate has not
been exercised against the live Edge Function.

## What is left

**The exposure is unchanged until `REACT_APP_ADMIN_SECRET` is removed from
Vercel.** While it is set, react-scripts inlines it into every bundle Vercel
builds, whether or not the code prefers the token.

Order matters:

1. Deploy the Edge Function. Dual-accept means nothing breaks: the panel keeps
   working on the secret.
   `supabase functions deploy api --project-ref mdqgndyhzlnwojtubouh`
2. Run `RUN_ME_admin_login_lockout_2026-11-13.sql` in the Supabase SQL editor.
   Not `supabase db push` — this project's migration history is out of sync.
3. Deploy the panel. Sign in. Confirm the Network tab shows
   `Authorization: Bearer ey...` and **no** `X-Admin-Secret` on admin requests.
4. Delete `REACT_APP_ADMIN_SECRET` in Vercel → Settings → Environment
   Variables, and redeploy so a fresh bundle is built without it. Confirm with:
   `curl -s https://admin.forpurposetechnologies.com/ | grep -o '/static/js/main[^"]*'`
   then grep that file for the secret. It should not be there.
5. Rotate `ADMIN_SECRET_KEY` in Supabase → Edge Functions → Secrets
   (`openssl rand -hex 32`). This is what finally revokes the value sitting in
   public git history. Nothing in the browser needs it any more, so unlike
   every previous rotation it does not go straight back into a bundle.
6. Remove the dual-accept branch from `adminRouter.ts` and the
   `X-Admin-Secret` fallbacks from `api.ts` and `supabaseStorage.ts`, so there
   is one way in.

Steps 1 to 3 are safe to do at any pace. **Step 4 is the one that closes the
hole**; step 5 is what makes the old, already-public value stop working.

Keep a local `.env.local` with the secret until step 5, as a way back in if
something goes wrong with token auth. After step 5 it is dead weight; delete it.

## Still not solved

- The token lives in `localStorage`, so script running on this origin could read
  it. Bounded by the eight-hour expiry. A HttpOnly cookie would close it and
  needs the API and the panel on one domain, which they are not.
- There is still no audit trail of which admin did what. The token now carries
  `sub`, so the handlers finally *can* record it. Nothing does yet.
- Admin passwords have no strength requirement and no reset-on-first-use flow
  beyond the warning the panel now shows.
