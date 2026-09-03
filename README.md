# Cocoa &amp; Crumb by Ray

A static marketing site for Cocoa &amp; Crumb by Ray, a small-batch cookie business —
plus a 30-second "Grab Them All!" mini game.

Orders are taken by DM on Instagram: [@cocoaandcrumb_byray](https://www.instagram.com/cocoaandcrumb_byray/).
Collection only, no delivery.

## Stack

Plain HTML, CSS and JavaScript — no framework and no build step. The repository
*is* the site, so deploying is just a push.

[GSAP 3.15](https://gsap.com) drives the motion. The plugin files are **vendored**
into `vendor/gsap/` rather than loaded from a CDN, so the site keeps working
offline and on locked-down networks.

| Plugin | Used for |
| --- | --- |
| `gsap` | core tweens and timelines |
| `ScrollTrigger` | section reveals on scroll |
| `SplitText` | hero headline entrance |
| `Draggable` + `InertiaPlugin` | grabbing and throwing cookies in the game |

## Layout

```
index.html        homepage
game.html         the mini game
css/style.css     site styles, design tokens, palette
css/game.css      game-only styles
js/main.js        homepage motion
js/game.js        game logic
media/            optimised images actually shipped (WebP)
vendor/gsap/      pinned GSAP builds
Assets/           working originals - git-ignored, not deployed
```

## Design system

Colours come from the brand palette:

| Token | Hex | Role |
| --- | --- | --- |
| `--cream` | `#fefcf8` | flavours + game background |
| `--pink` | `#fec1d0` | hero and story sections, flavour blobs |
| `--peach` | `#fed1c1` | flavour blobs |
| `--yellow` | `#ffed9c` | game badge, HUD |
| `--brown` | `#6d412a` | all text, headings, buttons |
| `--brown-deep` | `#4e2f1e` | depth and button shadows only, never text |

Type:

| Token | Face | Used for |
| --- | --- | --- |
| `--font-hero` | Atma Bold | the hero wordmark only |
| `--font-script` | Yuyu | the "by Ray" signature only |
| `--font-display` | Fredoka | every other heading, nav, buttons |
| `--font-body` | Nunito | body copy |

Atma and Yuyu are **self-hosted** from `fonts/` as WOFF2 (OFL licensed — the
licence files sit beside them, which the OFL requires). Both are preloaded in
`index.html` since they paint above the fold. Fredoka and Nunito still come
from Google Fonts.

All text meets WCAG AA contrast. `--brown` clears 4.5:1 on every background in
the palette (5.64:1 at worst, on the full pink), so one brown carries all text
and `--brown-deep` is reserved for shadows.

## Notes for future edits

- **Cookie images** are cut out from photos shot on plain white. To add one,
  shoot it top-down on white and remove the background with a flood fill from
  the image borders — a plain white-threshold key eats white chocolate chips
  and frosting.
- **The blob morph is CSS, not GSAP** (`@keyframes blobMorph`). GSAP's string
  interpolation drops the `/` half of an 8-value `border-radius`, which
  flattens the blobs into squircles.
- **The flavour name rings sway rather than rotate.** A full rotation turns the
  name upside-down for half of every cycle.
- The pink bag appears **only in the game** — it is not the real packaging.
- **The header is transparent at the top of the page** and only gains its bar
  and underline once scrolled, so the hero reads as one clean field. It also
  hides on scroll down and returns on scroll up.
- Smooth scrolling is ScrollSmoother at `smooth: 1`. Fixed elements (nav, game
  badge, cursor cookie) must stay **outside** `#smooth-content` or they scroll
  away with the page.
- **The "by Ray" signature is zero-width** (`flex:0 0 0; width:0`) and offset
  with a transform. Give it real width and it pushes "& CRUMB" 37px off-centre
  from "COCOA".
- **The hero type carries a pink halo** (`text-shadow` in `--pink`). Cookies fly
  behind the wordmark, and brown text over a brown cookie loses contrast; the
  halo is invisible on flat pink but separates the type from anything passing
  behind it.
- **Order CTAs are magnetic** (`[data-magnetic]`). They lean toward the cursor
  at 0.34 of its offset while it is within 80px of the button, then spring back
  with an elastic ease. GSAP owns their inline transform, so the CSS `:hover`
  lift is disabled for them or the two fight.
- **The footer overlaps the order section by 1px** (`margin-top:-1px`). Both are
  brown, but ScrollSmoother translates by fractional pixels, so the seam rounds
  independently and flashes a hairline of the cream body while scrolling.
- `prefers-reduced-motion` is respected throughout.

## Running locally

```bash
python devserver.py
```

Then open <http://localhost:5173>.

Use `devserver.py` rather than `python -m http.server`: the built-in server
sends no `Cache-Control`, so browsers hold on to stale CSS and JS and you end
up debugging an edit that already shipped. This one sends `no-store`.

## Deployment

Deployed as a static site to GitHub Pages, with Cloudflare Pages as a second
deploy from the same repository. No build command; the site root is the
repository root.
