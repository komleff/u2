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

#### Frontend (Client)
- **Node.js ≥ 18**
- **npm** (comes with Node)

#### Backend (Server) - Optional for online mode
- **.NET SDK 8.0** or later
- Required only if you want to run the online multiplayer mode or integration tests

### Installation

#### Client Setup

```bash
npm install
```

#### Server Setup (Optional - for online mode)

If you want to test the online multiplayer functionality:

1. Install [.NET SDK 8.0](https://dotnet.microsoft.com/download) or later
2. Build the server:
   ```bash
   dotnet build src/server/U2.Server.csproj
   ```
3. Run the server:
   ```bash
   dotnet run --project src/server/U2.Server.csproj -- --network
   ```

The server will start on `ws://localhost:8080/` by default.

### Running the Application

#### Offline Mode (Local Physics Only)

```bash
npm run dev
```

This runs Vite's dev server. See the terminal output for the local URL (typically `http://localhost:5173/`).

The client starts in offline mode by default. You can fly the ship using WASD keys and test the local physics simulation.

#### Online Mode (Multiplayer with Server)

1. First, start the backend server in a separate terminal:
   ```bash
   dotnet run --project src/server/U2.Server.csproj -- --network
   ```

2. Then start the client:
   ```bash
   npm run dev
   ```

3. Open the client in your browser and press **`O`** to toggle online mode

When online mode is enabled, you'll see a green indicator in the top-left corner. The client will connect to the server at `ws://localhost:8080/` and synchronize physics with server snapshots.

### Controls

- **WASD** - Thrust and strafe
- **Q/E** - Yaw left/right
- **M** - Toggle flight mode (Coupled/Decoupled)
- **A** (Autopilot key) - Toggle autopilot
- **H** - Toggle HUD
- **O** - Toggle online/offline mode

---

### Production build

```bash
npm run build
```

Build artifacts are emitted to `dist/`. You can preview the built app with:

```bash
npm run preview
```

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

**Note:** Integration tests require the .NET server to be running. Some tests will fail if the .NET SDK is not installed or the server is not running. This is expected - the smoke tests and unit tests will still pass in offline mode.

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

## Contributors

Recent documentation updates (M2.3 Stage 1) prepared by: **AI Agent - Claude Sonnet 4.5**  
Branch: `copilot/setup-basic-client-build`

