/**
 * 设备影子操作
 * 注意：设备影子操作需要使用IoT Data Plane API，需要使用专门的IoTDataPlaneClient
 * 这里提供基础接口定义，实际实现需要使用@aws-sdk/iot-data-plane
 */

/**
 * 设备影子文档
 */
export interface ThingShadowDocument {
  state?: {
    desired?: Record<string, any>
    reported?: Record<string, any>
    delta?: Record<string, any>
  }
  metadata?: Record<string, any>
  version?: number
  timestamp?: number
}

/**
 * 获取设备影子参数
 */
export interface GetThingShadowParams {
  thingName: string
  shadowName?: string
}

/**
 * 更新设备影子参数
 */
export interface UpdateThingShadowParams {
  thingName: string
  shadowName?: string
  state: {
    desired?: Record<string, any>
    reported?: Record<string, any>
  }
  version?: number
}

/**
 * 删除设备影子参数
 */
export interface DeleteThingShadowParams {
  thingName: string
  shadowName?: string
}

/**
 * 注意：设备影子操作需要使用IoT Data Plane端点
 * 实际实现需要使用@aws-sdk/client-iot-data-plane
 * 这里只提供类型定义和接口说明
 * 
 * 使用示例（需要额外安装@aws-sdk/client-iot-data-plane）：
 * 
 * import { IoTDataPlaneClient, GetThingShadowCommand } from '@aws-sdk/client-iot-data-plane'
 * 
 * const client = new IoTDataPlaneClient({
 *   region: 'us-east-1',
 *   endpoint: 'https://your-iot-endpoint.iot.us-east-1.amazonaws.com'
 * })
 * 
 * const command = new GetThingShadowCommand({
 *   thingName: 'my-device'
 * })
 * 
 * const response = await client.send(command)
 */
