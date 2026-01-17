/**
 * MessagePack序列化器
 */

import { pack, unpack } from 'msgpackr'
import type { ISerializer } from './types'

/**
 * MessagePack序列化器类
 */
export class MessagePackSerializer implements ISerializer {
  private options: {
    useRecords?: boolean
    structuredClone?: boolean
    variableMapSize?: boolean
    mapAsEmptyObject?: boolean
    useFloat32?: number
  }

  constructor(options?: {
    useRecords?: boolean
    structuredClone?: boolean
    variableMapSize?: boolean
    mapAsEmptyObject?: boolean
    useFloat32?: number
  }) {
    this.options = options || {
      useRecords: true,
    }
  }

  /**
   * 序列化数据
   */
  serialize<T>(data: T): Buffer {
    try {
      const encoded = pack(data, this.options)
      return Buffer.from(encoded)
    } catch (error) {
      throw new Error(`MessagePack serialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 反序列化数据
   */
  deserialize<T>(data: Buffer | Uint8Array): T {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
      return unpack(buffer, this.options) as T
    } catch (error) {
      throw new Error(`MessagePack deserialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

/**
 * 创建MessagePack序列化器
 */
export function createMessagePackSerializer(options?: {
  useRecords?: boolean
  structuredClone?: boolean
  variableMapSize?: boolean
  mapAsEmptyObject?: boolean
  useFloat32?: number
}): MessagePackSerializer {
  return new MessagePackSerializer(options)
}
