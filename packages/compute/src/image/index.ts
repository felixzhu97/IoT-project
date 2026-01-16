/**
 * 图像处理模块
 * 提供图像滤镜、压缩、格式转换和调整大小功能
 */

/**
 * 图像滤镜类型
 */
export type ImageFilter = 'grayscale' | 'invert' | 'blur' | 'sepia' | 'brightness';

/**
 * 图像格式类型
 */
export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

/**
 * 图像压缩选项
 */
export interface ImageCompressOptions {
  quality?: number; // 0-1，仅对JPEG和WebP有效
  format?: ImageFormat;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * 图像调整大小选项
 */
export interface ImageResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  quality?: number;
}

/**
 * 从File或Blob创建ImageBitmap
 * @param source - 图像源（File、Blob或URL字符串）
 * @returns Promise<ImageBitmap> 图像位图对象
 */
async function createImageBitmap(source: File | Blob | string): Promise<ImageBitmap> {
  if (typeof source === 'string') {
    const response = await fetch(source);
    const blob = await response.blob();
    return createImageBitmap(blob);
  }
  return createImageBitmap(source);
}

/**
 * 将ImageBitmap转换为Blob
 * @param imageBitmap - 图像位图对象
 * @param format - 图像格式
 * @param quality - 质量（0-1）
 * @returns Promise<Blob> 转换后的Blob
 */
async function imageBitmapToBlob(
  imageBitmap: ImageBitmap,
  format: ImageFormat = 'image/png',
  quality: number = 0.92
): Promise<Blob> {
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(imageBitmap, 0, 0);
  return canvas.convertToBlob({ type: format, quality });
}

/**
 * 应用图像滤镜
 * @param source - 图像源（File、Blob或URL字符串）
 * @param filter - 滤镜类型
 * @param options - 滤镜选项（例如强度）
 * @returns Promise<Blob> 处理后的图像Blob
 */
export async function applyFilter(
  source: File | Blob | string,
  filter: ImageFilter,
  options?: { intensity?: number }
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(imageBitmap, 0, 0);

  const intensity = options?.intensity ?? 1;

  switch (filter) {
    case 'grayscale':
      ctx.filter = `grayscale(${intensity * 100}%)`;
      break;
    case 'invert':
      ctx.filter = `invert(${intensity * 100}%)`;
      break;
    case 'blur':
      ctx.filter = `blur(${intensity * 5}px)`;
      break;
    case 'sepia':
      ctx.filter = `sepia(${intensity * 100}%)`;
      break;
    case 'brightness':
      ctx.filter = `brightness(${intensity})`;
      break;
  }

  // 重新绘制应用滤镜
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);

  return canvas.convertToBlob({ type: 'image/png' });
}

/**
 * 压缩图像
 * @param source - 图像源（File、Blob或URL字符串）
 * @param options - 压缩选项
 * @returns Promise<Blob> 压缩后的图像Blob
 */
export async function compressImage(
  source: File | Blob | string,
  options: ImageCompressOptions = {}
): Promise<Blob> {
  const {
    quality = 0.8,
    format = 'image/jpeg',
    maxWidth,
    maxHeight,
  } = options;

  let imageBitmap = await createImageBitmap(source);

  // 如果指定了最大尺寸，先调整大小
  if (maxWidth || maxHeight) {
    const width = maxWidth ?? imageBitmap.width;
    const height = maxHeight ?? imageBitmap.height;
    const scale = Math.min(
      width / imageBitmap.width,
      height / imageBitmap.height
    );

    const newWidth = Math.floor(imageBitmap.width * scale);
    const newHeight = Math.floor(imageBitmap.height * scale);

    const canvas = new OffscreenCanvas(newWidth, newHeight);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
    const resizedBlob = await canvas.convertToBlob({ type: 'image/png' });
    imageBitmap = await createImageBitmap(resizedBlob);
  }

  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(imageBitmap, 0, 0);

  return canvas.convertToBlob({
    type: format,
    quality: format !== 'image/png' ? quality : undefined,
  });
}

/**
 * 转换图像格式
 * @param source - 图像源（File、Blob或URL字符串）
 * @param format - 目标格式
 * @param quality - 质量（0-1，仅对JPEG和WebP有效）
 * @returns Promise<Blob> 转换后的图像Blob
 */
export async function convertFormat(
  source: File | Blob | string,
  format: ImageFormat,
  quality: number = 0.92
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  return imageBitmapToBlob(imageBitmap, format, quality);
}

/**
 * 调整图像大小
 * @param source - 图像源（File、Blob或URL字符串）
 * @param options - 调整大小选项
 * @returns Promise<Blob> 调整大小后的图像Blob
 */
export async function resizeImage(
  source: File | Blob | string,
  options: ImageResizeOptions
): Promise<Blob> {
  const {
    width,
    height,
    maintainAspectRatio = true,
    quality = 0.92,
  } = options;

  const imageBitmap = await createImageBitmap(source);

  let targetWidth = width ?? imageBitmap.width;
  let targetHeight = height ?? imageBitmap.height;

  if (maintainAspectRatio && width && height) {
    const scale = Math.min(
      width / imageBitmap.width,
      height / imageBitmap.height
    );
    targetWidth = Math.floor(imageBitmap.width * scale);
    targetHeight = Math.floor(imageBitmap.height * scale);
  } else if (maintainAspectRatio && width) {
    const scale = width / imageBitmap.width;
    targetHeight = Math.floor(imageBitmap.height * scale);
  } else if (maintainAspectRatio && height) {
    const scale = height / imageBitmap.height;
    targetWidth = Math.floor(imageBitmap.width * scale);
  }

  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  return canvas.convertToBlob({
    type: 'image/png',
    quality,
  });
}

/**
 * 获取图像信息
 * @param source - 图像源（File、Blob或URL字符串）
 * @returns Promise<{ width: number; height: number; format?: string }> 图像信息
 */
export async function getImageInfo(
  source: File | Blob | string
): Promise<{ width: number; height: number; format?: string }> {
  const imageBitmap = await createImageBitmap(source);
  let format: string | undefined;

  if (source instanceof File || source instanceof Blob) {
    format = source.type;
  }

  return {
    width: imageBitmap.width,
    height: imageBitmap.height,
    format,
  };
}
