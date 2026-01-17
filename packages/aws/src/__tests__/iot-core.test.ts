/**
 * IoT Core模块测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  buildTopicPath,
  parseTopicPath,
  validateTopicName,
  buildStandardTopic,
  topicMatches,
} from '../iot-core/topic'

describe('IoT Core Topic', () => {
  describe('buildTopicPath', () => {
    it('应该构建主题路径', () => {
      expect(buildTopicPath('devices', 'device-001', 'sensor', 'temperature')).toBe(
        'devices/device-001/sensor/temperature'
      )
    })

    it('应该过滤空段', () => {
      expect(buildTopicPath('devices', '', 'sensor', null as any, 'temperature')).toBe(
        'devices/sensor/temperature'
      )
    })
  })

  describe('parseTopicPath', () => {
    it('应该解析主题路径', () => {
      expect(parseTopicPath('devices/device-001/sensor/temperature')).toEqual([
        'devices',
        'device-001',
        'sensor',
        'temperature',
      ])
    })

    it('应该处理空路径', () => {
      expect(parseTopicPath('')).toEqual([])
    })
  })

  describe('validateTopicName', () => {
    it('应该验证有效的主题名称', () => {
      expect(validateTopicName('devices/device-001')).toBe(true)
      expect(validateTopicName('devices/+')).toBe(true)
      expect(validateTopicName('devices/+/sensor')).toBe(true)
      expect(validateTopicName('devices/#')).toBe(true)
    })

    it('应该拒绝空主题', () => {
      expect(validateTopicName('')).toBe(false)
    })

    it('应该拒绝包含非法通配符的主题', () => {
      expect(validateTopicName('devices/+/invalid/#')).toBe(false)
      expect(validateTopicName('devices/+invalid')).toBe(false)
    })

    it('应该确保#只在最后位置', () => {
      expect(validateTopicName('devices/#')).toBe(true)
      expect(validateTopicName('devices/#/invalid')).toBe(false)
    })
  })

  describe('buildStandardTopic', () => {
    it('应该构建标准主题格式', () => {
      expect(buildStandardTopic('devices', 'device-001', 'sensor', 'temperature')).toBe(
        'devices/device-001/sensor/temperature'
      )
    })
  })

  describe('topicMatches', () => {
    it('应该匹配完全相同的主题', () => {
      expect(topicMatches('devices/device-001', 'devices/device-001')).toBe(true)
    })

    it('应该匹配+通配符', () => {
      expect(topicMatches('devices/device-001', 'devices/+')).toBe(true)
      expect(topicMatches('devices/device-001/sensor', 'devices/+/sensor')).toBe(true)
    })

    it('应该匹配#通配符', () => {
      expect(topicMatches('devices/device-001', 'devices/#')).toBe(true)
      expect(topicMatches('devices/device-001/sensor/temperature', 'devices/#')).toBe(true)
    })

    it('应该拒绝不匹配的主题', () => {
      expect(topicMatches('devices/device-001', 'devices/device-002')).toBe(false)
      expect(topicMatches('devices/device-001/sensor', 'devices/+')).toBe(false)
    })
  })
})
