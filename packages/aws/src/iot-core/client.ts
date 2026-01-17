/**
 * IoT Core客户端封装
 */

import {
  IoTClient,
  type IoTClientConfig,
} from '@aws-sdk/client-iot'
import { createClientConfig, type ClientConfig } from '../config'

/**
 * 创建IoT Core客户端
 */
export function createIoTClient(config?: Partial<ClientConfig>): IoTClient {
  const clientConfig = createClientConfig(config)

  const iotConfig: IoTClientConfig = {
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
    iotConfig.credentials = {
      accessKeyId: clientConfig.accessKeyId,
      secretAccessKey: clientConfig.secretAccessKey,
      sessionToken: clientConfig.sessionToken,
    }
  }

  return new IoTClient(iotConfig)
}

/**
 * 获取默认IoT Core客户端（使用环境变量配置）
 */
export function getDefaultIoTClient(): IoTClient {
  return createIoTClient()
}
