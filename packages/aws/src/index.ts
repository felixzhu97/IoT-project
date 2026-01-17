/**
 * AWS集成工具包
 * @iot/aws
 * 
 * 提供AWS服务的统一封装，包括：
 * - S3: 对象存储服务
 * - IoT Core: 物联网设备管理
 * - Lambda: 无服务器函数
 * - DynamoDB: NoSQL数据库
 * - SNS: 消息通知服务
 * - SQS: 消息队列服务
 * - API Gateway: API管理和WebSocket
 */

// 配置模块
export * from './config'

// S3模块
export * from './s3'

// IoT Core模块
export * from './iot-core'

// Lambda模块
export * from './lambda'

// DynamoDB模块
export * from './dynamodb'

// SNS模块
export * from './sns'

// SQS模块
export * from './sqs'

// API Gateway模块
export * from './api-gateway'
