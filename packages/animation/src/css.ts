/**
 * CSS 动画工具
 */

export interface CSSAnimationOptions {
  duration?: number | string
  delay?: number | string
  easing?: string
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  iterationCount?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}

/**
 * 应用 CSS 动画
 */
export function animateCSS(
  element: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: CSSAnimationOptions = {}
): Animation {
  const {
    duration = 1000,
    delay = 0,
    easing = 'ease',
    fillMode = 'forwards',
    iterationCount = 1,
    direction = 'normal',
  } = options

  return element.animate(keyframes, {
    duration: typeof duration === 'number' ? duration : parseDuration(duration),
    delay: typeof delay === 'number' ? delay : parseDuration(delay),
    easing,
    fill: fillMode,
    iterations: iterationCount,
    direction,
  })
}

/**
 * 应用 CSS 过渡
 */
export function transitionCSS(
  element: HTMLElement,
  properties: Record<string, string>,
  duration: number | string = 300,
  easing: string = 'ease'
): Promise<void> {
  return new Promise((resolve) => {
    const durationValue = typeof duration === 'number' ? `${duration}ms` : duration
    const transitionValue = Object.keys(properties)
      .map((prop) => `${prop} ${durationValue} ${easing}`)
      .join(', ')

    element.style.transition = transitionValue

    // 应用新样式
    Object.assign(element.style, properties)

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target === element && e.propertyName && properties[e.propertyName] !== undefined) {
        element.removeEventListener('transitionend', handleTransitionEnd)
        resolve()
      }
    }

    element.addEventListener('transitionend', handleTransitionEnd)

    // 如果过渡时间很短，立即触发完成
    const timeout = typeof duration === 'number' ? duration : parseDuration(duration)
    setTimeout(() => {
      element.removeEventListener('transitionend', handleTransitionEnd)
      resolve()
    }, timeout + 50)
  })
}

/**
 * 解析 CSS 时间字符串（如 '1s', '500ms'）
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+(?:\.\d+)?)(s|ms)$/)
  if (!match) return 1000

  const value = parseFloat(match[1])
  const unit = match[2]

  return unit === 's' ? value * 1000 : value
}

/**
 * 取消 CSS 动画
 */
export function cancelCSSAnimation(element: HTMLElement): void {
  const animations = element.getAnimations()
  animations.forEach((animation) => animation.cancel())
}

/**
 * 暂停 CSS 动画
 */
export function pauseCSSAnimation(element: HTMLElement): void {
  const animations = element.getAnimations()
  animations.forEach((animation) => animation.pause())
}

/**
 * 恢复 CSS 动画
 */
export function resumeCSSAnimation(element: HTMLElement): void {
  const animations = element.getAnimations()
  animations.forEach((animation) => animation.play())
}

/**
 * 淡入动画
 */
export function fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    const animation = animateCSS(
      element,
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration,
        fillMode: 'forwards',
      }
    )

    animation.onfinish = () => resolve()
  })
}

/**
 * 淡出动画
 */
export function fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    const animation = animateCSS(
      element,
      [{ opacity: 1 }, { opacity: 0 }],
      {
        duration,
        fillMode: 'forwards',
      }
    )

    animation.onfinish = () => resolve()
  })
}

/**
 * 滑入动画
 */
export function slideIn(
  element: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  distance: string = '100%',
  duration: number = 300
): Promise<void> {
  const keyframes: Keyframe[] = [{ transform: getSlideTransform(direction, distance) }, { transform: 'translate(0, 0)' }]

  return new Promise((resolve) => {
    const animation = animateCSS(element, keyframes, {
      duration,
      fillMode: 'forwards',
    })

    animation.onfinish = () => resolve()
  })
}

/**
 * 滑出动画
 */
export function slideOut(
  element: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  distance: string = '100%',
  duration: number = 300
): Promise<void> {
  const keyframes: Keyframe[] = [{ transform: 'translate(0, 0)' }, { transform: getSlideTransform(direction, distance) }]

  return new Promise((resolve) => {
    const animation = animateCSS(element, keyframes, {
      duration,
      fillMode: 'forwards',
    })

    animation.onfinish = () => resolve()
  })
}

/**
 * 获取滑动变换
 */
function getSlideTransform(direction: 'left' | 'right' | 'up' | 'down', distance: string): string {
  switch (direction) {
    case 'left':
      return `translateX(-${distance})`
    case 'right':
      return `translateX(${distance})`
    case 'up':
      return `translateY(-${distance})`
    case 'down':
      return `translateY(${distance})`
  }
}

/**
 * 缩放动画
 */
export function scale(
  element: HTMLElement,
  from: number = 0,
  to: number = 1,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const animation = animateCSS(
      element,
      [{ transform: `scale(${from})` }, { transform: `scale(${to})` }],
      {
        duration,
        fillMode: 'forwards',
      }
    )

    animation.onfinish = () => resolve()
  })
}

/**
 * 旋转动画
 */
export function rotate(
  element: HTMLElement,
  from: number = 0,
  to: number = 360,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const animation = animateCSS(
      element,
      [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }],
      {
        duration,
        fillMode: 'forwards',
      }
    )

    animation.onfinish = () => resolve()
  })
}
