/**
 * CoAP客户端封装
 */

import * as coap from 'coap'
import type {
  CoapMethod,
  CoapRequestOptions,
  CoapResponse,
  CoapContentFormat,
  ICoapClient,
} from './types'

/**
 * CoAP客户端选项
 */
export interface CoapClientOptions {
  host?: string
  port?: number
  psk?: Buffer
  algorithm?: string
}

/**
 * CoAP客户端类
 */
export class CoapClient implements ICoapClient {
  private observeMap: Map<string, any> = new Map()
  private options?: CoapClientOptions

  constructor(options?: CoapClientOptions) {
    this.options = options
  }

  /**
   * 发送请求
   */
  private async request(
    method: CoapMethod,
    url: string,
    payload?: string | Buffer,
    options?: CoapRequestOptions
  ): Promise<CoapResponse> {
    return new Promise((resolve, reject) => {
      try {
        // 解析URL或使用路径
        let hostname = this.options?.host || 'localhost'
        let port = this.options?.port || 5683
        let pathname = url

        try {
          if (url.startsWith('coap://') || url.startsWith('coaps://')) {
            const urlObj = new URL(url)
            hostname = urlObj.hostname
            port = urlObj.port ? parseInt(urlObj.port, 10) : (url.startsWith('coaps://') ? 5684 : 5683)
            pathname = urlObj.pathname
          } else if (url.startsWith('/')) {
            pathname = url
          }
        } catch {
          // 如果URL解析失败，使用原始值
          pathname = url
        }

        const req = coap.request({
          hostname,
          port,
          pathname,
          method,
          confirmable: options?.confirmable !== false,
          observe: options?.observe || false,
        })

        // 设置内容格式
        if (options?.contentFormat !== undefined) {
          req.setOption('Content-Format', options.contentFormat)
        }

        if (options?.accept !== undefined) {
          req.setOption('Accept', options.accept)
        }

        // 设置查询参数
        if (options?.query) {
          const queryString = typeof options.query === 'string'
            ? options.query
            : Object.entries(options.query)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
          req.setOption('Uri-Query', queryString)
        }

        req.on('response', (res) => {
          let payload = Buffer.alloc(0)
          res.on('data', (chunk: Buffer) => {
            payload = Buffer.concat([payload, chunk])
          })

          res.on('end', () => {
            resolve({
              code: res.code,
              payload,
              contentFormat: res.headers['Content-Format'] as CoapContentFormat | undefined,
              options: res.headers as Record<string, string | number> | undefined,
            })
          })
        })

        req.on('error', (error: Error) => {
          reject(new Error(`CoAP request failed: ${error.message}`))
        })

        if (payload) {
          req.write(payload)
        }

        req.end()
      } catch (error) {
        reject(new Error(`CoAP request failed: ${error instanceof Error ? error.message : String(error)}`))
      }
    })
  }

  /**
   * 发送GET请求
   */
  async get(url: string, options?: CoapRequestOptions): Promise<CoapResponse> {
    return this.request(CoapMethod.GET, url, undefined, options)
  }

  /**
   * 发送POST请求
   */
  async post(url: string, payload?: string | Buffer, options?: CoapRequestOptions): Promise<CoapResponse> {
    return this.request(CoapMethod.POST, url, payload, options)
  }

  /**
   * 发送PUT请求
   */
  async put(url: string, payload?: string | Buffer, options?: CoapRequestOptions): Promise<CoapResponse> {
    return this.request(CoapMethod.PUT, url, payload, options)
  }

  /**
   * 发送DELETE请求
   */
  async delete(url: string, options?: CoapRequestOptions): Promise<CoapResponse> {
    return this.request(CoapMethod.DELETE, url, undefined, options)
  }

  /**
   * 发现资源（GET /.well-known/core）
   */
  async discover(serverUrl: string): Promise<string[]> {
    try {
      const baseUrl = serverUrl.replace(/\/$/, '')
      const response = await this.get(`${baseUrl}/.well-known/core`, {
        accept: CoapContentFormat.LinkFormat,
      })

      if (!response.payload) {
        return []
      }

      // 解析Link Format响应
      const linkFormat = response.payload.toString('utf-8')
      const links: string[] = []
      const entries = linkFormat.split(',')

      for (const entry of entries) {
        const match = entry.trim().match(/<([^>]+)>/)
        if (match && match[1]) {
          links.push(match[1])
        }
      }

      return links
    } catch (error) {
      throw new Error(`Resource discovery failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 监听资源变化（观察者模式）
   */
  async observe(
    url: string,
    callback: (response: CoapResponse) => void,
    options?: CoapRequestOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 解析URL或使用路径
        let hostname = this.options?.host || 'localhost'
        let port = this.options?.port || 5683
        let pathname = url

        try {
          if (url.startsWith('coap://') || url.startsWith('coaps://')) {
            const urlObj = new URL(url)
            hostname = urlObj.hostname
            port = urlObj.port ? parseInt(urlObj.port, 10) : (url.startsWith('coaps://') ? 5684 : 5683)
            pathname = urlObj.pathname
          } else if (url.startsWith('/')) {
            pathname = url
          }
        } catch {
          // 如果URL解析失败，使用原始值
          pathname = url
        }

        const req = coap.request({
          hostname,
          port,
          pathname,
          method: CoapMethod.GET,
          confirmable: options?.confirmable !== false,
          observe: true,
        })

        if (options?.accept !== undefined) {
          req.setOption('Accept', options.accept)
        }

        this.observeMap.set(url, req)

        req.on('response', (res) => {
          let payload = Buffer.alloc(0)
          res.on('data', (chunk: Buffer) => {
            payload = Buffer.concat([payload, chunk])
          })

          res.on('end', () => {
            callback({
              code: res.code,
              payload,
              contentFormat: res.headers['Content-Format'] as CoapContentFormat | undefined,
              options: res.headers as Record<string, string | number> | undefined,
            })
          })
        })

        req.on('error', (error: Error) => {
          this.observeMap.delete(url)
          reject(new Error(`Failed to observe resource: ${error.message}`))
        })

        req.end()
        resolve()
      } catch (error) {
        reject(new Error(`Failed to observe resource: ${error instanceof Error ? error.message : String(error)}`))
      }
    })
  }

  /**
   * 停止观察资源
   */
  async stopObserving(url: string): Promise<void> {
    const observer = this.observeMap.get(url)
    if (observer) {
      try {
        if (observer && typeof observer.close === 'function') {
          observer.close()
        }
        this.observeMap.delete(url)
      } catch (error) {
        throw new Error(
          `Failed to stop observing: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
  }
}

/**
 * 创建CoAP客户端
 */
export function createCoapClient(options?: CoapClientOptions): CoapClient {
  return new CoapClient(options)
}
