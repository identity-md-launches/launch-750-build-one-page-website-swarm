# Swarm Made design system

## Overview

Swarm Made is a single-page introduction to the $MADE community token. The typographic `0 → 1` mark, its amber terminal point, and the numbered sections describe a beginning. The page gives the token facts and external destinations without an account, wallet connection, or live market data.

The implementation is in `index.html`, `src/style.css`, `src/main.ts`, and `public/theme-init.js`. Static HTML is the content source; CSS classes are reusable patterns, not framework components. The visual direction is related to imd.fun through monospace type, space, flat surfaces, and hairline borders. The $MADE wordmark and amber accent belong to this site. Attribution appears once in the footer.

## Colors

All colors use hexadecimal primitives and semantic CSS custom properties in `src/style.css:1`. Components consume the semantic layer. `data-theme` on the root is the JavaScript-controlled theme switch. The light media query only applies when that attribute is absent, preserving the system theme when JavaScript is disabled.

| Semantic token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--page` | `#111110` | `#f6f6f0` | Page background |
| `--surface` | `#191918` | `#eaeae2` | Contract panel |
| `--hover` | `#282825` | `#d8d8ce` | Neutral control hover fill |
| `--text` | `#f6f6f0` | `#111110` | Primary text and hover labels |
| `--muted` | `#a4a49a` | `#65655d` | Descriptions and secondary labels |
| `--line` | `#3e3e38` | `#bdbdb3` | Decorative separators and panel boundaries |
| `--control-line` | `#85857b` | `#65655d` | Interactive control boundaries |
| `--accent`, `--focus` | `#f5a623` | `#915600` | Brand details, primary fill, focus ring |
| `--accent-hover` | `#ffbd51` | `#754500` | Primary action hover |
| `--on-accent` | `#111110` | `#f6f6f0` | Filled action and selection text |
| `--allocation-secondary` | `#bdbdb3` | `#3e3e38` | Swarm segment |
| `--allocation-tertiary` | `#65655d` | `#85857b` | Launcher segment |

The accent also marks the hero arrow, section indices, and progress endpoint; shape, text, borders, placement, and underlines identify interactions. Allocation percentages remain visible in text, so the decorative bar is not the only carrier of information. Copy success and errors use written messages rather than separate status hues. Hovering the theme button or a resource link changes its secondary label to `--text` to retain contrast.

Rendered contrast measurements are in `artifacts/contrast.json`. Body text is 17.42:1 in both themes; muted panel labels are 7.00:1 dark and 4.86:1 light. Primary action text is 9.32:1 dark and 5.48:1 light.

## Typography

The entire page inherits `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`. There are no font files or font requests. Chromium inspection identified the local **Liberation Mono** fallback; other operating systems will choose their available system face.

| Role | Size | Line height / tracking |
| --- | --- | --- |
| Body and contract address | `1rem` (16px) | 1.6 body; 1.7 address |
| `--text-caption` | `.75rem` (12px) | Inherits 1.6 |
| `--text-small` | `.8125rem` (13px) | Inherits 1.6 |
| `--text-ui` | `.875rem` (14px) | Inherits 1.6 |
| Wordmark | `1.25rem`, weight 700 | 1.6; 1.125rem below 24rem |
| H1 name | `clamp(1.75rem, 3.4vw, 2.5rem)` | 1.2 / −.055em |
| H2 section labels | `.875rem` | 1.6 |
| Statement paragraphs | `clamp(1.25rem, 2.5vw, 1.75rem)` | 1.4 / −.035em |
| Hero mark | `clamp(8rem, 25vw, 21rem)` | 1.1 / −.08em |
| Mobile hero mark | `clamp(6rem, 28vw, 12rem)` | 1.1 / −.08em |
| Supply | `clamp(1.75rem, 4.6vw, 3.25rem)` | 1.3 / −.06em |
| Allocation percentage | `2.5rem`; percent sign `1.25rem` | 1.2 / −.06em |

Weight 400 is the default, with 700 for the wordmark. Tabular numerals are enabled at the root. The hero arrow is .8em, and the amber period is .48em. Section labels and interface actions use lower case; product names, facts, and prose keep their natural case. Descriptions have a 62ch maximum and origin prose 59ch, with `text-wrap: pretty`. Headings use `balance`. The full address wraps anywhere and stays selectable, without ellipsis. No useful content is truncated.

## Layout

`--space-*` defines a rem scale: 1→4px, 2→8px, 3→12px, 4→16px, 6→24px, 8→32px, 12→48px, 16→64px, 20→80px, 24→96px at the default root size.

`.site-shell` is centered with a 1200px outer maximum and 48px inline padding. The header is at least 100px high and allows wrapping. The hero places its metadata above the mark and the name and primary action below it. `.section` uses a 1:3 label/content grid, 32px gap, and 80px vertical padding. `.section-content` has `min-width: 0` so long content can wrap. Allocation cells auto-fit with a 10rem minimum capped to their available width.

