import { vi, type MockInstance } from "vitest";

/**
 * 创建一个类型安全的Mock函数
 * @template T 函数类型
 * @param implementation 可选的函数实现
 * @returns Mock函数实例
 *
 * @example
 * ```ts
 * const mockFn = createMockFunction<(a: string, b: number) => Promise<boolean>>();
 * mockFn.mockResolvedValue(true);
 *
 * await mockFn('test', 42);
 * expect(mockFn).toHaveBeenCalledWith('test', 42);
 * ```
 */
export function createMockFunction<T extends (...args: any[]) => any>(
  implementation?: T
): MockInstance {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const mockFn = implementation
    ? (vi.fn(implementation) as MockInstance)
    : (vi.fn() as MockInstance);

  return mockFn;
}

/**
 * 创建一个异步Mock函数
 * @template T 函数类型（必须返回Promise）
 * @param resolvedValue 默认的resolve值
 * @returns Mock函数实例
 *
 * @example
 * ```ts
 * const mockAsync = createAsyncMockFunction<(id: string) => Promise<Device>>();
 * mockAsync.mockResolvedValue({ id: '1', name: 'Device' });
 * ```
 */
export function createAsyncMockFunction<
  T extends (...args: any[]) => Promise<any>
>(
  resolvedValue?: ReturnType<T> extends Promise<infer U> ? U : never
): MockInstance {
  const mockFn = createMockFunction<T>();
  if (resolvedValue !== undefined) {
    mockFn.mockResolvedValue(resolvedValue as any);
  }
  return mockFn;
}

/**
 * 创建一个抛出错误的Mock函数
 * @template T 函数类型
 * @param error 要抛出的错误
 * @returns Mock函数实例
 *
 * @example
 * ```ts
 * const mockFn = createErrorMockFunction(new Error('Failed'));
 * await expect(mockFn()).rejects.toThrow('Failed');
 * ```
 */
export function createErrorMockFunction<T extends (...args: any[]) => any>(
  error: Error
): MockInstance {
  const mockFn = createMockFunction<T>();
  mockFn.mockImplementation(() => {
    throw error;
  });
  return mockFn;
}
