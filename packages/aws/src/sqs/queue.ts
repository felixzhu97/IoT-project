/**
 * SQS队列操作
 */

import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageBatchCommand,
  SendMessageBatchCommand,
  type SendMessageCommandInput,
  type ReceiveMessageCommandInput,
  type DeleteMessageCommandInput,
} from '@aws-sdk/client-sqs'
import type { SQSClient } from '@aws-sdk/client-sqs'
import { createSQSClient } from './client'

/**
 * 接收到的消息
 */
export interface ReceivedMessage {
  messageId: string
  receiptHandle: string
  body: string
  attributes?: Record<string, string>
  messageAttributes?: Record<string, any>
}

/**
 * 发送消息到队列
 */
export async function sendMessage(
  queueUrl: string,
  messageBody: string | Record<string, any>,
  options?: {
    delaySeconds?: number
    messageAttributes?: Record<string, { DataType: string; StringValue?: string; BinaryValue?: Uint8Array }>
    messageDeduplicationId?: string
    messageGroupId?: string
    client?: SQSClient
  }
): Promise<{ messageId?: string; md5OfBody?: string; sequenceNumber?: string }> {
  const client = options?.client || createSQSClient()

  const bodyString = typeof messageBody === 'string' ? messageBody : JSON.stringify(messageBody)

  const input: SendMessageCommandInput = {
    QueueUrl: queueUrl,
    MessageBody: bodyString,
    DelaySeconds: options?.delaySeconds,
    MessageAttributes: options?.messageAttributes,
    MessageDeduplicationId: options?.messageDeduplicationId,
    MessageGroupId: options?.messageGroupId,
  }

  const command = new SendMessageCommand(input)
  const response = await client.send(command)

  return {
    messageId: response.MessageId,
    md5OfBody: response.MD5OfMessageBody,
    sequenceNumber: response.SequenceNumber,
  }
}

/**
 * 批量发送消息到队列
 */
export async function sendMessageBatch(
  queueUrl: string,
  messages: Array<{
    id: string
    body: string | Record<string, any>
    delaySeconds?: number
    messageAttributes?: Record<string, { DataType: string; StringValue?: string; BinaryValue?: Uint8Array }>
    messageDeduplicationId?: string
    messageGroupId?: string
  }>,
  options?: {
    client?: SQSClient
  }
): Promise<{
  successful: Array<{ id: string; messageId?: string; md5OfBody?: string; sequenceNumber?: string }>
  failed: Array<{ id: string; code?: string; message?: string }>
}> {
  const client = options?.client || createSQSClient()

  const entries = messages.map((msg) => {
    const bodyString = typeof msg.body === 'string' ? msg.body : JSON.stringify(msg.body)
    return {
      Id: msg.id,
      MessageBody: bodyString,
      DelaySeconds: msg.delaySeconds,
      MessageAttributes: msg.messageAttributes,
      MessageDeduplicationId: msg.messageDeduplicationId,
      MessageGroupId: msg.messageGroupId,
    }
  })

  const command = new SendMessageBatchCommand({
    QueueUrl: queueUrl,
    Entries: entries,
  })

  const response = await client.send(command)

  return {
    successful:
      response.Successful?.map((item) => ({
        id: item.Id || '',
        messageId: item.MessageId,
        md5OfBody: item.MD5OfMessageBody,
        sequenceNumber: item.SequenceNumber,
      })) || [],
    failed:
      response.Failed?.map((item) => ({
        id: item.Id || '',
        code: item.Code,
        message: item.Message,
      })) || [],
  }
}

/**
 * 从队列接收消息
 */
export async function receiveMessages(
  queueUrl: string,
  options?: {
    maxNumberOfMessages?: number
    visibilityTimeout?: number
    waitTimeSeconds?: number
    messageAttributeNames?: string[]
    attributeNames?: string[]
    client?: SQSClient
  }
): Promise<ReceivedMessage[]> {
  const client = options?.client || createSQSClient()

  const input: ReceiveMessageCommandInput = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: options?.maxNumberOfMessages || 1,
    VisibilityTimeout: options?.visibilityTimeout,
    WaitTimeSeconds: options?.waitTimeSeconds,
    MessageAttributeNames: options?.messageAttributeNames || ['All'],
    AttributeNames: options?.attributeNames || ['All'],
  }

  const command = new ReceiveMessageCommand(input)
  const response = await client.send(command)

  if (!response.Messages) {
    return []
  }

  return response.Messages.map((msg) => ({
    messageId: msg.MessageId || '',
    receiptHandle: msg.ReceiptHandle || '',
    body: msg.Body || '',
    attributes: msg.Attributes,
    messageAttributes: msg.MessageAttributes as Record<string, any> | undefined,
  }))
}

/**
 * 从队列接收并解析JSON消息
 */
export async function receiveJsonMessages<T = any>(
  queueUrl: string,
  options?: {
    maxNumberOfMessages?: number
    visibilityTimeout?: number
    waitTimeSeconds?: number
    client?: SQSClient
  }
): Promise<Array<ReceivedMessage & { parsedBody: T }>> {
  const messages = await receiveMessages(queueUrl, options)

  return messages.map((msg) => {
    let parsedBody: T
    try {
      parsedBody = JSON.parse(msg.body) as T
    } catch {
      throw new Error(`Failed to parse message body as JSON: ${msg.body}`)
    }

    return {
      ...msg,
      parsedBody,
    }
  })
}

/**
 * 删除队列中的消息
 */
export async function deleteMessage(
  queueUrl: string,
  receiptHandle: string,
  options?: {
    client?: SQSClient
  }
): Promise<void> {
  const client = options?.client || createSQSClient()

  const input: DeleteMessageCommandInput = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  }

  const command = new DeleteMessageCommand(input)
  await client.send(command)
}

/**
 * 批量删除队列中的消息
 */
export async function deleteMessageBatch(
  queueUrl: string,
  entries: Array<{ id: string; receiptHandle: string }>,
  options?: {
    client?: SQSClient
  }
): Promise<{
  successful: string[]
  failed: Array<{ id: string; code?: string; message?: string }>
}> {
  const client = options?.client || createSQSClient()

  const command = new DeleteMessageBatchCommand({
    QueueUrl: queueUrl,
    Entries: entries.map((entry) => ({
      Id: entry.id,
      ReceiptHandle: entry.receiptHandle,
    })),
  })

  const response = await client.send(command)

  return {
    successful: response.Successful?.map((item) => item.Id || '') || [],
    failed:
      response.Failed?.map((item) => ({
        id: item.Id || '',
        code: item.Code,
        message: item.Message,
      })) || [],
  }
}
