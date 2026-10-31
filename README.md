# The Screen-Free Family Reset

A printable 30-day kit for families who want less screen time and fewer fights, sold via Facebook and Instagram ads.

- `LAUNCH.md`: **start here**. Setup, ad copy, targeting, budget rules, profit model.
- `products/dist/`: the paid PDFs (30-page kit + 6-page Winter Break add-on). Keep this repo private.
- `products/src/`: kit content (`content.js`) and PDF builder (`build.js`). Rebuild: `cd products && npm install && cd .. && node products/src/build.js`
- `site/`: the public sales page (`index.html`) and post-purchase page (`thanks.html`)
- `ads/`: ad images and generator (`node ads/make-ads.js`)
