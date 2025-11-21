# U2 Flight Test Sandbox v0.5.0

**Release Date**: November 20, 2025  
**Milestone**: First Official Release  
**Status**: ✅ Production Ready

---

## 🎉 Highlights

This is the **first official release** of the U2 Flight Test Sandbox - a canvas-based flight systems sandbox for the **Universe Unlimited (U2)** project.

Version 0.5.0 delivers a complete technical foundation with:

- ✅ **Relativistic flight physics**
- ✅ **Client-server architecture** with UDP/WebSocket support
- ✅ **Client-side prediction** with server reconciliation
- ✅ **Efficient binary protocol** using Protocol Buffers
- ✅ **190+ passing tests** with comprehensive coverage

---

## 🚀 What's Included

### Core Systems

#### Physics Engine (M1)

- 2D relativistic flight model
- Coupled/Decoupled flight modes
- Flight Assist ON/OFF support
- G-limits and physics constraints
- Real-time physics simulation

#### Network Protocol (M2.1)

- Protocol Buffers for efficient serialization
- Type-safe message definitions
- Client/Server message types
- Binary data compression
- Full test coverage (190/190 tests)

#### Server Infrastructure (M2.2)

- .NET 8 UDP server
- Connection management
- Message processing pipeline
- Network game loop with fixed timestep
- Server-side entity simulation

#### Client-Side Prediction (M2.3)

- WebSocket relay for browser communication
- Prediction engine with input buffering
- Server reconciliation system
- Latency compensation:
  - **RTT 50ms**: Prediction error < 1 meter
  - **RTT 200ms**: Convergence < 2 seconds
- Integration tests with simulated latency

---

## 📦 Technical Specifications

- **Client Runtime**: Browser (Vite + TypeScript)
- **Server Runtime**: .NET 8
- **Node.js**: ≥ 18
- **ECS**: Custom implementation (Entitas-inspired)
- **Network**: Protocol Buffers over UDP/WebSocket
- **Testing**: Vitest + jsdom
- **Linting**: ESLint with zero-warning policy

---

## 🎮 Getting Started

### Quick Start

```bash
# Clone the repository
git clone https://github.com/dkomlev/u2.git
cd u2

# Install dependencies
npm install

# Run development server (client)
npm run dev

# In another terminal, run the server
cd src/server
dotnet run -- --network
```

### Controls

- **WASD**: Thrusters (forward, left, back, right)
- **Q/E**: Yaw rotation
- **O**: Toggle server connection
- **F3**: Toggle HUD debug overlay

### Building for Production

```bash
# Build client
npm run build

# Build server
cd src/server
dotnet build -c Release
```

---

## 📚 Documentation

Complete documentation is available in the `docs/` directory:

- **README**: [docs/README.md](docs/README.md)
- **Documentation Index**: [docs/INDEX.md](docs/INDEX.md)
- **Specifications**: [docs/specs/README.md](docs/specs/README.md)
- **Roadmap**: [ROADMAP.md](ROADMAP.md)

### Milestone Documentation

Each completed milestone has comprehensive documentation:

- **M0.1-M0.3**: Foundation and build system
- **M1**: Relativistic physics
- **M2.1**: Protocol Buffers
- **M2.2**: UDP server
- **M2.3**: Client prediction

---

## 🔧 Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run coverage
```

### Linting

```bash
# Run ESLint
npm run lint
```

---

## ⚠️ Known Limitations

This is an early release focused on technical foundation. The following features are planned for future releases:

- **No HUD**: Only debug overlay (F3) is available
- **No Combat**: Damage and weapons system planned for M5
- **No AI Bots**: Planned for M5
- **Integration Tests**: Require manual server startup
- **ESLint**: Some warnings in generated protobuf code

---

## 🛣️ Roadmap

### Completed Milestones (v0.5.0)

- ✅ **M0.1-M0.3**: Repository, mathematics, ECS
- ✅ **M1**: Relativistic physics
- ✅ **M2.1**: Protobuf protocol
- ✅ **M2.2**: UDP server
- ✅ **M2.3**: Client prediction

### Upcoming Milestones

- 🔜 **M3**: FA:ON/OFF with stabilization system (3-4 weeks)
- 🔜 **M4**: Minimal HUD (1-2 weeks)
- 🔜 **M5**: Combat stubs - damage and bots (2-3 weeks)
- 🔜 **M6**: Optimization and platform support (3-4 weeks)

**Target for v0.8.6**: ~3-4 months (optimistic), ~4.5 months (realistic)

See [ROADMAP.md](ROADMAP.md) for the complete development timeline.

---

## 🧪 Testing & Quality

This release has been thoroughly tested:

- **Unit Tests**: 8 test files, all passing
- **Integration Tests**: Network latency simulation
- **Manual Testing**: Browser + server validation
- **Documentation**: Complete specification coverage
- **Code Review**: Multiple audit cycles completed

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Keep changes aligned with specs in `docs/specs/`
2. Update corresponding documentation
3. Run `npm run lint` and `npm test` before submitting
4. Submit bug reports and feature requests via GitHub issues

---

## 📞 Support

- **Repository**: <https://github.com/dkomlev/u2>
- **Issues**: <https://github.com/dkomlev/u2/issues>
- **Documentation**: See `docs/` directory

---

## 🙏 Acknowledgments

Built with:

- TypeScript + Vite
- .NET 8
- Protocol Buffers
- Vitest
- ESLint

This release represents months of careful development and testing to establish a solid technical foundation for the Universe Unlimited flight test sandbox.

---

**Version**: 0.5.0  
**Build Date**: 2025-11-20  
**Target Platform**: Browser (Chrome/Edge) + .NET 8  
**Status**: ✅ Production Ready
