import * as THREE from 'three'

export type DeviceType = 'hub' | 'sensor' | 'camera' | 'actuator'

/**
 * 创建设备几何体
 * @param type 设备类型
 * @param size 尺寸（默认根据类型自动计算）
 */
export function createDeviceGeometry(
  type: DeviceType,
  size?: number
): THREE.BufferGeometry {
  const defaultSize = size ?? (type === 'hub' ? 0.6 : 0.35)

  switch (type) {
    case 'hub':
      return new THREE.OctahedronGeometry(defaultSize, 0)
    case 'camera':
      return new THREE.ConeGeometry(defaultSize, defaultSize * 1.5, 6)
    case 'sensor':
    case 'actuator':
    default:
      return new THREE.BoxGeometry(defaultSize, defaultSize, defaultSize)
  }
}

/**
 * 创建连接线几何体
 * @param start 起点
 * @param end 终点
 */
export function createConnectionLine(
  start: THREE.Vector3 | [number, number, number],
  end: THREE.Vector3 | [number, number, number]
): THREE.BufferGeometry {
  const startPoint = start instanceof THREE.Vector3 ? start : new THREE.Vector3(...start)
  const endPoint = end instanceof THREE.Vector3 ? end : new THREE.Vector3(...end)
  const points = [startPoint, endPoint]
  return new THREE.BufferGeometry().setFromPoints(points)
}

/**
 * 创建网格地板几何体
 * @param width 宽度
 * @param height 高度
 * @param divisions 分割数
 */
export function createGridFloor(
  width: number = 20,
  height: number = 20,
  divisions: number = 20
): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(width, height, divisions, divisions)
}

/**
 * 创建标签几何体（用于文本渲染）
 * @param text 文本内容
 * @param options 选项
 */
export function createLabelGeometry(
  text: string,
  options: {
    fontSize?: number
    fontFamily?: string
    color?: string
  } = {}
): THREE.BufferGeometry {
  // 注意：Three.js 中文本通常使用 TextGeometry 或 HTML 元素
  // 这里返回一个简单的平面几何体作为占位符
  // 实际使用时建议使用 @react-three/drei 的 Text 组件或 HTML 组件
  const { fontSize = 0.5 } = options
  return new THREE.PlaneGeometry(fontSize * text.length * 0.6, fontSize)
}

/**
 * 创建球体几何体
 */
export function createSphereGeometry(radius: number, segments?: number): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, segments ?? 16, segments ?? 16)
}

/**
 * 创建圆柱体几何体
 */
export function createCylinderGeometry(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments?: number
): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    segments ?? 32
  )
}

/**
 * 创建环形几何体
 */
export function createTorusGeometry(
  radius: number,
  tube: number,
  radialSegments?: number,
  tubularSegments?: number
): THREE.TorusGeometry {
  return new THREE.TorusGeometry(
    radius,
    tube,
    radialSegments ?? 16,
    tubularSegments ?? 100
  )
}
