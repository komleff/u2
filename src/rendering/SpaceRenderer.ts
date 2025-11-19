/**
 * SpaceRenderer - Comic-style sci-fi space renderer
 * Renders ships, stars, and effects in a hand-drawn comic book aesthetic
 */

import type { WorldSnapshotProto, EntitySnapshotProto } from '@network/proto/ecs.js';

export interface RendererConfig {
  width: number;
  height: number;
  showDebugInfo?: boolean;
}

export class SpaceRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private showDebugInfo: boolean;
  private stars: Array<{ x: number; y: number; size: number; brightness: number }> = [];

  constructor(ctx: CanvasRenderingContext2D, config: RendererConfig) {
    this.ctx = ctx;
    this.width = config.width;
    this.height = config.height;
    this.showDebugInfo = config.showDebugInfo ?? false;
    this.initializeStarfield();
  }

  /**
   * Initialize parallax starfield background
   */
  private initializeStarfield(): void {
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.6 + 0.4
      });
    }
  }

  /**
   * Resize renderer viewport
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Render complete frame from world snapshot
   */
  render(snapshot: WorldSnapshotProto | null, localEntityId: number | null): void {
    this.clear();
    this.drawStarfield();
    
    if (snapshot && snapshot.entities) {
      // Draw all entities
      for (const entity of snapshot.entities) {
        const isLocal = entity.entityId === localEntityId;
        this.drawShip(entity, isLocal);
      }

      // Draw debug info if enabled
      if (this.showDebugInfo && snapshot.tick) {
        this.drawDebugInfo(snapshot);
      }
    }
  }

  /**
   * Clear canvas with deep space gradient
   */
  private clear(): void {
    const gradient = this.ctx.createRadialGradient(
      this.width * 0.3,
      this.height * 0.2,
      0,
      this.width * 0.5,
      this.height * 0.5,
      this.width * 0.8
    );
    gradient.addColorStop(0, '#0d1821');
    gradient.addColorStop(0.5, '#05090f');
    gradient.addColorStop(1, '#010204');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw comic-style starfield
   */
  private drawStarfield(): void {
    for (const star of this.stars) {
      const alpha = star.brightness;
      const glow = star.size > 1.5;

      // Draw star glow (for larger stars)
      if (glow) {
        const glowGradient = this.ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3
        );
        glowGradient.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.4})`);
        glowGradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(
          star.x - star.size * 3,
          star.y - star.size * 3,
          star.size * 6,
          star.size * 6
        );
      }

      // Draw star core
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fillRect(
        star.x - star.size / 2,
        star.y - star.size / 2,
        star.size,
        star.size
      );
    }
  }

  /**
   * Draw ship with comic book styling
   */
  private drawShip(entity: EntitySnapshotProto, isLocal: boolean): void {
    if (!entity.transform) return;

    const pos = entity.transform.position;
    if (!pos) return;

    const x = this.width / 2 + (pos.x ?? 0);
    const y = this.height / 2 - (pos.y ?? 0); // Invert Y for screen coords
    const rotation = entity.transform.rotation ?? 0;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(-rotation); // Negative because screen Y is inverted

    // Choose color based on local/remote
    const primaryColor = isLocal ? '#1ff2ff' : '#ff6b35';
    const glowColor = isLocal ? '#00d9ff' : '#ff8c42';

    // Draw engine trail if moving
    if (entity.velocity?.linear) {
      const vel = entity.velocity.linear;
      const speed = Math.sqrt((vel.x ?? 0) ** 2 + (vel.y ?? 0) ** 2);
      if (speed > 1) {
        this.drawEngineTrail(speed, primaryColor);
      }
    }

    // Draw ship hull with comic outline
    this.drawShipHull(primaryColor, glowColor, isLocal);

    // Draw health bar
    if (entity.health) {
      this.drawHealthBar(entity.health.currentHp ?? 0, entity.health.maxHp ?? 100);
    }

    this.ctx.restore();
  }

  /**
   * Draw comic-style ship hull
   */
  private drawShipHull(primaryColor: string, glowColor: string, isLocal: boolean): void {
    const size = 30;

    // Outer glow
    const glowGradient = this.ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 1.5);
    glowGradient.addColorStop(0, `${glowColor}40`);
    glowGradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = glowGradient;
    this.ctx.fillRect(-size * 1.5, -size * 1.5, size * 3, size * 3);

    // Ship body - triangular for forward direction
    this.ctx.beginPath();
    this.ctx.moveTo(size, 0); // Front
    this.ctx.lineTo(-size * 0.6, -size * 0.6); // Top back
    this.ctx.lineTo(-size * 0.4, 0); // Back center
    this.ctx.lineTo(-size * 0.6, size * 0.6); // Bottom back
    this.ctx.closePath();

    // Fill with gradient
    const fillGradient = this.ctx.createLinearGradient(-size, 0, size, 0);
    fillGradient.addColorStop(0, '#0a1929');
    fillGradient.addColorStop(1, primaryColor + '80');
    this.ctx.fillStyle = fillGradient;
    this.ctx.fill();

    // Comic-style thick outline
    this.ctx.strokeStyle = primaryColor;
    this.ctx.lineWidth = isLocal ? 3 : 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();

    // Cockpit/detail
    this.ctx.beginPath();
    this.ctx.arc(size * 0.4, 0, size * 0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = glowColor;
    this.ctx.fill();
    this.ctx.strokeStyle = primaryColor;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  /**
   * Draw engine trail effect
   */
  private drawEngineTrail(speed: number, color: string): void {
    const trailLength = Math.min(speed * 2, 60);
    const trailWidth = 15;

    const gradient = this.ctx.createLinearGradient(0, 0, -trailLength, 0);
    gradient.addColorStop(0, `${color}60`);
    gradient.addColorStop(0.5, `${color}20`);
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(-trailLength, -trailWidth / 2, trailLength, trailWidth);
  }

  /**
   * Draw health bar above ship
   */
  private drawHealthBar(current: number, max: number): void {
    const barWidth = 40;
    const barHeight = 4;
    const yOffset = -40;

    const healthPercent = current / max;

    // Background
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(-barWidth / 2, yOffset, barWidth, barHeight);

    // Health fill
    const healthColor = healthPercent > 0.6 ? '#4ade80' : 
                       healthPercent > 0.3 ? '#fbbf24' : '#ef4444';
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(-barWidth / 2, yOffset, barWidth * healthPercent, barHeight);

    // Border
    this.ctx.strokeStyle = '#ffffff80';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-barWidth / 2, yOffset, barWidth, barHeight);
  }

  /**
   * Draw debug information overlay
   */
  private drawDebugInfo(snapshot: WorldSnapshotProto): void {
    this.ctx.save();
    this.ctx.resetTransform();

    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`Tick: ${snapshot.tick ?? 0}`, 10, 20);
    this.ctx.fillText(`Entities: ${snapshot.entities?.length ?? 0}`, 10, 35);
    this.ctx.fillText(`Time: ${snapshot.timestampMs ?? 0}`, 10, 50);

    this.ctx.restore();
  }

  /**
   * Draw online status indicator
   */
  drawOnlineIndicator(isOnline: boolean, isConnected: boolean): void {
    this.ctx.save();
    this.ctx.resetTransform();

    if (isOnline) {
      // Status dot
      const dotColor = isConnected ? '#4ade80' : '#fbbf24';
      
      // Glow effect
      const gradient = this.ctx.createRadialGradient(20, 20, 0, 20, 20, 12);
      gradient.addColorStop(0, dotColor);
      gradient.addColorStop(0.5, `${dotColor}80`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(8, 8, 24, 24);

      // Dot
      this.ctx.fillStyle = dotColor;
      this.ctx.beginPath();
      this.ctx.arc(20, 20, 8, 0, Math.PI * 2);
      this.ctx.fill();

      // Comic-style outline
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 14px monospace';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('ONLINE', 35, 20);
    }

    this.ctx.restore();
  }

  /**
   * Draw comic-style HUD message
   */
  drawHudMessage(message: string, y: number = 50): void {
    this.ctx.save();
    this.ctx.resetTransform();

    this.ctx.fillStyle = '#1ff2ff';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(message, this.width / 2, y);
    this.ctx.fillText(message, this.width / 2, y);

    this.ctx.restore();
  }
}
