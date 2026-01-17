/**
 * Lambda函数调用封装
 */

import {
  InvokeCommand,
  InvokeAsyncCommand,
  type InvokeCommandInput,
  type InvokeAsyncCommandInput,
} from '@aws-sdk/client-lambda'
import type { LambdaClient } from '@aws-sdk/client-lambda'
import { createLambdaClient } from './client'

/**
 * Lambda调用结果
 */
export interface LambdaInvokeResult<T = any> {
  /** 函数执行是否成功 */
  success: boolean
  /** 返回的有效负载（已解析） */
  payload?: T
  /** 原始响应状态码 */
  statusCode?: number
  /** 函数执行错误 */
  functionError?: string
  /** 日志结果（如果启用了日志记录） */
  logResult?: string
  /** 请求ID */
  requestId?: string
}

/**
 * 同步调用Lambda函数
 */
export async function invokeFunction<T = any>(
  functionName: string,
  payload?: any,
  options?: {
    invocationType?: 'RequestResponse' | 'Event' | 'DryRun'
    qualifier?: string
    clientContext?: Record<string, any>
    client?: LambdaClient
  }
): Promise<LambdaInvokeResult<T>> {
  const client = options?.client || createLambdaClient()

  const input: InvokeCommandInput = {
    FunctionName: functionName,
    Payload: payload ? JSON.stringify(payload) : undefined,
    InvocationType: options?.invocationType || 'RequestResponse',
    Qualifier: options?.qualifier,
    ClientContext: options?.clientContext
      ? Buffer.from(JSON.stringify(options.clientContext)).toString('base64')
      : undefined,
  }

  const command = new InvokeCommand(input)
  const response = await client.send(command)

  let parsedPayload: T | undefined
  let functionError: string | undefined

  if (response.Payload) {
    const payloadString = Buffer.from(response.Payload).toString('utf-8')
    try {
      parsedPayload = JSON.parse(payloadString) as T
    } catch {
      // 如果不是JSON，返回原始字符串
      parsedPayload = payloadString as unknown as T
    }

    // 检查是否有函数错误
    if (response.FunctionError) {
      functionError = payloadString
    }
  }

  const success =
    response.StatusCode === 200 &&
    !response.FunctionError &&
    (options?.invocationType !== 'RequestResponse' || parsedPayload !== undefined)

  return {
    success,
    payload: parsedPayload,
    statusCode: response.StatusCode,
    functionError,
    logResult: response.LogResult
      ? Buffer.from(response.LogResult, 'base64').toString('utf-8')
      : undefined,
    requestId: response.$metadata.requestId,
  }
}

/**
 * 异步调用Lambda函数（Event类型）
 */
export async function invokeFunctionAsync(
  functionName: string,
  payload?: any,
  options?: {
    qualifier?: string
    clientContext?: Record<string, any>
    client?: LambdaClient
  }
): Promise<{
  success: boolean
  statusCode?: number
  requestId?: string
}> {
  const client = options?.client || createLambdaClient()

  const input: InvokeAsyncCommandInput = {
    FunctionName: functionName,
    InvokeArgs: payload ? JSON.stringify(payload) : undefined,
    Qualifier: options?.qualifier,
  }

  const command = new InvokeAsyncCommand(input)
  const response = await client.send(command)

  return {
    success: response.Status === 202,
    statusCode: response.Status,
    requestId: response.$metadata.requestId,
  }
}

/**
 * 调用Lambda函数并获取JSON响应
 */
export async function invokeFunctionJson<T = any>(
  functionName: string,
  payload?: any,
  options?: {
    qualifier?: string
    clientContext?: Record<string, any>
    client?: LambdaClient
  }
): Promise<T> {
  const result = await invokeFunction<T>(functionName, payload, {
    ...options,
    invocationType: 'RequestResponse',
  })

  if (!result.success || result.functionError) {
    throw new Error(
      `Lambda function ${functionName} failed: ${result.functionError || 'Unknown error'}`
    )
  }

  if (result.payload === undefined) {
    throw new Error(`Lambda function ${functionName} returned no payload`)
  }

  return result.payload
}
