import * as THREE from 'three'
import { animateVector } from './animation'
import { easeInOutQuad } from './animation'

export type CameraPreset = 'default' | 'top' | 'front' | 'side' | 'iso'

export interface CameraConfig {
  position: [number, number, number]
  fov?: number
  near?: number
  far?: number
}

/**
 * 创建默认相机配置
 */
export function createDefaultCamera(): CameraConfig {
  return {
    position: [8, 6, 8],
    fov: 50,
    near: 0.1,
    far: 1000,
  }
}

/**
 * 获取相机预设
 */
export function getCameraPreset(preset: CameraPreset): CameraConfig {
  switch (preset) {
    case 'top':
      return {
        position: [0, 10, 0],
        fov: 50,
      }
    case 'front':
      return {
        position: [0, 0, 10],
        fov: 50,
      }
    case 'side':
      return {
        position: [10, 0, 0],
        fov: 50,
      }
    case 'iso':
      return {
        position: [8, 8, 8],
        fov: 50,
      }
    case 'default':
    default:
      return createDefaultCamera()
  }
}

/**
 * 平滑相机移动
 * @param camera 相机对象
 * @param targetPosition 目标位置
 * @param duration 动画持续时间（毫秒）
 * @param onComplete 完成回调
 */
export function smoothCameraMove(
  camera: THREE.Camera,
  targetPosition: THREE.Vector3 | [number, number, number],
  duration: number = 1000,
  onComplete?: () => void
): Promise<void> {
  const target = targetPosition instanceof THREE.Vector3
    ? targetPosition
    : new THREE.Vector3(...targetPosition)

  return animateVector(
    camera.position,
    target,
    duration,
    easeInOutQuad,
    (position) => {
      camera.position.copy(position)
    }
  ).then(() => {
    onComplete?.()
  })
}

/**
 * 聚焦到对象
 * @param camera 相机对象
 * @param object 目标对象
 * @param offset 偏移量
 * @param duration 动画持续时间（毫秒）
 */
export function focusOnObject(
  camera: THREE.Camera,
  object: THREE.Object3D,
  offset: THREE.Vector3 | [number, number, number] = [5, 5, 5],
  duration: number = 1000
): Promise<void> {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const distance = maxDim * 2

  const offsetVec = offset instanceof THREE.Vector3 ? offset : new THREE.Vector3(...offset)
  const targetPosition = center.clone().add(offsetVec.normalize().multiplyScalar(distance))

  // 让相机看向目标
  return smoothCameraMove(camera, targetPosition, duration).then(() => {
    if (camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera) {
      // 使用 lookAt 让相机看向目标中心
      const lookAtPromise = animateVector(
        camera.position,
        center,
        500,
        easeInOutQuad,
        (position) => {
          // 这里我们只是更新位置，lookAt 会在最后调用
        }
      )
      return lookAtPromise.then(() => {
        // 注意：这里需要根据实际需求调整
        // 如果使用 OrbitControls，应该更新 controls.target
      })
    }
  })
}

/**
 * 计算相机到对象的距离
 */
export function getCameraDistanceToObject(
  camera: THREE.Camera,
  object: THREE.Object3D
): number {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  return camera.position.distanceTo(center)
}

/**
 * 调整相机以适应对象
 */
export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  offset: number = 1.2
): void {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = camera.fov * (Math.PI / 180)
  const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * offset

  camera.position.set(center.x, center.y, center.z + cameraZ)
  camera.lookAt(center)
}
