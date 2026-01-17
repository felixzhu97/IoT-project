/**
 * 协议转换类型定义
 */

/**
 * 统一消息格式
 */
export interface UnifiedMessage {
  /**
   * 主题/路径/URL
   */
  topic?: string
  path?: string
  url?: string
  /**
   * 消息内容
   */
  payload: string | Buffer
  /**
   * 方法（HTTP方法或CoAP方法）
   */
  method?: string
  /**
   * 查询参数
   */
  query?: Record<string, string>
  /**
   * 头部信息
   */
  headers?: Record<string, string>
  /**
   * QoS级别（MQTT）
   */
  qos?: 0 | 1 | 2
  /**
   * 是否保留（MQTT）
   */
  retain?: boolean
  /**
   * 内容类型
   */
  contentType?: string
}

/**
 * 协议类型
 */
export enum ProtocolType {
  MQTT = 'mqtt',
  CoAP = 'coap',
  HTTP = 'http',
}
