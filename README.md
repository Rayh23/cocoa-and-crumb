# Cocoa & Crumb by Ray

An interactive marketing site for my small-batch cookie business, built from
scratch with vanilla HTML, CSS and JavaScript, with a 30-second drag-and-catch
cookie game tucked inside.

I designed the brand, visual system, content, assets and interaction direction,
then used Claude Code as an AI pair programmer to turn that specification into a
working site.

The result is a small project, but it became a useful experiment in AI-assisted
development, human evaluation and knowing when a technically successful solution
isn't actually the right one.

**Live:** https://rayh23.github.io/cocoa-and-crumb

**Instagram:** [@cocoaandcrumb_byray](https://www.instagram.com/cocoaandcrumb_byray/)

---

## What I built

I wanted to make more than a bakery template. The site combines a playful visual
identity with real product photography, animated interactions, collection-only
ordering, and a small game designed to give visitors a reason to explore.

The project was also an experiment in AI-assisted development. I used Claude Code
as a pair programmer for implementation, debugging, image processing and
optimisation, but treated its output as something to evaluate rather than
something to blindly accept.

That distinction mattered.

Claude could make something technically better according to a metric while making
the actual result worse. For example, an image-cleanup process reduced the
measured amount of background colour on a cookie edge, but it was doing so by
deleting real coconut flakes. I caught the problem visually, changed the
evaluation criteria, and corrected the pipeline.

The lesson: AI can accelerate implementation, but it still needs someone who
understands the intended outcome well enough to recognise when the optimisation
target is wrong.

---

## Highlights

- Built as a framework-free static site with no build step or backend.
- Created custom interactions with GSAP, including smooth scrolling, magnetic
  buttons, cursor-following effects and draggable game mechanics.
- Processed and optimised my own cookie photography rather than using stock
  imagery.
- Built an image background-removal approach using edge-connected flood fill to
  preserve white ingredients such as coconut and white chocolate.
- Audited 55 text elements for WCAG AA contrast and corrected an initially
  failing colour combination.
- Added `prefers-reduced-motion`, keyboard interaction and screen-reader feedback
  for the game.
- Self-hosted fonts and optimised images, keeping the deployed site at
  approximately 2.3 MB.
- Deployed the same repository through GitHub Pages and Cloudflare Pages.

---

## Tech

HTML · CSS · JavaScript · GSAP · Git · GitHub Pages · Cloudflare Pages · Python

---

## AI-assisted development

Claude Code was used throughout the project as a development partner rather than
an autonomous builder.

I used it for:

- implementation and refactoring
- debugging and investigating browser behaviour
- image-processing workflows
- font conversion and optimisation
- accessibility and contrast calculations
- exploring alternative solutions to technical problems

I remained responsible for the design direction, technical decisions, evaluation
criteria and final implementation.

The project reinforced something I think is increasingly important when working
with AI: knowing when the output is wrong can be more valuable than knowing how
to generate it.

---

## Selected engineering challenges

A few of the problems I encountered were less about writing code and more about
understanding why seemingly reasonable solutions failed.

### GSAP + complex border-radius interpolation

GSAP did not correctly interpolate the eight-value blob shapes I was using, so I
moved the morphing animation to CSS keyframes.

### Smooth scrolling + fixed positioning

ScrollSmoother's transformed wrapper changed the behaviour of `position: fixed`,
so elements that needed viewport positioning were moved outside the smooth-scroll
container.

### Image background removal

A simple white-pixel threshold would have removed parts of the actual product
because the cookies contained white chocolate, coconut and lemon. I instead used
flood fill from the image borders so only white connected to the background was
removed.

### Animation state management

A `quickTo`-based magnetic button animation stopped working after its first
interaction because a spring-back tween was overwriting the follow tweens. The
fix required understanding GSAP's `overwrite` behaviour rather than simply
increasing animation settings.

---

## Accessibility & performance

- WCAG AA contrast checked programmatically
- `prefers-reduced-motion` support
- Touch-specific behaviour for mobile devices
- Keyboard-accessible flavour interactions
- Screen-reader announcements for game score changes
- Self-hosted WOFF2 fonts
- WebP image assets
- Approximately 2.3 MB deployed

---

## Running locally

```bash
python devserver.py
```

Then open <http://localhost:5173>.

The custom development server sends no-cache headers so the browser doesn't serve
stale CSS and JavaScript during development.

---

## Structure

```
index.html        homepage
game.html         mini game
css/style.css     site styles and design tokens
css/game.css      game-only styles
js/main.js        homepage motion
js/game.js        game logic
media/            optimised WebP assets
fonts/            self-hosted WOFF2 fonts
vendor/gsap/      pinned GSAP builds
Assets/           working originals, git-ignored
```
