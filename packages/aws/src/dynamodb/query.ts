/**
 * DynamoDB查询操作
 */

import {
  QueryCommand,
  ScanCommand,
  type QueryCommandInput,
  type ScanCommandInput,
} from '@aws-sdk/client-dynamodb'
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { createDynamoDBClient } from './client'
import { toDynamoDBItem, fromDynamoDBItem, type DynamoDBItem } from './table'

/**
 * 查询结果
 */
export interface QueryResult<T = Record<string, any>> {
  items: T[]
  count: number
  scannedCount?: number
  lastEvaluatedKey?: Record<string, any>
}

/**
 * 执行Query查询
 */
export async function query<T = Record<string, any>>(
  tableName: string,
  keyConditionExpression: string,
  options?: {
    indexName?: string
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, any>
    filterExpression?: string
    projectionExpression?: string
    consistentRead?: boolean
    scanIndexForward?: boolean
    limit?: number
    exclusiveStartKey?: Record<string, any>
    client?: DynamoDBClient
  }
): Promise<QueryResult<T>> {
  const client = options?.client || createDynamoDBClient()

  // 辅助函数：将单个值转换为AttributeValue
  const valueToAttributeValue = (value: any): DynamoDBItem[string] => {
    if (value === null || value === undefined) {
      return { NULL: true } as DynamoDBItem[string]
    }
    if (typeof value === 'string') {
      return { S: value } as DynamoDBItem[string]
    }
    if (typeof value === 'number') {
      return { N: value.toString() } as DynamoDBItem[string]
    }
    if (typeof value === 'boolean') {
      return { BOOL: value } as DynamoDBItem[string]
    }
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
      return { B: Buffer.from(value) } as DynamoDBItem[string]
    }
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'string') {
        return { SS: value } as DynamoDBItem[string]
      }
      if (value.length > 0 && typeof value[0] === 'number') {
        return { NS: value.map((v) => v.toString()) } as DynamoDBItem[string]
      }
      // 其他类型数组，转换为L类型
      return {
        L: value.map((v) => valueToAttributeValue(v)),
      } as DynamoDBItem[string]
    }
    if (typeof value === 'object') {
      return { M: toDynamoDBItem(value) } as DynamoDBItem[string]
    }
    return { S: String(value) } as DynamoDBItem[string]
  }

  const dynamoValues = options?.expressionAttributeValues
    ? Object.entries(options.expressionAttributeValues).reduce(
        (acc, [k, v]) => {
          acc[k] = valueToAttributeValue(v)
          return acc
        },
        {} as Record<string, DynamoDBItem[string]>
      )
    : undefined

  const input: QueryCommandInput = {
    TableName: tableName,
    IndexName: options?.indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: options?.expressionAttributeNames,
    ExpressionAttributeValues: dynamoValues,
    FilterExpression: options?.filterExpression,
    ProjectionExpression: options?.projectionExpression,
    ConsistentRead: options?.consistentRead,
    ScanIndexForward: options?.scanIndexForward,
    Limit: options?.limit,
    ExclusiveStartKey: options?.exclusiveStartKey
      ? toDynamoDBItem(options.exclusiveStartKey)
      : undefined,
  }

  const command = new QueryCommand(input)
  const response = await client.send(command)

  return {
    items: (response.Items || []).map((item) => fromDynamoDBItem(item) as T),
    count: response.Count || 0,
    scannedCount: response.ScannedCount,
    lastEvaluatedKey: response.LastEvaluatedKey
      ? fromDynamoDBItem(response.LastEvaluatedKey)
      : undefined,
  }
}

/**
 * 执行Scan扫描
 */
export async function scan<T = Record<string, any>>(
  tableName: string,
  options?: {
    indexName?: string
    filterExpression?: string
    expressionAttributeNames?: Record<string, string>
    expressionAttributeValues?: Record<string, any>
    projectionExpression?: string
    segment?: number
    totalSegments?: number
    limit?: number
    exclusiveStartKey?: Record<string, any>
    client?: DynamoDBClient
  }
): Promise<QueryResult<T>> {
  const client = options?.client || createDynamoDBClient()

  // 辅助函数：将单个值转换为AttributeValue
  const valueToAttributeValue = (value: any): DynamoDBItem[string] => {
    if (value === null || value === undefined) {
      return { NULL: true } as DynamoDBItem[string]
    }
    if (typeof value === 'string') {
      return { S: value } as DynamoDBItem[string]
    }
    if (typeof value === 'number') {
      return { N: value.toString() } as DynamoDBItem[string]
    }
    if (typeof value === 'boolean') {
      return { BOOL: value } as DynamoDBItem[string]
    }
    if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
      return { B: Buffer.from(value) } as DynamoDBItem[string]
    }
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'string') {
        return { SS: value } as DynamoDBItem[string]
      }
      if (value.length > 0 && typeof value[0] === 'number') {
        return { NS: value.map((v) => v.toString()) } as DynamoDBItem[string]
      }
      // 其他类型数组，转换为L类型
      return {
        L: value.map((v) => valueToAttributeValue(v)),
      } as DynamoDBItem[string]
    }
    if (typeof value === 'object') {
      return { M: toDynamoDBItem(value) } as DynamoDBItem[string]
    }
    return { S: String(value) } as DynamoDBItem[string]
  }

  const dynamoValues = options?.expressionAttributeValues
    ? Object.entries(options.expressionAttributeValues).reduce(
        (acc, [k, v]) => {
          acc[k] = valueToAttributeValue(v)
          return acc
        },
        {} as Record<string, DynamoDBItem[string]>
      )
    : undefined

  const input: ScanCommandInput = {
    TableName: tableName,
    IndexName: options?.indexName,
    FilterExpression: options?.filterExpression,
    ExpressionAttributeNames: options?.expressionAttributeNames,
    ExpressionAttributeValues: dynamoValues,
    ProjectionExpression: options?.projectionExpression,
    Segment: options?.segment,
    TotalSegments: options?.totalSegments,
    Limit: options?.limit,
    ExclusiveStartKey: options?.exclusiveStartKey
      ? toDynamoDBItem(options.exclusiveStartKey)
      : undefined,
  }

  const command = new ScanCommand(input)
  const response = await client.send(command)

  return {
    items: (response.Items || []).map((item) => fromDynamoDBItem(item) as T),
    count: response.Count || 0,
    scannedCount: response.ScannedCount,
    lastEvaluatedKey: response.LastEvaluatedKey
      ? fromDynamoDBItem(response.LastEvaluatedKey)
      : undefined,
  }
}
