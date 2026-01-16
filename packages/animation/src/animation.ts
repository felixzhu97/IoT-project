/**
 * 动画控制器
 * 基于 requestAnimationFrame 的动画系统
 */

import type { EasingFunction } from './easing'
import { linear } from './easing'

/**
 * 动画选项
 */
export interface AnimationOptions {
  duration: number
  easing?: EasingFunction
  onUpdate?: (progress: number, value: number) => void
  onComplete?: () => void
  onStart?: () => void
}

/**
 * 动画控制器类
 */
export class AnimationController {
  private animationId?: number
  private startTime?: number
  private isPaused = false
  private pauseTime = 0
  private startPauseTime?: number
  private options: Required<AnimationOptions>
  private isCompleted = false

  constructor(options: AnimationOptions) {
    this.options = {
      duration: options.duration,
      easing: options.easing || linear,
      onUpdate: options.onUpdate || (() => {}),
      onComplete: options.onComplete || (() => {}),
      onStart: options.onStart || (() => {}),
    }
  }

  /**
   * 开始动画
   */
  start(): void {
    if (this.isCompleted) {
      this.reset()
    }

    if (this.isPaused) {
      // 从暂停状态恢复
      this.pauseTime += performance.now() - (this.startPauseTime || 0)
      this.isPaused = false
      this.startPauseTime = undefined
    } else {
      // 首次启动
      this.startTime = performance.now()
      this.options.onStart()
    }

    this.animate()
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    if (!this.startTime) return

    const currentTime = performance.now()
    const elapsed = currentTime - this.startTime - this.pauseTime
    const progress = Math.min(elapsed / this.options.duration, 1)
    const easedProgress = this.options.easing(progress)
    const value = easedProgress

    this.options.onUpdate(progress, value)

    if (progress < 1) {
      this.animationId = requestAnimationFrame(this.animate)
    } else {
      this.isCompleted = true
      this.options.onComplete()
    }
  }

  /**
   * 暂停动画
   */
  pause(): void {
    if (this.isPaused || !this.startTime) return

    this.isPaused = true
    this.startPauseTime = performance.now()

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = undefined
    }
  }

  /**
   * 停止动画
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = undefined
    }
    this.reset()
  }

  /**
   * 重置动画
   */
  private reset(): void {
    this.startTime = undefined
    this.pauseTime = 0
    this.startPauseTime = undefined
    this.isPaused = false
    this.isCompleted = false
  }

  /**
   * 获取动画状态
   */
  getState(): 'idle' | 'running' | 'paused' | 'completed' {
    if (this.isCompleted) return 'completed'
    if (this.isPaused) return 'paused'
    if (this.startTime) return 'running'
    return 'idle'
  }
}

/**
 * 值动画
 */
export function animateValue(
  from: number,
  to: number,
  options: AnimationOptions
): AnimationController {
  const range = to - from

  const controller = new AnimationController({
    ...options,
    onUpdate: (progress, value) => {
      const currentValue = from + range * value
      options.onUpdate?.(progress, currentValue)
    },
  })

  return controller
}

/**
 * 通用动画函数
 */
export function animate(options: AnimationOptions): AnimationController {
  const controller = new AnimationController(options)
  return controller
}

/**
 * 取消动画
 */
export function cancelAnimation(controller: AnimationController): void {
  controller.stop()
}

/**
 * Promise 形式的动画
 */
export function animatePromise(options: AnimationOptions): Promise<void> {
  return new Promise((resolve) => {
    const controller = new AnimationController({
      ...options,
      onComplete: () => {
        options.onComplete?.()
        resolve()
      },
    })
    controller.start()
  })
}
