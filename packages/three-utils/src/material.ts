import * as THREE from 'three'

export type DeviceStatus = 'online' | 'offline' | 'warning'

/**
 * 根据设备状态获取颜色
 */
export function getStatusColor(status: DeviceStatus, type?: string): string {
  if (status === 'offline') return '#ef4444'
  if (status === 'warning') return '#f59e0b'
  if (type === 'hub') return '#3b82f6'
  return '#22c55e'
}

/**
 * 创建设备材质
 * @param color 颜色
 * @param options 选项
 */
export function createDeviceMaterial(
  color: string | number,
  options: {
    emissive?: string | number
    emissiveIntensity?: number
    metalness?: number
    roughness?: number
    transparent?: boolean
    opacity?: number
  } = {}
): THREE.MeshStandardMaterial {
  const {
    emissive = color,
    emissiveIntensity = 0.3,
    metalness = 0.8,
    roughness = 0.2,
    transparent = false,
    opacity = 1,
  } = options

  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity,
    metalness,
    roughness,
    transparent,
    opacity,
  })
}

/**
 * 创建连接线材质
 * @param color 颜色
 * @param options 选项
 */
export function createLineMaterial(
  color: string | number,
  options: {
    transparent?: boolean
    opacity?: number
    linewidth?: number
  } = {}
): THREE.LineBasicMaterial {
  const { transparent = true, opacity = 0.4, linewidth = 1 } = options

  return new THREE.LineBasicMaterial({
    color,
    transparent,
    opacity,
    linewidth,
  })
}

/**
 * 创建光晕材质
 * @param color 颜色
 * @param options 选项
 */
export function createGlowMaterial(
  color: string | number,
  options: {
    transparent?: boolean
    opacity?: number
  } = {}
): THREE.MeshBasicMaterial {
  const { transparent = true, opacity = 0.1 } = options

  return new THREE.MeshBasicMaterial({
    color,
    transparent,
    opacity,
  })
}

/**
 * 根据设备状态和类型创建设备材质
 */
export function createDeviceMaterialByStatus(
  status: DeviceStatus,
  type?: string,
  isSelected: boolean = false
): THREE.MeshStandardMaterial {
  const color = getStatusColor(status, type)
  return createDeviceMaterial(color, {
    emissive: color,
    emissiveIntensity: isSelected ? 0.8 : 0.3,
    metalness: 0.8,
    roughness: 0.2,
  })
}

/**
 * 创建发光材质（用于特效）
 */
export function createEmissiveMaterial(
  color: string | number,
  intensity: number = 1
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
  })
}

/**
 * 创建透明材质
 */
export function createTransparentMaterial(
  color: string | number,
  opacity: number = 0.5
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
  })
}

/**
 * 创建线框材质
 */
export function createWireframeMaterial(
  color: string | number = '#ffffff',
  opacity: number = 0.3
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
  })
}
