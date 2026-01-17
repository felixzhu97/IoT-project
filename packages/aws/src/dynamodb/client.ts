/**
 * DynamoDB客户端封装
 */

import {
  DynamoDBClient,
  type DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb'
import { createClientConfig, type ClientConfig } from '../config'

/**
 * 创建DynamoDB客户端
 */
export function createDynamoDBClient(config?: Partial<ClientConfig>): DynamoDBClient {
  const clientConfig = createClientConfig(config)

  const dynamoConfig: DynamoDBClientConfig = {
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
    dynamoConfig.credentials = {
      accessKeyId: clientConfig.accessKeyId,
      secretAccessKey: clientConfig.secretAccessKey,
      sessionToken: clientConfig.sessionToken,
    }
  }

  return new DynamoDBClient(dynamoConfig)
}

/**
 * 获取默认DynamoDB客户端（使用环境变量配置）
 */
export function getDefaultDynamoDBClient(): DynamoDBClient {
  return createDynamoDBClient()
}
