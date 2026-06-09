# Office Mode — Visual Redesign Proposal

Scope: visual/UX only for `/simulations/$id`. No changes to scenarios, scoring, server functions, routes, i18n, auth, or progress. Classic Mode stays byte-identical; Office Mode is a new presentational shell over the same state and actions.

---

## 1. View Mode Selector

Location: top-right of the simulation runner, next to the Timer / "End simulation" button.

```text
[ Classic | Office ]   ⏱ 24:35   [ End ]
```

- Stored in `localStorage` key `pp:viewMode` (default = `office`).
- Toggle re-renders the runner; underlying state (step, history, metrics, pending) is preserved via lifted state in `SimulationRunner`.
- Briefing and Results pages: unchanged.

---

## 2. Office Layout Wireframe (desktop, ≥1100px)

```text
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back    Office · PM Simulation · Step 3/6        [Classic|Office] │
│                                              🕘 Mon 09:15 · Week 2   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ╔══════════════════ WHITEBOARD (always visible) ════════════════╗  │
│   ║  SCENARIO        │  COMPANY GOAL                              ║  │
│   ║  W2 retention…   │  Restore W2 retention > 35%                ║  │
│   ║ ─────────────────┴──────────────────────────────────────────  ║  │
│   ║  KEY METRICS  [W2 22% ▼] [D1 54% ▼] [Sess 3.1 ▬] [Crash 1.8%▲]║  │
│   ║ ─────────────────────────────────────────────────────────────  ║  │
│   ║  LATEST EVENTS                                                 ║  │
│   ║  09:14  Release v4.2 shipped                                   ║  │
│   ║  09:08  Support: spike in NPS complaints                       ║  │
│   ╚════════════════════════════════════════════════════════════════╝  │
│                                                                      │
│   ┌──────────────── DESK SURFACE (wood/matte plane) ──────────────┐  │
│   │  ╭──────────╮     ╭──────────────────────╮     ╭──────────╮   │  │
│   │  │ 📄 DOCS  │     │   💻 MACBOOK         │     │ 📞 PHONE │   │  │
│   │  │ stack    │     │   (active panel)     │     │ msgs •3  │   │  │
│   │  ╰──────────╯     ╰──────────────────────╯     ╰──────────╯   │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   ┌──────────────── ACTIVE WORKSPACE (MacBook screen) ────────────┐  │
│   │  Your decision · step 3/6                                     │  │
│   │  [suggested action chips]                                     │  │
│   │  [ free text input ............................. ] [ Send ]  │  │
│   │  Last reaction: …                                             │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   Timeline:  ● ● ● ◯ ◯ ◯                                             │
└──────────────────────────────────────────────────────────────────────┘
```

Desk objects are **navigation buttons**. Clicking one swaps the "Active Workspace" panel below:

| Object | Active Workspace shows |
|---|---|
| 💻 MacBook (default) | Decision input + suggested actions + last reaction |
| 📄 Docs | Resources list + selected resource detail (current right-column block) |
| 📞 Phone | Messages feed (current right-column block) |
| 🧑‍🏫 Whiteboard | Always rendered above — also clickable to expand metrics/updates full-width |

This keeps every piece of information that exists today, just rearranged into an office metaphor. Nothing is removed.

### Responsive strategy

- **≥1280px**: layout as above. Whiteboard ~ 1100px wide, desk row centered under it.
- **1024–1279px**: whiteboard full width; desk objects shrink to icon+label pills; active workspace below.
- **<1024px (tablet/mobile)**: desk row collapses to a horizontal segmented control (Computer / Docs / Phone). Whiteboard stacks above. No 3D illusion — flat cards. Office Mode remains usable but visually simplified.

---

## 3. Office Clock

Small chip in the top bar:

```text
🕘 Mon · 09:15 AM · Week 2
```

- Pure presentation, driven by `step` and scenario.
- Advances by ~25 in-fiction minutes per submitted decision (`base 09:00 + step * 25min`). Day/week derived from step ranges. No real timer — does not affect scoring.

---

## 4. Visual Style

- **Palette**: reuse existing tokens (`--background`, `--card`, `--primary`, gradients in `styles.css`). Add 3 new tokens for office surfaces:
  - `--office-floor` (soft warm gray)
  - `--office-desk` (matte oak via `oklch`)
  - `--office-glass` (translucent meeting-room glass, low-alpha primary)
- **Background**: lightweight CSS illustration — a single SVG layer with glass meeting rooms (rounded rectangles, soft inner shadow), desk plane, soft daylight gradient from top-left. No raster art, no stock photos, no neon.
- **Objects**: flat illustrated SVGs (MacBook, document stack, phone) styled with the same color tokens. ~120–160px wide, subtle drop shadow, hover lift (`translate-y-[-2px]`).
- **Typography & spacing**: unchanged — keep the current Inter/system stack and shadcn rhythm. Premium/Linear/Notion restraint.

---

## 5. Component Hierarchy (new files only)

```text
src/components/office/
  OfficeRunner.tsx          ← top-level Office Mode shell (replaces Running's JSX, reuses its state)
  OfficeBackground.tsx      ← SVG room (glass walls, daylight, plants)
  Whiteboard.tsx            ← scenario + goal + metrics + events panel
  Desk.tsx                  ← desk plane + positions the 3 objects
  DeskObject.tsx            ← reusable button (icon SVG, label, badge, active state)
  ActiveWorkspace.tsx       ← swaps Computer/Docs/Phone panel content
  OfficeClock.tsx           ← Mon · 09:15 · Week N chip
  ViewModeToggle.tsx        ← Classic | Office segmented control
  illustrations/
    Macbook.tsx
    DocsStack.tsx
    DeskPhone.tsx
    GlassRoom.tsx
```

Refactor in `src/routes/simulations.$id.index.tsx`:
- Extract the current `Running` body into `ClassicRunner` (zero visual change).
- New `OfficeRunner` consumes the **same** `submit`, `step`, `history`, `metrics`, `updates`, `messages`, `suggested`, `lastReaction`, `selectedResource` state.
- `SimulationRunner` reads `viewMode` from localStorage and renders one or the other.

No changes to: `simulation.functions.ts`, `scenarios.ts`, `i18n.tsx`, `AppShell`, `AppSidebar`, routes, results, progress.

---

## 6. Deliverable order

1. This proposal (now).
2. After approval: implement files above + the toggle. Classic Mode untouched.
3. Visual QA in preview at desktop + tablet widths.

---

Approve this plan and I'll build it. If you want different desk objects, a darker office, or the clock to advance differently, tell me before I start.