/**
 * S3客户端封装
 */

import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import { createClientConfig, type ClientConfig } from '../config'

/**
 * 创建S3客户端
 */
export function createS3Client(config?: Partial<ClientConfig>): S3Client {
  const clientConfig = createClientConfig(config)
  
  const s3Config: S3ClientConfig = {
    region: clientConfig.region,
    endpoint: clientConfig.endpoint,
    maxAttempts: clientConfig.maxAttempts,
    requestHandler: clientConfig.requestTimeout
      ? {
          requestTimeout: clientConfig.requestTimeout,
        }
      : undefined,
  }

  // 如果提供了凭证，添加到配置中
  if (clientConfig.accessKeyId && clientConfig.secretAccessKey) {
    s3Config.credentials = {
      accessKeyId: clientConfig.accessKeyId,
      secretAccessKey: clientConfig.secretAccessKey,
      sessionToken: clientConfig.sessionToken,
    }
  }

  return new S3Client(s3Config)
}

/**
 * 获取默认S3客户端（使用环境变量配置）
 */
export function getDefaultS3Client(): S3Client {
  return createS3Client()
}
