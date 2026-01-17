/**
 * 协议转换器
 */

import type { MqttMessage } from '../mqtt/types'
import type { CoapResponse } from '../coap/types'
import { CoapMethod } from '../coap/types'
import type { UnifiedMessage, ProtocolType } from './types'

/**
 * 协议转换器类
 */
export class ProtocolConverter {
  /**
   * 将MQTT消息转换为统一消息格式
   */
  static mqttToUnified(message: MqttMessage): UnifiedMessage {
    return {
      topic: message.topic,
      payload: message.payload,
      qos: message.qos,
      retain: message.retain,
      contentType: this.detectContentType(message.payload),
    }
  }

  /**
   * 将统一消息格式转换为MQTT消息
   */
  static unifiedToMqtt(message: UnifiedMessage): MqttMessage {
    return {
      topic: message.topic || '',
      payload: message.payload,
      qos: message.qos || 0,
      retain: message.retain || false,
    }
  }

  /**
   * 将CoAP响应转换为统一消息格式
   */
  static coapToUnified(path: string, response: CoapResponse, method?: CoapMethod): UnifiedMessage {
    return {
      path,
      url: path,
      payload: response.payload || Buffer.alloc(0),
      method: method || 'GET',
      contentType: this.coapContentTypeToString(response.contentFormat),
      headers: response.options as Record<string, string> | undefined,
    }
  }

  /**
   * 将统一消息格式转换为CoAP请求参数
   */
  static unifiedToCoap(message: UnifiedMessage): {
    url: string
    method: CoapMethod
    payload?: Buffer
    query?: Record<string, string>
  } {
    const url = message.url || message.path || ''
    const method = this.stringToCoapMethod(message.method || 'GET')

    return {
      url,
      method,
      payload: Buffer.isBuffer(message.payload)
        ? message.payload
        : Buffer.from(message.payload || ''),
      query: message.query,
    }
  }

  /**
   * 将HTTP消息转换为统一消息格式
   */
  static httpToUnified(url: string, method: string, payload?: string | Buffer, headers?: Record<string, string>): UnifiedMessage {
    return {
      url,
      path: url,
      payload: payload || Buffer.alloc(0),
      method,
      headers,
      contentType: headers?.['content-type'] || headers?.['Content-Type'],
    }
  }

  /**
   * 将统一消息格式转换为HTTP请求参数
   */
  static unifiedToHttp(message: UnifiedMessage): {
    url: string
    method: string
    payload?: string | Buffer
    headers?: Record<string, string>
  } {
    return {
      url: message.url || message.path || '',
      method: message.method || 'GET',
      payload: message.payload,
      headers: message.headers,
    }
  }

  /**
   * MQTT到CoAP转换
   */
  static mqttToCoap(mqttMessage: MqttMessage): { url: string; method: CoapMethod; payload?: Buffer } {
    const unified = this.mqttToUnified(mqttMessage)
    const coap = this.unifiedToCoap(unified)

    // 从MQTT主题构建CoAP路径
    if (mqttMessage.topic && !coap.url) {
      coap.url = `coap://localhost/${mqttMessage.topic.replace(/\/+/g, '/')}`
    }

    return coap
  }

