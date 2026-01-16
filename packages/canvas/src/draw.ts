/**
 * Canvas 2D 绘制工具
 */

export interface DrawRectOptions {
  fill?: string | CanvasGradient | CanvasPattern;
  stroke?: string;
  lineWidth?: number;
  lineDash?: number[];
  opacity?: number;
}

export interface DrawCircleOptions extends DrawRectOptions {
  startAngle?: number;
  endAngle?: number;
  counterclockwise?: boolean;
}

export interface DrawLineOptions {
  stroke?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDash?: number[];
  opacity?: number;
}

/**
 * 绘制矩形
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: DrawRectOptions = {}
): void {
  const { fill, stroke, lineWidth = 1, lineDash, opacity = 1 } = options;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (lineDash) {
    ctx.setLineDash(lineDash);
  }

  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.rect(x, y, width, height);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 绘制圆角矩形
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl: number; tr: number; bl: number; br: number },
  options: DrawRectOptions = {}
): void {
  const { fill, stroke, lineWidth = 1, lineDash, opacity = 1 } = options;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (lineDash) {
    ctx.setLineDash(lineDash);
  }

  ctx.lineWidth = lineWidth;

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

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 绘制圆形或圆弧
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  options: DrawCircleOptions = {}
): void {
  const {
    fill,
    stroke,
    lineWidth = 1,
    lineDash,
    opacity = 1,
    startAngle = 0,
    endAngle = Math.PI * 2,
    counterclockwise = false,
  } = options;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (lineDash) {
    ctx.setLineDash(lineDash);
  }

  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 绘制线条 - 使用对象数组
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  options?: DrawLineOptions
): void;
/**
 * 绘制线条 - 使用元组数组
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  options?: DrawLineOptions
): void;
/**
 * 绘制线条 - 实现
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number } | [number, number]>,
  options: DrawLineOptions = {}
): void {
  const {
    stroke = "#000",
    lineWidth = 1,
    lineCap = "round",
    lineJoin = "round",
    lineDash,
    opacity = 1,
  } = options;

  if (points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (lineDash) {
    ctx.setLineDash(lineDash);
  }

  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = lineCap;
  ctx.lineJoin = lineJoin;

  ctx.beginPath();

  // 处理第一个点
  const firstPointValue = points[0];
  let firstPoint: { x: number; y: number };
  if (Array.isArray(firstPointValue)) {
    const tuple = firstPointValue as [number, number];
    firstPoint = { x: tuple[0], y: tuple[1] };
  } else {
    firstPoint = firstPointValue as { x: number; y: number };
  }
  ctx.moveTo(firstPoint.x, firstPoint.y);

  // 处理后续点
  for (let i = 1; i < points.length; i++) {
    const pointValue = points[i];
    let point: { x: number; y: number };
    if (Array.isArray(pointValue)) {
      const tuple = pointValue as [number, number];
      point = { x: tuple[0], y: tuple[1] };
    } else {
      point = pointValue as { x: number; y: number };
    }
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * 绘制路径
 */
export function drawPath(
  ctx: CanvasRenderingContext2D,
  commands: Array<{ type: string; [key: string]: any }>,
  options: DrawRectOptions = {}
): void {
  const { fill, stroke, lineWidth = 1, lineDash, opacity = 1 } = options;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (lineDash) {
    ctx.setLineDash(lineDash);
  }

  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  for (const cmd of commands) {
    switch (cmd.type) {
      case "moveTo":
        ctx.moveTo(cmd.x, cmd.y);
        break;
      case "lineTo":
        ctx.lineTo(cmd.x, cmd.y);
        break;
      case "quadraticCurveTo":
        ctx.quadraticCurveTo(cmd.cpx, cmd.cpy, cmd.x, cmd.y);
        break;
      case "bezierCurveTo":
        ctx.bezierCurveTo(cmd.cp1x, cmd.cp1y, cmd.cp2x, cmd.cp2y, cmd.x, cmd.y);
        break;
      case "arc":
        ctx.arc(
          cmd.x,
          cmd.y,
          cmd.radius,
          cmd.startAngle,
          cmd.endAngle,
          cmd.counterclockwise || false
        );
        break;
      case "arcTo":
        ctx.arcTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.radius);
        break;
      case "closePath":
        ctx.closePath();
        break;
    }
  }

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 绘制文本
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string;
    fill?: string;
    stroke?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    maxWidth?: number;
    opacity?: number;
  } = {}
): void {
  const {
    font = "16px Arial",
    fill,
    stroke,
    align = "left",
    baseline = "top",
    maxWidth,
    opacity = 1,
  } = options;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y, maxWidth);
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.strokeText(text, x, y, maxWidth);
  }

  ctx.restore();
}

/**
 * 绘制图像
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
  x: number,
  y: number,
  options?: {
    width?: number;
    height?: number;
    opacity?: number;
    sx?: number;
    sy?: number;
    sWidth?: number;
    sHeight?: number;
  }
): void {
  const { width, height, opacity = 1, sx, sy, sWidth, sHeight } = options || {};

  ctx.save();
  ctx.globalAlpha = opacity;

  if (
    sx !== undefined &&
    sy !== undefined &&
    sWidth !== undefined &&
    sHeight !== undefined
  ) {
    if (width !== undefined && height !== undefined) {
      ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
    } else {
      // 需要创建临时 canvas 来绘制裁剪后的图像，因为 Canvas API 不支持只有源矩形和目标位置的 7 参数版本
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = sWidth;
      tempCanvas.height = sHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(
          image,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          sWidth,
          sHeight
        );
        ctx.drawImage(tempCanvas, x, y);
      }
    }
  } else if (width !== undefined && height !== undefined) {
    ctx.drawImage(image, x, y, width, height);
  } else {
    ctx.drawImage(image, x, y);
  }

  ctx.restore();
}
