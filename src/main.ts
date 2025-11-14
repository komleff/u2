import "./styles/main.css";

import { HangarScene } from "@scenes/hangar";
import { preloadAssets } from "@assets/index";
import { HudOverlay } from "@ui/hudOverlay";
import { CONTROL_MAP } from "@config/controls";
import { SIMULATION_TICK } from "@config/simulation";

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

  if (isPressed) pressed.add(action);
  else pressed.delete(action);
};

window.addEventListener("keydown", (evt) => handleKey(evt, true));
window.addEventListener("keyup", (evt) => handleKey(evt, false));

let lastTime = performance.now();

const renderFrame = (dt: number) => {
  const telemetry = scene.update(dt);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#1ff2ff";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

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
