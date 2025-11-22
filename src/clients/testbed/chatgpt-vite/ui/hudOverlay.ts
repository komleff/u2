import type { HudTelemetry } from "@types/simulation";

export class HudOverlay {
  #element: HTMLDivElement;

  constructor(root: HTMLElement) {
    this.#element = document.createElement("div");
    this.#element.className = "hud";
    root.appendChild(this.#element);
  }

  render(telemetry: HudTelemetry) {
    const { speed, aoa, altitude, warnings, flightAssist } = telemetry;
    
    // Flight Assist indicator (M3.0)
    const faStatus = flightAssist !== undefined 
      ? `<div class="fa-indicator ${flightAssist ? 'fa-on' : 'fa-off'}">FA:${flightAssist ? 'ON' : 'OFF'}</div>`
      : '';
    
    this.#element.innerHTML = `
      ${faStatus}
      <div>SPD ${speed.toFixed(1)} m/s</div>
      <div>AOA ${(aoa * (180 / Math.PI)).toFixed(1)}°</div>
      <div>ALT ${altitude.toFixed(0)} m</div>
      <div>WARN: ${
        warnings.length > 0 ? warnings.join(" | ") : "—"
      }</div>
    `;
  }
}
