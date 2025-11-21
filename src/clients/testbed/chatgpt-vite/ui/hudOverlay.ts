import type { HudTelemetry } from "@types/simulation";

export class HudOverlay {
  #element: HTMLDivElement;
  #faIndicator: HTMLDivElement | null = null;

  constructor(root: HTMLElement) {
    this.#element = document.createElement("div");
    this.#element.className = "hud";
    root.appendChild(this.#element);
  }

  render(telemetry: HudTelemetry) {
    const { speed, aoa, altitude, warnings } = telemetry;
    this.#element.innerHTML = `
      <div>SPD ${speed.toFixed(1)} m/s</div>
      <div>AOA ${(aoa * (180 / Math.PI)).toFixed(1)}°</div>
      <div>ALT ${altitude.toFixed(0)} m</div>
      <div>WARN: ${
        warnings.length > 0 ? warnings.join(" | ") : "—"
      }</div>
      <div id="fa-indicator"></div>
    `;
    
    // Re-acquire reference after innerHTML update
    this.#faIndicator = this.#element.querySelector("#fa-indicator");
  }

  /**
   * Update Flight Assist indicator (M3.0)
   * @param enabled - true for FA:ON, false for FA:OFF
   */
  updateFlightAssist(enabled: boolean) {
    if (!this.#faIndicator) {
      // Create indicator if it doesn't exist yet
      this.#faIndicator = document.createElement("div");
      this.#faIndicator.id = "fa-indicator";
      this.#element.appendChild(this.#faIndicator);
    }
    
    this.#faIndicator.textContent = enabled ? "FA:ON" : "FA:OFF";
    this.#faIndicator.style.color = enabled ? "#00ff00" : "#ff6600";
    this.#faIndicator.style.fontWeight = "bold";
  }
}
