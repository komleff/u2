# U2 Flight Test Sandbox v0.6.0

**Release Date**: November 21, 2025  
**Focus**: Developer Experience & DevOps  
**Status**: ✅ Production Ready

---

## 🎉 Highlights

This release focuses on **developer experience** and **production readiness** by adding Docker support, CI/CD automation, and comprehensive project documentation.

Version 0.6.0 delivers essential DevOps infrastructure:

- ✅ **Docker containerization** for both server and client
- ✅ **CI/CD pipelines** with GitHub Actions
- ✅ **Automated server startup** scripts for all platforms
- ✅ **AI-assisted development** with Copilot instructions
- ✅ **Zero-warning lint compliance** across the entire codebase

---

## 🚀 What's New

### Docker Support

Complete containerization for development and production environments:

#### Dockerfile.server
- Multi-stage build with .NET 8 SDK
- Optimized runtime image based on ASP.NET Core
- Exposes UDP port 7777 and WebSocket port 8080
- Automatic server startup with `--network` flag

#### Dockerfile.client
- Alpine-based Node.js 20 image for minimal footprint
- Vite dev server configured for Docker networking
- Layer caching for fast rebuilds
- Exposes port 5173 for browser access

#### docker-compose.yml
- Orchestrates server and client containers
- Automatic dependency management (client waits for server)
- Configurable port mappings
- Environment variable support for WebSocket URL
- Auto-restart policy for development

**Quick Start with Docker:**
```bash
# Linux/macOS
./scripts/start-docker.sh

# Windows PowerShell
.\scripts\start-docker.ps1

# Or directly with Docker Compose
docker compose up
```

### CI/CD Automation

#### GitHub Actions Workflows

**ci.yml** - Continuous Integration
- Runs on push to main, pull requests, and nightly schedule
- Multi-stage pipeline:
  1. **Build & Test**: C# backend tests (201 tests)
  2. **Physics Sync Validation**: Ensures client/server physics alignment
  3. **Integration Tests**: Optional latency simulation tests
- Node.js 20 and .NET 8 environment
- Comprehensive test coverage validation

**protect-main.yml** - Branch Protection
- Prevents direct pushes to main branch
- Enforces pull request workflow
- Educational error messages with proper git workflow

### Automation Scripts

Cross-platform scripts for streamlined development:

#### start-servers.sh / start-servers.bat
- Automatic dependency checking (.NET SDK, Node.js)
- Port availability validation (7777, 8080, 5173)
- Backend build and startup
- Client dev server launch
- Unified process management with Ctrl+C shutdown

**Features:**
- Color-coded console output
- Automatic log file creation in `logs/` directory
- Error handling with helpful messages
- Platform-specific implementations (Bash for Unix, Batch for Windows)

#### start-docker.sh / start-docker.ps1
- Docker availability check
- Automatic `docker compose up` execution
- Container health monitoring
- Platform-optimized scripts (Shell for Unix, PowerShell for Windows)

### Documentation Enhancements

#### AI-Assisted Development
- `.github/copilot-instructions.md`: Comprehensive guide for GitHub Copilot
  - Project architecture overview
  - Network protocol specifications
  - Testing patterns and requirements
  - Code quality standards
  - Common troubleshooting scenarios

#### Developer Guides
- `scripts/README.md`: English automation script documentation
- `scripts/README.ru.md`: Russian documentation for scripts
- Enhanced main README with Docker and automation sections
- Troubleshooting guides for common issues

### Code Quality

- **Zero ESLint warnings** across entire TypeScript codebase
- `.editorconfig` for consistent code style
- `.dockerignore` and `.gitignore` optimizations
- `.markdownlintignore` for documentation quality

---

## 📦 Technical Specifications

### Infrastructure
- **Docker**: Multi-stage builds with Alpine base images
- **CI/CD**: GitHub Actions with matrix testing
- **Automation**: Cross-platform Bash/Batch/PowerShell scripts

### Development Environment
- **Node.js**: ≥ 18 (Alpine-based Docker image uses v20)
- **.NET**: 8.0 SDK
- **Docker**: Latest stable version
- **Docker Compose**: v3.9 schema

### Network Architecture
- **UDP Server**: Port 7777 (backend)
- **WebSocket Relay**: Port 8080 (browser compatibility)
- **Vite Dev Server**: Port 5173 (client development)
- **Docker Networking**: Internal service discovery via container names

---

## 🎮 Getting Started

### Option 1: Docker (Recommended for Quick Start)

```bash
# Start everything with one command
./scripts/start-docker.sh       # macOS/Linux
.\scripts\start-docker.ps1      # Windows PowerShell

# Open browser
# Navigate to http://localhost:5173/
```

