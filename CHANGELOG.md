# Changelog

All notable changes to the U2 Flight Test Sandbox project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2025-11-22

### Summary

Infrastructure and physics enhancements release. Adds complete Docker containerization for development environment, enhanced physics synchronization with rotational parameters, AI agent documentation, and comprehensive code quality improvements with zero-warning enforcement.

### Added

#### Docker Development Environment (PR #35)

- Multi-stage `Dockerfile.server` for .NET 8.0 backend
- `Dockerfile.client` with Alpine base image for Vite development server
- `docker-compose.yml` orchestration for integrated server + client setup
- `.dockerignore` for optimized build context
- `scripts/start-docker.ps1` - PowerShell automation script with colored output
- `scripts/start-docker.sh` - Bash automation script for Unix systems
- WebSocket relay Docker compatibility with wildcard binding fallback
- One-command development environment startup
- Docker documentation in README.md with quick start guide

#### Physics Synchronization (PR #29)

- `pitch_accel_dps2` parameter in `physics.json` (180.0 deg/s²)
- `roll_accel_dps2` parameter in `physics.json` (360.0 deg/s²)
- Enhanced `SharedPhysics.cs` mapping with rotational parameters
- TypeScript `physics.ts` mapping with fallback values for backward compatibility
- Median-based RTT metrics in latency tests (resistant to outliers)
- Physics synchronization validation tests

#### AI Agent Documentation (PR #33)

- `.github/copilot-instructions.md` - Comprehensive guide for AI coding agents (258 lines)
- Architecture principles (physics sync, network patterns, ECS)
- Development workflows (commands, testing, debugging patterns)
- Common development patterns (adding physics params, modifying protocol)
- Project constraints documentation (determinism, zero-warnings, fixed timestep)
- File organization guide (backend C#, frontend TypeScript)
- Milestone structure and DoD tracking instructions

#### Documentation & Tooling (PR #32)

- Automation scripts for server startup with validation
- Enhanced Node.js version checking with improved regex
- Bilingual documentation support (English/Russian)

### Changed

- Docker base image: `node:20-bullseye` → `node:20-alpine` (security improvement)
- ESLint configuration: Added `dist/**`, `proto/**`, `*.d.ts` to ignores in `eslint.config.js`
- Physics configuration: Now synchronized via shared `physics.json` between C# and TypeScript
- README.md: Fixed UTF-8 encoding issues in Russian section
- README.md: Added Docker setup section with complete instructions
- WebSocket relay: Added fallback binding mechanism for Docker compatibility

### Fixed

- ESLint not ignoring generated files (dist/, proto/)
- UTF-8 encoding corruption in Russian README section (мojibake)
- 23 markdown linting errors (MD022, MD031, MD032, MD034, MD051, MD026)
- WebSocket `HttpListener` binding in Docker containers (localhost → + wildcard)
- Unused variable warnings in integration tests (prefixed with underscore)

### Removed

- Deprecated `.eslintignore` file (functionality moved to `eslint.config.js`)
- Old PR artifacts from root directory (PR #34)
- Outdated documentation files from archive

### Technical Metrics

- C# Tests: 201/201 passing ✅
- TypeScript Tests: 11/11 passing ✅
- ESLint Warnings: 0 ✅
- Docker Images: 2 (server + client)
- Code Quality: Zero-warning policy enforced
- Security: 3 HIGH vulnerabilities eliminated (Alpine migration)

## [0.5.0] - 2025-11-20

### Summary

First official release of the U2 Flight Test Sandbox - a canvas-based flight systems sandbox for the Universe Unlimited (U2) project. This release includes completed milestones M0.1 through M2.3, establishing a solid foundation with relativistic physics, network protocol, UDP server, and client-side prediction.

### Added

#### M0.1: Repository and Build System ✅

- Initial project structure with TypeScript/Vite setup
- ESLint configuration with zero-warning policy
- Vitest testing framework with jsdom environment
- Documentation structure in `docs/` directory
- Basic README and project documentation

#### M0.2: Mathematics + Validation + Migration ✅

- Core mathematical functions for flight physics
- Validation framework for physics calculations
- Test infrastructure with comprehensive coverage
- Migration to modern TypeScript/Vite toolchain

#### M0.3: Entitas ECS ✅

- Entity Component System (ECS) architecture
- Core ECS components: Transform2D, Velocity, Mass, ControlState
- ECS systems for physics simulation
- Component validation and testing

#### M1: Relativistic Physics ✅

- Relativistic flight physics implementation
- 2D flight model with coupled/decoupled modes
- Flight Assist ON/OFF support
- G-limits and physics constraints
- Comprehensive physics tests

#### M2.1: Protobuf Protocol ✅

- Protocol Buffers implementation for network communication
- Message definitions for game state synchronization
- Client/Server message types (190/190 tests passing)
- Efficient binary serialization
- Type-safe message handling

#### M2.2: UDP Server ✅

- .NET 8 UDP server implementation
- Connection management system
- Message processing pipeline
- Network game loop with fixed timestep
- Server-side physics simulation

#### M2.3: Client-Side Prediction and Reconciliation ✅

- WebSocket relay for browser-to-server communication
- Client-side prediction engine
- Input buffering and replay system
- Server reconciliation with sequence tracking
- Latency compensation (RTT 50ms: error < 1m, RTT 200ms: convergence < 2s)
- Virtual endpoint pattern for WebSocket ↔ UDP mapping
- Integration tests with network latency simulation

### Technical Specifications

- **Runtime**: Browser (Vite + TypeScript) + .NET 8 Server
- **Node.js**: ≥ 18
- **ECS Framework**: Custom implementation based on Entitas concepts
- **Network Protocol**: Protocol Buffers over UDP/WebSocket
- **Physics**: 2D relativistic flight model
- **Test Coverage**: Comprehensive unit and integration tests

### Documentation

Complete documentation available in `docs/` directory:

- High-level overview: `docs/README.md`
- Documentation index: `docs/INDEX.md`
- Specifications catalog: `docs/specs/README.md`
- Milestone READMEs: `M0.1-README.md` through `M2.3-VERIFICATION-COMPLETE.md`
- Development roadmap: `ROADMAP.md`

Key specification documents:

- Flight modes: `docs/specs/spec_pilot_assist_coupled.md`, `docs/specs/spec_flight_decoupled.md`
- Architecture: `docs/specs/tech/`
- Combat formulas: `docs/specs/gameplay/`
- Definition of Fun: `docs/specs/gameplay/`

### Known Limitations

- Integration tests require manual server startup
- Some ESLint warnings in generated protobuf code
- HUD is minimal (debug overlay only)
- No combat system yet (planned for M5)
- No AI bots yet (planned for M5)

### Next Steps

See `ROADMAP.md` for the complete development roadmap. Upcoming milestones:

- **M3**: FA:ON/OFF and Stabilized Flight Assist
- **M4**: Minimal HUD
- **M5**: Combat stubs (damage, bots)
- **M6**: Optimization and platform support

### Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

For detailed instructions, see `README.md`.

### Contributors

This release represents the collaborative effort of the U2 development team in establishing a solid technical foundation for the Universe Unlimited flight test sandbox.

### License

MIT License

---

[0.6.0]: https://github.com/komleff/u2/releases/tag/v0.6.0
[0.5.0]: https://github.com/komleff/u2/releases/tag/v0.5.0
