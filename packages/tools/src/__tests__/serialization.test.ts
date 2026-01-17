/**
 * 数据序列化工具测试
 */

import { describe, it, expect } from 'vitest'
import { CborSerializer, MessagePackSerializer, createCborSerializer, createMessagePackSerializer } from '../serialization'

describe('Serialization', () => {
  const testData = {
    name: 'test',
    value: 123,
    nested: {
      array: [1, 2, 3],
      flag: true,
    },
  }

  describe('CBOR Serializer', () => {
    it('应该能够序列化和反序列化数据', () => {
      const serializer = createCborSerializer()
      const serialized = serializer.serialize(testData)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(testData)
    })

    it('应该处理空对象', () => {
      const serializer = createCborSerializer()
      const data = {}
      const serialized = serializer.serialize(data)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(data)
    })

    it('应该处理数组', () => {
      const serializer = createCborSerializer()
      const data = [1, 2, 3, 'test']
      const serialized = serializer.serialize(data)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(data)
    })
  })

  describe('MessagePack Serializer', () => {
    it('应该能够序列化和反序列化数据', () => {
      const serializer = createMessagePackSerializer()
      const serialized = serializer.serialize(testData)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(testData)
    })

    it('应该处理空对象', () => {
      const serializer = createMessagePackSerializer()
      const data = {}
      const serialized = serializer.serialize(data)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(data)
    })

    it('应该处理数组', () => {
      const serializer = createMessagePackSerializer()
      const data = [1, 2, 3, 'test']
      const serialized = serializer.serialize(data)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(data)
    })
  })
})
