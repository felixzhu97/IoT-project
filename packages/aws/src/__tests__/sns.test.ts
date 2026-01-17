/**
 * SNS模块测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSNSClient, getDefaultSNSClient } from '../sns/client'

describe('SNS Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSNSClient', () => {
    it('应该创建SNS客户端', () => {
      const client = createSNSClient({
        region: 'us-east-1',
      })

      expect(client).toBeDefined()
      expect(client.config).toBeDefined()
    })

    it('应该使用默认配置创建客户端', () => {
      const client = getDefaultSNSClient()

      expect(client).toBeDefined()
    })
  })
})
