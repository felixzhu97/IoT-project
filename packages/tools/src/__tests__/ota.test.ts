/**
 * OTA固件更新工具测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createOtaManager,
  createFirmwareVersionManager,
  createFirmwareDownloader,
  createFirmwareVerifier,
} from '../ota'
import type { FirmwareVersion } from '../ota/types'
import { OtaUpdateStatus } from '../ota/types'

describe('OTA Management', () => {
  describe('Firmware Version Manager', () => {
    it('应该能够注册固件版本', () => {
      const manager = createFirmwareVersionManager()
      const version: FirmwareVersion = {
        version: '1.0.0',
        description: 'Initial release',
        releaseDate: new Date(),
        fileSize: 1024,
        checksum: 'test-checksum',
      }

      manager.registerVersion('1.0.0', version)
      const retrieved = manager.getVersion('1.0.0')

      expect(retrieved).not.toBeNull()
      expect(retrieved?.version).toBe('1.0.0')
    })

    it('应该能够比较版本号', () => {
      const manager = createFirmwareVersionManager()

      expect(manager.compareVersions('1.0.0', '1.0.1')).toBeLessThan(0)
      expect(manager.compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0)
      expect(manager.compareVersions('1.0.0', '1.0.0')).toBe(0)
    })

    it('应该能够检查是否需要更新', () => {
      const manager = createFirmwareVersionManager()
      const version: FirmwareVersion = {
        version: '1.0.1',
        releaseDate: new Date(),
      }

      manager.registerVersion('1.0.1', version)

      const result = manager.needsUpdate('1.0.0')

      expect(result.needsUpdate).toBe(true)
      expect(result.latestVersion?.version).toBe('1.0.1')
    })
  })

  describe('Firmware Verifier', () => {
    it('应该能够验证校验和', async () => {
      const verifier = createFirmwareVerifier()
      const data = Buffer.from('test firmware data')
      const checksum = await verifier.calculateChecksum(data, 'sha256')

      const isValid = await verifier.verifyChecksum(data, checksum)

      expect(isValid).toBe(true)
    })

    it('应该能够验证固件完整性', async () => {
      const verifier = createFirmwareVerifier()
      const data = Buffer.from('test firmware data')
      const checksum = await verifier.calculateChecksum(data, 'sha256')

      const version: FirmwareVersion = {
        version: '1.0.0',
        fileSize: data.length,
        checksum,
      }

      const result = await verifier.verifyIntegrity(data, version)

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('OTA Manager', () => {
    it('应该能够检查更新', async () => {
      const versionManager = createFirmwareVersionManager()
      const version: FirmwareVersion = {
        version: '1.0.1',
        releaseDate: new Date(),
      }

      versionManager.registerVersion('1.0.1', version)

      const otaManager = createOtaManager(versionManager)
      const latest = await otaManager.checkForUpdate('device-123', '1.0.0')

      expect(latest).not.toBeNull()
      expect(latest?.version).toBe('1.0.1')
    })

    it('应该能够获取更新状态', () => {
      const otaManager = createOtaManager()
      const status = otaManager.getUpdateStatus('device-123')

      expect(status).toBeNull() // 初始状态应该为null
    })
  })
})
