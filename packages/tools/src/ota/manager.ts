/**
 * OTA管理器
 */

import type {
  OtaUpdateInfo,
  FirmwareVersion,
} from './types'
import { OtaUpdateStatus } from './types'
import { FirmwareVersionManager } from './version'
import { FirmwareDownloader } from './download'
import { FirmwareVerifier } from './verify'

/**
 * OTA管理器类
 */
export class OtaManager {
  private versionManager: FirmwareVersionManager
  private downloader: FirmwareDownloader
  private verifier: FirmwareVerifier
  private updates: Map<string, OtaUpdateInfo> = new Map()

  constructor(
    versionManager?: FirmwareVersionManager,
    downloader?: FirmwareDownloader,
    verifier?: FirmwareVerifier
  ) {
    this.versionManager = versionManager || new FirmwareVersionManager()
    this.downloader = downloader || new FirmwareDownloader()
    this.verifier = verifier || new FirmwareVerifier()
  }

  /**
   * 检查更新
   */
  async checkForUpdate(deviceId: string, currentVersion: string): Promise<FirmwareVersion | null> {
    const updateInfo: OtaUpdateInfo = {
      deviceId,
      currentVersion,
      status: OtaUpdateStatus.Checking,
      startedAt: new Date(),
    }

    this.updates.set(deviceId, updateInfo)

    try {
      const result = this.versionManager.needsUpdate(currentVersion)
      
      if (result.needsUpdate && result.latestVersion) {
        updateInfo.status = OtaUpdateStatus.Idle
        updateInfo.targetVersion = result.latestVersion.version
      } else {
        updateInfo.status = OtaUpdateStatus.Idle
      }

      this.updates.set(deviceId, updateInfo)
      return result.latestVersion || null
    } catch (error) {
      updateInfo.status = OtaUpdateStatus.Failed
      updateInfo.error = error instanceof Error ? error.message : String(error)
      this.updates.set(deviceId, updateInfo)
      throw error
    }
  }

  /**
   * 下载固件
   */
  async downloadFirmware(deviceId: string, firmwareVersion: FirmwareVersion): Promise<Buffer> {
    const updateInfo = this.updates.get(deviceId) || {
      deviceId,
      currentVersion: '',
      status: OtaUpdateStatus.Idle,
    }

    updateInfo.status = OtaUpdateStatus.Downloading
    updateInfo.progress = 0
    updateInfo.targetVersion = firmwareVersion.version
    this.updates.set(deviceId, updateInfo)

    if (!firmwareVersion.fileUrl) {
      throw new Error('Firmware file URL is not specified')
    }

    try {
      const firmwareData = await this.downloader.download({
        url: firmwareVersion.fileUrl,
        onProgress: (progress) => {
          updateInfo.progress = progress.percentage
          this.updates.set(deviceId, updateInfo)
        },
      })

      updateInfo.status = OtaUpdateStatus.Verifying
      updateInfo.progress = 90
      this.updates.set(deviceId, updateInfo)

      // 验证固件
      const verification = await this.verifier.verifyIntegrity(firmwareData, firmwareVersion)
      if (!verification.valid) {
        updateInfo.status = OtaUpdateStatus.Failed
        updateInfo.error = verification.errors.join(', ')
        this.updates.set(deviceId, updateInfo)
        throw new Error(`Firmware verification failed: ${verification.errors.join(', ')}`)
      }

      updateInfo.status = OtaUpdateStatus.Completed
      updateInfo.progress = 100
      updateInfo.completedAt = new Date()
      this.updates.set(deviceId, updateInfo)

      return firmwareData
    } catch (error) {
      updateInfo.status = OtaUpdateStatus.Failed
      updateInfo.error = error instanceof Error ? error.message : String(error)
      this.updates.set(deviceId, updateInfo)
      throw error
    }
  }

  /**
   * 执行固件更新
   */
  async performUpdate(deviceId: string, currentVersion: string): Promise<Buffer> {
    // 检查更新
    const latestVersion = await this.checkForUpdate(deviceId, currentVersion)
    if (!latestVersion) {
      throw new Error('No update available')
    }

    // 下载固件
    return this.downloadFirmware(deviceId, latestVersion)
  }

  /**
   * 获取更新状态
   */
  getUpdateStatus(deviceId: string): OtaUpdateInfo | null {
    return this.updates.get(deviceId) || null
  }

  /**
   * 取消更新
   */
  async cancelUpdate(deviceId: string): Promise<void> {
    const updateInfo = this.updates.get(deviceId)
    if (updateInfo && updateInfo.status === OtaUpdateStatus.Downloading) {
      updateInfo.status = OtaUpdateStatus.Failed
      updateInfo.error = 'Update cancelled by user'
      this.updates.set(deviceId, updateInfo)
    }
  }

  /**
   * 清除更新记录
   */
  clearUpdate(deviceId: string): void {
    this.updates.delete(deviceId)
  }
}

/**
 * 创建OTA管理器
 */
export function createOtaManager(
  versionManager?: FirmwareVersionManager,
  downloader?: FirmwareDownloader,
  verifier?: FirmwareVerifier
): OtaManager {
  return new OtaManager(versionManager, downloader, verifier)
}
