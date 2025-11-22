# Release v0.7.0 - Flight Assist System (M3.0)

**Date:** 2025-11-22
**Milestone:** M3.0 Flight Assist

## 🚀 Highlights

This release introduces the **Flight Assist (FA)** system, a critical gameplay feature that bridges the gap between realistic Newtonian physics and accessible space flight control.

### 🎮 Dual Flight Modes

- **FA:ON (Default)**: The ship's flight computer actively stabilizes rotation and limits speed to safe levels.
  - **Auto-Stabilization**: Automatically dampens angular velocity when you stop rotating.
  - **Speed Limiting**: Enforces a maximum forward speed of **260 m/s** (and lower limits for reverse/lateral).
  - **G-Force Safety**: Deceleration is managed to respect crew G-limits (6g), preventing blackouts (future feature prep).
  - **Drift Correction**: Automatically brings the ship to a halt when controls are released.

- **FA:OFF**: Disables all safety limits and stabilization.
  - **Newtonian Purity**: Your ship retains all momentum until you counter-thrust.
  - **Unlimited Speed**: Only limited by the relativistic speed of light (c').
  - **Advanced Maneuvers**: Enables "drift" combat tactics and decoupled flight.

### 🖥️ UI & Controls

- **Toggle Key**: Press **`Z`** to switch between modes.
- **HUD Indicator**: New status indicator in the top-right corner.
  - **Green (FA:ON)**: System active and stabilizing.
  - **Red (FA:OFF)**: System disabled, manual control only.
- **Visual Feedback**: Smooth CSS transitions and glow effects for mode changes.

## 🔧 Technical Details

- **Server-Side Physics**:
  - Implemented `FlightAssistSystem` ECS system.
  - Uses **ship-local coordinate transformations** to correctly apply limits regardless of ship orientation.
  - **Exponential damping** (PD controller) for smooth, non-jittery stabilization.
- **Network Protocol**:
  - `flight_assist` boolean flag added to `PlayerInputProto` and `EntitySnapshotProto`.
  - Full synchronization between client prediction and server authority.
- **Testing**:
  - **211 Unit Tests** passing (100% coverage of FA logic).
  - Verified zero-regression in existing physics.

## 📦 Installation & Update

### Docker Users

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose up --build -d
```

### Manual Setup

```bash
# Update dependencies
npm install

# Run server
dotnet run --project src/server/U2.Server.csproj -- --network

# Run client
npm run dev
```
