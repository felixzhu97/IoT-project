/**
 * 设备注册表
 */

import { randomBytes } from 'crypto'
import type {
  DeviceInfo,
  DeviceRegistrationOptions,
} from './types'

/**
 * 设备注册表类（内存实现，生产环境应使用数据库）
 */
export class DeviceRegistry {
  private devices: Map<string, DeviceInfo> = new Map()

  /**
   * 注册设备
   */
  async registerDevice(options: DeviceRegistrationOptions): Promise<DeviceInfo> {
    const deviceId = this.generateDeviceId()
    const now = new Date()

    const deviceInfo: DeviceInfo = {
      deviceId,
      name: options.name,
      type: options.type,
      manufacturer: options.manufacturer,
      model: options.model,
      attributes: options.attributes || {},
      registeredAt: now,
      lastSeen: now,
      status: 'offline',
    }

    this.devices.set(deviceId, deviceInfo)
    return deviceInfo
  }

  /**
   * 获取设备信息
   */
  async getDevice(deviceId: string): Promise<DeviceInfo | null> {
    return this.devices.get(deviceId) || null
  }

  /**
   * 更新设备信息
   */
  async updateDevice(deviceId: string, updates: Partial<DeviceInfo>): Promise<DeviceInfo | null> {
    const device = this.devices.get(deviceId)
    if (!device) {
      return null
    }

    const updatedDevice: DeviceInfo = {
      ...device,
      ...updates,
      deviceId, // 确保deviceId不会被覆盖
    }

    this.devices.set(deviceId, updatedDevice)
    return updatedDevice
  }

  /**
   * 删除设备
   */
  async deleteDevice(deviceId: string): Promise<boolean> {
    return this.devices.delete(deviceId)
  }

  /**
   * 列出所有设备
   */
  async listDevices(filter?: {
    type?: string
    status?: DeviceInfo['status']
    manufacturer?: string
  }): Promise<DeviceInfo[]> {
    let devices = Array.from(this.devices.values())

    if (filter) {
      if (filter.type) {
        devices = devices.filter((d) => d.type === filter.type)
      }
      if (filter.status) {
        devices = devices.filter((d) => d.status === filter.status)
      }
      if (filter.manufacturer) {
        devices = devices.filter((d) => d.manufacturer === filter.manufacturer)
      }
    }

    return devices
  }

  /**
   * 更新设备在线状态
   */
  async updateDeviceStatus(deviceId: string, status: DeviceInfo['status']): Promise<boolean> {
    const device = this.devices.get(deviceId)
    if (!device) {
      return false
    }

    const now = new Date()
    this.devices.set(deviceId, {
      ...device,
      status,
      lastSeen: now,
    })

    return true
  }

  /**
   * 生成设备ID
   */
  private generateDeviceId(): string {
    const timestamp = Date.now().toString(36)
    const random = randomBytes(8).toString('hex')
    return `device_${timestamp}_${random}`
  }
}

/**
 * 创建设备注册表
 */
export function createDeviceRegistry(): DeviceRegistry {
  return new DeviceRegistry()
}
