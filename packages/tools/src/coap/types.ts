/**
 * CoAP类型定义
 */

/**
 * CoAP请求方法
 */
export enum CoapMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * CoAP消息类型
 */
export enum CoapMessageType {
  Confirmable = 'CON',
  NonConfirmable = 'NON',
  Acknowledgement = 'ACK',
  Reset = 'RST',
}

/**
 * CoAP内容格式
 */
export enum CoapContentFormat {
  TextPlain = 0,
  LinkFormat = 40,
  Xml = 41,
  OctetStream = 42,
  Exi = 47,
  Json = 50,
  Cbor = 60,
}

/**
 * CoAP请求选项
 */
export interface CoapRequestOptions {
  /**
   * 消息类型
   */
  confirmable?: boolean
  /**
   * 观察选项（用于订阅资源变化）
   */
  observe?: boolean
  /**
   * 内容格式
   */
  contentFormat?: CoapContentFormat
  /**
   * 接受的内容格式
   */
  accept?: CoapContentFormat
  /**
   * 查询参数
   */
  query?: string | Record<string, string>
  /**
   * 请求超时时间（毫秒）
   */
  timeout?: number
  /**
   * 重试次数
   */
  retransmit?: number
}

/**
 * CoAP响应
 */
export interface CoapResponse {
  /**
   * 状态码
   */
  code: number
  /**
   * 响应数据
   */
  payload?: Buffer
  /**
   * 内容格式
   */
  contentFormat?: CoapContentFormat
  /**
   * 选项
   */
  options?: Record<string, string | number>
}

/**
 * CoAP客户端接口
 */
export interface ICoapClient {
  /**
   * 发送GET请求
   */
  get(url: string, options?: CoapRequestOptions): Promise<CoapResponse>
  /**
   * 发送POST请求
   */
  post(url: string, payload?: string | Buffer, options?: CoapRequestOptions): Promise<CoapResponse>
  /**
   * 发送PUT请求
   */
  put(url: string, payload?: string | Buffer, options?: CoapRequestOptions): Promise<CoapResponse>
  /**
   * 发送DELETE请求
   */
  delete(url: string, options?: CoapRequestOptions): Promise<CoapResponse>
  /**
   * 发现资源（GET /.well-known/core）
   */
  discover(serverUrl: string): Promise<string[]>
  /**
   * 监听资源变化（观察者模式）
   */
  observe(url: string, callback: (response: CoapResponse) => void, options?: CoapRequestOptions): Promise<void>
  /**
   * 停止观察资源
   */
  stopObserving(url: string): Promise<void>
}