| Breakpoint | Implemented change |
| --- | --- |
| At or below 60rem (960px default) | 32px page padding, 1:4 section grid, vertically grouped section number/title, stacked origin links |
| At or below 44rem (704px default) | 24px page padding; navigation below wordmark/theme; metadata, hero content, and sections stack; full-width inset buy link; 48px section padding; allocation becomes label/value rows; footer wraps |
| At or below 24rem (384px default) | 16px page padding, tighter wordmark/control spacing, supply symbol on its own line |

Navigation and header flex wrapping, plus auto-fitting allocation columns, also accommodate enlarged text independently of viewport breakpoints. Logical padding, margins, and borders carry the structure. There is no sticky header or fixed height on text containers. Section anchors have 32px scroll margin.

The production export was checked at 320, 390, 768, and 1440 CSS pixels in both themes. At 768px, a doubled root font size also reflowed without horizontal page overflow. This is a text-enlargement check, not browser-native zoom. The page is English-only; RTL and translations were not tested.

## Elevation & Depth

The surface system is flat. There are no shadows, gradients, blur effects, or overlays. Hairline separators organize sections; the slightly different contract-panel fill groups the address and actions. Interactive borders use `--control-line`, which is stronger than decorative `--line`. Only the keyboard skip link has a stacking level (`z-index: 10`).

## Shapes

All panels and controls have square corners. Borders are 1px. The focus perimeter is 2px with a 5px offset. The allocation bar is 8px high with 3px gaps; its 88:10:2 flex proportions are decorative approximations with exact amounts beside them. The 0-to-1 progress rule is 1px with a 5px endpoint. The locally bundled favicon is a small `01` wordmark, not an illustration.

## Components

| Pattern / source | Behavior and states |
| --- | --- |
| `.wordmark`, `index.html:18` | $MADE plus the small 0 → 1 mark; native top anchor; footer variant uses 14px type |
| `.button-primary`, `index.html:36` | One filled amber buy link; URL preselects MADE on Ethereum; native same-tab navigation |
| `.button-secondary`, `src/main.ts:36` | Copy address; pending label and `aria-busy`; success with “copy again”; denied/unavailable clipboard selects the full address and gives a persistent manual-copy instruction; repeated requests are blocked while pending |
| `.theme-toggle`, `src/main.ts:3` | Button label names the destination theme; system preference until manually changed; persists under `made-theme`; storage errors leave current-visit switching usable; polite status announcement |
| `.contract-panel`, `index.html:46` | Full contract, chain ID, copy control, explorer link, persistent status area; untruncated code value |
| `.section`, `index.html:41` | Numbered label and content column; semantic H2 and anchored section; repeated for 00/01/02 |
| `.allocation-grid`, `index.html:66` | Native description list; percentage and absolute amount for each recipient; separate decorative proportional bar |
| `.resource-link`, `index.html:80` | Entire bordered tile is a native link, with secondary label and arrow; hover adds fill, stronger label contrast, and underline |
| `.skip-link`, `src/style.css:165` | First keyboard stop; visible on focus; Enter moves focus to main |

All interactive elements use native anchors or buttons. Visible targets are at least 44px high. The copy SVG is 18px with 1.5px `currentColor` strokes. Decorative glyphs are hidden from assistive technology. Hover treatments are guarded by `@media (hover: hover)`. Press states have a 2px outline; forced-colors mode uses system focus and border colors. There are no animations, transitions, toasts, dialogs, forms, or data-loading skeletons. Reduced-motion users get the same immediate state changes. JavaScript-only buttons remain hidden until initialized; static content, links, theme media fallback, and manual copying work without JavaScript.

## Do’s and don’ts

- Start additional content with `.section`, `.section-label`, and `.section-content`; reuse the spacing and semantic color tokens.
- Keep only the primary destination filled. Use native text or bordered links for secondary destinations.
- Preserve the full address, explicit amounts, lowercase labels, system monospace stack, and visible focus indicators.
- Keep the site’s $MADE identity, amber accent, square geometry, and open space. Green accents, gradients, rounded cards, mascots, external fonts, and IMD branding as the site’s own identity conflict with this implementation’s brief.
- Any future page needs its own exported HTML and relative assets; this site currently uses one page and hash navigation. Reuse the shell, theme initializer, stylesheet, and native controls, then validate the new export at the same widths.

Design review used the pinned Better Interface guidance by Jakub Krehel (MIT, commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`). This document’s organization is adapted from Paul Bakaus’s [Impeccable documentation reference](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md) (Apache-2.0), modified to describe this implementation. Both license notices are preserved in [docs/design-guidance-LICENSE.txt](docs/design-guidance-LICENSE.txt).
