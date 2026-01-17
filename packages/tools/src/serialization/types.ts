/**
 * 数据序列化类型定义
 */

/**
 * 序列化器接口
 */
export interface ISerializer {
  /**
   * 序列化数据
   */
  serialize<T>(data: T): Buffer | Uint8Array
  /**
   * 反序列化数据
   */
  deserialize<T>(data: Buffer | Uint8Array): T
  /**
   * 序列化到字符串（如果支持）
   */
  serializeToString?(data: any): string
  /**
   * 从字符串反序列化（如果支持）
   */
  deserializeFromString?(data: string): any
}
