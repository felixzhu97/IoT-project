import * as THREE from 'three'

/**
 * 计算三维空间中两点之间的距离
 */
export function distance3D(
  point1: THREE.Vector3 | [number, number, number],
  point2: THREE.Vector3 | [number, number, number]
): number {
  const v1 = point1 instanceof THREE.Vector3 ? point1 : new THREE.Vector3(...point1)
  const v2 = point2 instanceof THREE.Vector3 ? point2 : new THREE.Vector3(...point2)
  return v1.distanceTo(v2)
}

/**
 * 归一化向量
 */
export function normalizeVector(vector: THREE.Vector3 | [number, number, number]): THREE.Vector3 {
  const v = vector instanceof THREE.Vector3 ? vector.clone() : new THREE.Vector3(...vector)
  return v.normalize()
}

/**
 * 计算两个向量之间的夹角（弧度）
 */
export function angleBetweenVectors(
  v1: THREE.Vector3 | [number, number, number],
  v2: THREE.Vector3 | [number, number, number]
): number {
  const vec1 = v1 instanceof THREE.Vector3 ? v1 : new THREE.Vector3(...v1)
  const vec2 = v2 instanceof THREE.Vector3 ? v2 : new THREE.Vector3(...v2)
  return vec1.angleTo(vec2)
}

/**
 * 球坐标转笛卡尔坐标
 * @param radius 半径
 * @param theta 极角（与 z 轴的夹角，弧度）
 * @param phi 方位角（在 xy 平面上的角度，弧度）
 */
export function sphericalToCartesian(
  radius: number,
  theta: number,
  phi: number
): THREE.Vector3 {
  const x = radius * Math.sin(theta) * Math.cos(phi)
  const y = radius * Math.sin(theta) * Math.sin(phi)
  const z = radius * Math.cos(theta)
  return new THREE.Vector3(x, y, z)
}

/**
 * 笛卡尔坐标转球坐标
 * @returns [radius, theta, phi]
 */
export function cartesianToSpherical(
  vector: THREE.Vector3 | [number, number, number]
): [number, number, number] {
  const v = vector instanceof THREE.Vector3 ? vector : new THREE.Vector3(...vector)
  const radius = v.length()
  const theta = Math.acos(v.z / radius) // 极角
  const phi = Math.atan2(v.y, v.x) // 方位角
  return [radius, theta, phi]
}

/**
 * 将数值限制在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 角度转弧度
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * 弧度转角度
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 向量线性插值
 */
export function lerpVector(
  v1: THREE.Vector3 | [number, number, number],
  v2: THREE.Vector3 | [number, number, number],
  t: number
): THREE.Vector3 {
  const vec1 = v1 instanceof THREE.Vector3 ? v1 : new THREE.Vector3(...v1)
  const vec2 = v2 instanceof THREE.Vector3 ? v2 : new THREE.Vector3(...v2)
  return vec1.clone().lerp(vec2, t)
}

/**
 * 平滑步进函数（smoothstep）
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}
