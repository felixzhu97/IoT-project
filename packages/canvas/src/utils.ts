/**
 * Canvas 工具函数
 */

/**
 * 坐标转换工具
 */
export class CoordinateTransform {
  private scaleX: number;
  private scaleY: number;
  private offsetX: number;
  private offsetY: number;

  constructor(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number,
    mode: "contain" | "cover" | "fill" = "contain"
  ) {
    let scale: number;

    switch (mode) {
      case "contain":
        scale = Math.min(
          targetWidth / sourceWidth,
          targetHeight / sourceHeight
        );
        this.scaleX = scale;
        this.scaleY = scale;
        this.offsetX = (targetWidth - sourceWidth * scale) / 2;
        this.offsetY = (targetHeight - sourceHeight * scale) / 2;
        break;

      case "cover":
        scale = Math.max(
          targetWidth / sourceWidth,
          targetHeight / sourceHeight
        );
        this.scaleX = scale;
        this.scaleY = scale;
        this.offsetX = (targetWidth - sourceWidth * scale) / 2;
        this.offsetY = (targetHeight - sourceHeight * scale) / 2;
        break;

      case "fill":
        this.scaleX = targetWidth / sourceWidth;
        this.scaleY = targetHeight / sourceHeight;
        this.offsetX = 0;
        this.offsetY = 0;
        break;
    }
  }

  /**
   * 将源坐标转换为目标坐标
   */
  transform(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.scaleX + this.offsetX,
      y: y * this.scaleY + this.offsetY,
    };
  }

  /**
   * 将目标坐标转换为源坐标
   */
  inverse(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - this.offsetX) / this.scaleX,
      y: (y - this.offsetY) / this.scaleY,
    };
  }
}

/**
 * 颜色工具
 */
export const colorUtils = {
  /**
   * 解析颜色字符串为 RGB
   */
  parseColor(color: string): { r: number; g: number; b: number; a: number } {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return { r: 0, g: 0, b: 0, a: 1 };

    ctx.fillStyle = color;
    const computed = ctx.fillStyle as string;

    // 处理 rgb/rgba 格式
    const rgbMatch = computed.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
        a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
      };
    }

    // 处理十六进制格式
    const hexMatch = computed.match(
      /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?/
    );
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16),
        a: hexMatch[4] ? parseInt(hexMatch[4], 16) / 255 : 1,
      };
    }

    return { r: 0, g: 0, b: 0, a: 1 };
  },

  /**
   * RGB 转十六进制
   */
  rgbToHex(r: number, g: number, b: number, a?: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return a !== undefined
      ? `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`
      : `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  /**
   * 颜色插值
   */
  lerpColor(color1: string, color2: string, t: number): string {
    const c1 = this.parseColor(color1);
    const c2 = this.parseColor(color2);

    const r = c1.r + (c2.r - c1.r) * t;
    const g = c1.g + (c2.g - c1.g) * t;
    const b = c1.b + (c2.b - c1.b) * t;
    const a = c1.a + (c2.a - c1.a) * t;

    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
  },

  /**
   * 调整颜色亮度
   */
  adjustBrightness(color: string, factor: number): string {
    const c = this.parseColor(color);
    const r = Math.min(255, Math.max(0, c.r * factor));
    const g = Math.min(255, Math.max(0, c.g * factor));
    const b = Math.min(255, Math.max(0, c.b * factor));
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  },
};

/**
 * 路径工具
 */
export const pathUtils = {
  /**
   * 生成圆角矩形路径
   */
  createRoundedRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | { tl: number; tr: number; bl: number; br: number }
  ): void {
    const r =
      typeof radius === "number"
        ? { tl: radius, tr: radius, bl: radius, br: radius }
        : radius;

    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + width - r.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
    ctx.lineTo(x + width, y + height - r.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
    ctx.lineTo(x + r.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
  },

  /**
   * 生成星形路径
   */
  createStarPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outerRadius: number,
    innerRadius: number,
    points: number = 5
  ): void {
    ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.closePath();
  },

  /**
   * 生成多边形路径
   */
  createPolygonPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    sides: number,
    rotation: number = 0
  ): void {
    ctx.beginPath();

    for (let i = 0; i < sides; i++) {
      const angle = (i * (Math.PI * 2)) / sides - Math.PI / 2 + rotation;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.closePath();
  },
};

/**
 * 清空画布
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width?: number,
  height?: number
): void {
  if (width !== undefined && height !== undefined) {
    ctx.clearRect(0, 0, width, height);
  } else {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * 获取鼠标在画布上的坐标
 */
export function getCanvasMousePos(
  canvas: HTMLCanvasElement,
  event: MouseEvent | TouchEvent
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
  const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}
