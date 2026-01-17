/**
 * Lambda模块测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLambdaClient, getDefaultLambdaClient } from '../lambda/client'

describe('Lambda Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createLambdaClient', () => {
    it('应该创建Lambda客户端', () => {
      const client = createLambdaClient({
        region: 'us-east-1',
      })

      expect(client).toBeDefined()
      expect(client.config).toBeDefined()
    })

    it('应该使用默认配置创建客户端', () => {
      const client = getDefaultLambdaClient()

      expect(client).toBeDefined()
    })
  })
})
