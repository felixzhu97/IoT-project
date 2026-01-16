/**
 * Canvas 图像处理工具
 */

/**
 * 加载图像
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 图像裁剪
 */
export function cropImage(
  image: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法获取canvas上下文')

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)
  return canvas
}

/**
 * 图像缩放
 */
export function resizeImage(
  image: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
  quality: 'low' | 'medium' | 'high' = 'high'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法获取canvas上下文')

  // 设置图像平滑质量
  const imageSmoothingQuality = quality === 'low' ? 'low' : quality === 'medium' ? 'medium' : 'high'
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = imageSmoothingQuality

  ctx.drawImage(image, 0, 0, width, height)
  return canvas
}

/**
 * 应用滤镜效果
 */
export type FilterType = 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast' | 'invert'

export function applyFilter(
  image: HTMLImageElement | HTMLCanvasElement,
  filterType: FilterType,
  value: number = 1
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法获取canvas上下文')

  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  switch (filterType) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
      }
      break

    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
      }
      break

    case 'brightness':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * value)
        data[i + 1] = Math.min(255, data[i + 1] * value)
        data[i + 2] = Math.min(255, data[i + 2] * value)
      }
      break

    case 'contrast':
      const factor = (259 * (value * 255 + 255)) / (255 * (259 - value * 255))
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
      }
      break

    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
      break

    case 'blur':
      // 简单的模糊实现（盒式模糊）
      const radius = Math.floor(value)
      const weights = []
      for (let i = -radius; i <= radius; i++) {
        weights.push(1 / (2 * radius + 1))
      }

      const tempData = new Uint8ClampedArray(data)
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          let r = 0,
            g = 0,
            b = 0,
            a = 0

          for (let i = -radius; i <= radius; i++) {
            const px = Math.max(0, Math.min(canvas.width - 1, x + i))
            const idx = (y * canvas.width + px) * 4
            const weight = weights[i + radius]
            r += tempData[idx] * weight
            g += tempData[idx + 1] * weight
            b += tempData[idx + 2] * weight
            a += tempData[idx + 3] * weight
          }

          const idx = (y * canvas.width + x) * 4
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = a
        }
      }
      break
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/**
 * 将 Canvas 转换为 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('转换失败'))
        }
      },
      type,
      quality
    )
  })
}

/**
 * 将 Canvas 转换为 Data URL
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, type: string = 'image/png', quality?: number): string {
  return canvas.toDataURL(type, quality)
}

/**
 * 创建渐变
 */
export function createGradient(
  ctx: CanvasRenderingContext2D,
  type: 'linear' | 'radial',
  ...params: number[]
): CanvasGradient {
  if (type === 'linear') {
    return ctx.createLinearGradient(params[0], params[1], params[2], params[3])
  } else {
    return ctx.createRadialGradient(params[0], params[1], params[2], params[3], params[4], params[5])
  }
}
