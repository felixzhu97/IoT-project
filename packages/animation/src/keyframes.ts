/**
 * 关键帧动画系统
 */

import type { EasingFunction } from './easing'
import { linear } from './easing'

/**
 * 关键帧定义
 */
export interface Keyframe {
  offset: number // 0-1 之间的时间偏移
  value: number | string | Record<string, any>
  easing?: EasingFunction
}

/**
 * 关键帧动画选项
 */
export interface KeyframeAnimationOptions {
  duration: number
  keyframes: Keyframe[]
  onUpdate?: (currentValue: number | string | Record<string, any>) => void
  onComplete?: () => void
  onStart?: () => void
}

/**
 * 关键帧动画类
 */
export class KeyframeAnimation {
  private animationId?: number
  private startTime?: number
  private isPaused = false
  private pauseTime = 0
  private startPauseTime?: number
  private options: KeyframeAnimationOptions
  private isCompleted = false

  constructor(options: KeyframeAnimationOptions) {
    // 确保关键帧按 offset 排序
    this.options = {
      ...options,
      keyframes: [...options.keyframes].sort((a, b) => a.offset - b.offset),
    }
  }

  /**
   * 插值计算（数值）
   */
  private interpolateNumber(start: number, end: number, t: number): number {
    return start + (end - start) * t
  }

  /**
   * 插值计算（字符串 - 仅支持简单数值替换）
   */
  private interpolateString(start: string, end: string, t: number): string {
    // 尝试提取数值进行插值
    const startMatch = start.match(/([\d.]+)/)
    const endMatch = end.match(/([\d.]+)/)

    if (startMatch && endMatch) {
      const startValue = parseFloat(startMatch[1])
      const endValue = parseFloat(endMatch[1])
      const interpolated = this.interpolateNumber(startValue, endValue, t)
      return start.replace(/([\d.]+)/, interpolated.toString())
    }

    return t < 0.5 ? start : end
  }

  /**
   * 插值计算（对象）
   */
  private interpolateObject(
    start: Record<string, any>,
    end: Record<string, any>,
    t: number
  ): Record<string, any> {
    const result: Record<string, any> = {}
    const keys = new Set([...Object.keys(start), ...Object.keys(end)])

    for (const key of keys) {
      const startValue = start[key]
      const endValue = end[key]

      if (typeof startValue === 'number' && typeof endValue === 'number') {
        result[key] = this.interpolateNumber(startValue, endValue, t)
      } else if (typeof startValue === 'string' && typeof endValue === 'string') {
        result[key] = this.interpolateString(startValue, endValue, t)
      } else {
        result[key] = t < 0.5 ? startValue : endValue
      }
    }

    return result
  }

  /**
   * 根据进度计算当前值
   */
  private getValueAtProgress(progress: number): number | string | Record<string, any> {
    const { keyframes } = this.options

    if (keyframes.length === 0) return 0
    if (keyframes.length === 1) return keyframes[0].value

    // 找到当前进度所在的关键帧区间
    for (let i = 0; i < keyframes.length - 1; i++) {
      const current = keyframes[i]
      const next = keyframes[i + 1]

      if (progress >= current.offset && progress <= next.offset) {
        // 计算区间内的相对进度 (0-1)
        const range = next.offset - current.offset
        const localProgress = range === 0 ? 0 : (progress - current.offset) / range

        // 应用缓动函数
        const easing = next.easing || current.easing || linear
        const easedProgress = easing(localProgress)

        // 根据值类型进行插值
        const startValue = current.value
        const endValue = next.value

        if (typeof startValue === 'number' && typeof endValue === 'number') {
          return this.interpolateNumber(startValue, endValue, easedProgress)
        } else if (typeof startValue === 'string' && typeof endValue === 'string') {
          return this.interpolateString(startValue, endValue, easedProgress)
        } else if (
          typeof startValue === 'object' &&
          typeof endValue === 'object' &&
          startValue !== null &&
          endValue !== null
        ) {
          return this.interpolateObject(startValue, endValue, easedProgress)
        }

        return easedProgress < 0.5 ? startValue : endValue
      }
    }

    // 如果进度超出最后一个关键帧，返回最后一个关键帧的值
    return keyframes[keyframes.length - 1].value
  }

  /**
   * 动画循环
   */
  private animate = (): void => {
    if (!this.startTime) return

    const currentTime = performance.now()
    const elapsed = currentTime - this.startTime - this.pauseTime
    const progress = Math.min(elapsed / this.options.duration, 1)
    const currentValue = this.getValueAtProgress(progress)

    this.options.onUpdate?.(currentValue)

    if (progress < 1) {
      this.animationId = requestAnimationFrame(this.animate)
    } else {
      this.isCompleted = true
      this.options.onComplete?.()
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
      this.pauseTime += performance.now() - (this.startPauseTime || 0)
      this.isPaused = false
      this.startPauseTime = undefined
    } else {
      this.startTime = performance.now()
      this.options.onStart?.()
    }

    this.animate()
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
 * 创建关键帧动画
 */
export function createKeyframeAnimation(options: KeyframeAnimationOptions): KeyframeAnimation {
  return new KeyframeAnimation(options)
}
