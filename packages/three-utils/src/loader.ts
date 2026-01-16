import * as THREE from 'three'

/**
 * 加载纹理图片
 */
export function loadTexture(
  url: string,
  onLoad?: (texture: THREE.Texture) => void,
  onError?: (error: ErrorEvent) => void
): THREE.Texture {
  const loader = new THREE.TextureLoader()
  const texture = loader.load(
    url,
    (texture) => {
      onLoad?.(texture)
    },
    undefined,
    (error) => {
      onError?.(error as ErrorEvent)
    }
  )
  return texture
}

/**
 * 异步加载纹理
 */
export function loadTextureAsync(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loadTexture(
      url,
      (texture) => resolve(texture),
      (error) => reject(error)
    )
  })
}

/**
 * 加载 3D 模型（GLTF/GLB）
 * 注意：这需要 GLTFLoader，通常从 'three/examples/jsm/loaders/GLTFLoader' 导入
 */
export async function loadModel(
  url: string,
  loader?: any // GLTFLoader 类型
): Promise<any> {
  // 这是一个占位函数
  // 实际实现需要使用 GLTFLoader
  // 例如：
  // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
  // const gltfLoader = loader ?? new GLTFLoader()
  // return gltfLoader.loadAsync(url)

  throw new Error(
    'loadModel 需要 GLTFLoader 支持，请从 three/examples/jsm/loaders/GLTFLoader 导入并使用'
  )
}

/**
 * 带进度回调的模型加载
 */
export async function loadModelWithProgress(
  url: string,
  onProgress?: (progress: number) => void,
  loader?: any // GLTFLoader 类型
): Promise<any> {
  // 这是一个占位函数
  // 实际实现需要使用 GLTFLoader 的加载管理器
  // 例如：
  // const loadingManager = createLoadingManager(onProgress)
  // const gltfLoader = loader ?? new GLTFLoader(loadingManager)
  // return gltfLoader.loadAsync(url)

  throw new Error(
    'loadModelWithProgress 需要 GLTFLoader 支持，请从 three/examples/jsm/loaders/GLTFLoader 导入并使用'
  )
}

/**
 * 预加载多个模型
 */
export async function preloadModels(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void,
  loader?: any // GLTFLoader 类型
): Promise<any[]> {
  const results: any[] = []
  for (let i = 0; i < urls.length; i++) {
    try {
      const model = await loadModel(urls[i], loader)
      results.push(model)
      onProgress?.(i + 1, urls.length)
    } catch (error) {
      console.error(`Failed to load model: ${urls[i]}`, error)
      throw error
    }
  }
  return results
}

/**
 * 创建加载管理器
 */
export function createLoadingManager(
  onLoad?: () => void,
  onProgress?: (url: string, loaded: number, total: number) => void,
  onError?: (url: string) => void
): THREE.LoadingManager {
  return new THREE.LoadingManager(
    onLoad,
    (url, loaded, total) => {
      onProgress?.(url, loaded, total)
    },
    (url) => {
      onError?.(url)
    }
  )
}

/**
 * 获取模型边界框
 */
export function getModelBoundingBox(object: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3()
  box.setFromObject(object)
  return box
}

/**
 * 居中模型
 */
export function centerModel(object: THREE.Object3D): void {
  const box = getModelBoundingBox(object)
  const center = box.getCenter(new THREE.Vector3())
  const offset = center.multiplyScalar(-1)
  object.position.add(offset)
}

/**
 * 缩放模型以适应场景
 */
export function scaleModelToFit(
  object: THREE.Object3D,
  maxSize: number = 10
): void {
  const box = getModelBoundingBox(object)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = maxSize / maxDim
  object.scale.multiplyScalar(scale)
}

/**
 * 获取模型尺寸
 */
export function getModelSize(object: THREE.Object3D): THREE.Vector3 {
  const box = getModelBoundingBox(object)
  return box.getSize(new THREE.Vector3())
}

/**
 * 获取模型中心点
 */
export function getModelCenter(object: THREE.Object3D): THREE.Vector3 {
  const box = getModelBoundingBox(object)
  return box.getCenter(new THREE.Vector3())
}

/**
 * 加载立方体贴图（用于环境贴图）
 */
export function loadCubeTexture(
  urls: string[],
  onLoad?: (texture: THREE.CubeTexture) => void,
  onError?: (error: ErrorEvent) => void
): THREE.CubeTexture {
  const loader = new THREE.CubeTextureLoader()
  const texture = loader.load(
    urls,
    (texture) => {
      onLoad?.(texture)
    },
    undefined,
    (error) => {
      onError?.(error as ErrorEvent)
    }
  )
  return texture
}

/**
 * 异步加载立方体贴图
 */
export function loadCubeTextureAsync(urls: string[]): Promise<THREE.CubeTexture> {
  return new Promise((resolve, reject) => {
    loadCubeTexture(
      urls,
      (texture) => resolve(texture),
      (error) => reject(error)
    )
  })
}
