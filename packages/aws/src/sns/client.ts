/**
 * SNS客户端封装
 */

import {
  SNSClient,
  type SNSClientConfig,
} from '@aws-sdk/client-sns'
import { createClientConfig, type ClientConfig } from '../config'

/**
 * 创建SNS客户端
 */
export function createSNSClient(config?: Partial<ClientConfig>): SNSClient {
  const clientConfig = createClientConfig(config)

  const snsConfig: SNSClientConfig = {
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
    snsConfig.credentials = {
      accessKeyId: clientConfig.accessKeyId,
      secretAccessKey: clientConfig.secretAccessKey,
      sessionToken: clientConfig.sessionToken,
    }
  }

  return new SNSClient(snsConfig)
}

/**
 * 获取默认SNS客户端（使用环境变量配置）
 */
export function getDefaultSNSClient(): SNSClient {
  return createSNSClient()
}
