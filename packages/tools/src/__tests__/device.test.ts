/**
 * 设备管理工具测试
 */

import { describe, it, expect } from 'vitest'
import {
  createDeviceRegistry,
  createDeviceAuthenticator,
  createDeviceConfigManager,
} from '../device'

describe('Device Management', () => {
  describe('Device Registry', () => {
    it('应该能够注册设备', async () => {
      const registry = createDeviceRegistry()
      const device = await registry.registerDevice({
        name: 'Test Device',
        type: 'sensor',
        manufacturer: 'Test Manufacturer',
      })

      expect(device.deviceId).toBeDefined()
      expect(device.name).toBe('Test Device')
      expect(device.type).toBe('sensor')
      expect(device.status).toBe('offline')
    })

    it('应该能够获取设备信息', async () => {
      const registry = createDeviceRegistry()
      const device = await registry.registerDevice({
        name: 'Test Device',
      })

      const retrieved = await registry.getDevice(device.deviceId)

      expect(retrieved).not.toBeNull()
      expect(retrieved?.deviceId).toBe(device.deviceId)
      expect(retrieved?.name).toBe('Test Device')
    })

    it('应该能够更新设备信息', async () => {
      const registry = createDeviceRegistry()
      const device = await registry.registerDevice({
        name: 'Test Device',
      })

      const updated = await registry.updateDevice(device.deviceId, {
        name: 'Updated Device',
        status: 'online',
      })

      expect(updated?.name).toBe('Updated Device')
      expect(updated?.status).toBe('online')
    })

    it('应该能够列出所有设备', async () => {
      const registry = createDeviceRegistry()
      await registry.registerDevice({ name: 'Device 1', type: 'sensor' })
      await registry.registerDevice({ name: 'Device 2', type: 'actuator' })

      const devices = await registry.listDevices()

      expect(devices.length).toBe(2)
    })

    it('应该能够按类型筛选设备', async () => {
      const registry = createDeviceRegistry()
      await registry.registerDevice({ name: 'Device 1', type: 'sensor' })
      await registry.registerDevice({ name: 'Device 2', type: 'actuator' })

      const sensors = await registry.listDevices({ type: 'sensor' })

      expect(sensors.length).toBe(1)
      expect(sensors[0].type).toBe('sensor')
    })
  })

  describe('Device Authenticator', () => {
    it('应该能够生成设备证书', async () => {
      const authenticator = createDeviceAuthenticator()
      const certificate = await authenticator.generateCertificate('device-123')

      expect(certificate.certificateId).toBeDefined()
      expect(certificate.deviceId).toBe('device-123')
      expect(certificate.certificate).toBeDefined()
      expect(certificate.expiresAt).toBeDefined()
    })

    it('应该能够生成设备密钥', async () => {
      const authenticator = createDeviceAuthenticator()
      const key = await authenticator.generateKey('device-123', 'psk')

      expect(key.keyId).toBeDefined()
      expect(key.deviceId).toBe('device-123')
      expect(key.keyType).toBe('psk')
      expect(key.keyValue).toBeDefined()
    })

    it('应该能够生成设备Token', async () => {
      const authenticator = createDeviceAuthenticator()
      const token = await authenticator.generateToken('device-123', 3600)

      expect(token.token).toBeDefined()
      expect(token.deviceId).toBe('device-123')
      expect(token.expiresAt).toBeDefined()
    })

    it('应该能够验证Token', async () => {
      const authenticator = createDeviceAuthenticator()
      const token = await authenticator.generateToken('device-123', 3600)

      const result = await authenticator.verifyToken(token.token)

      expect(result.valid).toBe(true)
      expect(result.deviceId).toBe('device-123')
    })
  })

  describe('Device Config Manager', () => {
    it('应该能够设置设备配置', async () => {
      const manager = createDeviceConfigManager()
      const config = await manager.setConfig('device-123', {
        interval: 60,
        enabled: true,
      })

      expect(config.deviceId).toBe('device-123')
      expect(config.config.interval).toBe(60)
      expect(config.config.enabled).toBe(true)
      expect(config.version).toBe(1)
    })

    it('应该能够获取设备配置', async () => {
      const manager = createDeviceConfigManager()
      await manager.setConfig('device-123', { interval: 60 })

      const config = await manager.getConfig('device-123')

      expect(config).not.toBeNull()
      expect(config?.config.interval).toBe(60)
    })

    it('应该能够更新设备配置', async () => {
      const manager = createDeviceConfigManager()
      await manager.setConfig('device-123', { interval: 60 })

      const updated = await manager.updateConfig('device-123', { enabled: true })

      expect(updated?.config.interval).toBe(60)
      expect(updated?.config.enabled).toBe(true)
      expect(updated?.version).toBe(2)
    })

    it('应该能够检查配置是否需要更新', async () => {
      const manager = createDeviceConfigManager()
      await manager.setConfig('device-123', { interval: 60 })

      const needsUpdate = await manager.needsUpdate('device-123', 0)

      expect(needsUpdate).toBe(true)
    })
  })
})
