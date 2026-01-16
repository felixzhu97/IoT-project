/**
 * 缓动函数集合
 * 提供常用的动画缓动函数
 */

/**
 * 线性缓动
 */
export function linear(t: number): number {
  return t
}

/**
 * 二次缓入
 */
export function easeInQuad(t: number): number {
  return t * t
}

/**
 * 二次缓出
 */
export function easeOutQuad(t: number): number {
  return t * (2 - t)
}

/**
 * 二次缓入缓出
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/**
 * 三次缓入
 */
export function easeInCubic(t: number): number {
  return t * t * t
}

/**
 * 三次缓出
 */
export function easeOutCubic(t: number): number {
  return --t * t * t + 1
}

/**
 * 三次缓入缓出
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

/**
 * 四次缓入
 */
export function easeInQuart(t: number): number {
  return t * t * t * t
}

/**
 * 四次缓出
 */
export function easeOutQuart(t: number): number {
  return 1 - --t * t * t * t
}

/**
 * 四次缓入缓出
 */
export function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t
}

/**
 * 正弦缓入
 */
export function easeInSine(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2)
}

/**
 * 正弦缓出
 */
export function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2)
}

/**
 * 正弦缓入缓出
 */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

/**
 * 指数缓入
 */
export function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
}

/**
 * 指数缓出
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * 指数缓入缓出
 */
export function easeInOutExpo(t: number): number {
  if (t === 0) return 0
  if (t === 1) return 1
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2
  return (2 - Math.pow(2, -20 * t + 10)) / 2
}

/**
 * 圆形缓入
 */
export function easeInCirc(t: number): number {
  return 1 - Math.sqrt(1 - t * t)
}

/**
 * 圆形缓出
 */
export function easeOutCirc(t: number): number {
  return Math.sqrt(1 - --t * t)
}

/**
 * 圆形缓入缓出
 */
export function easeInOutCirc(t: number): number {
  return t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2
}

/**
 * 弹性缓入
 */
export function easeInElastic(t: number): number {
  if (t === 0) return 0
  if (t === 1) return 1
  const c4 = (2 * Math.PI) / 3
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
}

/**
 * 弹性缓出
 */
export function easeOutElastic(t: number): number {
  if (t === 0) return 0
  if (t === 1) return 1
  const c4 = (2 * Math.PI) / 3
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

/**
 * 弹性缓入缓出
 */
export function easeInOutElastic(t: number): number {
  if (t === 0) return 0
  if (t === 1) return 1
  const c5 = (2 * Math.PI) / 4.5
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
}

/**
 * 反弹缓入
 */
export function easeInBounce(t: number): number {
  return 1 - easeOutBounce(1 - t)
}

/**
 * 反弹缓出
 */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625
  const d1 = 2.75

  if (t < 1 / d1) {
    return n1 * t * t
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}

/**
 * 反弹缓入缓出
 */
export function easeInOutBounce(t: number): number {
  return t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2
}

/**
 * 缓动函数类型
 */
export type EasingFunction = (t: number) => number

/**
 * 缓动函数映射表
 */
export const easingFunctions = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
} as const
