/**
 * API Gateway客户端封装
 *
 * 注意：API Gateway Management API主要用于WebSocket连接
 * 对于REST API和HTTP API的调用，直接使用标准的HTTP客户端即可
 * 这里提供Management API的客户端封装
 */

import {
  ApiGatewayManagementApiClient,
  type ApiGatewayManagementApiClientConfig,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { createClientConfig, type ClientConfig } from "../config";

/**
 * 创建API Gateway Management API客户端
 * 主要用于WebSocket连接的发送消息等操作
 */
export function createApiGatewayClient(
  config?: Partial<ClientConfig>
): ApiGatewayManagementApiClient {
  const clientConfig = createClientConfig(config);

  // API Gateway Management API需要endpoint
  if (!clientConfig.endpoint) {
    throw new Error("API Gateway Management API requires an endpoint URL");
  }

  const apiGatewayConfig: ApiGatewayManagementApiClientConfig = {
    region: clientConfig.region,
    endpoint: clientConfig.endpoint,
    maxAttempts: clientConfig.maxAttempts,
    requestHandler: clientConfig.requestTimeout
      ? {
          requestTimeout: clientConfig.requestTimeout,
        }
      : undefined,
  };

  // 如果提供了凭证，添加到配置中
  if (clientConfig.accessKeyId && clientConfig.secretAccessKey) {
    apiGatewayConfig.credentials = {
      accessKeyId: clientConfig.accessKeyId,
      secretAccessKey: clientConfig.secretAccessKey,
      sessionToken: clientConfig.sessionToken,
    };
  }

  return new ApiGatewayManagementApiClient(apiGatewayConfig);
}

/**
 * 获取默认API Gateway客户端（使用环境变量配置）
 * 注意：需要设置API_GATEWAY_ENDPOINT环境变量
 */
export function getDefaultApiGatewayClient(): ApiGatewayManagementApiClient {
  const endpoint = process.env.API_GATEWAY_ENDPOINT;
  if (!endpoint) {
    throw new Error("API_GATEWAY_ENDPOINT environment variable is required");
  }

  return createApiGatewayClient({ endpoint });
}
