/**
 * 固件版本管理
 */

import type { FirmwareVersion } from './types'

/**
 * 固件版本管理器类
 */
export class FirmwareVersionManager {
  private versions: Map<string, FirmwareVersion> = new Map()

  /**
   * 注册固件版本
   */
  registerVersion(version: string, firmware: FirmwareVersion): void {
    this.versions.set(version, firmware)
  }

  /**
   * 获取固件版本信息
   */
  getVersion(version: string): FirmwareVersion | null {
    return this.versions.get(version) || null
  }

  /**
   * 获取所有版本
   */
  getAllVersions(): FirmwareVersion[] {
    return Array.from(this.versions.values())
  }

  /**
   * 获取最新版本
   */
  getLatestVersion(): FirmwareVersion | null {
    const versions = this.getAllVersions()
    if (versions.length === 0) {
      return null
    }

    // 按发布日期排序，返回最新版本
    return versions.sort((a, b) => {
      const dateA = a.releaseDate?.getTime() || 0
      const dateB = b.releaseDate?.getTime() || 0
      return dateB - dateA
    })[0]
  }

  /**
   * 比较版本号
   * 返回: 正数表示version1 > version2, 负数表示version1 < version2, 0表示相等
   */
  compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    const maxLength = Math.max(v1Parts.length, v2Parts.length)

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part > v2Part) {
        return 1
      }
      if (v1Part < v2Part) {
        return -1
      }
    }

    return 0
  }

  /**
   * 检查是否需要更新
   */
  needsUpdate(currentVersion: string, targetVersion?: string): {
    needsUpdate: boolean
    latestVersion?: FirmwareVersion
  } {
    const latest = targetVersion ? this.getVersion(targetVersion) : this.getLatestVersion()

    if (!latest) {
      return { needsUpdate: false }
    }

    const comparison = this.compareVersions(currentVersion, latest.version)

    return {
      needsUpdate: comparison < 0,
      latestVersion: latest,
    }
  }

  /**
   * 获取可升级的版本列表
   */
  getUpgradeableVersions(currentVersion: string): FirmwareVersion[] {
    const allVersions = this.getAllVersions()
    return allVersions.filter((version) => this.compareVersions(currentVersion, version.version) < 0)
  }

  /**
   * 验证版本格式
   */
  isValidVersion(version: string): boolean {
    // 简单的版本格式验证：x.y.z 格式
    return /^\d+\.\d+(\.\d+)?(-.*)?$/.test(version)
  }
}

/**
 * 创建固件版本管理器
 */
export function createFirmwareVersionManager(): FirmwareVersionManager {
  return new FirmwareVersionManager()
}
