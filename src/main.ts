import "./styles/main.css";

import { HangarScene } from "@scenes/hangar";
import { preloadAssets } from "@assets/index";
import { HudOverlay } from "@ui/hudOverlay";
import { CONTROL_MAP } from "@config/controls";
import { SIMULATION_TICK } from "@config/simulation";
import { NetworkManager, type NetworkManagerConfig } from "@network/NetworkManager";

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) {
  throw new Error("App container not found");
}

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
appRoot.appendChild(canvas);

const hud = new HudOverlay(appRoot);
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Failed to acquire CanvasRenderingContext2D");
}

const scene = new HangarScene();
const pressed = new Set<string>();
let drawHud = true;

// M2.3 Network integration
let onlineMode = false;
let networkManager: NetworkManager | null = null;

const networkConfig: NetworkManagerConfig = {
  serverUrl: 'ws://localhost:8080/',
  playerName: 'FlightTest',
  version: '0.5.0',
  inputRateHz: 30,
  enablePrediction: true,
  reconciliationThreshold: 1.0, // 1 meter
  fixedDeltaTime: 1.0 / 60.0    // 60 FPS to match server
};

scene.setInputResolver(() => {
  const thrustVector = { x: 0, y: 0 };
  let torque = 0;

  if (pressed.has("thrust-up")) thrustVector.y -= 1;
  if (pressed.has("thrust-down")) thrustVector.y += 1;
  if (pressed.has("strafe-left")) thrustVector.x -= 1;
  if (pressed.has("strafe-right")) thrustVector.x += 1;
  if (pressed.has("yaw-left")) torque -= 1;
  if (pressed.has("yaw-right")) torque += 1;

  return {
    thrustVector,
    torque
  };
});

const handleKey = (evt: KeyboardEvent, isPressed: boolean) => {
  const action = CONTROL_MAP[evt.code];
  if (!action) return;

  evt.preventDefault();

  if (action === "mode-toggle" && isPressed) {
    scene.toggleMode();
    return;
  }

  if (action === "autopilot-toggle" && isPressed) {
    scene.toggleAutopilot();
    return;
  }

  if (action === "hud-toggle" && isPressed) {
    drawHud = !drawHud;
    hud.render({
      speed: 0,
      aoa: 0,
      altitude: 0,
      warnings: []
    });
    return;
  }

  // M2.3: Online/Offline toggle (key 'O')
  if (action === "online-toggle" && isPressed) {
    toggleOnlineMode();
    return;
  }

  if (isPressed) pressed.add(action);
  else pressed.delete(action);
};

window.addEventListener("keydown", (evt) => handleKey(evt, true));
window.addEventListener("keyup", (evt) => handleKey(evt, false));

async function toggleOnlineMode() {
  onlineMode = !onlineMode;
  
  if (onlineMode) {
    console.warn('🌐 Connecting to server...');
    
    networkManager = new NetworkManager(networkConfig);
    
    networkManager.onStateUpdate((_state) => {
      // State updates handled by prediction engine
    });
    
    try {
      await networkManager.connect();
      console.warn('✅ Connected to server');
    } catch (error) {
      console.error('❌ Connection failed:', error);
      onlineMode = false;
      networkManager = null;
    }
  } else {
    console.warn('📴 Disconnecting...');
    
    if (networkManager) {
      networkManager.disconnect();
      networkManager = null;
    }
    
    console.warn('✅ Offline mode');
  }
}

let lastTime = performance.now();

const renderFrame = (dt: number) => {
  // Send input to server if online
  if (onlineMode && networkManager) {
    const thrustVector = { x: 0, y: 0 };
    let torque = 0;

    if (pressed.has("thrust-up")) thrustVector.y -= 1;
    if (pressed.has("thrust-down")) thrustVector.y += 1;
    if (pressed.has("strafe-left")) thrustVector.x -= 1;
    if (pressed.has("strafe-right")) thrustVector.x += 1;
    if (pressed.has("yaw-left")) torque -= 1;
    if (pressed.has("yaw-right")) torque += 1;

    // Normalize thrust vector
    const magnitude = Math.sqrt(thrustVector.x ** 2 + thrustVector.y ** 2);
    const thrust = magnitude > 0 ? magnitude : 0;
    
    networkManager.updateInput(
      thrust,
      thrustVector.x,
      thrustVector.y,
      torque,
      true // flight assist ON
    );
  }
  
  const telemetry = scene.update(dt);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw ship (circle for now)
  ctx.strokeStyle = "#1ff2ff";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw online indicator
  if (onlineMode) {
    ctx.fillStyle = networkManager?.isConnected() ? "#4ade80" : "#fbbf24";
    ctx.beginPath();
    ctx.arc(20, 20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.fillText("ONLINE", 35, 25);
  }

  if (drawHud) {
    hud.render(telemetry);
  }
};

const loop = () => {
  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  const steps = Math.max(1, Math.floor(delta / SIMULATION_TICK));
  for (let i = 0; i < steps; i += 1) {
    renderFrame(SIMULATION_TICK);
  }

  requestAnimationFrame(loop);
};

preloadAssets().then(() => {
  requestAnimationFrame(loop);
});
