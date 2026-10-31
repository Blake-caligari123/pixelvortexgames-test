# Beamline

A free daily light-routing puzzle and the small business built around it. See [BUSINESS.md](BUSINESS.md) for the plan.

- `index.html`: landing page and game (no build step; open it in a browser)
- `js/beamline.js`: puzzle engine (deterministic generator and beam tracer, no DOM, also loadable in Node)

Run locally: `python3 -m http.server` and open http://localhost:8000.
