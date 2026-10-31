# Delivery runbook (for Claude, when an order arrives)

1. `cd tools/audit && npm install` (fresh container)
2. `node audit.js --client "<Store>" --out ../../reports/<slug> <url1> <url2> ...`
3. **Manual review.** Never ship an automated-only report. Open each page with Playwright and check:
   - The main menu and mobile drawer: keyboard open and close, Esc, focus returns, `aria-expanded`
   - The product page: variant pickers labelled, add-to-cart announces, quantity +/− named, image gallery keyboard-usable
   - The cart drawer and popups: focus moves in, is trapped, and returns. Close button is named
   - Forms: errors announced and linked to fields, `autocomplete` set
   - Colour contrast of sale badges and buttons on hover and focus
   - Carousels: pause control, no auto-advance trap
   - Overlay present: explain removal
4. Replace `MANUAL_REVIEW_PLACEHOLDER` in report.html with findings. Each gets: where, who it affects, and a fix with theme-specific code (for Shopify, name the exact file, such as `sections/header.liquid`).
5. Fix Report tier: make sure every critical and serious finding has a code fix. Done For You tier: also produce a patched theme zip or diff.
6. Sanity-check: at least 5 actionable fixes (the guarantee), no compliance or legal claims, the store name spelled right.
7. Log the order in `ops/LEDGER.md` (date, client, tier, price, channel). No personal data beyond the business name.
