# Changelog

All notable changes to the U2 Flight Test Sandbox project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.5.0]: https://github.com/dkomlev/u2/releases/tag/v0.5.0
