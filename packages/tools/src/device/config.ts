/**
 * 设备配置管理器
 */

import type { DeviceConfig } from './types'

/**
 * 设备配置管理器类（内存实现，生产环境应使用数据库）
 */
export class DeviceConfigManager {
  private configs: Map<string, DeviceConfig> = new Map()
  private versionMap: Map<string, number> = new Map()

  /**
   * 设置设备配置
   */
  async setConfig(deviceId: string, config: Record<string, any>): Promise<DeviceConfig> {
    const currentVersion = this.versionMap.get(deviceId) || 0
    const newVersion = currentVersion + 1
    const now = new Date()

    const deviceConfig: DeviceConfig = {
      configId: this.generateConfigId(deviceId, newVersion),
      deviceId,
      config,
      version: newVersion,
      updatedAt: now,
    }

    this.configs.set(deviceId, deviceConfig)
    this.versionMap.set(deviceId, newVersion)

    return deviceConfig
  }

  /**
   * 获取设备配置
   */
  async getConfig(deviceId: string): Promise<DeviceConfig | null> {
    return this.configs.get(deviceId) || null
  }

  /**
   * 更新设备配置（合并方式）
   */
  async updateConfig(deviceId: string, updates: Record<string, any>): Promise<DeviceConfig | null> {
    const currentConfig = await this.getConfig(deviceId)
    if (!currentConfig) {
      return this.setConfig(deviceId, updates)
    }

    const mergedConfig = {
      ...currentConfig.config,
      ...updates,
    }

    return this.setConfig(deviceId, mergedConfig)
  }

  /**
   * 删除设备配置
   */
  async deleteConfig(deviceId: string): Promise<boolean> {
    const deleted = this.configs.delete(deviceId)
    this.versionMap.delete(deviceId)
    return deleted
  }

  /**
   * 获取配置版本
   */
  async getConfigVersion(deviceId: string): Promise<number> {
    return this.versionMap.get(deviceId) || 0
  }

  /**
   * 检查配置是否需要更新
   */
  async needsUpdate(deviceId: string, deviceVersion: number): Promise<boolean> {
    const serverVersion = this.versionMap.get(deviceId) || 0
    return serverVersion > deviceVersion
  }

  /**
   * 同步配置（下发配置到设备）
   */
  async syncConfig(deviceId: string): Promise<DeviceConfig | null> {
    return this.getConfig(deviceId)
  }

  /**
   * 生成配置ID
   */
  private generateConfigId(deviceId: string, version: number): string {
    return `config_${deviceId}_v${version}`
  }
}

/**
 * 创建设备配置管理器
 */
export function createDeviceConfigManager(): DeviceConfigManager {
  return new DeviceConfigManager()
}
