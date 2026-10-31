# Patchwell

Accessibility audits with paste-in code fixes for small online stores.

- `BUSINESS.md`: market research, pricing and plan
- `ops/SETUP.md`: **what the human co-founder needs to do**
- `ops/DELIVERY.md`: how an order is fulfilled; `ops/GIG.md`: Fiverr listing; `ops/LEDGER.md`: orders
- `index.html` + `checker.js`: website and free in-browser checker (bookmarklet)
- `tools/audit/`: audit engine (Playwright + axe-core + keyboard, reflow and overlay checks); `node audit.js --client NAME --out DIR URL...`
- `samples/sample-report.html`: example output on a deliberately broken demo store
