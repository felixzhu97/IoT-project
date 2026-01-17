/**
 * S3操作封装
 */

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  type PutObjectCommandInput,
  type GetObjectCommandInput,
  type DeleteObjectCommandInput,
  type ListObjectsV2CommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { S3Client } from '@aws-sdk/client-s3'
import { createS3Client } from './client'

/**
 * 上传对象到S3
 */
export async function putObject(
  bucket: string,
  key: string,
  body: string | Uint8Array | Buffer | ReadableStream,
  options?: {
    contentType?: string
    metadata?: Record<string, string>
    acl?: string
    client?: S3Client
  }
): Promise<{ etag?: string; versionId?: string }> {
  const client = options?.client || createS3Client()

  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: options?.contentType,
    Metadata: options?.metadata,
    ACL: options?.acl as any,
  }

  const command = new PutObjectCommand(input)
  const response = await client.send(command)

  return {
    etag: response.ETag,
    versionId: response.VersionId,
  }
}

/**
 * 从S3获取对象
 */
export async function getObject(
  bucket: string,
  key: string,
  options?: {
    versionId?: string
    range?: string
    client?: S3Client
  }
): Promise<{
  body: ReadableStream<Uint8Array> | undefined
  contentType?: string
  contentLength?: number
  etag?: string
  metadata?: Record<string, string>
  lastModified?: Date
}> {
  const client = options?.client || createS3Client()

  const input: GetObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    VersionId: options?.versionId,
    Range: options?.range,
  }

  const command = new GetObjectCommand(input)
  const response = await client.send(command)

  return {
    body: response.Body as ReadableStream<Uint8Array> | undefined,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    etag: response.ETag,
    metadata: response.Metadata,
    lastModified: response.LastModified,
  }
}

/**
 * 将S3对象内容读取为字符串
 */
export async function getObjectAsString(
  bucket: string,
  key: string,
  options?: {
    versionId?: string
    encoding?: BufferEncoding
    client?: S3Client
  }
): Promise<string> {
  const result = await getObject(bucket, key, {
    versionId: options?.versionId,
    client: options?.client,
  })

  if (!result.body) {
    throw new Error(`Object ${key} not found in bucket ${bucket}`)
  }

  const chunks: Uint8Array[] = []
  const reader = result.body.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const buffer = Buffer.concat(chunks)
  return buffer.toString(options?.encoding || 'utf-8')
}

/**
 * 删除S3对象
 */
export async function deleteObject(
  bucket: string,
  key: string,
  options?: {
    versionId?: string
    client?: S3Client
  }
): Promise<{ deleteMarker?: boolean; versionId?: string }> {
  const client = options?.client || createS3Client()

  const input: DeleteObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    VersionId: options?.versionId,
  }

  const command = new DeleteObjectCommand(input)
  const response = await client.send(command)

  return {
    deleteMarker: response.DeleteMarker,
    versionId: response.VersionId,
  }
}

/**
 * 列出S3桶中的对象
 */
export async function listObjects(
  bucket: string,
  options?: {
    prefix?: string
    delimiter?: string
    maxKeys?: number
    continuationToken?: string
    client?: S3Client
  }
): Promise<{
  contents: Array<{
    key: string
    lastModified?: Date
    size?: number
    etag?: string
  }>
  isTruncated: boolean
  nextContinuationToken?: string
  commonPrefixes: string[]
}> {
  const client = options?.client || createS3Client()

  const input: ListObjectsV2CommandInput = {
    Bucket: bucket,
    Prefix: options?.prefix,
    Delimiter: options?.delimiter,
    MaxKeys: options?.maxKeys,
    ContinuationToken: options?.continuationToken,
  }

  const command = new ListObjectsV2Command(input)
  const response = await client.send(command)

  return {
    contents:
      response.Contents?.map((item) => ({
        key: item.Key || '',
        lastModified: item.LastModified,
        size: item.Size,
        etag: item.ETag,
      })) || [],
    isTruncated: response.IsTruncated || false,
    nextContinuationToken: response.NextContinuationToken,
    commonPrefixes: response.CommonPrefixes?.map((p) => p.Prefix || '') || [],
  }
}

/**
 * 检查对象是否存在
 */
export async function objectExists(
  bucket: string,
  key: string,
  options?: {
    client?: S3Client
  }
): Promise<boolean> {
  const client = options?.client || createS3Client()

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    await client.send(command)
    return true
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false
    }
    throw error
  }
}

/**
 * 复制S3对象
 */
export async function copyObject(
  sourceBucket: string,
  sourceKey: string,
  destinationBucket: string,
  destinationKey: string,
  options?: {
    metadata?: Record<string, string>
    acl?: string
    client?: S3Client
  }
): Promise<{ etag?: string; versionId?: string }> {
  const client = options?.client || createS3Client()

  const command = new CopyObjectCommand({
    CopySource: `${sourceBucket}/${sourceKey}`,
    Bucket: destinationBucket,
    Key: destinationKey,
    Metadata: options?.metadata,
    ACL: options?.acl as any,
  })

  const response = await client.send(command)

  return {
    etag: response.CopyObjectResult?.ETag,
    versionId: response.VersionId,
  }
}

/**
 * 生成预签名URL（用于上传）
 */
export async function getPresignedPutUrl(
  bucket: string,
  key: string,
  options?: {
    expiresIn?: number
    contentType?: string
    client?: S3Client
  }
): Promise<string> {
  const client = options?.client || createS3Client()

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: options?.contentType,
  })

  return getSignedUrl(client, command, {
    expiresIn: options?.expiresIn || 3600,
  })
}

/**
 * 生成预签名URL（用于下载）
 */
export async function getPresignedGetUrl(
  bucket: string,
  key: string,
  options?: {
    expiresIn?: number
    versionId?: string
    client?: S3Client
  }
): Promise<string> {
  const client = options?.client || createS3Client()

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    VersionId: options?.versionId,
  })

  return getSignedUrl(client, command, {
    expiresIn: options?.expiresIn || 3600,
  })
}
