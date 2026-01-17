/**
 * IoT设备管理
 */

import {
  CreateThingCommand,
  UpdateThingCommand,
  DeleteThingCommand,
  DescribeThingCommand,
  ListThingsCommand,
  type CreateThingCommandInput,
  type UpdateThingCommandInput,
  type DescribeThingCommandInput,
  type ListThingsCommandInput,
} from '@aws-sdk/client-iot'
import type { IoTClient } from '@aws-sdk/client-iot'
import { createIoTClient } from './client'

/**
 * 创建设备
 */
export async function createThing(
  thingName: string,
  options?: {
    thingTypeName?: string
    attributePayload?: Record<string, string>
    client?: IoTClient
  }
): Promise<{ thingName?: string; thingArn?: string; thingId?: string }> {
  const client = options?.client || createIoTClient()

  const input: CreateThingCommandInput = {
    thingName,
    thingTypeName: options?.thingTypeName,
    attributePayload: options?.attributePayload
      ? {
          attributes: options.attributePayload,
        }
      : undefined,
  }

  const command = new CreateThingCommand(input)
  const response = await client.send(command)

  return {
    thingName: response.thingName,
    thingArn: response.thingArn,
    thingId: response.thingId,
  }
}

/**
 * 更新设备
 */
export async function updateThing(
  thingName: string,
  options?: {
    thingTypeName?: string
    attributePayload?: Record<string, string>
    removeThingType?: boolean
    expectedVersion?: number
    client?: IoTClient
  }
): Promise<void> {
  const client = options?.client || createIoTClient()

  const input: UpdateThingCommandInput = {
    thingName,
    thingTypeName: options?.thingTypeName,
    attributePayload: options?.attributePayload
      ? {
          attributes: options.attributePayload,
        }
      : undefined,
    removeThingType: options?.removeThingType,
    expectedVersion: options?.expectedVersion,
  }

  const command = new UpdateThingCommand(input)
  await client.send(command)
}

/**
 * 删除设备
 */
export async function deleteThing(
  thingName: string,
  options?: {
    expectedVersion?: number
    client?: IoTClient
  }
): Promise<void> {
  const client = options?.client || createIoTClient()

  const command = new DeleteThingCommand({
    thingName,
    expectedVersion: options?.expectedVersion,
  })

  await client.send(command)
}

/**
 * 查询设备详情
 */
export async function describeThing(
  thingName: string,
  options?: {
    client?: IoTClient
  }
): Promise<{
  thingName?: string
  thingTypeName?: string
  thingArn?: string
  attributes?: Record<string, string>
  version?: number
  defaultClientId?: string
}> {
  const client = options?.client || createIoTClient()

  const input: DescribeThingCommandInput = {
    thingName,
  }

  const command = new DescribeThingCommand(input)
  const response = await client.send(command)

  return {
    thingName: response.thingName,
    thingTypeName: response.thingTypeName,
    thingArn: response.thingArn,
    attributes: response.attributes,
    version: response.version,
    defaultClientId: response.defaultClientId,
  }
}

/**
 * 列出设备
 */
export async function listThings(
  options?: {
    nextToken?: string
    maxResults?: number
    attributeName?: string
    attributeValue?: string
    thingTypeName?: string
    client?: IoTClient
  }
): Promise<{
  things: Array<{
    thingName?: string
    thingTypeName?: string
    thingArn?: string
    attributes?: Record<string, string>
    version?: number
  }>
  nextToken?: string
}> {
  const client = options?.client || createIoTClient()

  const input: ListThingsCommandInput = {
    nextToken: options?.nextToken,
    maxResults: options?.maxResults,
    attributeName: options?.attributeName,
    attributeValue: options?.attributeValue,
    thingTypeName: options?.thingTypeName,
  }

  const command = new ListThingsCommand(input)
  const response = await client.send(command)

  return {
    things:
      response.things?.map((thing) => ({
        thingName: thing.thingName,
        thingTypeName: thing.thingTypeName,
        thingArn: thing.thingArn,
        attributes: thing.attributes,
        version: thing.version,
      })) || [],
    nextToken: response.nextToken,
  }
}
