/**
 * 等待条件满足
 * @param condition 条件函数
 * @param options 选项
 * @returns Promise，当条件满足时解析
 * 
 * @example
 * ```ts
 * await waitFor(() => {
 *   expect(element).toBeInTheDocument();
 * });
 * ```
 */
export async function waitFor(
  condition: () => void | Promise<void>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();
  
  let lastError: Error | null = null;
  
  while (Date.now() - startTime < timeout) {
    try {
      await condition();
      return; // 条件满足，成功返回
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // 条件不满足，继续等待
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  
  // 超时，抛出最后的错误
  throw lastError || new Error(`Condition not met within ${timeout}ms`);
}

/**
 * 等待指定时间
 * @param ms 等待的毫秒数
 * @returns Promise
 * 
 * @example
 * ```ts
 * await delay(1000); // 等待1秒
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 带超时的Promise
 * @param promise 原始Promise
 * @param timeoutMs 超时时间（毫秒）
 * @param timeoutMessage 超时错误消息
 * @returns Promise，在超时前完成
 * @throws 如果超时则抛出错误
 * 
 * @example
 * ```ts
 * const result = await timeout(
 *   fetchData(),
 *   5000,
 *   'Fetch data timeout'
 * );
 * ```
 */
export async function timeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

/**
 * 重试异步操作
 * @param fn 要重试的函数
 * @param options 选项
 * @returns Promise，在成功或达到最大重试次数后解析
 * 
 * @example
 * ```ts
 * const result = await retry(
 *   () => fetchData(),
 *   { maxAttempts: 3, delay: 1000 }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delay?: number; onRetry?: (error: Error, attempt: number) => void } = {}
): Promise<T> {
  const { maxAttempts = 3, delay: delayMs = 1000, onRetry } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        if (onRetry) {
          onRetry(lastError, attempt);
        }
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
}

/**
 * 等待所有Promise完成（包括失败的）
 * @param promises Promise数组
 * @returns Promise结果数组和错误数组的元组
 * 
 * @example
 * ```ts
 * const [results, errors] = await settleAll([
 *   promise1(),
 *   promise2(),
 * ]);
 * ```
 */
export async function settleAll<T>(
  promises: Promise<T>[]
): Promise<[Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: Error }>, Error[]]> {
  const results = await Promise.allSettled(promises);
  const errors: Error[] = [];
  
  const processed = results.map((result) => {
    if (result.status === 'rejected') {
      const error = result.reason instanceof Error 
        ? result.reason 
        : new Error(String(result.reason));
      errors.push(error);
      return { status: 'rejected' as const, reason: error };
    }
    return { status: 'fulfilled' as const, value: result.value };
  });
  
  return [processed, errors];
}
