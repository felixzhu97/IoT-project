import * as THREE from 'three'
import { lerp, smoothstep } from './math'

/**
 * 缓动函数 - 二次缓入缓出
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/**
 * 缓动函数 - 三次缓入缓出
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

/**
 * 缓动函数 - 弹性
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

/**
 * 线性插值（重新导出以便使用）
 */
export { lerp } from './math'

/**
 * 创建浮动动画
 * @param object 要动画的对象
 * @param options 选项
 * @returns 清理函数
 */
export function createFloatAnimation(
  object: THREE.Object3D,
  options: {
    speed?: number
    rotationIntensity?: number
    floatIntensity?: number
    baseY?: number
  } = {}
): () => void {
  const {
    speed = 2,
    rotationIntensity = 0.2,
    floatIntensity = 0.5,
    baseY = object.position.y,
  } = options

  let time = 0
  const initialRotation = object.rotation.clone()

  const animate = () => {
    time += 0.01 * speed
    object.position.y = baseY + Math.sin(time) * floatIntensity
    object.rotation.x = initialRotation.x + Math.sin(time * 0.5) * rotationIntensity
    object.rotation.z = initialRotation.z + Math.cos(time * 0.5) * rotationIntensity
  }

  // 返回清理函数
  return () => {
    // 清理逻辑（如果需要）
  }
}

/**
 * 创建旋转动画
 * @param object 要动画的对象
 * @param options 选项
 * @returns 清理函数
 */
export function createRotationAnimation(
  object: THREE.Object3D,
  options: {
    speed?: number
    axis?: 'x' | 'y' | 'z'
  } = {}
): () => void {
  const { speed = 1, axis = 'y' } = options

  const animate = () => {
    object.rotation[axis] += 0.01 * speed
  }

  return () => {
    // 清理逻辑
  }
}

/**
 * 通用值动画函数
 * @param from 起始值
 * @param to 目标值
 * @param duration 持续时间（毫秒）
 * @param easing 缓动函数
 * @param onUpdate 更新回调
 * @returns Promise，动画完成时 resolve
 */
export function animateValue(
  from: number,
  to: number,
  duration: number,
  easing: (t: number) => number = easeInOutQuad,
  onUpdate: (value: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now()
    const range = to - from

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)
      const currentValue = from + range * easedProgress

      onUpdate(currentValue)

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        resolve()
      }
    }

    requestAnimationFrame(update)
  })
}

/**
 * 向量动画
 */
export function animateVector(
  from: THREE.Vector3 | [number, number, number],
  to: THREE.Vector3 | [number, number, number],
  duration: number,
  easing: (t: number) => number = easeInOutQuad,
  onUpdate: (value: THREE.Vector3) => void
): Promise<void> {
  const fromVec = from instanceof THREE.Vector3 ? from : new THREE.Vector3(...from)
  const toVec = to instanceof THREE.Vector3 ? to : new THREE.Vector3(...to)

  return new Promise((resolve) => {
    const startTime = performance.now()

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const currentValue = fromVec.clone().lerp(toVec, easedProgress)
      onUpdate(currentValue)

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        resolve()
      }
    }

    requestAnimationFrame(update)
  })
}

/**
 * 创建脉冲动画（用于高亮效果）
 */
export function createPulseAnimation(
  material: THREE.Material,
  options: {
    minIntensity?: number
    maxIntensity?: number
    speed?: number
  } = {}
): () => void {
  const { minIntensity = 0.3, maxIntensity = 0.8, speed = 2 } = options
  let time = 0

  const animate = () => {
    time += 0.01 * speed
    if (material instanceof THREE.MeshStandardMaterial) {
      const intensity = minIntensity + (maxIntensity - minIntensity) * (Math.sin(time) * 0.5 + 0.5)
      material.emissiveIntensity = intensity
    }
  }

  return () => {
    // 清理逻辑
  }
}
