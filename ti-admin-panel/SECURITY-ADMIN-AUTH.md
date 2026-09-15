# Admin panel authentication: current state and what it does not protect

Written 2026-09-15 after finding the admin secret committed to this repo.

## What was wrong, and what was fixed

`src/services/api.ts` and `src/services/supabaseStorage.ts` each carried a
hardcoded `ADMIN_SECRET_KEY` as a fallback for when `REACT_APP_ADMIN_SECRET` is
unset. This repository is **public** (`github.com/sbeverage/ti-admin-panel`), so
that fallback was a published credential for the live admin API. It also sat in
five files under `DEPLOYMENT_FILES/` and in `update-live-admin.sh`, all leftovers
from the April migration off the Render backend.

Fixed: both fallbacks now resolve to `''`, and the seven files holding the
literal are gone. The secret must come from `REACT_APP_ADMIN_SECRET`.

**The git history still contains it.** Scrubbing `HEAD` does not remove a value
from earlier commits, and the repo has been public for months, so the only thing
that actually revokes the old secret is rotating `ADMIN_SECRET_KEY` in Supabase.
Treat that value as compromised regardless of whether it still authenticates.

## What is still not protected

Keeping the secret out of git closes the GitHub exposure. It does not close the
larger one.

This is a Create React App build (`react-scripts build`, via `scripts/build.sh`).
`REACT_APP_*` variables are **inlined into the static bundle at build time** —
they are not server-side secrets. Confirmed directly: the last local build has
the secret in plain text in `build/static/js/main.*.js`, and the deployed bundle
Vercel serves is produced the same way.

So the current model is:

- one static shared secret,
- readable by anyone who can load the admin panel URL and open the JS bundle,
- granting full access to every `/admin/*` route: donors, vendors, approvals,
  payouts, reporting.

There is no per-user admin identity, so there is also no audit trail of which
admin did what, and no way to revoke one person's access without rotating the
secret for everyone.

Rotating into Vercel is still worth doing immediately — it invalidates a
credential that is sitting in public git history. But it moves the secret from
"in GitHub" to "in the served bundle"; it does not make it private.

## Fixing it properly

The real fix is that the browser must not hold a credential that grants admin
access. Two options, in order of preference:

1. **Admin login issuing short-lived per-user JWTs.** The app already does
   exactly this for donors: `supabase/functions/api/routes/auth.ts` signs HS256
   tokens verified against `JWT_SECRET`. An `/admin/login` route on the same
   pattern gives each admin their own identity, an expiry, and revocability,
   and `ADMIN_SECRET_KEY` stops being a client-side value at all. There is
   already a `settings/team/login` path referenced in `normalizeAdminBaseUrl`,
   so some of this may be partly built.

2. **A server-side proxy.** Move the secret to a Vercel serverless function that
   holds it as a real (non-`REACT_APP_`) env var and forwards to the Edge
   Function. Less work, but it only hides the secret — everyone still shares one
   identity and there is still no audit trail.

Either way `ADMIN_SECRET_KEY` should end up server-to-server only.

## Order of operations when rotating

`REACT_APP_ADMIN_SECRET` is already set in Vercel Production, so the source
change above does not break the live panel. To rotate:

1. Generate a new value: `openssl rand -hex 32`
2. Set `ADMIN_SECRET_KEY` in Supabase → Edge Functions → Secrets
3. Update `REACT_APP_ADMIN_SECRET` in Vercel → Settings → Environment Variables
4. Redeploy the panel so the new value is inlined into a fresh bundle
5. Confirm the panel loads donors, then confirm the old value now returns 401

Steps 2 and 3 must not be separated by long — between them, the deployed panel
is sending the old secret to an Edge Function expecting the new one, and the
panel will 401 on every request.

For local development, put the value in `.env.local` (gitignored). Without it
requests send an empty secret and the Edge Function answers 401, which
`api.ts` surfaces as a message naming the variable to set.