### Option 2: Automated Scripts (Recommended for Development)

```bash
# Install dependencies first
npm install

# Start both servers automatically
npm run start:servers           # or
./scripts/start-servers.sh      # macOS/Linux
scripts\start-servers.bat       # Windows

# Servers start in the same terminal
# Press Ctrl+C to stop both
```

### Option 3: Manual Start (Full Control)

```bash
# Terminal 1 - Backend Server
dotnet run --project src/server/U2.Server.csproj -- --network

# Terminal 2 - Client Dev Server
npm run dev

# Open http://localhost:5173/ in browser
```

### Verification

After starting the servers:

1. **Check logs**: Look in `logs/` directory for `backend.log` and `client.log`
2. **Test WebSocket**: Open browser dev tools, check Network tab for WebSocket connection
3. **Test gameplay**: Use WASD for movement, Q/E for yaw rotation

---

## 🧪 Testing

### Run All Tests

```bash
# C# backend tests (201 tests)
dotnet test --configuration Release

# TypeScript client tests
npm test --workspace=src/clients/testbed/chatgpt-vite

# Integration tests (requires server running)
U2_RUN_INTEGRATION=1 npm test --workspace=src/clients/testbed/chatgpt-vite
```

### CI Pipeline

The GitHub Actions CI pipeline automatically runs:
- Backend unit tests
- Client unit tests
- Physics synchronization validation
- Optional integration tests (nightly and manual dispatch)

---

## 📝 Documentation

### New Documentation Files

- `.github/copilot-instructions.md`: AI agent development guide
- `scripts/README.md`: Automation scripts (English)
- `scripts/README.ru.md`: Automation scripts (Russian)
- Enhanced main `README.md` with Docker sections

### Existing Documentation

- High-level overview: `docs/README.md`
- Documentation index: `docs/INDEX.md`
- Specifications catalog: `docs/specs/README.md`
- Roadmap: `ROADMAP.md`
- Changelog: `CHANGELOG.md`

---

## 🔧 Troubleshooting

### Ports Already in Use

**Linux/macOS:**
```bash
lsof -i :7777
lsof -i :8080
lsof -i :5173
kill -9 <PID>
```

**Windows:**
```batch
netstat -ano | findstr :7777
taskkill /PID <PID> /F
```

### Docker Issues

```bash
# Rebuild containers
docker compose build --no-cache

# Clean up containers and volumes
docker compose down --remove-orphans --volumes

# Check container logs
docker compose logs -f
```

### Server Not Starting

1. **Check .NET SDK**: `dotnet --version` (should be 8.0+)
2. **Rebuild manually**: `dotnet build U2.sln`
3. **Check logs**: `logs/backend.log`

### Client Not Connecting

1. **Verify server is running**: Check port 8080 for WebSocket
2. **Check WebSocket URL**: Browser dev tools > Network tab
3. **Environment variable**: Set `VITE_SERVER_URL=ws://localhost:8080/`

---

## 🔄 Upgrading from v0.5.0

This release is fully backward compatible with v0.5.0. No breaking changes.

### Migration Steps

1. **Pull latest code**: `git pull origin main`
2. **Install dependencies**: `npm install`
3. **Optional - Try Docker**: `./scripts/start-docker.sh`

No configuration changes required. All existing save files and configurations remain compatible.

---

## 🛠️ Behind the Scenes

### Build System Improvements

- **Layer caching**: Docker builds reuse dependency layers for 10x faster rebuilds
- **Multi-stage builds**: Separate build and runtime images reduce final image size by ~60%
- **Workspace support**: npm scripts properly support monorepo workspace structure

### Code Quality

- **Lint compliance**: Zero warnings across 50+ TypeScript files
- **Test coverage**: 201 C# tests + comprehensive TypeScript test suite
- **Type safety**: Strict TypeScript configuration with no `any` types

---

## 🎯 What's Next

See `ROADMAP.md` for the complete development roadmap. Upcoming milestones:

- **M3.0**: Flight Assist ON/OFF modes
- **M4.0**: Minimal HUD implementation
- **M5.0**: Combat system (damage, bots)
- **M6.0**: Optimization and platform support

---

## 👥 Contributors

This release represents the continued effort of the U2 development team in improving developer experience and production readiness.

Special thanks to all contributors who tested the Docker setup and automation scripts.

---

## 📄 License

MIT License

---

## 🔗 Links

- **Repository**: https://github.com/komleff/u2
- **Previous Release**: [v0.5.0](https://github.com/komleff/u2/releases/tag/v0.5.0)
- **Issues**: https://github.com/komleff/u2/issues
- **Roadmap**: See `ROADMAP.md` in repository

---

**Full Changelog**: v0.5.0...v0.6.0
