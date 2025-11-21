# U2 Flight Test Sandbox v0.6.0

**Release Date**: November 22, 2025  
**Milestone**: Infrastructure & Physics Enhancements  
**Status**: ✅ Production Ready

## 🎉 Highlights

Version 0.6.0 brings **critical infrastructure improvements** and **physics synchronization enhancements** to the U2 Flight Test Sandbox:

- 🐳 **Docker containerization** for seamless development environment setup
- 🎯 **Enhanced physics sync** with pitch/roll acceleration parameters
- 📚 **AI agent documentation** with comprehensive Copilot instructions
- 🔧 **Zero-warning policy enforcement** across the entire codebase

## 🆕 What's New

### 🐳 Docker Development Environment (PR #35)

Complete Docker setup for both server and client with one-command startup:

**Features:**
- Multi-stage Dockerfiles for .NET 8.0 server and Vite client
- `docker-compose.yml` orchestration for seamless integration
- Automation scripts: `start-docker.ps1` (Windows) and `start-docker.sh` (Unix)
- Alpine-based images for improved security (vs. previous Debian bullseye)
- WebSocket relay Docker compatibility with wildcard binding fallback

**Quick Start:**

```bash
# Windows
.\scripts\start-docker.ps1

# macOS/Linux
./scripts/start-docker.sh
```

**Services:**
- C# Backend: UDP 7777, WebSocket 8080
- Vite Client: HTTP 5173

**Files Added:**
- `Dockerfile.server` - .NET 8.0 multi-stage build
- `Dockerfile.client` - Node 20 Alpine + Vite dev server
- `docker-compose.yml` - Service orchestration
- `.dockerignore` - Build optimization
- `scripts/start-docker.ps1` - PowerShell automation
- `scripts/start-docker.sh` - Bash automation

### 🎯 Physics Synchronization Enhancements (PR #29)

Unified physics configuration between C# backend and TypeScript client:

**What Changed:**
- Added `pitch_accel_dps2` and `roll_accel_dps2` to `physics.json`
- Enhanced `SharedPhysics.cs` mapping with new rotational parameters
- Updated TypeScript `physics.ts` with fallback values for backward compatibility
- Improved median-based RTT metrics for latency tests (resistant to outliers)

**Technical Details:**

```json
// src/shared/physics.json
{
  "physics": {
    "pitch_accel_dps2": 180.0,
    "roll_accel_dps2": 360.0,
    // ... other parameters
  }
}
```

**Synchronization Pattern:**
- C# backend: `SharedPhysics.cs` loads `physics.json` → `ShipConfig`
- TypeScript client: `physics.ts` imports `physics.json` with fallbacks
- **Critical:** All physics parameters MUST be synced for deterministic prediction

### 📚 AI Agent Documentation (PR #33)

Comprehensive `.github/copilot-instructions.md` for AI coding agents:

