/**
 * API Gateway模块测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiGatewayClient, getDefaultApiGatewayClient } from '../api-gateway/client'

describe('API Gateway Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createApiGatewayClient', () => {
    it('应该创建API Gateway客户端', () => {
      const client = createApiGatewayClient({
        region: 'us-east-1',
        endpoint: 'https://test.execute-api.us-east-1.amazonaws.com',
      })

      expect(client).toBeDefined()
      expect(client.config).toBeDefined()
    })

    it('应该在缺少endpoint时抛出错误', () => {
      expect(() => {
        createApiGatewayClient({
          region: 'us-east-1',
        })
      }).toThrow('API Gateway Management API requires an endpoint URL')
    })

    it('应该使用默认配置创建客户端（需要环境变量）', () => {
      const originalEnv = process.env.API_GATEWAY_ENDPOINT
      process.env.API_GATEWAY_ENDPOINT = 'https://test.execute-api.us-east-1.amazonaws.com'

      const client = getDefaultApiGatewayClient()

      expect(client).toBeDefined()

      if (originalEnv) {
        process.env.API_GATEWAY_ENDPOINT = originalEnv
      } else {
        delete process.env.API_GATEWAY_ENDPOINT
      }
    })

    it('应该在缺少环境变量时抛出错误', () => {
      const originalEnv = process.env.API_GATEWAY_ENDPOINT
      delete process.env.API_GATEWAY_ENDPOINT

      expect(() => {
        getDefaultApiGatewayClient()
      }).toThrow('API_GATEWAY_ENDPOINT environment variable is required')

      if (originalEnv) {
        process.env.API_GATEWAY_ENDPOINT = originalEnv
      }
    })
  })
})
