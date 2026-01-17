/**
 * Protobuf序列化器
 */

import protobuf from 'protobufjs'
import type { ISerializer } from './types'

/**
 * Protobuf序列化器类
 */
export class ProtobufSerializer implements ISerializer {
  private root: protobuf.Root
  private messageType?: protobuf.Type

  constructor(protoDefinition?: string | protobuf.Root, messageName?: string) {
    if (protoDefinition instanceof protobuf.Root) {
      this.root = protoDefinition
    } else if (protoDefinition) {
      this.root = protobuf.parse(protoDefinition).root
    } else {
      this.root = new protobuf.Root()
    }

    if (messageName) {
      this.messageType = this.root.lookupType(messageName)
    }
  }

  /**
   * 序列化数据
   */
  serialize<T>(data: T): Buffer {
    if (!this.messageType) {
      throw new Error('Message type not specified. Provide proto definition and message name.')
    }

    try {
      const message = this.messageType.create(data as any)
      const buffer = this.messageType.encode(message).finish()
      return Buffer.from(buffer)
    } catch (error) {
      throw new Error(`Protobuf serialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 反序列化数据
   */
  deserialize<T>(data: Buffer | Uint8Array): T {
    if (!this.messageType) {
      throw new Error('Message type not specified. Provide proto definition and message name.')
    }

    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
      const message = this.messageType.decode(buffer)
      return this.messageType.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: true,
        arrays: true,
        objects: true,
        oneofs: true,
      }) as T
    } catch (error) {
      throw new Error(`Protobuf deserialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 注册消息类型
   */
  registerMessageType(messageName: string): void {
    this.messageType = this.root.lookupType(messageName)
  }

  /**
   * 从文件加载proto定义
   */
  static async fromFile(protoPath: string, messageName?: string): Promise<ProtobufSerializer> {
    const root = await protobuf.load(protoPath)
    const serializer = new ProtobufSerializer(root, messageName)
    return serializer
  }

  /**
   * 从JSON定义创建
   */
  static fromJSON(json: protobuf.INamespace | string, messageName?: string): ProtobufSerializer {
    const root = protobuf.Root.fromJSON(typeof json === 'string' ? JSON.parse(json) : json)
    return new ProtobufSerializer(root, messageName)
  }
}

/**
 * 创建Protobuf序列化器
 */
export function createProtobufSerializer(
  protoDefinition?: string | protobuf.Root,
  messageName?: string
): ProtobufSerializer {
  return new ProtobufSerializer(protoDefinition, messageName)
}
