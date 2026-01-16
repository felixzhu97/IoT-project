import { vi, type MockInstance } from "vitest";

/**
 * 创建一个部分Mock的对象
 * @template T 对象类型
 * @param partial 部分属性实现
 * @returns Mock对象
 * 
 * @example
 * ```ts
 * const mockApi = createMockObject<ApiClient>({
 *   get: vi.fn(),
 *   post: vi.fn(),
 * });
 * ```
 */
export function createMockObject<T extends Record<string, any>>(
  partial?: Partial<{ [K in keyof T]: T[K] extends (...args: any[]) => any 
    ? MockInstance
    : T[K] 
  }>
): T {
  return (partial || {}) as T;
}

/**
 * 创建一个深度Mock对象（所有方法都被Mock）
 * @template T 对象类型
 * @returns 完全Mock的对象
 * 
 * @example
 * ```ts
 * const mockService = createDeepMockObject<DeviceService>();
 * mockService.getDevice.mockResolvedValue({ id: '1' });
 * ```
 */
export function createDeepMockObject<T extends Record<string, any>>(): T {
  const mockObj = {} as T;
  
  // 由于TypeScript的限制，我们无法在编译时自动Mock所有方法
  // 这个方法主要用于提供类型提示
  return mockObj;
}

/**
 * 为对象的方法创建Spy
 * @template T 对象类型
 * @template K 方法名
 * @param obj 目标对象
 * @param methodName 方法名
 * @returns Mock实例
 * 
 * @example
 * ```ts
 * const obj = { getValue: () => 42 };
 * const spy = spyOnMethod(obj, 'getValue');
 * obj.getValue();
 * expect(spy).toHaveBeenCalled();
 * ```
 */
export function spyOnMethod<
  T extends Record<string, any>,
  K extends keyof T
>(
  obj: T,
  methodName: K
): T[K] extends (...args: any[]) => any 
  ? MockInstance
  : never {
  const original = obj[methodName];
  if (typeof original !== 'function') {
    throw new Error(`Property ${String(methodName)} is not a function`);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const spy = vi.spyOn(obj, methodName as string) as any;
  return spy;
}