**Content:**
- Architecture principles (physics sync, network patterns, ECS)
- Development workflows (commands, testing, debugging)
- Common patterns (adding physics params, modifying protocol)
- Project constraints (determinism, zero-warnings, fixed timestep)
- File organization (backend C#, frontend TypeScript)
- Milestone structure and DoD tracking

**Purpose:** Enables AI assistants to understand project architecture and make changes that comply with established patterns.

### 🔧 Code Quality Improvements

**Zero-Warning Policy Enforcement:**
- ESLint compliance: 0 warnings across entire TypeScript codebase
- Updated `eslint.config.js` to ignore generated files (`dist/**`, `proto/**`, `*.d.ts`)
- Fixed 23 markdown linting errors in README.md
- Corrected UTF-8 encoding issues in Russian documentation

**Security:**
- Migrated from `node:20-bullseye` to `node:20-alpine` (reduced attack surface)
- Eliminated 3 HIGH severity vulnerabilities from Docker base image

### 📄 Documentation Cleanup (PR #34)

- Archived old PR artifacts and outdated documentation
- Cleaned up `docs/archive/` directory structure
- Removed deprecated files from root directory

## 📊 Technical Metrics

| Category | Value |
|----------|-------|
| **C# Tests** | 201/201 ✅ |
| **TypeScript Tests** | 11/11 ✅ |
| **ESLint Warnings** | 0 ✅ |
| **Code Coverage** | Comprehensive |
| **Docker Images** | 2 (server + client) |
| **Automation Scripts** | 2 (PowerShell + Bash) |

## 🔄 Changes Since v0.5.0

### Added

- Docker containerization for development environment
- `pitch_accel_dps2` and `roll_accel_dps2` physics parameters
- `.github/copilot-instructions.md` AI agent documentation
- Automation scripts for Docker setup
- WebSocket relay Docker compatibility layer
- Enhanced physics synchronization between C# and TypeScript

### Changed

- Docker base image: `node:20-bullseye` → `node:20-alpine` (security)
- ESLint configuration: Added `dist/**`, `proto/**` to ignores
- Physics configuration: Now synced via shared `physics.json`
- README: Fixed UTF-8 encoding and markdown linting errors

### Fixed

- ESLint ignoring generated files (dist, proto)
- UTF-8 encoding corruption in Russian README section
- 23 markdown linting errors (MD022, MD031, MD032, MD034)
- WebSocket relay binding in Docker containers (`localhost` → `+` wildcard)

### Removed

- Deprecated `.eslintignore` file (replaced by `eslint.config.js` ignores)
- Old PR artifacts from root directory
- Outdated documentation from archive

## 🧪 Testing

All tests passing with comprehensive coverage:

**C# Backend:**
- 201/201 unit tests ✅
- Duration: 125ms
- No regressions

**TypeScript Client:**
- 11/11 unit tests ✅
- Duration: 691ms
- Integration tests available with `U2_RUN_INTEGRATION=1`

**Latency Tests (M2.3 DoD):**
- RTT 50ms: Median prediction error < 1.6m ✅
- RTT 200ms: Convergence time < 2s ✅
- 5s stability test at RTT 200ms ✅

**CI/CD:**
- GitHub Actions: All checks passing ✅
- Build time: 34s

## 🎯 Migration Guide

### For Developers

**New Docker Workflow:**

```bash
# Old way (manual setup)
dotnet run --project src/server/U2.Server.csproj -- --network &
npm run dev

# New way (Docker one-liner)
.\scripts\start-docker.ps1  # or ./scripts/start-docker.sh
```

**Physics Configuration:**

If you were manually setting physics parameters in code:

```typescript
// ❌ Old way (hardcoded)
const pitchAccel = degToRad(180.0);

// ✅ New way (from physics.json)
import sharedPhysics from '../../../shared/physics.json';
const pitchAccel = degToRad(sharedPhysics.physics.pitch_accel_dps2 ?? 180.0);
```

**ESLint:**

If you have custom ESLint configuration, update to use `eslint.config.js` ignores instead of `.eslintignore`:

```javascript
// eslint.config.js
export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'proto/**', '*.d.ts']
  },
  // ... rest of config
];
```

## 🔗 Compatibility

### Breaking Changes

**None.** All changes are backward-compatible and additive.

### System Requirements

- **Node.js**: ≥ 18.0.0 (unchanged)
- **.NET SDK**: 8.0 (unchanged)
- **Docker**: 20.10+ (new, optional)
- **Docker Compose**: v2+ (new, optional)

### Network Ports

- UDP 7777: C# backend (unchanged)
- WebSocket 8080: Relay server (unchanged)
- HTTP 5173: Vite dev server (unchanged)

## 📚 Documentation

### New Documentation

- `.github/copilot-instructions.md` - AI agent development guide (258 lines)
- `PR-35-MERGE-COMMENT.md` - Docker setup comprehensive review

### Updated Documentation

- `README.md` - Added Docker setup section with instructions
- `CHANGELOG.md` - Updated with v0.6.0 changes (to be committed)

### Existing Documentation

All M0.1-M2.3 milestone documentation remains current:
- `ROADMAP.md` - Development timeline
- `M2.3-VERIFICATION-COMPLETE.md` - Client-side prediction verification
- `docs/specs/` - Technical and gameplay specifications

## 🚀 What's Next (M3.0)

The next milestone focuses on **Flight Assist modes**:

- [ ] FA:ON mode implementation (automatic stabilization)
- [ ] FA:OFF mode (direct thruster control) - already working
- [ ] `Z` key toggle between modes
- [ ] UI indicators for current FA state
- [ ] Server-side FA state synchronization

**Timeline:** 2-3 weeks (optimistic), 3-4 weeks (realistic)

## 🙏 Acknowledgments

- **GitHub Copilot** for AI-assisted development
- **Entitas ECS** architecture inspiration
- **Protocol Buffers** for efficient serialization
- **Docker** community for containerization best practices

## 📄 Release Metadata

| Field | Value |
|-------|-------|
| **Version** | 0.6.0 |
| **Previous Version** | 0.5.0 |
| **Release Date** | November 22, 2025 |
| **Commits Since v0.5.0** | 7+ |
| **Pull Requests** | #29, #32, #33, #34, #35 |
| **Contributors** | komleff |
| **License** | Proprietary |

## 📦 Installation

### Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/komleff/u2.git
cd u2

# Start with Docker
.\scripts\start-docker.ps1  # Windows
./scripts/start-docker.sh   # macOS/Linux

# Open browser
# http://localhost:5173/
```

### Manual Setup

```bash
# Install dependencies
npm install

# Start servers
npm run start:servers

# In another terminal
npm run dev
```

## 🔍 Verification

To verify the installation:

```bash
# Check linting
npm run lint
# Expected: 0 warnings

# Run tests
dotnet test --configuration Release
# Expected: 201/201 passed

npm test --workspace=src/clients/testbed/chatgpt-vite
# Expected: 11/11 passed

# Check Docker setup
docker compose up
# Expected: Both containers start successfully
```

## 🐛 Known Issues

None. All known issues from v0.5.0 have been resolved.

## 📧 Support

For issues, questions, or feedback:
- Create an issue: <https://github.com/komleff/u2/issues>
- Review documentation: `docs/README.md`
- Check Copilot instructions: `.github/copilot-instructions.md`

---

**Full Changelog**: <https://github.com/komleff/u2/compare/v0.5.0...v0.6.0>
