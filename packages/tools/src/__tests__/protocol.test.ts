/**
 * 协议转换工具测试
 */

import { describe, it, expect } from 'vitest'
import { ProtocolConverter } from '../protocol'
import type { MqttMessage } from '../mqtt/types'
import type { CoapResponse } from '../coap/types'
import { CoapMethod, CoapContentFormat } from '../coap/types'

describe('Protocol Converter', () => {
  describe('MQTT to Unified', () => {
    it('应该将MQTT消息转换为统一格式', () => {
      const mqttMessage: MqttMessage = {
        topic: 'test/topic',
        payload: Buffer.from('test message'),
        qos: 1,
        retain: false,
      }

      const unified = ProtocolConverter.mqttToUnified(mqttMessage)

      expect(unified.topic).toBe('test/topic')
      expect(unified.payload).toEqual(Buffer.from('test message'))
      expect(unified.qos).toBe(1)
      expect(unified.retain).toBe(false)
    })
  })

  describe('Unified to MQTT', () => {
    it('应该将统一格式转换为MQTT消息', () => {
      const unified = {
        topic: 'test/topic',
        payload: Buffer.from('test message'),
        qos: 1 as const,
        retain: false,
      }

      const mqtt = ProtocolConverter.unifiedToMqtt(unified)

      expect(mqtt.topic).toBe('test/topic')
      expect(mqtt.payload).toEqual(Buffer.from('test message'))
      expect(mqtt.qos).toBe(1)
      expect(mqtt.retain).toBe(false)
    })
  })

  describe('CoAP to Unified', () => {
    it('应该将CoAP响应转换为统一格式', () => {
      const response: CoapResponse = {
        code: 200,
        payload: Buffer.from('test response'),
        contentFormat: CoapContentFormat.Json,
      }

      const unified = ProtocolConverter.coapToUnified('/test/path', response, CoapMethod.GET)

      expect(unified.path).toBe('/test/path')
      expect(unified.url).toBe('/test/path')
      expect(unified.payload).toEqual(Buffer.from('test response'))
      expect(unified.method).toBe('GET')
    })
  })

  describe('MQTT to CoAP', () => {
    it('应该将MQTT消息转换为CoAP请求参数', () => {
      const mqttMessage: MqttMessage = {
        topic: 'test/topic',
        payload: Buffer.from('test message'),
        qos: 1,
        retain: false,
      }

      const coap = ProtocolConverter.mqttToCoap(mqttMessage)

      expect(coap.url).toContain('test/topic')
      expect(coap.method).toBe(CoapMethod.GET)
    })
  })

  describe('MQTT to HTTP', () => {
    it('应该将MQTT消息转换为HTTP请求参数', () => {
      const mqttMessage: MqttMessage = {
        topic: 'test/topic',
        payload: Buffer.from('test message'),
        qos: 1,
        retain: false,
      }

      const http = ProtocolConverter.mqttToHttp(mqttMessage, 'http://localhost')

      expect(http.url).toContain('test/topic')
      expect(http.method).toBe('POST')
    })
  })

  describe('HTTP to MQTT', () => {
    it('应该将HTTP请求转换为MQTT消息', () => {
      const http = ProtocolConverter.httpToMqtt(
        'http://localhost/test/topic',
        'POST',
        Buffer.from('test message')
      )

      expect(http.topic).toContain('test/topic')
      expect(http.payload).toEqual(Buffer.from('test message'))
    })
  })
})
