/**
 * AWS配置模块测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAwsConfigFromEnv,
  mergeAwsConfig,
  validateAwsConfig,
  createClientConfig,
  type AwsConfig,
} from '../config'

describe('AWS Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getAwsConfigFromEnv', () => {
    it('应该从环境变量读取配置', () => {
      process.env.AWS_REGION = 'us-west-2'
      process.env.AWS_ACCESS_KEY_ID = 'test-access-key'
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key'
      process.env.AWS_SESSION_TOKEN = 'test-session-token'

      const config = getAwsConfigFromEnv()

      expect(config.region).toBe('us-west-2')
      expect(config.accessKeyId).toBe('test-access-key')
      expect(config.secretAccessKey).toBe('test-secret-key')
      expect(config.sessionToken).toBe('test-session-token')
    })

    it('应该优先使用AWS_REGION而非AWS_DEFAULT_REGION', () => {
      process.env.AWS_REGION = 'us-west-2'
      process.env.AWS_DEFAULT_REGION = 'us-east-1'

      const config = getAwsConfigFromEnv()

      expect(config.region).toBe('us-west-2')
    })

    it('应该使用AWS_DEFAULT_REGION作为回退', () => {
      delete process.env.AWS_REGION
      process.env.AWS_DEFAULT_REGION = 'eu-west-1'

      const config = getAwsConfigFromEnv()

      expect(config.region).toBe('eu-west-1')
    })

    it('应该在没有环境变量时使用默认区域', () => {
      delete process.env.AWS_REGION
      delete process.env.AWS_DEFAULT_REGION

      const config = getAwsConfigFromEnv()

      expect(config.region).toBe('us-east-1')
    })
  })

  describe('mergeAwsConfig', () => {
    it('应该合并配置，参数优先于环境变量', () => {
      process.env.AWS_REGION = 'us-west-2'
      process.env.AWS_ACCESS_KEY_ID = 'env-access-key'

      const config = mergeAwsConfig({
        region: 'us-east-1',
        accessKeyId: 'param-access-key',
      })

      expect(config.region).toBe('us-east-1')
      expect(config.accessKeyId).toBe('param-access-key')
      expect(config.secretAccessKey).toBe(process.env.AWS_SECRET_ACCESS_KEY)
    })

    it('应该使用环境变量作为回退', () => {
      process.env.AWS_REGION = 'ap-southeast-1'
      process.env.AWS_ACCESS_KEY_ID = 'env-key'

      const config = mergeAwsConfig({})

      expect(config.region).toBe('ap-southeast-1')
      expect(config.accessKeyId).toBe('env-key')
    })

    it('应该在没有配置时使用默认值', () => {
      delete process.env.AWS_REGION
      delete process.env.AWS_DEFAULT_REGION

      const config = mergeAwsConfig({})

      expect(config.region).toBe('us-east-1')
    })
  })

  describe('validateAwsConfig', () => {
    it('应该验证有效的配置', () => {
      const config: AwsConfig = {
        region: 'us-east-1',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      }

      expect(validateAwsConfig(config)).toBe(true)
    })

    it('应该验证只有region的配置（使用IAM角色）', () => {
      const config: AwsConfig = {
        region: 'us-east-1',
      }

      expect(validateAwsConfig(config)).toBe(true)
    })

    it('应该拒绝缺少region的配置', () => {
      const config: Partial<AwsConfig> = {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      }

      expect(validateAwsConfig(config as AwsConfig)).toBe(false)
    })

    it('应该拒绝只有accessKeyId但没有secretAccessKey的配置', () => {
      const config: AwsConfig = {
        region: 'us-east-1',
        accessKeyId: 'test-key',
      }

      expect(validateAwsConfig(config)).toBe(false)
    })
  })

  describe('createClientConfig', () => {
    it('应该创建客户端配置', () => {
      const config = createClientConfig({
        region: 'us-east-1',
        maxAttempts: 5,
        requestTimeout: 60000,
      })

      expect(config.region).toBe('us-east-1')
      expect(config.maxAttempts).toBe(5)
      expect(config.requestTimeout).toBe(60000)
    })

    it('应该使用默认值', () => {
      const config = createClientConfig({
        region: 'us-east-1',
      })

      expect(config.maxAttempts).toBe(3)
      expect(config.requestTimeout).toBe(30000)
    })
  })
})
