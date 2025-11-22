import type { EntityState } from "@network/PredictionEngine";
import type { TransportStatus } from "../net/TransportLayer";
import type { WorldFrame } from "../world/SnapshotStore";

export class SnapshotRenderer {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private readonly GRID_SIZE = 250; // Larger grid for space feel

  // Graphic Novel / Comic Style Configuration
  private readonly STYLE = {
    bgColor: "#121212", // Dark ink background
    gridColor: "#2a2a2a",
    
    // Hero Ship (Player)
    heroFill: "#ffffff",
    heroStroke: "#000000",
    heroStrokeWidth: 3,
    
    // Other Ships
    enemyFill: "#ff4444",
    enemyStroke: "#000000",
    enemyStrokeWidth: 3,
    
    // UI / HUD
    fontMain: "bold 16px 'Courier New', monospace",
    fontHeader: "bold 24px 'Courier New', monospace",
    fontLarge: "bold 48px 'Courier New', monospace",
    
    uiBg: "rgba(255, 255, 255, 0.9)",
    uiBorder: "#000000",
    uiBorderWidth: 4,
    uiShadow: "5px 5px 0px rgba(0,0,0,0.5)",
    
    accentColor: "#ffcc00" // Comic book yellow
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("No 2d context");
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  private resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  render(
    frame: WorldFrame,
    status: TransportStatus,
    localId: number | null,
    predicted: EntityState | null,
    hudVisible: boolean,
    faMode: "coupled" | "decoupled" = "coupled"
  ) {
    // 1. Background (Inked Paper look)
    this.ctx.fillStyle = this.STYLE.bgColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Camera Setup
    this.ctx.save();
    
    let camX = 0;
    let camY = 0;
    let playerVelocity = { x: 0, y: 0 };

    // Determine camera focus
    if (predicted) {
        camX = predicted.position.x;
        camY = predicted.position.y;
        playerVelocity = predicted.velocity;
    } else if (localId) {
        // Find local entity in frame
        const localEntity = frame.entities.find(e => e.id === localId);
        if (localEntity) {
            camX = localEntity.position.x;
            camY = localEntity.position.y;
            playerVelocity = localEntity.velocity;
        }
    } else if (frame.focus) {
        camX = frame.focus.x;
        camY = frame.focus.y;
    }

    // Center camera
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.translate(-camX, -camY);

    // 3. World Rendering
    this.drawGrid(camX, camY);

    // Draw Entities
    for (const entity of frame.entities) {
        const isLocal = entity.id === localId;
        
        // If local and we have prediction, skip snapshot rendering for local
        if (isLocal && predicted) continue;

        this.drawShip(entity.position.x, entity.position.y, entity.rotation, false);
    }

    // Draw Local Player (Predicted)
    if (predicted) {
        this.drawShip(predicted.position.x, predicted.position.y, predicted.rotation, true);
    }

    this.ctx.restore();

    // 4. HUD / UI Overlay (Comic Panels)
    if (hudVisible) {
        this.drawHUD(status, playerVelocity, faMode, frame);
    }
  }

  private drawGrid(camX: number, camY: number) {
    this.ctx.strokeStyle = this.STYLE.gridColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const startX = Math.floor(camX / this.GRID_SIZE) * this.GRID_SIZE;
    const startY = Math.floor(camY / this.GRID_SIZE) * this.GRID_SIZE;

    // Draw a large enough area to cover the screen
    const extra = 2;
    const cols = Math.ceil(this.width / this.GRID_SIZE) + extra * 2;
    const rows = Math.ceil(this.height / this.GRID_SIZE) + extra * 2;

    // Vertical lines
    const leftEdge = startX - (Math.ceil(this.width / 2 / this.GRID_SIZE) + extra) * this.GRID_SIZE;
    for (let i = 0; i < cols + 5; i++) {
        const x = leftEdge + i * this.GRID_SIZE;
        this.ctx.moveTo(x, camY - this.height); 
        this.ctx.lineTo(x, camY + this.height);
    }

    // Horizontal lines
    const topEdge = startY - (Math.ceil(this.height / 2 / this.GRID_SIZE) + extra) * this.GRID_SIZE;
    for (let i = 0; i < rows + 5; i++) {
        const y = topEdge + i * this.GRID_SIZE;
        this.ctx.moveTo(camX - this.width, y);
        this.ctx.lineTo(camX + this.width, y);
    }

    this.ctx.stroke();
  }

  private drawShip(x: number, y: number, rotation: number, isHero: boolean) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);

