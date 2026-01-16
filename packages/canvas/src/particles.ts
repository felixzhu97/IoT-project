/**
 * Canvas 粒子系统
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface ParticleSystemOptions {
  x: number;
  y: number;
  count?: number;
  speed?: number;
  size?: number | { min: number; max: number };
  color?: string | string[];
  life?: number;
  spread?: number;
  gravity?: number;
  friction?: number;
}

/**
 * 粒子发射器
 */
export class ParticleEmitter {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;
  private options: Required<Omit<ParticleSystemOptions, "color">> & {
    color: string | string[];
  };
  private x: number;
  private y: number;
  private animationId?: number;
  private isRunning = false;

  constructor(ctx: CanvasRenderingContext2D, options: ParticleSystemOptions) {
    this.ctx = ctx;
    this.x = options.x;
    this.y = options.y;
    this.options = {
      count: options.count || 50,
      speed: options.speed || 2,
      size: options.size || 4,
      color: options.color || "#ffffff",
      life: options.life || 1000,
      spread: options.spread || Math.PI * 2,
      gravity: options.gravity || 0,
      friction: options.friction || 0.98,
    };
  }

  /**
   * 创建单个粒子
   */
  private createParticle(): Particle {
    const angle = Math.random() * this.options.spread;
    const speed = (Math.random() * 0.5 + 0.5) * this.options.speed;

    const size =
      typeof this.options.size === "number"
        ? this.options.size
        : this.options.size.min +
          Math.random() * (this.options.size.max - this.options.size.min);

    const color =
      typeof this.options.color === "string"
        ? this.options.color
        : this.options.color[
            Math.floor(Math.random() * this.options.color.length)
          ];

    return {
      x: this.x,
      y: this.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: this.options.life,
      maxLife: this.options.life,
      size,
      color,
      alpha: 1,
    };
  }

  /**
   * 发射粒子
   */
  emit(count?: number): void {
    const emitCount = count || this.options.count;
    for (let i = 0; i < emitCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  /**
   * 更新粒子
   */
  private update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // 更新位置
      particle.x += particle.vx * (deltaTime / 16);
      particle.y += particle.vy * (deltaTime / 16);

      // 应用重力和摩擦力
      particle.vy += this.options.gravity * (deltaTime / 16);
      particle.vx *= this.options.friction;
      particle.vy *= this.options.friction;

      // 更新生命周期
      particle.life -= deltaTime;
      particle.alpha = particle.life / particle.maxLife;

      // 移除死亡的粒子
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 绘制粒子
   */
  private draw(): void {
    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  /**
   * 动画循环
   */
  private animate = (currentTime: number): void => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - (this.lastTime || currentTime);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    if (this.isRunning) {
      this.animationId = requestAnimationFrame(this.animate);
    }
  };

  private lastTime?: number;

  /**
   * 开始动画
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = undefined;
    this.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * 停止动画
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * 清空所有粒子
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * 设置发射位置
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * 获取粒子数量
   */
  getParticleCount(): number {
    return this.particles.length;
  }
}

/**
 * 创建粒子系统
 */
export function createParticleSystem(
  ctx: CanvasRenderingContext2D,
  options: ParticleSystemOptions
): ParticleEmitter {
  return new ParticleEmitter(ctx, options);
}
