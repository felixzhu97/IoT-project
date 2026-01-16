/**
 * Web Workers封装模块
 * 提供Worker池、任务队列和计算结果缓存功能
 */

/**
 * 任务类型
 */
export interface Task<T = any, R = any> {
  id: string;
  data: T;
  onResult?: (result: R) => void;
  onError?: (error: Error) => void;
}

/**
 * Worker消息类型
 */
interface WorkerMessage<T = any, R = any> {
  type: "execute" | "terminate";
  taskId: string;
  data?: T;
}

/**
 * Worker响应类型
 */
interface WorkerResponse<R = any> {
  type: "result" | "error";
  taskId: string;
  result?: R;
  error?: string;
}

/**
 * Worker池配置
 */
export interface WorkerPoolOptions {
  size?: number; // Worker池大小
  timeout?: number; // 任务超时时间（毫秒）
  enableCache?: boolean; // 是否启用结果缓存
}

/**
 * Worker池管理器
 */
export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];
  private busy: Set<number> = new Set();
  private taskMap: Map<string, Task> = new Map();
  private cache: Map<string, any> = new Map();
  private readonly size: number;
  private readonly timeout: number;
  private readonly enableCache: boolean;
  private scriptUrl?: string | URL;

  constructor(
    scriptUrl?: string | URL | ((task: Task) => string | URL),
    options: WorkerPoolOptions = {}
  ) {
    this.scriptUrl = typeof scriptUrl === "function" ? undefined : scriptUrl;
    this.size = options.size ?? navigator.hardwareConcurrency ?? 4;
    this.timeout = options.timeout ?? 30000;
    this.enableCache = options.enableCache ?? false;

    this.initializeWorkers(scriptUrl);
  }

  /**
   * 初始化Worker池
   */
  private initializeWorkers(
    scriptUrl?: string | URL | ((task: Task) => string | URL)
  ): void {
    for (let i = 0; i < this.size; i++) {
      // Worker将在实际使用时创建
      this.workers.push(null as any);
    }
  }

  /**
   * 创建Worker实例
   */
  private createWorker(scriptUrl?: string | URL): Worker {
    if (!scriptUrl) {
      // 创建内联Worker
      const blob = new Blob([this.getDefaultWorkerScript()], {
        type: "application/javascript",
      });
      return new Worker(URL.createObjectURL(blob));
    }
    return new Worker(scriptUrl);
  }

  /**
   * 获取默认Worker脚本
   */
  private getDefaultWorkerScript(): string {
    return `
      self.onmessage = function(e) {
        const { type, taskId, data } = e.data;
        
        if (type === 'execute') {
          try {
            // 默认Worker仅传递数据，实际处理应在外部定义
            const result = data;
            self.postMessage({
              type: 'result',
              taskId,
              result
            });
          } catch (error) {
            self.postMessage({
              type: 'error',
              taskId,
              error: error.message
            });
          }
        }
      };
    `;
  }

  /**
   * 获取可用Worker的索引
   */
  private getAvailableWorkerIndex(): number | null {
    for (let i = 0; i < this.workers.length; i++) {
      if (!this.busy.has(i)) {
        return i;
      }
    }
    return null;
  }

  /**
   * 处理队列中的下一个任务
   */
  private processQueue(): void {
    if (this.queue.length === 0) {
      return;
    }

    const workerIndex = this.getAvailableWorkerIndex();
    if (workerIndex === null) {
      return; // 所有Worker都在忙碌
    }

    const task = this.queue.shift();
    if (!task) {
      return;
    }

    this.executeTask(task, workerIndex);
  }

  /**
   * 执行任务
   */
  private executeTask(task: Task, workerIndex: number): void {
    // 检查缓存
    if (this.enableCache) {
      const cacheKey = this.getCacheKey(task);
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        task.onResult?.(cached);
        this.processQueue();
        return;
      }
    }

    // 创建或获取Worker
    if (!this.workers[workerIndex]) {
      const scriptUrl =
        typeof this.scriptUrl === "function"
          ? this.scriptUrl(task)
          : this.scriptUrl;
      this.workers[workerIndex] = this.createWorker(scriptUrl);
      this.setupWorkerListeners(workerIndex);
    }

    this.busy.add(workerIndex);
    this.taskMap.set(task.id, task);

    const worker = this.workers[workerIndex];
    const message: WorkerMessage = {
      type: "execute",
      taskId: task.id,
      data: task.data,
    };

    worker.postMessage(message);

    // 设置超时
    const timeoutId = setTimeout(() => {
      if (this.taskMap.has(task.id)) {
        this.taskMap.delete(task.id);
        this.busy.delete(workerIndex);
        task.onError?.(new Error("Task timeout"));
        this.processQueue();
      }
    }, this.timeout);

    // 存储超时ID以便在任务完成时清理
    (task as any).timeoutId = timeoutId;
  }

  /**
   * 设置Worker监听器
   */
  private setupWorkerListeners(workerIndex: number): void {
    const worker = this.workers[workerIndex];

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, taskId, result, error } = e.data;
      const task = this.taskMap.get(taskId);

      if (!task) {
        return;
      }

      // 清除超时
      if ((task as any).timeoutId) {
        clearTimeout((task as any).timeoutId);
      }

      this.taskMap.delete(taskId);
      this.busy.delete(workerIndex);

      if (type === "result" && result !== undefined) {
        // 缓存结果
        if (this.enableCache) {
          const cacheKey = this.getCacheKey(task);
          this.cache.set(cacheKey, result);
        }
        task.onResult?.(result);
      } else if (type === "error" && error) {
        task.onError?.(new Error(error));
      }

      this.processQueue();
    };

    worker.onerror = (error) => {
      // 找到导致错误的任务
      for (const [taskId, task] of this.taskMap.entries()) {
        if (this.workers[workerIndex] === worker) {
          this.taskMap.delete(taskId);
          this.busy.delete(workerIndex);
          task.onError?.(new Error(error.message || "Worker error"));
        }
      }
      this.processQueue();
    };
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(task: Task): string {
    return JSON.stringify(task.data);
  }

  /**
   * 提交任务
   * @param task - 要执行的任务
   * @returns Promise<R> 任务结果
   */
  submit<T, R>(task: Task<T, R>): Promise<R> {
    return new Promise((resolve, reject) => {
      const taskWithCallbacks: Task<T, R> = {
        ...task,
        onResult: (result) => {
          task.onResult?.(result);
          resolve(result);
        },
        onError: (error) => {
          task.onError?.(error);
          reject(error);
        },
      };

      this.queue.push(taskWithCallbacks);
      this.processQueue();
    });
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 终止所有Worker
   */
  terminate(): void {
    for (const worker of this.workers) {
      if (worker) {
        worker.terminate();
      }
    }
    this.workers = [];
    this.busy.clear();
    this.taskMap.clear();
    this.queue = [];
    this.cache.clear();
  }
}

