/**
 * DynamoDB表操作
 */

import {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  type PutItemCommandInput,
  type GetItemCommandInput,
  type UpdateItemCommandInput,
  type DeleteItemCommandInput,
  type AttributeValue,
} from '@aws-sdk/client-dynamodb'
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { createDynamoDBClient } from './client'

/**
 * DynamoDB项（使用AttributeValue格式）
 */
export type DynamoDBItem = Record<string, AttributeValue>

/**
 * 将单个值转换为AttributeValue
 */
function valueToAttributeValue(value: any): AttributeValue {
  if (value === null || value === undefined) {
    return { NULL: true }
  }
  if (typeof value === 'string') {
    return { S: value }
  }
  if (typeof value === 'number') {
    return { N: value.toString() }
  }
  if (typeof value === 'boolean') {
    return { BOOL: value }
  }
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return { B: Buffer.from(value) }
  }
  if (Array.isArray(value)) {
    if (value.length > 0) {
      if (typeof value[0] === 'string') {
        return { SS: value }
      }
      if (typeof value[0] === 'number') {
        return { NS: value.map((v) => v.toString()) }
      }
      if (Buffer.isBuffer(value[0]) || value[0] instanceof Uint8Array) {
        return { BS: value.map((v) => Buffer.from(v)) }
      }
      // 对象数组
      return {
        L: value.map((v) => {
          if (typeof v === 'object' && v !== null && !Array.isArray(v) && !Buffer.isBuffer(v) && !(v instanceof Uint8Array)) {
            return { M: toDynamoDBItem(v) }
          }
          return valueToAttributeValue(v)
        }),
      }
    }
    return { L: [] }
  }
  if (typeof value === 'object') {
    return { M: toDynamoDBItem(value) }
  }
  // 默认作为字符串处理
  return { S: String(value) }
}

/**
 * 将JavaScript对象转换为DynamoDB AttributeValue格式
 */
export function toDynamoDBItem(item: Record<string, any>): DynamoDBItem {
  const dynamoItem: DynamoDBItem = {}

  for (const [key, value] of Object.entries(item)) {
    if (value === null || value === undefined) {
      continue
    }

    if (typeof value === 'string') {
      dynamoItem[key] = { S: value }
    } else if (typeof value === 'number') {
      dynamoItem[key] = { N: value.toString() }
    } else if (typeof value === 'boolean') {
      dynamoItem[key] = { BOOL: value }
    } else if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
      dynamoItem[key] = { B: Buffer.from(value) }
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        if (typeof value[0] === 'string') {
          dynamoItem[key] = { SS: value }
        } else if (typeof value[0] === 'number') {
          dynamoItem[key] = { NS: value.map((v) => v.toString()) }
        } else if (Buffer.isBuffer(value[0]) || value[0] instanceof Uint8Array) {
          dynamoItem[key] = { BS: value.map((v) => Buffer.from(v)) }
        } else {
          // 对象数组或其他类型数组，转换为AttributeValue的L类型列表
          // 对于对象，转换为M类型；对于其他类型，根据类型转换
          dynamoItem[key] = {
            L: value.map((v) => {
              if (typeof v === 'object' && v !== null && !Array.isArray(v) && !Buffer.isBuffer(v) && !(v instanceof Uint8Array)) {
                return { M: toDynamoDBItem(v) }
              }
              // 对于基本类型，根据类型创建对应的AttributeValue
              if (typeof v === 'string') {
                return { S: v }
              } else if (typeof v === 'number') {
                return { N: v.toString() }
              } else if (typeof v === 'boolean') {
                return { BOOL: v }
              } else if (Buffer.isBuffer(v) || v instanceof Uint8Array) {
                return { B: Buffer.from(v) }
              }
              // 默认返回空对象（不应该到达这里）
              return {}
            }),
          }
        }
      } else {
        dynamoItem[key] = { L: [] }
      }
    } else if (typeof value === 'object') {
      dynamoItem[key] = { M: toDynamoDBItem(value) }
    }
  }

  return dynamoItem
}

/**
 * 将DynamoDB AttributeValue格式转换为JavaScript对象
 */
export function fromDynamoDBItem(dynamoItem: DynamoDBItem): Record<string, any> {
  const item: Record<string, any> = {}

  for (const [key, attrValue] of Object.entries(dynamoItem)) {
    if (attrValue.S !== undefined) {
      item[key] = attrValue.S
    } else if (attrValue.N !== undefined) {
      item[key] = parseFloat(attrValue.N)
    } else if (attrValue.BOOL !== undefined) {
      item[key] = attrValue.BOOL
    } else if (attrValue.B !== undefined) {
      item[key] = Buffer.from(attrValue.B)
    } else if (attrValue.SS !== undefined) {
      item[key] = attrValue.SS
    } else if (attrValue.NS !== undefined) {
      item[key] = attrValue.NS.map((n) => parseFloat(n))
    } else if (attrValue.BS !== undefined) {
      item[key] = attrValue.BS.map((b) => Buffer.from(b))
    } else if (attrValue.L !== undefined) {
      item[key] = attrValue.L.map((v) => {
        // 处理列表中的每个AttributeValue
        if (v.M) {
          return fromDynamoDBItem(v.M)
        } else if (v.S) {
          return v.S
        } else if (v.N) {
          return parseFloat(v.N)
        } else if (v.BOOL !== undefined) {
          return v.BOOL
        } else if (v.B) {
          return Buffer.from(v.B)
        } else if (v.NULL !== undefined) {
          return null
        }
        return v
      })
    } else if (attrValue.M !== undefined) {
      item[key] = fromDynamoDBItem(attrValue.M)
    } else if (attrValue.NULL !== undefined) {
      item[key] = null
    }
  }

  return item
}

