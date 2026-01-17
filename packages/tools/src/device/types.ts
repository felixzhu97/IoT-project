/**
 * 设备管理类型定义
 */

/**
 * 设备信息
 */
export interface DeviceInfo {
  /**
   * 设备ID
   */
  deviceId: string
  /**
   * 设备名称
   */
  name: string
  /**
   * 设备类型
   */
  type?: string
  /**
   * 设备厂商
   */
  manufacturer?: string
  /**
   * 设备型号
   */
  model?: string
  /**
   * 固件版本
   */
  firmwareVersion?: string
  /**
   * 硬件版本
   */
  hardwareVersion?: string
  /**
   * 设备属性
   */
  attributes?: Record<string, string>
  /**
   * 注册时间
   */
  registeredAt?: Date
  /**
   * 最后在线时间
   */
  lastSeen?: Date
  /**
   * 设备状态
   */
  status?: 'online' | 'offline' | 'unknown'
}

/**
 * 设备证书信息
 */
export interface DeviceCertificate {
  /**
   * 证书ID
   */
  certificateId: string
  /**
   * 设备ID
   */
  deviceId: string
  /**
   * 证书内容（PEM格式）
   */
  certificate: string
  /**
   * 私钥（PEM格式，可选）
   */
  privateKey?: string
  /**
   * 公钥（PEM格式）
   */
  publicKey?: string
  /**
   * 证书过期时间
   */
  expiresAt?: Date
  /**
   * 创建时间
   */
  createdAt?: Date
}

/**
 * 设备密钥信息
 */
export interface DeviceKey {
  /**
   * 密钥ID
   */
  keyId: string
  /**
   * 设备ID
   */
  deviceId: string
  /**
   * 密钥类型（psk, rsa, ecc等）
   */
  keyType: string
  /**
   * 密钥值（加密存储）
   */
  keyValue: string
  /**
   * 创建时间
   */
  createdAt?: Date
}

/**
 * 设备Token信息
 */
export interface DeviceToken {
  /**
   * Token值
   */
  token: string
  /**
   * 设备ID
   */
  deviceId: string
  /**
   * 过期时间
   */
  expiresAt: Date
  /**
   * 创建时间
   */
  createdAt?: Date
}

/**
 * 设备配置
 */
export interface DeviceConfig {
  /**
   * 配置ID
   */
  configId?: string
  /**
   * 设备ID
   */
  deviceId: string
  /**
   * 配置键值对
   */
  config: Record<string, any>
  /**
   * 配置版本
   */
  version?: number
  /**
   * 更新时间
   */
  updatedAt?: Date
}

/**
 * 设备注册选项
 */
export interface DeviceRegistrationOptions {
  /**
   * 设备名称
   */
  name: string
  /**
   * 设备类型
   */
  type?: string
  /**
   * 设备厂商
   */
  manufacturer?: string
  /**
   * 设备型号
   */
  model?: string
  /**
   * 设备属性
   */
  attributes?: Record<string, string>
}

/**
 * 设备认证选项
 */
export interface DeviceAuthOptions {
  /**
   * 认证方式（certificate, key, token）
   */
  authType: 'certificate' | 'key' | 'token'
  /**
   * 证书信息（当authType为certificate时）
   */
  certificate?: DeviceCertificate
  /**
   * 密钥信息（当authType为key时）
   */
  key?: DeviceKey
  /**
   * Token信息（当authType为token时）
   */
  token?: DeviceToken
}