  /**
   * CoAP到MQTT转换
   */
  static coapToMqtt(path: string, response: CoapResponse, topic?: string): MqttMessage {
    const unified = this.coapToUnified(path, response)
    const mqtt = this.unifiedToMqtt(unified)

    // 从CoAP路径构建MQTT主题
    if (topic) {
      mqtt.topic = topic
    } else if (path) {
      // 移除协议前缀，转换为主题格式
      const cleanPath = path.replace(/^(coap:\/\/[^\/]+)?\//, '')
      mqtt.topic = cleanPath.replace(/\//g, '/')
    }

    return mqtt
  }

  /**
   * MQTT到HTTP转换
   */
  static mqttToHttp(mqttMessage: MqttMessage, baseUrl?: string): {
    url: string
    method: string
    payload?: string | Buffer
    headers?: Record<string, string>
  } {
    const unified = this.mqttToUnified(mqttMessage)
    const http = this.unifiedToHttp(unified)

    // 从MQTT主题构建HTTP URL
    if (mqttMessage.topic && !http.url) {
      const topicPath = mqttMessage.topic.replace(/\/+/g, '/')
      http.url = baseUrl ? `${baseUrl}/${topicPath}` : `http://localhost/${topicPath}`
    }

    http.method = 'POST' // MQTT发布默认转为HTTP POST

    return http
  }

  /**
   * HTTP到MQTT转换
   */
  static httpToMqtt(
    url: string,
    method: string,
    payload?: string | Buffer,
    topic?: string
  ): MqttMessage {
    const unified = this.httpToUnified(url, method, payload)
    const mqtt = this.unifiedToMqtt(unified)

    // 从HTTP路径构建MQTT主题
    if (topic) {
      mqtt.topic = topic
    } else if (url) {
      // 移除协议前缀和域名，转换为主题格式
      const path = url.replace(/^https?:\/\/[^\/]+/, '')
      mqtt.topic = path.replace(/^\/+/, '').replace(/\/+/g, '/')
    }

    return mqtt
  }

  /**
   * CoAP到HTTP转换
   */
  static coapToHttp(path: string, response: CoapResponse, baseUrl?: string): {
    url: string
    method: string
    payload?: string | Buffer
    headers?: Record<string, string>
  } {
    const unified = this.coapToUnified(path, response)
    const http = this.unifiedToHttp(unified)

    // 从CoAP路径构建HTTP URL
    if (path && !http.url) {
      const cleanPath = path.replace(/^(coap:\/\/[^\/]+)?/, '')
      http.url = baseUrl ? `${baseUrl}${cleanPath}` : `http://localhost${cleanPath}`
    }

    return http
  }

  /**
   * HTTP到CoAP转换
   */
  static httpToCoap(url: string, method: string, payload?: string | Buffer): {
    url: string
    method: CoapMethod
    payload?: Buffer
  } {
    const unified = this.httpToUnified(url, method, payload)
    const coap = this.unifiedToCoap(unified)

    // 从HTTP URL构建CoAP路径
    if (url && !coap.url) {
      const cleanPath = url.replace(/^https?:\/\/[^\/]+/, '')
      coap.url = `coap://localhost${cleanPath}`
    }

    return coap
  }

  /**
   * 检测内容类型
   */
  private static detectContentType(payload: string | Buffer): string {
    if (Buffer.isBuffer(payload)) {
      try {
        JSON.parse(payload.toString('utf-8'))
        return 'application/json'
      } catch {
        return 'application/octet-stream'
      }
    }

    try {
      JSON.parse(payload)
      return 'application/json'
    } catch {
      return 'text/plain'
    }
  }

  /**
   * CoAP内容格式转换为字符串
   */
  private static coapContentTypeToString(contentFormat?: number): string {
    const formatMap: Record<number, string> = {
      0: 'text/plain',
      40: 'application/link-format',
      41: 'application/xml',
      42: 'application/octet-stream',
      47: 'application/exi',
      50: 'application/json',
      60: 'application/cbor',
    }

    return contentFormat !== undefined ? formatMap[contentFormat] || 'application/octet-stream' : 'application/octet-stream'
  }

  /**
   * 字符串转换为CoAP方法
   */
  private static stringToCoapMethod(method: string): CoapMethod {
    const upperMethod = method.toUpperCase()
    if (upperMethod === 'GET') return CoapMethod.GET
    if (upperMethod === 'POST') return CoapMethod.POST
    if (upperMethod === 'PUT') return CoapMethod.PUT
    if (upperMethod === 'DELETE') return CoapMethod.DELETE
    return CoapMethod.GET
  }
}
