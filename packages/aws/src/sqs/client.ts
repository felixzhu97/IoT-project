/**
 * SQS客户端封装
 */

import {
  SQSClient,
  type SQSClientConfig,
} from '@aws-sdk/client-sqs'
import { createClientConfig, type ClientConfig } from '../config'

/**
 * 创建SQS客户端
 */
export function createSQSClient(config?: Partial<ClientConfig>): SQSClient {
  const clientConfig = createClientConfig(config)

  const sqsConfig: SQSClientConfig = {
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
    sqsConfig.credentials = {
      accessKeyId: clientConfig.accessKeyId,
      secretAccessKey: clientConfig.secretAccessKey,
      sessionToken: clientConfig.sessionToken,
    }
  }

  return new SQSClient(sqsConfig)
}

/**
 * 获取默认SQS客户端（使用环境变量配置）
 */
export function getDefaultSQSClient(): SQSClient {
  return createSQSClient()
}
