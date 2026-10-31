# Beamline: business plan

*Started from scratch on 2026-10-31.*

## One line
**Beamline is a free daily logic puzzle for people who want two minutes of thinking, not two hours of grinding.** You bend a laser with mirrors to light every crystal, and your score is how few mirrors you used.

## Why this business
- **Daily puzzles are a proven habit format.** One shared puzzle a day gives people a ritual, a streak to protect and something to talk about. People share a spoiler-free grid of results, and that sharing is how the game grows.
- **Word puzzles are crowded. Spatial logic puzzles aren't.** Beamline needs no vocabulary and no particular language, so it works worldwide from the first day.
- **It costs almost nothing to run.** Every puzzle is generated from the date inside the browser. There's no server, no database and no content team for the free tier. A static host costs about $0 at any scale up to millions of plays.
- **The format scales.** Par, wall layout, board size and new pieces (splitters, coloured filters, portals) give years of variety without redesigning the core.

## Customers
| Segment | Who | What they pay for |
|---|---|---|
| Daily players | Commuters and coffee-break puzzlers, aged 25–55, who already play a daily word game | Nothing, and that's fine. They are the growth engine. |
| Enthusiasts (about 2–4% of daily players) | Streak keepers and people who play every puzzle | **Beamline Plus**: archive, endless boards, monthly hand-made "Prism" packs, sync |
| Publishers | Newsletters, local news sites, school portals, company intranets | **Beamline Syndicate**: an embeddable branded daily puzzle and printable PDFs |

## Revenue model
1. **Beamline Plus: $3/month or $24/year.** No ads, ever, in any tier. Ads would undercut the "calm two minutes" brand.
2. **Beamline Syndicate: from $49/month.** Pricing goes up with audience size: $49 for up to 10k readers, $149 for up to 100k, custom above that. Most of the margin will come from here.
3. *Later:* a print book of puzzles ("Beamline: 365") and a one-off classroom licence.

### Year-one model (conservative)
| | Q1 | Q2 | Q3 | Q4 |
|---|---|---|---|---|
| Daily active players | 2,000 | 8,000 | 20,000 | 40,000 |
| Plus subscribers (2%) | 0 (beta) | 160 | 400 | 800 |
| Syndicate customers | 0 | 2 | 6 | 12 |
| Monthly recurring revenue at quarter end | $0 | ~$560 | ~$1,600 | ~$3,200 |

Costs in year one: domain ($15), static hosting ($0–20/mo), payment processor fees (~5%), a small sync backend once Plus launches (~$25/mo). **Break-even comes almost immediately. The real cost is time.**

## What's built today (MVP, in this repo)
- [x] A deterministic daily puzzle generator. Every puzzle is solvable and has a known par. Tested on 2,000 consecutive days with zero failures and no puzzles that can be solved without mirrors.
- [x] A playable board that works on mobile and with a keyboard, with an animated beam and a mirror budget.
- [x] Streaks and stats stored locally. No accounts and no tracking.
- [x] A spoiler-free share grid (the growth loop).
- [x] A practice board, the first Plus feature, free during the beta.
- [x] A landing page with honest pricing (no payments are taken yet).

## Roadmap
**Next 30 days: launch**
- Register a domain and point it at GitHub Pages
- Post to r/puzzles, Hacker News (Show HN), puzzle Discords and newsletters
- Add privacy-respecting analytics (Plausible/GoatCounter) to measure daily actives and share rate
- Have a human designer review a week of puzzles ahead of time and hand-pick the weekend boards to be harder

**Days 30–90: validate**
- Add a waitlist for Plus and Syndicate, with the goal of 300 signups before writing payment code
- Add difficulty tiers: Mon–Thu 7×7, Fri–Sun 8×8 with splitters
- Prototype the publisher embed (an iframe and a script tag)

**Days 90–180: monetise**
- Take Plus payments with Stripe Checkout and add sync behind a tiny backend
- Sign the first three Syndicate customers by hand
- Release the first Prism pack (splitter mirrors)

## Key metrics
- **D1/D7/D30 retention** of daily players. Target D7 above 35%.
- **Share rate**: share clicks divided by solves. Target above 15%.
- **Plus conversion**: target 2% of 30-day actives.
- **Syndicate pipeline**: number of conversations and pilots.

## Risks and answers
| Risk | Answer |
|---|---|
| Puzzles feel samey | Rotate a weekly mechanic and hand-curate weekend boards. The generator gives par, and humans add the taste. |
| A clone appears | Brand, streaks and the publisher relationships are the moat, not the mechanic. |
| Puzzles are too easy at par+1 | Budget = par + 1 is tunable per weekday. Record median mirrors used and adjust. |
| Players in different timezones see different boards | This is deliberate (local midnight rollover). Add a "global puzzle number" if it confuses people. |

## What a human needs to do (I can't)
I can design, build and plan. Turning Beamline into a real company needs someone to:
1. Pick and register the legal entity and a domain
2. Open a Stripe account and a business bank account
3. Do the launch posts under a real account and talk to the first publishers
4. Confirm the name "Beamline" is clear to use (trademark search) and pick another if it isn't
