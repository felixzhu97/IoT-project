/**
 * CBOR序列化器
 */

import { encode, decode } from 'cbor-x'
import type { ISerializer } from './types'

/**
 * CBOR序列化器类
 */
export class CborSerializer implements ISerializer {
  private options: {
    useRecords?: boolean
    useTag259ForMaps?: boolean
    mapsAsObjects?: boolean
    tagUint8Arrays?: boolean
  }

  constructor(options?: {
    useRecords?: boolean
    useTag259ForMaps?: boolean
    mapsAsObjects?: boolean
    tagUint8Arrays?: boolean
  }) {
    this.options = options || {
      useRecords: true,
      mapsAsObjects: true,
    }
  }

  /**
   * 序列化数据
   */
  serialize<T>(data: T): Buffer {
    try {
      const encoded = encode(data, this.options)
      return Buffer.from(encoded)
    } catch (error) {
      throw new Error(`CBOR serialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 反序列化数据
   */
  deserialize<T>(data: Buffer | Uint8Array): T {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
      return decode(buffer, this.options) as T
    } catch (error) {
      throw new Error(`CBOR deserialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

/**
 * 创建CBOR序列化器
 */
export function createCborSerializer(options?: {
  useRecords?: boolean
  useTag259ForMaps?: boolean
  mapsAsObjects?: boolean
  tagUint8Arrays?: boolean
}): CborSerializer {
  return new CborSerializer(options)
}
