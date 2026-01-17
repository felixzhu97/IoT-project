/**
 * MQTT客户端封装
 */

import mqtt, { type MqttClient as IMqttClient, type IClientOptions } from 'mqtt'
import type {
  MqttConnectOptions,
  MqttMessage,
  MqttSubscribeOptions,
  IMqttClient as IMqttClientInterface,
} from './types'

/**
 * MQTT客户端类
 */
export class MqttClient implements IMqttClientInterface {
  private client: IMqttClient | null = null
  private options: MqttConnectOptions
  private messageCallbacks: Array<(message: MqttMessage) => void> = []
  private connectCallbacks: Array<() => void> = []
  private disconnectCallbacks: Array<() => void> = []
  private errorCallbacks: Array<(error: Error) => void> = []

  constructor(options: MqttConnectOptions) {
    this.options = options
  }

  /**
   * 连接到MQTT服务器
   */
  async connect(): Promise<void> {
    if (this.client?.connected) {
      return
    }

    return new Promise((resolve, reject) => {
      const protocol = this.options.protocol || 'mqtt'
      const port = this.options.port || (protocol === 'mqtts' || protocol === 'wss' ? 8883 : 1883)
      const url = `${protocol}://${this.options.host}:${port}`

      const clientOptions: IClientOptions = {
        clientId: this.options.clientId || `mqtt_${Math.random().toString(16).substring(2, 10)}`,
        username: this.options.username,
        password: this.options.password,
        clean: this.options.clean !== false,
        keepalive: this.options.keepalive || 60,
        reconnectPeriod: this.options.reconnectPeriod || 1000,
        connectTimeout: this.options.connectTimeout || 30000,
        rejectUnauthorized: this.options.rejectUnauthorized !== false,
      }

      if (this.options.will) {
        clientOptions.will = {
          topic: this.options.will.topic,
          payload: this.options.will.payload,
          qos: this.options.will.qos || 0,
          retain: this.options.will.retain || false,
        }
      }

      if (this.options.ca || this.options.cert || this.options.key) {
        clientOptions.ca = this.options.ca
        clientOptions.cert = this.options.cert
        clientOptions.key = this.options.key
      }

      this.client = mqtt.connect(url, clientOptions)

      this.client.on('connect', () => {
        this.connectCallbacks.forEach((callback) => callback())
        resolve()
      })

      this.client.on('message', (topic: string, payload: Buffer, packet: any) => {
        const message: MqttMessage = {
          topic,
          payload,
          qos: packet.qos,
          retain: packet.retain,
          messageId: packet.messageId,
          dup: packet.dup,
        }
        this.messageCallbacks.forEach((callback) => callback(message))
      })

      this.client.on('error', (error: Error) => {
        this.errorCallbacks.forEach((callback) => callback(error))
        reject(error)
      })

      this.client.on('close', () => {
        this.disconnectCallbacks.forEach((callback) => callback())
      })

      this.client.on('disconnect', () => {
        this.disconnectCallbacks.forEach((callback) => callback())
      })
    })
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client?.end(false, {}, () => {
          this.client = null
          resolve()
        })
      })
    }
  }

  /**
   * 发布消息
   */
  async publish(
    topic: string,
    message: string | Buffer,
    options?: MqttSubscribeOptions
  ): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('MQTT client is not connected')
    }

    return new Promise((resolve, reject) => {
      this.client?.publish(topic, message, { qos: options?.qos || 0 }, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * 订阅主题
   */
  async subscribe(topic: string | string[], options?: MqttSubscribeOptions): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('MQTT client is not connected')
    }

    return new Promise((resolve, reject) => {
      const topics = Array.isArray(topic) ? topic : [topic]
      const subscription = topics.reduce((acc, t) => {
        acc[t] = { qos: options?.qos || 0 }
        return acc
      }, {} as Record<string, { qos: 0 | 1 | 2 }>)

      this.client?.subscribe(subscription, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * 取消订阅
   */
  async unsubscribe(topic: string | string[]): Promise<void> {
    if (!this.client?.connected) {
      throw new Error('MQTT client is not connected')
    }

    return new Promise((resolve, reject) => {
      const topics = Array.isArray(topic) ? topic : [topic]
      this.client?.unsubscribe(topics, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * 监听消息
   */
  onMessage(callback: (message: MqttMessage) => void): void {
    this.messageCallbacks.push(callback)
  }

  /**
   * 监听连接事件
   */
  onConnect(callback: () => void): void {
    this.connectCallbacks.push(callback)
  }

  /**
   * 监听断开连接事件
   */
  onDisconnect(callback: () => void): void {
    this.disconnectCallbacks.push(callback)
  }

  /**
   * 监听错误事件
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback)
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.client?.connected || false
  }
}

/**
 * 创建MQTT客户端
 */
export function createMqttClient(options: MqttConnectOptions): MqttClient {
  return new MqttClient(options)
}
