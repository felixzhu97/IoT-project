/**
 * SNS消息发布
 */

import {
  PublishCommand,
  PublishBatchCommand,
  type PublishCommandInput,
  type PublishBatchCommandInput,
} from '@aws-sdk/client-sns'
import type { SNSClient } from '@aws-sdk/client-sns'
import { createSNSClient } from './client'

/**
 * 发布消息到主题
 */
export async function publishToTopic(
  topicArn: string,
  message: string | Record<string, any>,
  options?: {
    subject?: string
    messageAttributes?: Record<string, { DataType: string; StringValue?: string; BinaryValue?: Uint8Array }>
    messageStructure?: 'json' | 'string'
    client?: SNSClient
  }
): Promise<{ messageId?: string }> {
  const client = options?.client || createSNSClient()

  let messageString: string
  if (typeof message === 'string') {
    messageString = message
  } else {
    messageString = JSON.stringify(message)
  }

  const input: PublishCommandInput = {
    TopicArn: topicArn,
    Message: messageString,
    Subject: options?.subject,
    MessageAttributes: options?.messageAttributes,
    MessageStructure: options?.messageStructure,
  }

  const command = new PublishCommand(input)
  const response = await client.send(command)

  return {
    messageId: response.MessageId,
  }
}

/**
 * 直接发送消息到电话号码或邮箱
 */
export async function publishToTarget(
  targetArn: string,
  message: string | Record<string, any>,
  options?: {
    subject?: string
    messageAttributes?: Record<string, { DataType: string; StringValue?: string; BinaryValue?: Uint8Array }>
    client?: SNSClient
  }
): Promise<{ messageId?: string }> {
  const client = options?.client || createSNSClient()

  let messageString: string
  if (typeof message === 'string') {
    messageString = message
  } else {
    messageString = JSON.stringify(message)
  }

  const input: PublishCommandInput = {
    TargetArn: targetArn,
    Message: messageString,
    Subject: options?.subject,
    MessageAttributes: options?.messageAttributes,
  }

  const command = new PublishCommand(input)
  const response = await client.send(command)

  return {
    messageId: response.MessageId,
  }
}

/**
 * 批量发布消息到主题
 */
export async function publishBatchToTopic(
  topicArn: string,
  messages: Array<{
    id: string
    message: string | Record<string, any>
    subject?: string
    messageAttributes?: Record<string, { DataType: string; StringValue?: string; BinaryValue?: Uint8Array }>
  }>,
  options?: {
    client?: SNSClient
  }
): Promise<{
  successful: Array<{ id: string; messageId?: string }>
  failed: Array<{ id: string; code?: string; message?: string }>
}> {
  const client = options?.client || createSNSClient()

  const publishEntries = messages.map((msg) => {
    let messageString: string
    if (typeof msg.message === 'string') {
      messageString = msg.message
    } else {
      messageString = JSON.stringify(msg.message)
    }

    return {
      Id: msg.id,
      Message: messageString,
      Subject: msg.subject,
      MessageAttributes: msg.messageAttributes,
    }
  })

  const input: PublishBatchCommandInput = {
    TopicArn: topicArn,
    PublishBatchRequestEntries: publishEntries,
  }

  const command = new PublishBatchCommand(input)
  const response = await client.send(command)

  return {
    successful:
      response.Successful?.map((item) => ({
        id: item.Id || '',
        messageId: item.MessageId,
      })) || [],
    failed:
      response.Failed?.map((item) => ({
        id: item.Id || '',
        code: item.Code,
        message: item.Message,
      })) || [],
  }
}
