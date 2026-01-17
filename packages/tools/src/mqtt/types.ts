/**
 * MQTT类型定义
 */

/**
 * MQTT连接选项
 */
export interface MqttConnectOptions {
  /**
   * 服务器地址
   */
  host: string
  /**
   * 端口号
   */
  port?: number
  /**
   * 协议（mqtt, mqtts, ws, wss）
   */
  protocol?: 'mqtt' | 'mqtts' | 'ws' | 'wss'
  /**
   * 客户端ID
   */
  clientId?: string
  /**
   * 用户名
   */
  username?: string
  /**
   * 密码
   */
  password?: string
  /**
   * 是否清理会话
   */
  clean?: boolean
  /**
   * 保持连接时间（秒）
   */
  keepalive?: number
  /**
   * 遗嘱消息
   */
  will?: {
    topic: string
    payload: string | Buffer
    qos?: 0 | 1 | 2
    retain?: boolean
  }
  /**
   * 是否重新连接
   */
  reconnectPeriod?: number
  /**
   * 连接超时时间（毫秒）
   */
  connectTimeout?: number
  /**
   * CA证书路径或内容
   */
  ca?: string | string[] | Buffer | Buffer[]
  /**
   * 客户端证书路径或内容
   */
  cert?: string | Buffer | Buffer[]
  /**
   * 客户端密钥路径或内容
   */
  key?: string | Buffer | Buffer[]
  /**
   * 是否拒绝未授权的证书
   */
  rejectUnauthorized?: boolean
}

/**
 * MQTT消息
 */
export interface MqttMessage {
  /**
   * 主题
   */
  topic: string
  /**
   * 消息内容
   */
  payload: string | Buffer
  /**
   * QoS级别
   */
  qos?: 0 | 1 | 2
  /**
   * 是否保留
   */
  retain?: boolean
  /**
   * 消息ID（QoS > 0时）
   */
  messageId?: number
  /**
   * 重复标志
   */
  dup?: boolean
}

/**
 * MQTT订阅选项
 */
export interface MqttSubscribeOptions {
  /**
   * QoS级别
   */
  qos?: 0 | 1 | 2
}

/**
 * MQTT客户端接口
 */
export interface IMqttClient {
  /**
   * 连接到MQTT服务器
   */
  connect(): Promise<void>
  /**
   * 断开连接
   */
  disconnect(): Promise<void>
  /**
   * 发布消息
   */
  publish(topic: string, message: string | Buffer, options?: MqttSubscribeOptions): Promise<void>
  /**
   * 订阅主题
   */
  subscribe(topic: string | string[], options?: MqttSubscribeOptions): Promise<void>
  /**
   * 取消订阅
   */
  unsubscribe(topic: string | string[]): Promise<void>
  /**
   * 监听消息
   */
  onMessage(callback: (message: MqttMessage) => void): void
  /**
   * 监听连接事件
   */
  onConnect(callback: () => void): void
  /**
   * 监听断开连接事件
   */
  onDisconnect(callback: () => void): void
  /**
   * 监听错误事件
   */
  onError(callback: (error: Error) => void): void
  /**
   * 是否已连接
   */
  isConnected(): boolean
}
