import * as THREE from 'three'
import { lerp } from './math'

/**
 * 粒子系统配置
 */
export interface ParticleSystemConfig {
  count?: number
  size?: number
  color?: string | number
  speed?: number
  spread?: number
  lifetime?: number
}

/**
 * 创建粒子系统
 */
export function createParticleSystem(
  config: ParticleSystemConfig = {}
): THREE.Points {
  const {
    count = 1000,
    size = 0.02,
    color = '#ffffff',
    speed = 1,
    spread = 10,
    lifetime = 1,
  } = config

  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  const lifetimes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * spread
    positions[i3 + 1] = (Math.random() - 0.5) * spread
    positions[i3 + 2] = (Math.random() - 0.5) * spread

    velocities[i3] = (Math.random() - 0.5) * speed
    velocities[i3 + 1] = (Math.random() - 0.5) * speed
    velocities[i3 + 2] = (Math.random() - 0.5) * speed

    lifetimes[i] = Math.random() * lifetime
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1))

  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.8,
  })

  const particles = new THREE.Points(geometry, material)
  ;(particles.userData as any).velocities = velocities
  ;(particles.userData as any).lifetimes = lifetimes

  return particles
}

/**
 * 创建发光效果
 */
export function createGlowEffect(
  object: THREE.Object3D,
  color: string | number = '#ffffff',
  intensity: number = 0.5
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: intensity,
    side: THREE.BackSide,
  })

  const glow = new THREE.Mesh(geometry, material)
  glow.scale.multiplyScalar(1.1)
  object.add(glow)

  return glow
}

/**
 * 创建轨迹效果
 */
export function createTrailEffect(
  object: THREE.Object3D,
  options: {
    length?: number
    color?: string | number
    width?: number
  } = {}
): THREE.Line {
  const { length = 50, color = '#3b82f6', width = 0.1 } = options

  const points: THREE.Vector3[] = []
  for (let i = 0; i < length; i++) {
    points.push(object.position.clone())
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color,
    linewidth: width,
    transparent: true,
    opacity: 0.6,
  })

  const trail = new THREE.Line(geometry, material)
  ;(trail.userData as any).points = points
  ;(trail.userData as any).maxLength = length

  return trail
}

/**
 * 创建脉冲效果
 */
export function createPulseEffect(
  object: THREE.Object3D,
  options: {
    color?: string | number
    minScale?: number
    maxScale?: number
    speed?: number
  } = {}
): () => void {
  const { color = '#ffffff', minScale = 1, maxScale = 1.2, speed = 2 } = options

  const pulseGeometry = new THREE.RingGeometry(minScale, maxScale, 32)
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  })

  const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial)
  pulse.rotation.x = -Math.PI / 2
  object.add(pulse)

  let time = 0

  const animate = () => {
    time += 0.02 * speed
    const scale = minScale + (maxScale - minScale) * (Math.sin(time) * 0.5 + 0.5)
    pulse.scale.set(scale, scale, scale)
    pulseMaterial.opacity = 0.5 * (1 - Math.abs(Math.sin(time)))
  }

  ;(pulse.userData as any).animate = animate

  return () => {
    object.remove(pulse)
    pulseGeometry.dispose()
    pulseMaterial.dispose()
  }
}

/**
 * 创建涟漪效果
 */
export function createRippleEffect(
  position: THREE.Vector3 | [number, number, number],
  options: {
    color?: string | number
    maxRadius?: number
    speed?: number
    count?: number
  } = {}
): THREE.Group {
  const { color = '#3b82f6', maxRadius = 5, speed = 2, count = 3 } = options

  const group = new THREE.Group()
  const pos = position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)
  group.position.copy(pos)

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.RingGeometry(0.1, 0.2, 32)
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })

    const ring = new THREE.Mesh(geometry, material)
    ring.rotation.x = -Math.PI / 2
    ring.userData.delay = i / count
    ring.userData.maxRadius = maxRadius
    ring.userData.speed = speed

    group.add(ring)
  }

  return group
}

/**
 * 创建光束效果（用于连接线）
 */
export function createBeamEffect(
  start: THREE.Vector3 | [number, number, number],
  end: THREE.Vector3 | [number, number, number],
  options: {
    color?: string | number
    width?: number
    segments?: number
  } = {}
): THREE.Mesh {
  const { color = '#3b82f6', width = 0.1, segments = 20 } = options

  const startPoint = start instanceof THREE.Vector3 ? start : new THREE.Vector3(...start)
  const endPoint = end instanceof THREE.Vector3 ? end : new THREE.Vector3(...end)

  const direction = new THREE.Vector3().subVectors(endPoint, startPoint)
  const length = direction.length()
  direction.normalize()

  const geometry = new THREE.CylinderGeometry(width, width, length, 8, 1, true)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6,
  })

  const beam = new THREE.Mesh(geometry, material)

  // 旋转到正确方向
  const axis = new THREE.Vector3(0, 1, 0).cross(direction)
  const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(direction))
  beam.rotateOnAxis(axis.normalize(), angle)

  // 移动到中点
  const center = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5)
  beam.position.copy(center)

  return beam
}

/**
 * 创建光晕效果
 */
export function createHaloEffect(
  object: THREE.Object3D,
  options: {
    color?: string | number
    size?: number
    intensity?: number
  } = {}
): THREE.Mesh {
  const { color = '#ffffff', size = 1.2, intensity = 0.3 } = options

  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: intensity,
    side: THREE.BackSide,
  })

  const halo = new THREE.Mesh(geometry, material)
  halo.scale.multiplyScalar(size)
  object.add(halo)

  return halo
}

/**
 * 后处理效果配置
 */
export interface PostProcessingConfig {
  bloom?: {
    strength?: number
    radius?: number
    threshold?: number
  }
  depthOfField?: {
    focus?: number
    aperture?: number
    maxBlur?: number
  }
}

/**
 * 创建后处理效果
 * 注意：这需要额外的后处理库（如 three/examples/jsm/postprocessing）
 * 这里只提供配置接口，实际实现需要根据项目使用的后处理库
 */
export function createPostProcessing(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  config: PostProcessingConfig = {}
): void {
  // 这是一个占位函数
  // 实际实现需要使用 three/examples/jsm/postprocessing 中的效果
  // 例如：EffectComposer, RenderPass, UnrealBloomPass 等
  console.warn(
    'createPostProcessing 需要额外的后处理库支持，请根据项目需求实现具体效果'
  )
}