    // Shadow / Outline
    this.ctx.shadowColor = "rgba(0,0,0,0.5)";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 5;
    this.ctx.shadowOffsetY = 5;

    // Ship Shape
    this.ctx.beginPath();
    if (isHero) {
        // Hero Ship Design (Arrowhead with wings)
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-15, 15);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-15, -15);
    } else {
        // Enemy Ship Design (Same size as hero)
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-15, 15);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-15, -15);
    }
    this.ctx.closePath();

    // Fill & Stroke
    this.ctx.fillStyle = isHero ? this.STYLE.heroFill : this.STYLE.enemyFill;
    this.ctx.fill();
    
    this.ctx.shadowColor = "transparent"; // Reset shadow for stroke
    this.ctx.lineWidth = isHero ? this.STYLE.heroStrokeWidth : this.STYLE.enemyStrokeWidth;
    this.ctx.strokeStyle = isHero ? this.STYLE.heroStroke : this.STYLE.enemyStroke;
    this.ctx.stroke();

    // Internal Detail (Cockpit/Engine)
    this.ctx.beginPath();
    this.ctx.fillStyle = "#000000";
    this.ctx.arc(-5, 0, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawHUD(status: TransportStatus, velocity: {x: number, y: number}, faMode: "coupled" | "decoupled", frame: WorldFrame) {
    const speed = Math.hypot(velocity.x, velocity.y);
    
    // 1. Speed Panel (Bottom Left)
    this.drawPanel(20, this.height - 100, 200, 80);
    this.ctx.fillStyle = "#000000";
    this.ctx.font = this.STYLE.fontHeader;
    this.ctx.fillText("SPEED", 35, this.height - 70);
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(`${speed.toFixed(0)} m/s`, 35, this.height - 30);

    // 2. Flight Assist Panel (Bottom Right)
    const faText = faMode === "coupled" ? "FA: ON" : "FA: OFF";
    const faColor = faMode === "coupled" ? "#000000" : "#cc0000"; // Red for OFF (Danger)
    
    this.drawPanel(this.width - 220, this.height - 100, 200, 80);
    this.ctx.fillStyle = "#000000";
    this.ctx.font = this.STYLE.fontHeader;
    this.ctx.fillText("SYSTEM", this.width - 205, this.height - 70);
    this.ctx.fillStyle = faColor;
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(faText, this.width - 205, this.height - 30);

    // 3. Status Panel (Top Left)
    this.drawPanel(20, 20, 250, 60);
    this.ctx.fillStyle = "#000000";
    this.ctx.font = this.STYLE.fontMain;
    const statusText = status.connected ? "ONLINE" : (status.connecting ? "CONNECTING..." : "OFFLINE");
    this.ctx.fillText(`NET: ${statusText}`, 35, 55);
    this.ctx.fillText(`TICK: ${frame.tick}`, 150, 55);
    
    // 4. Center Crosshair - REMOVED per user request
  }

  private drawPanel(x: number, y: number, w: number, h: number) {
      this.ctx.save();
      
      // Drop Shadow
      this.ctx.fillStyle = this.STYLE.uiShadow.split(" ")[3]; // Hacky color extraction or just hardcode
      this.ctx.fillStyle = "rgba(0,0,0,1)";
      this.ctx.fillRect(x + 5, y + 5, w, h);

      // Main Box
      this.ctx.fillStyle = this.STYLE.uiBg;
      this.ctx.fillRect(x, y, w, h);
      
      // Border
      this.ctx.strokeStyle = this.STYLE.uiBorder;
      this.ctx.lineWidth = this.STYLE.uiBorderWidth;
      this.ctx.strokeRect(x, y, w, h);
      
      this.ctx.restore();
  }
}
