# Portfolio — Claude Context

## Design Context

### Users
**Audience**: Recruiters and hiring managers, founders and collaborators, and peer engineers/designers — all equally. Each visitor arrives with a different lens: hiring managers scan for range and credibility, founders want to feel who you are and how you think, engineers and designers look for craft in the details. Every design decision must earn its place across all three.

**Emotional goal**: Visitors should feel that they're looking at work made by someone with a sharp point of view and the execution to back it up. Quiet confidence, not self-promotion.

### Brand Personality
**Three words**: Sharp, opinionated, direct.

The voice and aesthetic should project a clear point of view. Not hedged, not generic. Opinionated about what to include and what to cut. Decisive in layout, type, and interaction choices. References: Stripe Docs, Paul Graham essays, Linear changelog — things that say something without needing to shout.

### Aesthetic Direction
**Visual reference**: Linear / Vercel — ultra minimal. Dark, high-contrast, technical precision. No decoration that doesn't earn its place.

**Current stack**: Next.js + Tailwind v4, motion/Framer for interactions, next-themes for dark/light, Inter as base type.

**Anti-references**:
- Corporate or sterile — no suit-and-tie energy, no LinkedIn-feel
- Trendy but shallow — no glassmorphism for its own sake, no trend-chasing without purpose

**Theme**: Both light and dark modes are first-class. Dark: near-black `#111110` bg. Light: clean white. Zinc neutrals throughout. Motion is purposeful, physics-based, never gratuitous.

### Design Principles

1. **Precision over decoration** — Every element should have a reason to exist. If it doesn't communicate something, cut it.

2. **Opinionated simplicity** — Minimal means having a strong enough point of view to know what to leave out. Each choice should feel decided, not defaulted.

3. **Motion earns its place** — Interactions should feel physical and grounded (spring physics). Animation communicates state — never exists purely for delight.

4. **Consistent craft at every scale** — The same care applied to the hero applies to a hover state on a footnote.

5. **Content leads, chrome follows** — Writing and projects are the product. The interface should make those shine and then get out of the way.
