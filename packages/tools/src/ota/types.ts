/**
 * OTA固件更新类型定义
 */

/**
 * 固件版本信息
 */
export interface FirmwareVersion {
  /**
   * 版本号
   */
  version: string
  /**
   * 版本描述
   */
  description?: string
  /**
   * 发布日期
   */
  releaseDate?: Date
  /**
   * 文件大小（字节）
   */
  fileSize?: number
  /**
   * 文件URL或路径
   */
  fileUrl?: string
  /**
   * 校验和（MD5或SHA256）
   */
  checksum?: string
  /**
   * 数字签名（可选）
   */
  signature?: string
  /**
   * 是否强制更新
   */
  forceUpdate?: boolean
  /**
   * 支持的设备类型
   */
  supportedDevices?: string[]
}

/**
 * 固件下载选项
 */
export interface FirmwareDownloadOptions {
  /**
   * 下载URL
   */
  url: string
  /**
   * 下载超时时间（毫秒）
   */
  timeout?: number
  /**
   * 是否启用断点续传
   */
  resume?: boolean
  /**
   * 分块大小（字节）
   */
  chunkSize?: number
  /**
   * 进度回调
   */
  onProgress?: (progress: DownloadProgress) => void
}

/**
 * 下载进度
 */
export interface DownloadProgress {
  /**
   * 已下载字节数
   */
  downloaded: number
  /**
   * 总字节数
   */
  total: number
  /**
   * 下载百分比（0-100）
   */
  percentage: number
  /**
   * 下载速度（字节/秒）
   */
  speed?: number
}

/**
 * OTA更新状态
 */
export enum OtaUpdateStatus {
  Idle = 'idle',
  Checking = 'checking',
  Downloading = 'downloading',
  Verifying = 'verifying',
  Installing = 'installing',
  Completed = 'completed',
  Failed = 'failed',
}

/**
 * OTA更新信息
 */
export interface OtaUpdateInfo {
  /**
   * 设备ID
   */
  deviceId: string
  /**
   * 当前版本
   */
  currentVersion: string
  /**
   * 目标版本
   */
  targetVersion?: string
  /**
   * 更新状态
   */
  status: OtaUpdateStatus
  /**
   * 进度（0-100）
   */
  progress?: number
  /**
   * 错误信息
   */
  error?: string
  /**
   * 开始时间
   */
  startedAt?: Date
  /**
   * 完成时间
   */
  completedAt?: Date
}
