import type { EntityState } from "@network/PredictionEngine";
import type { TransportStatus } from "../net/TransportLayer";
import type { WorldFrame } from "../world/SnapshotStore";

export class SnapshotRenderer {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private readonly GRID_SIZE = 250; // Larger grid for space feel
  
  // Track velocity for acceleration calculation
  private lastVelocity = { x: 0, y: 0 };
  private lastTime = Date.now();
  private currentAcceleration = { x: 0, y: 0 };
  private readonly SPEED_OF_LIGHT = 5000; // m/s (from physics config c')

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
    
    // Update acceleration calculation
    this.updateAcceleration(velocity);
    
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
    
    // 2b. Acceleration / G-Force Panel (Below Server Info)
    const accelMagnitude = Math.hypot(this.currentAcceleration.x, this.currentAcceleration.y);
    const gForce = accelMagnitude / 9.81; // Convert to Gs
    const gColor = gForce < 3 ? this.STYLE.colorOnline : (gForce < 6 ? this.STYLE.colorWarning : this.STYLE.colorOffline);
    
    this.drawPanel(15, 185, 240, 90);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("ACCELERATION", 32, 208);
    
    this.ctx.fillStyle = gColor;
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(`${gForce.toFixed(1)}`, 32, 238);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillText("G", 90, 238);
    
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText(`${accelMagnitude.toFixed(1)} m/s²`, 32, 258);
    
    // G-force warning indicator
    if (gForce >= 6) {
      this.ctx.fillStyle = this.STYLE.colorOffline;
      this.ctx.fillText("⚠ HIGH G", 145, 238);
    } else if (gForce >= 3) {
      this.ctx.fillStyle = this.STYLE.colorWarning;
      this.ctx.fillText("CAUTION", 145, 238);
    } else {
      this.ctx.fillStyle = this.STYLE.colorOnline;
      this.ctx.fillText("NORMAL", 145, 238);
    }
    
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
    
    // 4. Heading / Compass Panel (Below Flight Assist)
    const heading = this.calculateHeading(velocity);
    
    this.drawPanel(this.width - 255, 110, 240, 85);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("HEADING", this.width - 238, 133);
    
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillStyle = this.STYLE.colorAccent;
    this.ctx.fillText(`${heading.toFixed(0)}°`, this.width - 238, 163);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontSmall;
    const cardinalDir = this.getCardinalDirection(heading);
    this.ctx.fillText(cardinalDir, this.width - 238, 178);
    
    // Mini compass rose
    this.drawMiniCompass(this.width - 115, 153, 20, heading);
    
    // 5. Relativity Panel (Below Heading)
    // 5. Relativity Panel (Below Heading)
    const gamma = this.calculateGamma(speed);
    const percentC = (speed / this.SPEED_OF_LIGHT) * 100;
    
    this.drawPanel(this.width - 255, 205, 240, 90);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("RELATIVITY", this.width - 238, 228);
    
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillStyle = percentC > 50 ? this.STYLE.colorWarning : this.STYLE.colorAccent;
    this.ctx.fillText(`${percentC.toFixed(1)}% c'`, this.width - 238, 250);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText(`γ = ${gamma.toFixed(3)}`, this.width - 238, 270);
    
    if (gamma > 1.05) {
      this.ctx.fillStyle = this.STYLE.colorWarning;
      this.ctx.fillText("TIME DILATION", this.width - 120, 270);
    }
    
    // === BOTTOM ROW: VELOCITY & ANGULAR ===
    
    // 5b. Linear Velocity Panel (Bottom-Left) - Enhanced with Speed Limit
    this.drawPanel(15, this.height - 110, 240, 95);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("LINEAR SPEED", 32, this.height - 87);
    
    // Speed limit indicator for FA:ON
    const speedLimit = faMode === "coupled" ? 500 : this.SPEED_OF_LIGHT; // 500 m/s limit for FA:ON
    const speedPercent = faMode === "coupled" ? (speed / speedLimit) * 100 : 0;
    
    this.ctx.fillStyle = this.STYLE.colorAccent;
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(`${Math.round(speed)}`, 32, this.height - 58);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontValue;
    this.ctx.fillText("m/s", 32, this.height - 35);
    
