/**
 * Lambda客户端封装
 */

import {
  LambdaClient,
  type LambdaClientConfig,
} from '@aws-sdk/client-lambda'
import { createClientConfig, type ClientConfig } from '../config'

/**
 * 创建Lambda客户端
 */
export function createLambdaClient(config?: Partial<ClientConfig>): LambdaClient {
  const clientConfig = createClientConfig(config)

  const lambdaConfig: LambdaClientConfig = {
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
    lambdaConfig.credentials = {
      accessKeyId: clientConfig.accessKeyId,
      secretAccessKey: clientConfig.secretAccessKey,
      sessionToken: clientConfig.sessionToken,
    }
  }

  return new LambdaClient(lambdaConfig)
}

/**
 * 获取默认Lambda客户端（使用环境变量配置）
 */
export function getDefaultLambdaClient(): LambdaClient {
  return createLambdaClient()
}
