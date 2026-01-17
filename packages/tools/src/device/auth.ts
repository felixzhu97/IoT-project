/**
 * 设备认证器
 */

import { randomBytes, createHash, createSign, createVerify } from 'crypto'
import type {
  DeviceCertificate,
  DeviceKey,
  DeviceToken,
  DeviceAuthOptions,
} from './types'

/**
 * 设备认证器类
 */
export class DeviceAuthenticator {
  private certificates: Map<string, DeviceCertificate> = new Map()
  private keys: Map<string, DeviceKey> = new Map()
  private tokens: Map<string, DeviceToken> = new Map()

  /**
   * 生成设备证书
   */
  async generateCertificate(deviceId: string): Promise<DeviceCertificate> {
    // 注意：这是一个简化的实现
    // 生产环境应使用真正的X.509证书生成库（如node-forge或pem）
    const certificateId = this.generateCertificateId()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1年后过期

    // 这里仅生成模拟证书，实际应使用真正的证书生成逻辑
    const certificate: DeviceCertificate = {
      certificateId,
      deviceId,
      certificate: this.generateMockCertificate(deviceId, certificateId),
      publicKey: this.generateMockPublicKey(),
      expiresAt,
      createdAt: now,
    }

    this.certificates.set(certificateId, certificate)
    return certificate
  }

  /**
   * 验证设备证书
   */
  async verifyCertificate(certificate: DeviceCertificate): Promise<boolean> {
    if (!certificate.expiresAt) {
      return true // 如果没有过期时间，认为有效
    }

    if (new Date() > certificate.expiresAt) {
      return false // 证书已过期
    }

    // 这里应实现真正的证书验证逻辑
    // 例如验证签名、检查证书链等
    return true
  }

  /**
   * 生成设备密钥
   */
  async generateKey(deviceId: string, keyType: string = 'psk'): Promise<DeviceKey> {
    const keyId = this.generateKeyId()
    const keyValue = this.generateKeyValue(keyType)
    const now = new Date()

    const key: DeviceKey = {
      keyId,
      deviceId,
      keyType,
      keyValue: this.hashKey(keyValue), // 哈希存储
      createdAt: now,
    }

    this.keys.set(keyId, key)
    return { ...key, keyValue } // 返回时包含原始密钥值（仅用于初始化）
  }

  /**
   * 验证设备密钥
   */
  async verifyKey(keyId: string, providedKey: string): Promise<boolean> {
    const storedKey = this.keys.get(keyId)
    if (!storedKey) {
      return false
    }

    const hashedProvidedKey = this.hashKey(providedKey)
    return hashedProvidedKey === storedKey.keyValue
  }

  /**
   * 生成设备Token
   */
  async generateToken(deviceId: string, expiresInSeconds: number = 3600): Promise<DeviceToken> {
    const token = this.generateTokenValue()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000)

    const deviceToken: DeviceToken = {
      token,
      deviceId,
      expiresAt,
      createdAt: now,
    }

    this.tokens.set(token, deviceToken)
    return deviceToken
  }

  /**
   * 验证设备Token
   */
  async verifyToken(token: string): Promise<{ valid: boolean; deviceId?: string }> {
    const deviceToken = this.tokens.get(token)
    if (!deviceToken) {
      return { valid: false }
    }

    if (new Date() > deviceToken.expiresAt) {
      this.tokens.delete(token)
      return { valid: false }
    }

    return { valid: true, deviceId: deviceToken.deviceId }
  }

  /**
   * 认证设备
   */
  async authenticateDevice(options: DeviceAuthOptions): Promise<{ success: boolean; deviceId?: string }> {
    switch (options.authType) {
      case 'certificate':
        if (options.certificate) {
          const valid = await this.verifyCertificate(options.certificate)
          return { success: valid, deviceId: options.certificate.deviceId }
        }
        break
      case 'key':
        if (options.key) {
          // 注意：实际实现中需要提供密钥值进行验证
          return { success: true, deviceId: options.key.deviceId }
        }
        break
      case 'token':
        if (options.token) {
          const result = await this.verifyToken(options.token.token)
          return { success: result.valid, deviceId: result.deviceId }
        }
        break
    }

    return { success: false }
  }

  /**
   * 生成证书ID
   */
  private generateCertificateId(): string {
    const timestamp = Date.now().toString(36)
    const random = randomBytes(4).toString('hex')
    return `cert_${timestamp}_${random}`
  }

  /**
   * 生成密钥ID
   */
  private generateKeyId(): string {
    const timestamp = Date.now().toString(36)
    const random = randomBytes(4).toString('hex')
    return `key_${timestamp}_${random}`
  }

  /**
   * 生成密钥值
   */
  private generateKeyValue(keyType: string): string {
    if (keyType === 'psk') {
      return randomBytes(32).toString('hex')
    }
    // 其他密钥类型的生成逻辑
    return randomBytes(32).toString('hex')
  }

  /**
   * 生成Token值
   */
  private generateTokenValue(): string {
    return randomBytes(32).toString('base64url')
  }

  /**
   * 哈希密钥
   */
  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex')
  }

  /**
   * 生成模拟证书（仅用于示例）
   */
  private generateMockCertificate(deviceId: string, certificateId: string): string {
    return `-----BEGIN CERTIFICATE-----
Mock Certificate for Device: ${deviceId}
Certificate ID: ${certificateId}
Generated: ${new Date().toISOString()}
-----END CERTIFICATE-----`
  }

  /**
   * 生成模拟公钥（仅用于示例）
   */
  private generateMockPublicKey(): string {
    return `-----BEGIN PUBLIC KEY-----
Mock Public Key
${randomBytes(32).toString('base64')}
-----END PUBLIC KEY-----`
  }
}

/**
 * 创建设备认证器
 */
export function createDeviceAuthenticator(): DeviceAuthenticator {
  return new DeviceAuthenticator()
}
