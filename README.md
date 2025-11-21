# U2 Flight Test Sandbox (Universe Unlimited)

This repository contains a canvas‑based flight systems sandbox for the **Universe Unlimited (U2)** project.  
It is used to prototype and validate flight modes, physics constraints, HUD concepts and related gameplay for versions around **U2 v0.8.x**.

- App name: `u2-flighttest`  
- Runtime: browser (Vite + TypeScript)  
- Docs root: `docs/` (see below)

---

## Project goals

- Experiment with 2D representations of U2’s flight model (Coupled/Decoupled, FA:ON/OFF, g‑limits, etc.).
- Provide a fast sandbox for tuning ship tech specs and combat formulas.
- Serve as a living reference implementation for the design specs in `docs/specs`.

Game‑design and technical specifications live in Markdown and are treated as first‑class artifacts.

---

## Getting started

### Prerequisites

- **Node.js ≥ 18**
- **npm** (comes with Node)

### Installation

```bash
npm install
```

### Online testing (automated server startup)

For online multiplayer testing, use the automated server startup script:

```bash
npm run start:servers
```

This script automatically starts both:
- **C# backend server** (UDP on port 7777, WebSocket on port 8080)
- **Vite development client** (HTTP on port 5173)

On Windows, use:
```batch
scripts\start-servers.bat
```

See `scripts/README.md` for detailed information about the automation scripts.

### Development server (client only)

```bash
npm run dev
```

This runs Vite’s dev server. See the terminal output for the local URL (typically `http://localhost:5173/`).

### Production build

```bash
npm run build
```

Build artifacts are emitted to `dist/`. You can preview the built app with:

```bash
npm run preview
```

---

### Client preview (M2.3 Stage 1)

- Run `npm run dev` to start the Vite client.
- Default server endpoint: `ws://localhost:8080/` (override with `VITE_SERVER_URL`).
- Controls: `WASD` thrusters, `Q`/`E` yaw, `O` toggles link, `F3` toggles HUD overlay.
- Theme: hand-drawn space opera; snapshots from the test server are rendered on the new canvas client.

---

## Testing and quality

### Linting

```bash
npm run lint
```

Runs ESLint on the TypeScript codebase with zero‑warning policy.

### Unit tests

```bash
npm test         # single run
npm run test:watch
npm run coverage # with coverage report
```

Tests are implemented with **Vitest** and run in a jsdom environment where needed.

---

## Documentation

All project documentation lives in the `docs/` directory.

- High‑level docs overview: `docs/README.md`
- Documentation index / navigation hub: `docs/INDEX.md`
- Specs catalog: `docs/specs/README.md`

Key areas:

- **Game design (GDD):** `docs/gdd/`
- **Specs (flight modes, architecture, tech stack, Definition of Fun, combat formulas):**  
  - `docs/specs/spec_pilot_assist_coupled.md`  
  - `docs/specs/spec_flight_decoupled.md`  
  - `docs/specs/gameplay/` — dev‑plans, combat formulas, Definition of Fun for v0.8.x  
  - `docs/specs/tech/` — architecture, tech stack, ship tech specs, visual style  
  - `docs/specs/audit/` — documentation audit reports and action plans
- **PvE design and analysis:** `docs/pve/`
- **Guides and practices:** `docs/guides/`
- **Archive and converted legacy docs:** `docs/archive/`, `docs/_converted/`

For naming and structure conventions, see `docs/STYLE.md`.

---

## Documentation tooling

This repo includes simple scripts to help normalize and convert documentation:

- Normalize Markdown (line endings, spaces, etc.):

  ```bash
  npm run docs:normalize
  ```

- Convert external documents (PDF/DOCX → Markdown) into `docs/_converted/`:

  ```bash
  npm run docs:convert
  ```

These scripts are primarily for maintainers of the documentation set.

---

## Contributing

1. Keep changes aligned with the existing specs in `docs/specs/`.  
2. When altering behavior that is documented, update the corresponding spec and, if applicable, its `Changelog`.  
3. Run `npm run lint` and `npm test` before submitting changes.

Bug reports and feature requests are welcome via GitHub issues.

---

## License

This project is licensed under the **MIT License**.  
See the `LICENSE` file if present, or the license section on the GitHub repository page.

---

Build prepared with Codex (GPT-5).