    this.ctx.font = this.STYLE.fontSmall;
    this.ctx.fillText(`Vx: ${velocity.x.toFixed(1)}`, 130, this.height - 70);
    this.ctx.fillText(`Vy: ${velocity.y.toFixed(1)}`, 130, this.height - 50);
    
    // FA:ON speed limit bar
    if (faMode === "coupled") {
      this.ctx.fillText(`LIMIT: ${speedLimit}`, 130, this.height - 30);
      // Draw speed limit progress bar
      this.drawSpeedLimitBar(150, this.height - 87, 80, 8, speedPercent);
    }
    
    // 6. Angular Velocity Panel (Bottom-Right)
    const angularVel = this.estimateAngularVelocity(velocity); // Mock angular velocity
    
    this.drawPanel(this.width - 255, this.height - 110, 240, 95);
    
    this.ctx.fillStyle = this.STYLE.colorNeutral;
    this.ctx.font = this.STYLE.fontTitle;
    this.ctx.fillText("ANGULAR SPEED", this.width - 238, this.height - 87);
    
    this.ctx.fillStyle = this.STYLE.colorAccent;
    this.ctx.font = this.STYLE.fontLarge;
    this.ctx.fillText(`${Math.abs(angularVel).toFixed(1)}`, this.width - 238, this.height - 58);
    
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
   * Estimate angular velocity from linear velocity changes
   */
  private estimateAngularVelocity(velocity: {x: number, y: number}): number {
    // Mock angular velocity based on lateral movement
    // В реальности нужно получать из EntityState
    const lateral = velocity.x;
    return lateral * 0.5; // Mock conversion
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
  
  /**
   * Update acceleration calculation based on velocity changes
   */
  private updateAcceleration(velocity: {x: number, y: number}) {
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000; // Convert to seconds
    
    if (dt > 0 && dt < 1) { // Sanity check for reasonable time deltas
      this.currentAcceleration = {
        x: (velocity.x - this.lastVelocity.x) / dt,
        y: (velocity.y - this.lastVelocity.y) / dt
      };
    }
    
    this.lastVelocity = { x: velocity.x, y: velocity.y };
    this.lastTime = now;
  }
  
  /**
   * Calculate gamma (Lorentz factor) for relativity display
   */
  private calculateGamma(speed: number): number {
    const beta = speed / this.SPEED_OF_LIGHT;
    if (beta >= 0.999) return 22.37; // Cap at 0.999c'
    return 1 / Math.sqrt(1 - beta * beta);
  }
  
  /**
   * Calculate heading angle from velocity vector
   */
  private calculateHeading(velocity: {x: number, y: number}): number {
    const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
    return (angle + 360) % 360; // Normalize to 0-360
  }
  
  /**
   * Get cardinal direction from heading
   */
  private getCardinalDirection(heading: number): string {
    const directions = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  }
  
  /**
   * Draw mini compass rose
   */
  private drawMiniCompass(x: number, y: number, radius: number, heading: number) {
    this.ctx.save();
    this.ctx.translate(x, y);
    
    // Compass circle
    this.ctx.strokeStyle = this.STYLE.uiBorder;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // North marker
    this.ctx.rotate(-heading * Math.PI / 180);
    this.ctx.fillStyle = this.STYLE.colorOffline;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -radius);
    this.ctx.lineTo(-3, -radius + 6);
    this.ctx.lineTo(3, -radius + 6);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Direction pointer (current heading)
    this.ctx.rotate(heading * Math.PI / 180);
    this.ctx.fillStyle = this.STYLE.colorAccent;
    this.ctx.beginPath();
    this.ctx.moveTo(radius - 5, 0);
    this.ctx.lineTo(radius - 10, -3);
    this.ctx.lineTo(radius - 10, 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  /**
   * Draw speed limit progress bar for FA:ON mode
   */
  private drawSpeedLimitBar(x: number, y: number, width: number, height: number, percent: number) {
    this.ctx.save();
    
    // Background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.fillRect(x, y, width, height);
    
    // Border
    this.ctx.strokeStyle = this.STYLE.uiBorder;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
    
    // Fill based on percentage
    const fillWidth = (width - 2) * Math.min(percent / 100, 1);
    const fillColor = percent < 70 ? this.STYLE.colorOnline : 
                     percent < 90 ? this.STYLE.colorWarning : 
                     this.STYLE.colorOffline;
    
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x + 1, y + 1, fillWidth, height - 2);
    
    this.ctx.restore();
  }
}
