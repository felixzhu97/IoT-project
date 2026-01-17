/**
 * SQS模块测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSQSClient, getDefaultSQSClient } from '../sqs/client'

describe('SQS Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSQSClient', () => {
    it('应该创建SQS客户端', () => {
      const client = createSQSClient({
        region: 'us-east-1',
      })

      expect(client).toBeDefined()
      expect(client.config).toBeDefined()
    })

    it('应该使用默认配置创建客户端', () => {
      const client = getDefaultSQSClient()

      expect(client).toBeDefined()
    })
  })
})
