/**
 * IoT主题操作
 * 注意：MQTT主题的发布和订阅需要使用MQTT客户端库（如aws-iot-device-sdk）
 * IoT Core管理API主要用于管理主题规则和策略
 *
 * 这里提供主题相关的辅助函数和类型定义
 */

/**
 * 构建IoT主题路径
 */
export function buildTopicPath(...segments: (string | number)[]): string {
  return segments
    .filter((seg) => seg !== undefined && seg !== null && seg !== "")
    .join("/");
}

/**
 * 解析IoT主题路径
 */
export function parseTopicPath(topic: string): string[] {
  return topic.split("/").filter((seg) => seg !== "");
}

/**
 * 验证主题名称格式
 */
export function validateTopicName(topic: string): boolean {
  // MQTT主题规则：
  // 1. 长度不超过65535字节（UTF-8编码）
  // 2. 不能为空
  // 3. 不能包含通配符在非层级位置（+ 和 # 必须符合规则）

  if (!topic || topic.length === 0) {
    return false;
  }

  // 检查是否包含非法字符（基本检查）
  const segments = topic.split("/");
  for (const segment of segments) {
    // 单个 + 或 # 可以作为完整段
    if (segment === "+" || segment === "#") {
      continue;
    }
    // # 只能在最后一个位置
    if (
      segment.includes("#") &&
      segment !== "#" &&
      segment !== segments[segments.length - 1]
    ) {
      return false;
    }
    // + 不能包含其他字符
    if (segment.includes("+") && segment !== "+") {
      return false;
    }
  }

  // # 只能单独作为最后一段
  if (segments.includes("#")) {
    if (segments[segments.length - 1] !== "#") {
      return false;
    }
    // 如果包含#，不能在其他段中有通配符（项目特定规则）
    // 这样可以避免复杂的通配符组合
    for (let i = 0; i < segments.length - 1; i++) {
      if (segments[i] === "+") {
        return false;
      }
    }
  }

  return true;
}

/**
 * 主题订阅模式类型
 */
export type TopicPattern = string;

/**
 * 构建标准IoT主题格式
 *
 * @example
 * buildStandardTopic('devices', 'device-001', 'sensor', 'temperature')
 * // returns: 'devices/device-001/sensor/temperature'
 */
export function buildStandardTopic(...segments: (string | number)[]): string {
  return buildTopicPath(...segments);
}

/**
 * 检查主题是否匹配模式
 *
 * @param topic 实际主题
 * @param pattern 匹配模式（支持+和#通配符）
 * @returns 是否匹配
 */
export function topicMatches(topic: string, pattern: string): boolean {
  if (!validateTopicName(topic) || !validateTopicName(pattern)) {
    return false;
  }

  const topicSegments = parseTopicPath(topic);
  const patternSegments = parseTopicPath(pattern);

  // 如果模式以#结尾，前面的段必须完全匹配
  if (patternSegments[patternSegments.length - 1] === "#") {
    const patternWithoutWildcard = patternSegments.slice(0, -1);
    if (topicSegments.length < patternWithoutWildcard.length) {
      return false;
    }
    for (let i = 0; i < patternWithoutWildcard.length; i++) {
      if (
        patternWithoutWildcard[i] !== "+" &&
        patternWithoutWildcard[i] !== topicSegments[i]
      ) {
        return false;
      }
    }
    return true;
  }

  // 段数必须相等
  if (topicSegments.length !== patternSegments.length) {
    return false;
  }

  // 逐段匹配
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i];
    const topicSeg = topicSegments[i];

    if (patternSeg === "#") {
      return true; // # 匹配所有剩余段
    }
    if (patternSeg === "+") {
      continue; // + 匹配单个段
    }
    if (patternSeg !== topicSeg) {
      return false;
    }
  }

  return true;
}
