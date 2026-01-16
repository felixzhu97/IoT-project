import { expect } from "vitest";

/**
 * 断言数组包含指定元素（使用深度相等比较）
 * @param array 要检查的数组
 * @param item 要查找的元素
 * @param message 自定义错误消息
 */
export function expectArrayToContainEqual<T>(
  array: T[],
  item: T,
  message?: string
): void {
  const found = array.some((element) => {
    try {
      expect(element).toEqual(item);
      return true;
    } catch {
      return false;
    }
  });
  
  expect(found, message || `Expected array to contain ${JSON.stringify(item)}`).toBe(true);
}

/**
 * 断言对象包含指定的键值对（允许额外属性）
 * @param obj 要检查的对象
 * @param expected 期望包含的键值对
 * @param message 自定义错误消息
 */
export function expectObjectToContain<T extends Record<string, any>>(
  obj: T,
  expected: Partial<T>,
  message?: string
): void {
  for (const [key, value] of Object.entries(expected)) {
    expect(obj).toHaveProperty(key);
    if (value !== undefined) {
      expect(obj[key]).toEqual(value);
    }
  }
}

/**
 * 断言值在指定范围内
 * @param value 要检查的值
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @param message 自定义错误消息
 */
export function expectToBeInRange(
  value: number,
  min: number,
  max: number,
  message?: string
): void {
  expect(
    value >= min && value <= max,
    message || `Expected ${value} to be between ${min} and ${max}`
  ).toBe(true);
}

/**
 * 断言两个日期接近（在指定毫秒内）
 * @param actual 实际日期
 * @param expected 期望日期
 * @param toleranceMs 容差（毫秒），默认1000
 */
export function expectDateToBeCloseTo(
  actual: Date | string,
  expected: Date | string,
  toleranceMs: number = 1000
): void {
  const actualTime = new Date(actual).getTime();
  const expectedTime = new Date(expected).getTime();
  const diff = Math.abs(actualTime - expectedTime);
  
  expect(diff).toBeLessThanOrEqual(toleranceMs);
}

/**
 * 断言字符串匹配正则表达式
 * @param value 要检查的字符串
 * @param pattern 正则表达式
 * @param message 自定义错误消息
 */
export function expectStringToMatch(
  value: string,
  pattern: RegExp | string,
  message?: string
): void {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  expect(regex.test(value), message || `Expected string to match ${pattern}`).toBe(true);
}

/**
 * 断言Promise被拒绝并包含特定错误
 * @param promise 要检查的Promise
 * @param errorMessage 期望的错误消息（可选）
 */
export async function expectPromiseToReject(
  promise: Promise<any>,
  errorMessage?: string | RegExp
): Promise<void> {
  let rejected = false;
  let actualError: any;
  
  try {
    await promise;
  } catch (error) {
    rejected = true;
    actualError = error;
  }
  
  expect(rejected, 'Expected promise to be rejected').toBe(true);
  
  if (errorMessage !== undefined) {
    const message = actualError?.message || String(actualError);
    if (typeof errorMessage === 'string') {
      expect(message).toContain(errorMessage);
    } else {
      expectStringToMatch(message, errorMessage);
    }
  }
}
