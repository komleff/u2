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
    
    // UI / HUD - Comic Book Style Typography
    fontTitle: "bold 14px 'Courier New', monospace",
    fontValue: "bold 18px 'Courier New', monospace",
    fontLarge: "bold 24px 'Courier New', monospace",
    fontSmall: "bold 12px 'Courier New', monospace",
    
    uiBg: "rgba(255, 255, 255, 0.95)",
    uiBorder: "#000000",
    uiBorderWidth: 3,
    uiShadow: "4px 4px 0px rgba(0,0,0,0.8)",
    
    // Status Colors (Comic Book Palette)
    colorOnline: "#00cc00",
    colorOffline: "#ff0000",
    colorWarning: "#ffaa00",
    colorNeutral: "#000000",
    colorAccent: "#00ccff"
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
    let playerHeading = 0;
    let playerAngularVelocity = 0;

    // Determine camera focus
    if (predicted) {
        camX = predicted.position.x;
        camY = predicted.position.y;
        playerVelocity = predicted.velocity;
        playerAngularVelocity = predicted.angularVelocity;
        playerHeading = predicted.rotation;
    } else if (localId) {
        // Find local entity in frame
        const localEntity = frame.entities.find(e => e.id === localId);
        if (localEntity) {
            camX = localEntity.position.x;
            camY = localEntity.position.y;
            playerVelocity = localEntity.velocity;
            playerAngularVelocity = (localEntity as any).angularVelocity ?? 0;
            playerHeading = (localEntity as any).rotation ?? 0;
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
        this.drawHUD(status, playerVelocity, playerAngularVelocity, playerHeading, faMode, frame);
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

  private drawHUD(status: TransportStatus, velocity: {x: number, y: number}, angularVelocity: number, headingRad: number, faMode: "coupled" | "decoupled", frame: WorldFrame) {
    const speed = Math.hypot(velocity.x, velocity.y);
    
    // === LEFT COLUMN: NETWORK & SERVER INFO ===
    
    // 1. Network Status Panel (Top-Left)
    const statusColor = status.connected ? this.STYLE.colorOnline : (status.connecting ? this.STYLE.colorWarning : this.STYLE.colorOffline);
    const statusIconColor = status.connected ? "#00aa00" : (status.connecting ? "#cc8800" : "#cc0000");
    const statusText = status.connected ? "ONLINE" : (status.connecting ? "CONN..." : "OFFLINE");
    
    this.drawPanel(15, 15, 240, 85);
    this.drawStatusIcon(32, 35, 10, statusIconColor);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("NETWORK", 50, 35);
    
    this.ctx.fillStyle = statusColor;
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillText(statusText, 50, 58);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText(`PING: ${this.estimatePing(status)}ms`, 50, 78);
    this.ctx.fillText(`TICK: ${frame.tick}`, 150, 78);
    
    // 2. Server Info Panel (Below Network)
    const activeShips = frame.entities.length;
    this.drawPanel(15, 110, 240, 65);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("SERVER", 32, 133);
    
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillStyle = this.STYLE.colorAccent;
    this.ctx.fillText(`SHIPS: ${activeShips}`, 32, 155);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText("COMBAT ZONE", 145, 155);
    
    // === RIGHT COLUMN: FLIGHT SYSTEMS ===
    
    // 3. Flight Assist Panel (Top-Right)
    const faText = faMode === "coupled" ? "ON" : "OFF";
    const faColor = faMode === "coupled" ? this.STYLE.colorOnline : this.STYLE.colorOffline;
    const faIconColor = faMode === "coupled" ? "#00aa00" : "#cc0000";
    
    this.drawPanel(this.width - 255, 15, 240, 85);
    this.drawStatusIcon(this.width - 238, 35, 10, faIconColor);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("FLIGHT ASSIST", this.width - 220, 35);
    
    this.ctx.fillStyle = faColor;
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(faText, this.width - 220, 65);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText(faMode === "coupled" ? "STABILIZED" : "MANUAL CTRL", this.width - 220, 80);
    
    // 4. Position Panel (Below Flight Assist)
    const posX = velocity.x !== 0 ? Math.round(velocity.x * 100) / 100 : 0; // Mock position based on velocity
    const posY = velocity.y !== 0 ? Math.round(velocity.y * 100) / 100 : 0;
    const headingDeg = ((headingRad * 180) / Math.PI + 360) % 360;
    
    this.drawPanel(this.width - 255, 110, 240, 85);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("COORDINATES", this.width - 238, 133);
    
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillText(`X: ${posX.toFixed(1)}`, this.width - 238, 155);
    this.ctx.fillText(`Y: ${posY.toFixed(1)}`, this.width - 238, 175);
    this.ctx.fillText(`HDG: ${headingDeg.toFixed(1)}°`, this.width - 238, 195);
    
    // === BOTTOM ROW: VELOCITY & ANGULAR ===
    
    // 5. Linear Velocity Panel (Bottom-Left)
    this.drawPanel(15, this.height - 110, 240, 95);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("LINEAR SPEED", 32, this.height - 87);
    
    this.ctx.fillStyle = this.STYLE.colorAccent;
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(`${Math.round(speed)}`, 32, this.height - 58);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillText("m/s", 32, this.height - 35);
    
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText(`Vx: ${velocity.x.toFixed(1)}`, 130, this.height - 70);
    this.ctx.fillText(`Vy: ${velocity.y.toFixed(1)}`, 130, this.height - 50);
    
    // 6. Angular Velocity Panel (Bottom-Right)
    const angularVel = angularVelocity; // rad/s
    const angularDeg = angularVel * (180 / Math.PI);
    
    this.drawPanel(this.width - 255, this.height - 110, 240, 95);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("ANGULAR SPEED", this.width - 238, this.height - 87);
    
    this.ctx.fillStyle = this.STYLE.colorAccent;
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(`${Math.abs(angularDeg).toFixed(1)}`, this.width - 238, this.height - 58);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillText("°/s", this.width - 238, this.height - 35);
    
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText(angularVel >= 0 ? "CCW" : "CW", this.width - 115, this.height - 70);
    this.ctx.fillText(`YAW RATE`, this.width - 115, this.height - 50);
  }
  
  /**
   * Estimate ping based on connection status
   */
  private estimatePing(status: TransportStatus): number {
    if (!status.connected) return 0;
    if (status.connecting) return 999;
    // Mock ping - в реальности нужно получать от TransportLayer
    return Math.floor(Math.random() * 30) + 20; // 20-50ms mock
  }
  
  /**
   * Draw a colored status indicator circle (●) with glow
   * Green (#00aa00) = Connected/OK
   * Yellow (#cc8800) = Connecting/Warning
   * Red (#cc0000) = Disconnected/Offline
   */
  private drawStatusIcon(x: number, y: number, radius: number, color: string) {
    this.ctx.save();
    
    // Outer glow
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Main circle
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Black outline for comic book effect
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  /**
   * Draw comic-style panel with shadow and bold borders
   */
  private drawPanel(x: number, y: number, w: number, h: number) {
      this.ctx.save();
      
      // Drop Shadow (Comic Book Style)
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      this.ctx.fillRect(x + 4, y + 4, w, h);

      // Main Panel Background (White/Off-white like paper)
      this.ctx.fillStyle = this.STYLE.uiBg;
      this.ctx.fillRect(x, y, w, h);
      
      // Bold Black Border (Comic Panel Outline)
      this.ctx.strokeStyle = this.STYLE.uiBorder;
      this.ctx.lineWidth = this.STYLE.uiBorderWidth;
      this.ctx.strokeRect(x, y, w, h);
      
      // Inner highlight for depth
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
      
      this.ctx.restore();
  }
}
