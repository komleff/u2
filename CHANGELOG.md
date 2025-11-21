# Changelog

All notable changes to the U2 Flight Test Sandbox project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2025-11-21

### Summary

Developer experience and DevOps release focusing on Docker containerization, CI/CD automation, and comprehensive documentation for AI-assisted development. This release makes U2 easier to deploy, test, and develop with automated workflows and production-ready Docker configurations.

### Added

#### Docker Support ✅

- `Dockerfile.server`: Multi-stage build for .NET 8 backend with optimized runtime image
- `Dockerfile.client`: Alpine-based Node.js 20 image for Vite development server
- `docker-compose.yml`: Complete orchestration for server + client with dependency management
- `.dockerignore`: Optimized Docker context for faster builds
- Docker networking configuration with WebSocket compatibility

#### CI/CD Automation ✅

- `.github/workflows/ci.yml`: Continuous Integration pipeline
  - Build and test jobs for C# backend (201 tests)
  - Client-side physics validation tests
  - Optional integration tests with latency simulation
  - Node.js 20 and .NET 8 environment setup
  - Nightly automated test runs
- `.github/workflows/protect-main.yml`: Branch protection workflow preventing direct pushes to main

#### Automation Scripts ✅

- `scripts/start-servers.sh`: Unix/Linux/macOS automated server startup
- `scripts/start-servers.bat`: Windows automated server startup
- `scripts/start-docker.sh`: Docker Compose automation for Unix systems
- `scripts/start-docker.ps1`: PowerShell Docker automation for Windows
- `scripts/test-startup.sh`: Automated startup validation
- `scripts/README.md`: English documentation for automation scripts
- `scripts/README.ru.md`: Russian documentation for automation scripts

#### Developer Experience ✅

- `.github/copilot-instructions.md`: Comprehensive GitHub Copilot guide
  - Project architecture and design principles
  - Network protocol specifications (M2.2, M2.3)
  - Physics synchronization patterns
  - Testing requirements and patterns
  - Common troubleshooting scenarios
  - Russian language documentation
- `.editorconfig`: Unified code style configuration
- Enhanced main README with Docker and automation sections
- Troubleshooting guides for common deployment issues

#### Code Quality ✅

- Zero ESLint warnings across entire TypeScript codebase
- `.markdownlintignore`: Documentation linting configuration
- Updated `.gitignore`: Docker, logs, and build artifact exclusions

### Technical Details

#### Docker Architecture

- **Multi-stage builds**: Separate SDK and runtime layers for optimal image size
- **Layer caching**: Dependencies cached for 10x faster rebuilds
- **Alpine base**: Minimal footprint for client container
- **Port mapping**: 7777 (UDP), 8080 (WebSocket), 5173 (Vite)
- **Environment variables**: Configurable WebSocket endpoint

#### CI Pipeline

- **Matrix testing**: Node.js 20 + .NET 8 environment
- **Scheduled runs**: Nightly integration test execution
- **Manual dispatch**: On-demand test runs via workflow_dispatch
- **Test coverage**: 201 C# tests + comprehensive TypeScript suite
- **Physics validation**: Automated client/server synchronization checks

#### Automation Features

- **Dependency checking**: Automatic validation of .NET SDK and Node.js
- **Port availability**: Pre-flight checks for 7777, 8080, 5173
- **Log management**: Automatic log file creation in `logs/` directory
- **Error handling**: Helpful error messages with troubleshooting hints
- **Process management**: Unified Ctrl+C shutdown for all servers

### Documentation Updates

- Complete Docker setup guide in README
- Cross-platform automation script documentation
- AI-assisted development workflow guide
- Troubleshooting section for deployment issues
- Russian translations for key documentation

### Known Limitations

- Docker setup is optimized for development (production build requires separate configuration)
- Integration tests still require manual server startup (addressed by automation scripts)
- Windows Docker requires WSL2 for optimal performance

### Next Steps

See `ROADMAP.md` for the complete development roadmap. Upcoming milestones:

- **M3.0**: Flight Assist ON/OFF and Stabilized Flight Assist
- **M4.0**: Minimal HUD
- **M5.0**: Combat stubs (damage, bots)
- **M6.0**: Optimization and platform support

### Contributors

This release represents the collaborative effort of the U2 development team in improving developer experience and production readiness.

---

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
