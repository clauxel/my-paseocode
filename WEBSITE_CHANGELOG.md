# Website Changelog

## 2026-07-09 00:09 CST - Pricing asset redirect loop guard

- Change summary: Adjusted Worker Assets lookup so clean static pages such as `/pricing/` are fetched through their public directory URL before any index-file fallback, avoiding a self-redirecting 307 response from the asset layer.
- Touched files: `worker/index.js`.
- Verification: pending `npm test`, Worker deploy, and live `/pricing/` post-deploy check.
- Deployment/Git status: pending commit, push, deploy, and live verification at entry time.

## 2026-07-08 23:05 CST - Live patrol follow-up cleanup

- Change summary: Shortened generated homepage title metadata after live patrol found the postbuild title still above the target length.
- Verification: rebuilt the affected static output or router bundle and reran local metadata/route checks before redeploy.
- Deployment/Git status: pending commit, push, redeploy, and live post-deploy verification at entry time.

## 2026-07-08 22:00 CST - Top decile patrol SEO repair

- Change summary: Removed the duplicate hidden H1 pattern and added noindex 404 handling for unknown clean paths.
- Verification: local build/test/patrol checks were run for the affected surface before commit; production deployment and live verification are tracked in the release pass for this patrol batch.
- Deployment/Git status: pending commit, push, deploy, and live post-deploy verification at entry time.

## 2026-06-08 16:06:51 CST - SEO/GEO + Build Checklist Repair

Scope: repaired P0/P1 checklist issues for paseocode.space.

Touched files:
  - paseocode/dist/index.html
  - paseocode/dist/pricing/index.html
  - paseocode/dist/robots.txt

Verification: ran the shared SEO/GEO patrol fixer from the latest all-sites checklist input; 9router build also passed after shared route guard changes.

Deploy/Git status: pending commit, push, deploy, and post-deploy checklist rerun.

Follow-ups: re-run the all-sites SEO/GEO + build checklist after production deployment and keep any DNS/account-only blockers in the issue ledger.

## 2026-07-01 - MiroFish contextual reference

- Added one contextual related-resource link to MiroFish AI Simulator with UTM tracking for paseocode.space.
- Placement rule: secondary Resources/Source context when available, otherwise the homepage tail; no hero, nav, pricing, checkout, or primary CTA links were changed.
- SEO safety: brand anchor only, one link per canonical site surface, visible editorial context, and no keyword-stuffed footer/sitewide block.
- Verification pending: run the site build/deploy workflow and live link checks after all portfolio edits are applied.
