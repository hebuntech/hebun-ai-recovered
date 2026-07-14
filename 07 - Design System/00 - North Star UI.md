# North Star UI — Hebun AI Design System

> The single source of truth for the look, feel, and behavior of every Hebun AI product. Read this first. Every screen, current and future, is built from the tokens and components defined here.

**Scope:** `hebun.ai` · Hebun Commerce · Turkish Rug House Admin · Enterprise Dashboard · ChatGPT-native Apps. One language across all five.

---

## 1. Visual language (extracted from the North Star reference)

The reference brand board defines the direction. We do not copy it literally — we encode its DNA:

- **Dark-first, near-black canvas** (`#0B0F19`). Deep, calm, focused. Light theme is derived, not separate.
- **Indigo→violet as the signature.** `#6366F1 → #8B5CF6` is the brand gradient — used on the logo, hero, primary nodes, and key emphasis. Color is an *accent*, not a coat of paint.
- **Four-gradient system** (primary, ocean, sunset, purple) for visual energy, used decoratively and on data.
- **Plus Jakarta Sans**, one typeface, clean geometric hierarchy.
- **Soft, layered surfaces.** Elevation = lighter surface + soft large-blur shadow + faint top hairline. No hard edges, no harsh shadows.
- **Generous space, low noise.** 8px grid, breathing room, restraint. Clarity reads as intelligence.
- **Subtle glass** on floating chrome (nav, palette), never on dense data.
- **AI-native motifs:** node/network graphs, agent avatars, gradient glow accents — the product looks like it thinks.

---

## 2. Design principles

The product should feel: **Enterprise · Premium · Minimal · AI-native · Fast · Confident · Trustworthy.**

Operationalized:

1. **Clarity over decoration.** If an element doesn't carry meaning, remove it. Whitespace is a feature.
2. **One accent, used with intent.** Brand color marks the primary action, active state, links, and data — nothing else. A screen drowning in indigo is a failure.
3. **Hierarchy through weight and space, not color.** Size, weight, and spacing rank content. Color signals state.
4. **Fast and responsive.** Sub-300ms interactions. Skeletons over spinners. Optimistic where safe.
5. **Confident, plain language.** No cute copy, no hedging. Empty and error states tell the user exactly what to do.
6. **Consistent, not novel.** Reuse components. Novelty is debt. The same button looks the same everywhere.
7. **Trust through polish + accessibility.** Tight alignment, real contrast, keyboard support. Enterprise buyers read sloppiness as risk.

**Anti-noise checklist** — reject a screen if: more than one primary button, more than ~2 gradients in view, color used for decoration, borders fighting shadows for elevation, text below 16px for body, or any blank state with no guidance.

---

## 3. How the system is organized

| File | Owns |
|---|---|
| [00 - North Star UI](00%20-%20North%20Star%20UI.md) | This overview, visual language, principles |
| [01 - Brand Identity](01%20-%20Brand%20Identity.md) | Logo, wordmark, brand values, voice, gradients-as-brand |
| [02 - Landing Page](02%20-%20Landing%20Page.md) | Marketing/`hebun.ai` layout rules |
| [03 - Dashboard UI](03%20-%20Dashboard%20UI.md) | Dashboard layout rules + widgets |
| [04 - Admin Panel](04%20-%20Admin%20Panel.md) | Admin/back-office layout rules |
| [05 - Components](05%20-%20Components.md) | The reusable component library |
| [06 - Color Tokens](06%20-%20Color%20Tokens.md) | Color token system (the API) |
| [07 - Typography Tokens](07%20-%20Typography%20Tokens.md) | Type scale + rules |
| [08 - Design Tokens](08%20-%20Design%20Tokens.md) | Spacing, radius, shadow, gradient, glass, motion, layout, z-index |
| [09 - Mobile Rules](09%20-%20Mobile%20Rules.md) | Responsive + mobile patterns |
| [10 - Accessibility](10%20-%20Accessibility.md) | A11y guidelines, contrast, keyboard, ARIA |

**The dependency direction:** Tokens (06/07/08) → Components (05) → Layouts (02/03/04). Never the reverse. A layout never defines a new color; it uses a component; a component uses a token.

---

## 4. The golden rule

> **Reuse, don't reinvent.** Every future screen composes existing components styled by existing tokens. If you need something new, add it to the token/component layer first — then everyone gets it. The day two products draw the same button differently, the system has failed.

Token layers, naming, and the full theming model are in [06 - Color Tokens](06%20-%20Color%20Tokens.md). Start there for implementation.