/**
 * 任务队列管理器
 */
export class TaskQueue {
  private queue: Task[] = [];
  private running: boolean = false;
  private concurrency: number;

  constructor(concurrency: number = 1) {
    this.concurrency = Math.max(1, concurrency);
  }

  /**
   * 添加任务到队列
   */
  enqueue<T, R>(task: Task<T, R>): Promise<R> {
    return new Promise((resolve, reject) => {
      const taskWithCallbacks: Task<T, R> = {
        ...task,
        onResult: (result) => {
          task.onResult?.(result);
          resolve(result);
        },
        onError: (error) => {
          task.onError?.(error);
          reject(error);
        },
      };

      this.queue.push(taskWithCallbacks);
      this.process();
    });
  }

  /**
   * 处理队列
   */
  private async process(): Promise<void> {
    if (this.running || this.queue.length === 0) {
      return;
    }

    this.running = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.concurrency);

      await Promise.all(
        batch.map((task) => {
          return new Promise<void>((resolve) => {
            try {
              // 默认执行器（可以被覆盖）
              if (task.onResult) {
                task.onResult(task.data as any);
              }
              resolve();
            } catch (error) {
              if (task.onError) {
                task.onError(error as Error);
              }
              resolve();
            }
          });
        })
      );
    }

    this.running = false;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length;
  }
}

/**
 * 创建Worker
 * @param scriptUrl - Worker脚本URL
 * @returns Worker实例
 */
export function createWorker(scriptUrl: string | URL): Worker {
  return new Worker(scriptUrl);
}

/**
 * 创建内联Worker
 * @param script - Worker脚本代码
 * @returns Worker实例
 */
export function createInlineWorker(script: string): Worker {
  const blob = new Blob([script], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);

  // 清理URL对象
  worker.addEventListener(
    "message",
    () => {
      URL.revokeObjectURL(url);
    },
    { once: true }
  );

  return worker;
}

/**
 * 执行Worker任务（简化版）
 * @param worker - Worker实例
 * @param data - 要发送的数据
 * @returns Promise<any> 任务结果
 */
export function executeWorkerTask(worker: Worker, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const taskId = `${Date.now()}-${Math.random()}`;

    const messageHandler = (e: MessageEvent) => {
      if (e.data.taskId === taskId) {
        worker.removeEventListener("message", messageHandler);

        if (e.data.type === "result") {
          resolve(e.data.result);
        } else if (e.data.type === "error") {
          reject(new Error(e.data.error));
        }
      }
    };

    worker.addEventListener("message", messageHandler);
    worker.onerror = (error) => {
      worker.removeEventListener("message", messageHandler);
      reject(error);
    };

    worker.postMessage({
      type: "execute",
      taskId,
      data,
    });
  });
}
