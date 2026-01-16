/**
 * 动画时间轴管理
 */

import type { AnimationController } from './animation'
import type { KeyframeAnimation } from './keyframes'

/**
 * 时间轴项类型
 */
export type TimelineItem = {
  type: 'animation'
  animation: AnimationController
  delay?: number
} | {
  type: 'keyframe'
  animation: KeyframeAnimation
  delay?: number
} | {
  type: 'callback'
  callback: () => void | Promise<void>
  delay?: number
}

/**
 * 时间轴选项
 */
export interface TimelineOptions {
  autoStart?: boolean
  onComplete?: () => void
}

/**
 * 时间轴类
 */
export class Timeline {
  private items: TimelineItem[] = []
  private isRunning = false
  private startTime?: number
  private currentIndex = 0
  private options: TimelineOptions
  private onCompleteCallback?: () => void

  constructor(options: TimelineOptions = {}) {
    this.options = {
      autoStart: options.autoStart || false,
      onComplete: options.onComplete,
    }
  }

  /**
   * 添加动画项
   */
  add(item: TimelineItem): this {
    this.items.push(item)
    return this
  }

  /**
   * 添加动画控制器
   */
  addAnimation(animation: AnimationController, delay: number = 0): this {
    return this.add({ type: 'animation', animation, delay })
  }

  /**
   * 添加关键帧动画
   */
  addKeyframe(animation: KeyframeAnimation, delay: number = 0): this {
    return this.add({ type: 'keyframe', animation, delay })
  }

  /**
   * 添加回调
   */
  addCallback(callback: () => void | Promise<void>, delay: number = 0): this {
    return this.add({ type: 'callback', callback, delay })
  }

  /**
   * 执行时间轴
   */
  async execute(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    this.startTime = performance.now()
    this.currentIndex = 0

    await this.executeNext()
  }

  /**
   * 执行下一个项
   */
  private async executeNext(): Promise<void> {
    if (this.currentIndex >= this.items.length) {
      this.isRunning = false
      this.options.onComplete?.()
      this.onCompleteCallback?.()
      return
    }

    const item = this.items[this.currentIndex]

    // 处理延迟
    if (item.delay && item.delay > 0) {
      await this.delay(item.delay)
    }

    // 执行项
    switch (item.type) {
      case 'animation':
        await this.executeAnimation(item.animation)
        break
      case 'keyframe':
        await this.executeKeyframe(item.animation)
        break
      case 'callback':
        await item.callback()
        break
    }

    this.currentIndex++
    await this.executeNext()
  }

  /**
   * 执行动画控制器
   */
  private executeAnimation(animation: AnimationController): Promise<void> {
    return new Promise((resolve) => {
      const originalComplete = animation['options'].onComplete
      animation['options'].onComplete = () => {
        originalComplete?.()
        resolve()
      }
      animation.start()
    })
  }

  /**
   * 执行关键帧动画
   */
  private executeKeyframe(animation: KeyframeAnimation): Promise<void> {
    return new Promise((resolve) => {
      const originalComplete = animation['options'].onComplete
      animation['options'].onComplete = () => {
        originalComplete?.()
        resolve()
      }
      animation.start()
    })
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 开始时间轴
   */
  start(): void {
    if (this.options.autoStart) {
      this.execute()
    }
  }

  /**
   * 重置时间轴
   */
  reset(): void {
    this.isRunning = false
    this.currentIndex = 0
    this.startTime = undefined

    // 停止所有动画
    for (const item of this.items) {
      if (item.type === 'animation') {
        item.animation.stop()
      } else if (item.type === 'keyframe') {
        item.animation.stop()
      }
    }
  }

  /**
   * 清空时间轴
   */
  clear(): void {
    this.reset()
    this.items = []
  }

  /**
   * 设置完成回调
   */
  onComplete(callback: () => void): this {
    this.onCompleteCallback = callback
    return this
  }

  /**
   * 获取时间轴状态
   */
  getState(): 'idle' | 'running' | 'completed' {
    if (!this.isRunning && this.currentIndex === 0) return 'idle'
    if (this.isRunning) return 'running'
    return 'completed'
  }
}

/**
 * 创建顺序执行的时间轴
 */
export function sequence(...items: TimelineItem[]): Timeline {
  const timeline = new Timeline()
  items.forEach((item) => timeline.add(item))
  return timeline
}

/**
 * 创建并行执行的时间轴
 */
export function parallel(...items: TimelineItem[]): Timeline {
  const timeline = new Timeline()

  // 并行执行所有项
  timeline.addCallback(async () => {
    const promises: Promise<void>[] = []

    for (const item of items) {
      if (item.type === 'animation') {
        promises.push(
          new Promise<void>((resolve) => {
            const originalComplete = item.animation['options'].onComplete
            item.animation['options'].onComplete = () => {
              originalComplete?.()
              resolve()
            }
            if (item.delay) {
              setTimeout(() => item.animation.start(), item.delay)
            } else {
              item.animation.start()
            }
          })
        )
      } else if (item.type === 'keyframe') {
        promises.push(
          new Promise<void>((resolve) => {
            const originalComplete = item.animation['options'].onComplete
            item.animation['options'].onComplete = () => {
              originalComplete?.()
              resolve()
            }
            if (item.delay) {
              setTimeout(() => item.animation.start(), item.delay)
            } else {
              item.animation.start()
            }
          })
        )
      } else if (item.type === 'callback') {
        if (item.delay) {
          promises.push(
            new Promise<void>((resolve) => {
              setTimeout(async () => {
                await item.callback()
                resolve()
              }, item.delay)
            })
          )
        } else {
          promises.push(
            Promise.resolve(item.callback()).then(() => {})
          )
        }
      }
    }

    await Promise.all(promises)
  })

  return timeline
}
