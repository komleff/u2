import type { EntityState } from "@network/PredictionEngine";
import { CLIENT_CONFIG } from "@config/client";
import type { TransportStatus } from "../net/TransportLayer";
import type { RenderEntity, WorldFrame } from "../world/SnapshotStore";

export class SnapshotRenderer {
  private ctx: CanvasRenderingContext2D;
  private bgGradient: CanvasGradient | null = null;
  private vignetteGradient: CanvasGradient | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("CanvasRenderingContext2D missing");
    }
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  render(
    frame: WorldFrame,
    status: TransportStatus,
    localEntityId: number | null,
    predicted: EntityState | null,
    options?: { showOverlay?: boolean; flightAssist?: boolean }
  ) {
    const showOverlay = options?.showOverlay ?? true;
    const flightAssistEnabled = options?.flightAssist ?? true;
    const focus = frame.focus ?? { x: 0, y: 0 };
    const scale = this.computeScale();

    this.drawBackground(focus, scale);

    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(1, 1);
    this.ctx.translate(-focus.x * scale, -focus.y * scale);

    for (const entity of frame.entities) {
      this.drawEntity(entity, scale, entity.id === localEntityId);
    }

    if (predicted) {
      this.drawGhost(predicted, scale);
    }

    this.ctx.restore();
    if (showOverlay) {
      this.drawOverlay(frame, status, flightAssistEnabled);
    }
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.canvas.clientWidth * dpr);
    this.canvas.height = Math.floor(this.canvas.clientHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    this.bgGradient = this.ctx.createLinearGradient(0, 0, w, h);
    this.bgGradient.addColorStop(0, "#060914");
    this.bgGradient.addColorStop(0.5, "#081024");
    this.bgGradient.addColorStop(1, "#05070f");

    this.vignetteGradient = this.ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.1,
      w / 2,
      h / 2,
      Math.min(w, h) * 0.6
    );
    this.vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
    this.vignetteGradient.addColorStop(1, "rgba(0,0,0,0.35)");
  }

  private computeScale() {
    const viewRadius = CLIENT_CONFIG.render.viewRadius;
    const viewport = Math.min(this.canvas.width, this.canvas.height);
    return viewport / (viewRadius * 2);
  }

  private drawBackground(focus: { x: number; y: number }, scale: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.resetTransform();
    ctx.globalCompositeOperation = "source-over";

    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    ctx.fillStyle = this.bgGradient ?? "#05070f";
    ctx.fillRect(0, 0, w, h);

    // World-aligned grid to replace drifting stars
    const gridSpacingWorld = 150; // meters between grid lines
    const gridSpacingPx = gridSpacingWorld * scale;
    if (gridSpacingPx > 6) {
      const centerX = w / 2;
      const centerY = h / 2;
      const offsetX = (-focus.x * scale) % gridSpacingPx;
      const offsetY = (-focus.y * scale) % gridSpacingPx;

      ctx.strokeStyle = "rgba(120, 170, 255, 0.2)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = centerX + offsetX; x < w; x += gridSpacingPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let x = centerX + offsetX; x > 0; x -= gridSpacingPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = centerY + offsetY; y < h; y += gridSpacingPx) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      for (let y = centerY + offsetY; y > 0; y -= gridSpacingPx) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Crosshair at world origin for orientation
      ctx.strokeStyle = "rgba(200, 235, 255, 0.35)";
      ctx.lineWidth = 1.5;
      const originX = centerX - focus.x * scale;
      const originY = centerY - focus.y * scale;
      ctx.beginPath();
      ctx.moveTo(originX - 8, originY);
      ctx.lineTo(originX + 8, originY);
      ctx.moveTo(originX, originY - 8);
      ctx.lineTo(originX, originY + 8);
      ctx.stroke();
    }

    // Comic-style vignette
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.vignetteGradient ?? "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  private drawEntity(entity: RenderEntity, scale: number, isLocal: boolean) {
    const ctx = this.ctx;
    const size = 14;
    const speed = Math.hypot(entity.velocity.x, entity.velocity.y);
    const heading = entity.rotation;

    ctx.save();
    ctx.translate(entity.position.x * scale, entity.position.y * scale);
    ctx.rotate(heading);

    // Thruster trail
    ctx.strokeStyle = isLocal ? "rgba(255, 150, 80, 0.7)" : "rgba(143, 231, 255, 0.55)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-size * 1.4, 0);
    ctx.quadraticCurveTo(-size * 1.8, size * 0.4, -size * 2.2, 0);
    ctx.quadraticCurveTo(-size * 1.8, -size * 0.4, -size * 1.4, 0);
    ctx.stroke();

    // Hull
    ctx.fillStyle = isLocal ? "#ffdf8a" : "#7ce8ff";
    ctx.strokeStyle = isLocal ? "#ff9f46" : "#2cd4ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size, size * 0.8);
    ctx.lineTo(-size * 0.6, 0);
    ctx.lineTo(-size, -size * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Speed hash marks to accentuate motion
    const hashCount = Math.min(3, Math.max(1, Math.floor(speed / 40)));
    ctx.strokeStyle = "rgba(152, 205, 255, 0.6)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < hashCount; i += 1) {
      ctx.beginPath();
      const offset = -size - i * 6;
      ctx.moveTo(offset, -4);
      ctx.lineTo(offset - 6, 0);
      ctx.lineTo(offset, 4);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawGhost(state: EntityState, scale: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(state.position.x * scale, state.position.y * scale);
    ctx.rotate(state.rotation);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawOverlay(frame: WorldFrame, status: TransportStatus, flightAssistEnabled: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.resetTransform();

    const panelWidth = 260;
    const panelHeight = 120;
    ctx.fillStyle = "rgba(6, 12, 22, 0.8)";
    ctx.fillRect(16, 16, panelWidth, panelHeight);
    ctx.strokeStyle = "rgba(117, 242, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, panelWidth, panelHeight);

    ctx.fillStyle = "#c7f2ff";
    ctx.font = "16px 'Space Grotesk', 'DM Sans', 'Inter', system-ui";

    const statusLabel = status.connected ? "ONLINE" : status.connecting ? "LINKING..." : "OFFLINE";
    const statusColor = status.connected ? "#6bf2b5" : status.connecting ? "#f6c343" : "#ff6b6b";

    ctx.fillText(`Status: ${statusLabel}`, 28, 42);
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.arc(20, 38, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c7f2ff";
    ctx.font = "14px 'Space Grotesk', 'DM Sans', 'Inter', system-ui";
    ctx.fillText(`Tick: ${frame.tick}`, 28, 66);
    ctx.fillText(`Entities: ${frame.entities.length}`, 140, 66);
    ctx.fillText(`Last snapshot: ${Math.round(performance.now() - frame.timestamp)} ms ago`, 28, 90);

    // Flight Assist indicator (M3)
    const faLabel = flightAssistEnabled ? "FA: ON" : "FA: OFF";
    const faColor = flightAssistEnabled ? "#6bf2b5" : "#ff6b6b";
    ctx.fillStyle = "#c7f2ff";
    ctx.fillText("Flight Assist:", 28, 114);
    ctx.fillStyle = faColor;
    ctx.fillText(faLabel, 140, 114);

    ctx.restore();
  }
}
