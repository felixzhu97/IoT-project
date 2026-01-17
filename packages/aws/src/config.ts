/**
 * AWS配置和凭证管理
 * 提供统一的AWS服务配置接口
 */

/**
 * AWS配置选项
 */
export interface AwsConfig {
  /** AWS区域 */
  region: string
  /** 访问密钥ID（可选，优先使用环境变量） */
  accessKeyId?: string
  /** 秘密访问密钥（可选，优先使用环境变量） */
  secretAccessKey?: string
  /** 会话令牌（可选，用于临时凭证） */
  sessionToken?: string
  /** 自定义端点（用于本地开发或测试） */
  endpoint?: string
}

/**
 * AWS客户端配置
 */
export interface ClientConfig extends Partial<AwsConfig> {
  /** 最大重试次数 */
  maxAttempts?: number
  /** 请求超时时间（毫秒） */
  requestTimeout?: number
}

/**
 * 从环境变量获取AWS配置
 */
export function getAwsConfigFromEnv(): Partial<AwsConfig> {
  return {
    region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  }
}

/**
 * 合并配置，优先级：参数 > 环境变量 > 默认值
 */
export function mergeAwsConfig(config?: Partial<AwsConfig>): AwsConfig {
  const envConfig = getAwsConfigFromEnv()
  
  return {
    region: config?.region || envConfig.region || 'us-east-1',
    accessKeyId: config?.accessKeyId || envConfig.accessKeyId,
    secretAccessKey: config?.secretAccessKey || envConfig.secretAccessKey,
    sessionToken: config?.sessionToken || envConfig.sessionToken,
    endpoint: config?.endpoint,
  }
}

/**
 * 验证AWS配置是否完整
 * 注意：在EC2/ECS/Lambda等环境中，可以不提供凭证（使用IAM角色）
 */
export function validateAwsConfig(config: AwsConfig): boolean {
  // 区域是必需的
  if (!config.region) {
    return false
  }
  
  // 如果提供了accessKeyId，必须同时提供secretAccessKey
  if (config.accessKeyId && !config.secretAccessKey) {
    return false
  }
  
  return true
}

/**
 * 创建AWS客户端基础配置
 */
export function createClientConfig(config?: Partial<ClientConfig>): ClientConfig {
  const baseConfig = mergeAwsConfig(config)
  
  return {
    ...baseConfig,
    maxAttempts: config?.maxAttempts || 3,
    requestTimeout: config?.requestTimeout || 30000,
  }
}
