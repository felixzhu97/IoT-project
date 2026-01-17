/**
 * S3模块测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createS3Client, getDefaultS3Client } from '../s3/client'

describe('S3 Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createS3Client', () => {
    it('应该创建S3客户端', () => {
      const client = createS3Client({
        region: 'us-east-1',
      })

      expect(client).toBeDefined()
      expect(client.config).toBeDefined()
    })

    it('应该使用默认配置创建客户端', () => {
      const client = getDefaultS3Client()

      expect(client).toBeDefined()
    })
  })
})