/**
 * 插入或替换项
 */
export async function putItem(
  tableName: string,
  item: Record<string, any>,
  options?: {
    conditionExpression?: string
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, AttributeValue>
    returnValues?: 'NONE' | 'ALL_OLD'
    client?: DynamoDBClient
  }
): Promise<Record<string, any> | undefined> {
  const client = options?.client || createDynamoDBClient()

  const dynamoItem = toDynamoDBItem(item)

  const input: PutItemCommandInput = {
    TableName: tableName,
    Item: dynamoItem,
    ConditionExpression: options?.conditionExpression,
    ExpressionAttributeNames: options?.expressionAttributeNames,
    ExpressionAttributeValues: options?.expressionAttributeValues,
    ReturnValues: options?.returnValues,
  }

  const command = new PutItemCommand(input)
  const response = await client.send(command)

  return response.Attributes ? fromDynamoDBItem(response.Attributes) : undefined
}

/**
 * 获取项
 */
export async function getItem(
  tableName: string,
  key: Record<string, any>,
  options?: {
    consistentRead?: boolean
    projectionExpression?: string
    expressionAttributeNames?: Record<string, string>
    client?: DynamoDBClient
  }
): Promise<Record<string, any> | undefined> {
  const client = options?.client || createDynamoDBClient()

  const dynamoKey = toDynamoDBItem(key)

  const input: GetItemCommandInput = {
    TableName: tableName,
    Key: dynamoKey,
    ConsistentRead: options?.consistentRead,
    ProjectionExpression: options?.projectionExpression,
    ExpressionAttributeNames: options?.expressionAttributeNames,
  }

  const command = new GetItemCommand(input)
  const response = await client.send(command)

  return response.Item ? fromDynamoDBItem(response.Item) : undefined
}

/**
 * 更新项
 */
export async function updateItem(
  tableName: string,
  key: Record<string, any>,
  updateExpression: string,
  options?: {
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, any>
    conditionExpression?: string
    returnValues?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'
    client?: DynamoDBClient
  }
): Promise<Record<string, any> | undefined> {
  const client = options?.client || createDynamoDBClient()

  const dynamoKey = toDynamoDBItem(key)
  const dynamoValues = options?.expressionAttributeValues
    ? Object.entries(options.expressionAttributeValues).reduce(
        (acc, [k, v]) => {
          acc[k] = valueToAttributeValue(v)
          return acc
        },
        {} as Record<string, AttributeValue>
      )
    : undefined

  const input: UpdateItemCommandInput = {
    TableName: tableName,
    Key: dynamoKey,
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: options?.expressionAttributeNames,
    ExpressionAttributeValues: dynamoValues,
    ConditionExpression: options?.conditionExpression,
    ReturnValues: options?.returnValues,
  }

  const command = new UpdateItemCommand(input)
  const response = await client.send(command)

  return response.Attributes ? fromDynamoDBItem(response.Attributes) : undefined
}

/**
 * 删除项
 */
export async function deleteItem(
  tableName: string,
  key: Record<string, any>,
  options?: {
    conditionExpression?: string
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, any>
    returnValues?: 'NONE' | 'ALL_OLD'
    client?: DynamoDBClient
  }
): Promise<Record<string, any> | undefined> {
  const client = options?.client || createDynamoDBClient()

  const dynamoKey = toDynamoDBItem(key)
  const dynamoValues = options?.expressionAttributeValues
    ? Object.entries(options.expressionAttributeValues).reduce(
        (acc, [k, v]) => {
          acc[k] = valueToAttributeValue(v)
          return acc
        },
        {} as Record<string, AttributeValue>
      )
    : undefined

  const input: DeleteItemCommandInput = {
    TableName: tableName,
    Key: dynamoKey,
    ConditionExpression: options?.conditionExpression,
    ExpressionAttributeNames: options?.expressionAttributeNames,
    ExpressionAttributeValues: dynamoValues,
    ReturnValues: options?.returnValues,
  }

  const command = new DeleteItemCommand(input)
  const response = await client.send(command)

  return response.Attributes ? fromDynamoDBItem(response.Attributes) : undefined
}

/**
 * 批量获取项
 */
export async function batchGetItems(
  requests: Array<{ tableName: string; keys: Array<Record<string, any>> }>,
  options?: {
    client?: DynamoDBClient
  }
): Promise<Record<string, Array<Record<string, any>>>> {
  const client = options?.client || createDynamoDBClient()

  const requestItems: Record<string, { Keys: DynamoDBItem[] }> = {}

  for (const request of requests) {
    requestItems[request.tableName] = {
      Keys: request.keys.map((key) => toDynamoDBItem(key)),
    }
  }

  const command = new BatchGetItemCommand({
    RequestItems: requestItems,
  })

  const response = await client.send(command)
  const result: Record<string, Array<Record<string, any>>> = {}

  if (response.Responses) {
    for (const [tableName, items] of Object.entries(response.Responses)) {
      result[tableName] = items.map((item) => fromDynamoDBItem(item))
    }
  }

  return result
}
