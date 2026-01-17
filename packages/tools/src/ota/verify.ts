/**
 * 固件验证器
 */

import { createHash, createVerify, createSign } from 'crypto'
import type { FirmwareVersion } from './types'

/**
 * 固件验证器类
 */
export class FirmwareVerifier {
  /**
   * 验证固件校验和
   */
  async verifyChecksum(firmwareData: Buffer | string, expectedChecksum: string): Promise<boolean> {
    try {
      const algorithm = expectedChecksum.length === 32 ? 'md5' : 'sha256'
      const hash = createHash(algorithm)
      const buffer = typeof firmwareData === 'string' ? Buffer.from(firmwareData) : firmwareData
      hash.update(buffer)
      const calculatedChecksum = hash.digest('hex')

      return calculatedChecksum.toLowerCase() === expectedChecksum.toLowerCase()
    } catch (error) {
      throw new Error(`Checksum verification failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 验证固件数字签名（简化实现）
   */
  async verifySignature(firmwareData: Buffer | string, signature: string, publicKey?: string): Promise<boolean> {
    if (!publicKey) {
      // 如果没有提供公钥，仅检查签名格式
      return this.isValidSignatureFormat(signature)
    }

    try {
      // 注意：这是一个简化的实现
      // 生产环境应使用真正的数字签名验证（如RSA、ECDSA等）
      const buffer = typeof firmwareData === 'string' ? Buffer.from(firmwareData) : firmwareData
      const verify = createVerify('RSA-SHA256')
      verify.update(buffer)
      verify.end()

      // 实际实现中需要解析公钥和签名
      // 这里仅返回true作为示例
      return true
    } catch (error) {
      throw new Error(`Signature verification failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 验证固件完整性
   */
  async verifyIntegrity(firmwareData: Buffer | string, firmwareVersion: FirmwareVersion): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    // 验证文件大小
    const buffer = typeof firmwareData === 'string' ? Buffer.from(firmwareData) : firmwareData
    if (firmwareVersion.fileSize && buffer.length !== firmwareVersion.fileSize) {
      errors.push(`File size mismatch: expected ${firmwareVersion.fileSize}, got ${buffer.length}`)
    }

    // 验证校验和
    if (firmwareVersion.checksum) {
      const checksumValid = await this.verifyChecksum(firmwareData, firmwareVersion.checksum)
      if (!checksumValid) {
        errors.push('Checksum verification failed')
      }
    }

    // 验证数字签名
    if (firmwareVersion.signature) {
      const signatureValid = await this.verifySignature(firmwareData, firmwareVersion.signature)
      if (!signatureValid) {
        errors.push('Signature verification failed')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 验证签名格式（简化检查）
   */
  private isValidSignatureFormat(signature: string): boolean {
    // 简单的签名格式验证
    // 实际应用中应根据使用的签名算法进行验证
    return signature.length > 0 && /^[A-Za-z0-9+/=]+$/.test(signature)
  }

  /**
   * 计算固件校验和
   */
  async calculateChecksum(firmwareData: Buffer | string, algorithm: 'md5' | 'sha256' = 'sha256'): Promise<string> {
    const hash = createHash(algorithm)
    const buffer = typeof firmwareData === 'string' ? Buffer.from(firmwareData) : firmwareData
    hash.update(buffer)
    return hash.digest('hex')
  }
}

/**
 * 创建固件验证器
 */
export function createFirmwareVerifier(): FirmwareVerifier {
  return new FirmwareVerifier()
}
