/**
 * DynamoDB模块测试
 */

import { describe, it, expect } from 'vitest'
import { toDynamoDBItem, fromDynamoDBItem } from '../dynamodb/table'

describe('DynamoDB Table', () => {
  describe('toDynamoDBItem', () => {
    it('应该转换字符串值', () => {
      const item = { name: 'test', id: '123' }
      const result = toDynamoDBItem(item)

      expect(result.name?.S).toBe('test')
      expect(result.id?.S).toBe('123')
    })

    it('应该转换数字值', () => {
      const item = { count: 42, price: 99.99 }
      const result = toDynamoDBItem(item)

      expect(result.count?.N).toBe('42')
      expect(result.price?.N).toBe('99.99')
    })

    it('应该转换布尔值', () => {
      const item = { active: true, deleted: false }
      const result = toDynamoDBItem(item)

      expect(result.active?.BOOL).toBe(true)
      expect(result.deleted?.BOOL).toBe(false)
    })

    it('应该转换字符串数组', () => {
      const item = { tags: ['tag1', 'tag2', 'tag3'] }
      const result = toDynamoDBItem(item)

      expect(result.tags?.SS).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('应该转换数字数组', () => {
      const item = { scores: [10, 20, 30] }
      const result = toDynamoDBItem(item)

      expect(result.scores?.NS).toEqual(['10', '20', '30'])
    })

    it('应该转换嵌套对象', () => {
      const item = {
        name: 'test',
        metadata: {
          created: '2024-01-01',
          version: 1,
        },
      }
      const result = toDynamoDBItem(item)

      expect(result.name?.S).toBe('test')
      expect(result.metadata?.M).toBeDefined()
      expect(result.metadata?.M?.created?.S).toBe('2024-01-01')
      expect(result.metadata?.M?.version?.N).toBe('1')
    })

    it('应该跳过null和undefined值', () => {
      const item = { name: 'test', nullValue: null, undefinedValue: undefined }
      const result = toDynamoDBItem(item)

      expect(result.name?.S).toBe('test')
      expect(result.nullValue).toBeUndefined()
      expect(result.undefinedValue).toBeUndefined()
    })
  })

  describe('fromDynamoDBItem', () => {
    it('应该转换字符串值', () => {
      const dynamoItem = {
        name: { S: 'test' },
        id: { S: '123' },
      }
      const result = fromDynamoDBItem(dynamoItem)

      expect(result.name).toBe('test')
      expect(result.id).toBe('123')
    })

    it('应该转换数字值', () => {
      const dynamoItem = {
        count: { N: '42' },
        price: { N: '99.99' },
      }
      const result = fromDynamoDBItem(dynamoItem)

      expect(result.count).toBe(42)
      expect(result.price).toBe(99.99)
    })

    it('应该转换布尔值', () => {
      const dynamoItem = {
        active: { BOOL: true },
        deleted: { BOOL: false },
      }
      const result = fromDynamoDBItem(dynamoItem)

      expect(result.active).toBe(true)
      expect(result.deleted).toBe(false)
    })

    it('应该转换字符串数组', () => {
      const dynamoItem = {
        tags: { SS: ['tag1', 'tag2', 'tag3'] },
      }
      const result = fromDynamoDBItem(dynamoItem)

      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('应该转换数字数组', () => {
      const dynamoItem = {
        scores: { NS: ['10', '20', '30'] },
      }
      const result = fromDynamoDBItem(dynamoItem)

      expect(result.scores).toEqual([10, 20, 30])
    })

    it('应该转换嵌套对象', () => {
      const dynamoItem = {
        name: { S: 'test' },
        metadata: {
          M: {
            created: { S: '2024-01-01' },
            version: { N: '1' },
          },
        },
      }
      const result = fromDynamoDBItem(dynamoItem)

      expect(result.name).toBe('test')
      expect(result.metadata.created).toBe('2024-01-01')
      expect(result.metadata.version).toBe(1)
    })

    it('应该处理往返转换', () => {
      const original = {
        name: 'test',
        count: 42,
        active: true,
        tags: ['tag1', 'tag2'],
        metadata: {
          created: '2024-01-01',
          version: 1,
        },
      }

      const dynamoItem = toDynamoDBItem(original)
      const converted = fromDynamoDBItem(dynamoItem)

      expect(converted.name).toBe(original.name)
      expect(converted.count).toBe(original.count)
      expect(converted.active).toBe(original.active)
      expect(converted.tags).toEqual(original.tags)
      expect(converted.metadata.created).toBe(original.metadata.created)
      expect(converted.metadata.version).toBe(original.metadata.version)
    })
  })
})
