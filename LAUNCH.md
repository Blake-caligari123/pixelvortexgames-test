# Launch playbook: The Screen-Free Family Reset

**Product:** a 30-page printable kit ($24) plus a Winter Break add-on ($33 bundle). Instant PDF download, sold through Facebook and Instagram ads.
**Files:** `products/dist/*.pdf` (the paid products) · `site/` (sales page) · `ads/*.png` (ad images)

---

## 1. Setup (your part, about 1 hour)

1. **Make this repo private** (Settings → General → Danger zone). The paid PDFs and their source live here.
   The website only ever publishes the `site/` folder, so the PDFs aren't on the web, but a public repo would expose them.
2. **Lemon Squeezy** (lemonsqueezy.com). Create a free account, a store and two products:
   - "The Screen-Free Family Reset", $24: upload `screen-free-family-reset.pdf`
   - "Family Reset + Winter Break Pack", $33: upload both PDFs
   - For each product: Settings → Confirmation → redirect to `https://YOURSITE/thanks.html?v=24` (or `?v=33`)
   - Copy both checkout links and send them to me, or paste them into `CONFIG.checkout` in `site/index.html`
   - Lemon Squeezy handles payment, instant download, receipts and sales tax. Its fee is 5% + 50¢.
3. **Host the sales page** (free). Either option works:
   - **Netlify Drop:** drag the `site/` folder onto app.netlify.com/drop. That's the easiest, and it works with a private repo.
   - **GitHub Pages:** merge to `main`, then Settings → Pages → Source: GitHub Actions. This needs GitHub Pro for a private repo.
4. **Meta Business account.** Create an ad account and a **Pixel**. Send me the Pixel ID, or paste it into `site/index.html` (`metaPixelId`) and `site/thanks.html` (`PIXEL_ID`).
   - Fill in `contactEmail` too (used for refunds and questions).
5. Buy one copy yourself with a 100% discount code to test the whole flow: ad → page → checkout → download → thanks page → Purchase event in Events Manager.

## 2. The ads

Upload the 4 images in `ads/` (1080×1080, plus a 1080×1350 portrait). Each gets its own primary text below.
**Rules:** no fake testimonials, no fake countdowns, no "doctor-approved" claims. Meta rejects ads that imply a viewer has a problem ("Is YOUR child addicted?"), so speak about the situation, not the person.

**Ad 1: Meltdown** (`ad1-meltdown.png`)
> Screen time ends… and the meltdown begins. Sound familiar?
> The Screen-Free Family Reset is a printable 30-day plan that makes switching off calmer, one small step at a time. It includes word-for-word phrases for the hard moments, a family agreement everyone signs, and 100 activities for when "I'm bored" hits.
> ✔ Instant download ✔ Print at home ✔ Ages 3–12
**Headline:** A calmer way to turn screens off · **CTA:** Shop now

**Ad 2: 100 activities** (`ad2-100-activities.png`)
> "I'm bored" has a new answer. 100 screen-free activity cards: forts, kitchen science, scavenger hunts, talent shows and more. Cut them out, drop them in a jar, and let the kids pull one.
> Part of a 30-day printable kit for families who want less screen time without the daily battle.
**Headline:** 100 things to do that aren't a screen · **CTA:** Shop now

**Ad 3: Winter break** (`ad3-winter-break.png`). Run from about Dec 1 to Jan 2.
> Two weeks of winter break. A lot of screens… and a lot of "I'm bored."
> This year, have a plan: 25 days of cozy screen-free activities, a calm daily rhythm, plus our full 30-day Family Reset kit. Print it tonight.
**Headline:** Your winter break screen-time plan · **CTA:** Shop now

**Ad 4: What's inside** (`ad4-whats-inside.png`)
> Everything you need to reset screen time in 30 days: a 30-day challenge calendar, family agreement, Earn Your Screen Time charts, 100 activity cards, an "I'm bored!" poster and a parent guide with meltdown scripts.
> $24 · instant PDF download · 30-day money-back guarantee.
**Headline:** The Screen-Free Family Reset · **CTA:** Shop now

## 3. Campaign setup

- **Objective:** Sales, optimised for **Purchase**. Needs the Pixel from step 4.
- **Countries:** United States and Canada to start. Avoid EU/UK at first, because tracking there needs a cookie-consent banner.
- **Audience:** Advantage+ audience (broad) with suggestions: parents, ages 25–50, interests such as "Parenting", "Toddlers", "Preschool", "Homeschooling", "Montessori". Broad usually beats narrow now, so let Meta find the buyers.
- **Placements:** Advantage+ (automatic).
- **Budget:** **one campaign, $15/day**, with all 4 ads in one ad set. The test runs **7 to 10 days, about $150 total.** Set an account spending limit of $150 so it can't overspend.

## 4. Decision rules (send me the numbers every 2–3 days)

| What we see | What it means | Action |
|---|---|---|
| Link click-through rate under 0.8% | Ad isn't grabbing attention | Turn that ad off; I'll write new hooks |
| Lots of clicks, few "Initiate checkout" | Sales page isn't convincing | I'll rework the page |
| Cost per purchase **under $20** | Winning | Raise budget 20% every 3 days |
| Cost per purchase **$20–35** | Close | Keep the best ad, I make 3 new variations |
| No purchase after $60 on an ad | Not working | Turn that ad off |
| No purchases at all after $150 | The offer isn't landing | Stop. We rethink the price, page or product. |

## 5. Profit model

We keep about **$26 per order** after fees, assuming about a third of buyers choose the $33 bundle.

| Visitors who buy | Cost per sale at ~$1/click | Profit per sale |
|---|---|---|
| 1.5% | ~$65 | −$39 (stop) |
| 3% | ~$33 | −$7 (improve) |
| 4.5% | ~$22 | **+$4** |
| 6% | ~$17 | **+$9** |

At $20/day in the good case: about 27 sales and **$100–250 profit a month**. Scaling to $100/day could mean **$800–1,500 a month**, but costs usually rise as you scale.
**Maximum test risk: $150.**

## 6. Refunds and support

Refunds are one click in Lemon Squeezy (Orders → Refund). Paste any customer emails to me and I'll draft the replies.
