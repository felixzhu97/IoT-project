import * as THREE from 'three'

/**
 * 创建射线检测器
 */
export function createRaycaster(): THREE.Raycaster {
  return new THREE.Raycaster()
}

/**
 * 从鼠标位置进行射线检测
 */
export function raycastFromMouse(
  mouse: THREE.Vector2 | [number, number],
  camera: THREE.Camera,
  objects: THREE.Object3D[],
  raycaster?: THREE.Raycaster
): THREE.Intersection[] {
  const mouseVector = mouse instanceof THREE.Vector2 ? mouse : new THREE.Vector2(...mouse)
  const rc = raycaster ?? createRaycaster()
  rc.setFromCamera(mouseVector, camera)
  return rc.intersectObjects(objects, true)
}

/**
 * 从屏幕坐标进行射线检测
 */
export function raycastFromScreen(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  camera: THREE.Camera,
  objects: THREE.Object3D[],
  raycaster?: THREE.Raycaster
): THREE.Intersection[] {
  const mouse = new THREE.Vector2()
  mouse.x = (screenX / width) * 2 - 1
  mouse.y = -(screenY / height) * 2 + 1
  return raycastFromMouse(mouse, camera, objects, raycaster)
}

/**
 * 获取被射线击中的对象（第一个）
 */
export function getIntersectedObject(
  mouse: THREE.Vector2 | [number, number],
  camera: THREE.Camera,
  objects: THREE.Object3D[],
  raycaster?: THREE.Raycaster
): THREE.Intersection | null {
  const intersections = raycastFromMouse(mouse, camera, objects, raycaster)
  return intersections.length > 0 ? intersections[0] : null
}

/**
 * 获取所有被击中的对象
 */
export function getIntersectedObjects(
  mouse: THREE.Vector2 | [number, number],
  camera: THREE.Camera,
  objects: THREE.Object3D[],
  raycaster?: THREE.Raycaster
): THREE.Intersection[] {
  return raycastFromMouse(mouse, camera, objects, raycaster)
}

/**
 * 对象拾取配置
 */
export interface ObjectPickingConfig {
  onPick?: (object: THREE.Object3D, intersection: THREE.Intersection) => void
  onHover?: (object: THREE.Object3D | null, intersection: THREE.Intersection | null) => void
  filter?: (object: THREE.Object3D) => boolean
}

/**
 * 设置对象拾取功能
 */
export function setupObjectPicking(
  camera: THREE.Camera,
  scene: THREE.Scene,
  renderer: THREE.Renderer,
  config: ObjectPickingConfig = {}
): {
  handleMouseMove: (event: MouseEvent) => void
  handleClick: (event: MouseEvent) => void
  cleanup: () => void
} {
  const { onPick, onHover, filter } = config
  const raycaster = createRaycaster()
  let hoveredObject: THREE.Object3D | null = null

  const getMousePosition = (event: MouseEvent): THREE.Vector2 => {
    const rect = (renderer.domElement as HTMLCanvasElement).getBoundingClientRect()
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
  }

  const handleMouseMove = (event: MouseEvent) => {
    const mouse = getMousePosition(event)
    const intersections = raycastFromMouse(mouse, camera, scene.children, raycaster)

    let currentObject: THREE.Object3D | null = null
    let currentIntersection: THREE.Intersection | null = null

    if (intersections.length > 0) {
      const intersection = intersections.find((i) => !filter || filter(i.object)) ?? intersections[0]
      if (intersection) {
        currentObject = intersection.object
        currentIntersection = intersection
      }
    }

    if (currentObject !== hoveredObject) {
      hoveredObject = currentObject
      onHover?.(currentObject, currentIntersection)
    }
  }

  const handleClick = (event: MouseEvent) => {
    const mouse = getMousePosition(event)
    const intersection = getIntersectedObject(mouse, camera, scene.children, raycaster)

    if (intersection && (!filter || filter(intersection.object))) {
      onPick?.(intersection.object, intersection)
    }
  }

  const canvas = renderer.domElement as HTMLCanvasElement
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('click', handleClick)

  return {
    handleMouseMove,
    handleClick,
    cleanup: () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    },
  }
}

/**
 * 拖拽控制器配置
 */
export interface DragControllerConfig {
  onDragStart?: (object: THREE.Object3D) => void
  onDrag?: (object: THREE.Object3D, delta: THREE.Vector3) => void
  onDragEnd?: (object: THREE.Object3D) => void
  plane?: THREE.Plane
  constraint?: 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz'
}

/**
 * 创建拖拽控制器
 */
export function createDragController(
  camera: THREE.Camera,
  renderer: THREE.Renderer,
  config: DragControllerConfig = {}
): {
  startDrag: (object: THREE.Object3D, intersection: THREE.Intersection) => void
  updateDrag: (event: MouseEvent) => void
  endDrag: () => void
  isDragging: () => boolean
} {
  const { onDragStart, onDrag, onDragEnd, plane, constraint } = config
  let draggingObject: THREE.Object3D | null = null
  let dragPlane: THREE.Plane
  let dragOffset: THREE.Vector3 = new THREE.Vector3()
  const raycaster = createRaycaster()

  const getMousePosition = (event: MouseEvent): THREE.Vector2 => {
    const rect = (renderer.domElement as HTMLCanvasElement).getBoundingClientRect()
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
  }

  const startDrag = (object: THREE.Object3D, intersection: THREE.Intersection) => {
    draggingObject = object
    dragPlane = plane ?? new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    dragOffset.copy(intersection.point).sub(object.position)
    onDragStart?.(object)
  }

  const updateDrag = (event: MouseEvent) => {
    if (!draggingObject) return

    const mouse = getMousePosition(event)
    raycaster.setFromCamera(mouse, camera)

    const intersectionPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(dragPlane, intersectionPoint)

    const delta = intersectionPoint.sub(dragOffset).sub(draggingObject.position)

    if (constraint) {
      if (constraint === 'x') {
        delta.y = 0
        delta.z = 0
      } else if (constraint === 'y') {
        delta.x = 0
        delta.z = 0
      } else if (constraint === 'z') {
        delta.x = 0
        delta.y = 0
      } else if (constraint === 'xy') {
        delta.z = 0
      } else if (constraint === 'xz') {
        delta.y = 0
      } else if (constraint === 'yz') {
        delta.x = 0
      }
    }

    draggingObject.position.add(delta)
    onDrag?.(draggingObject, delta)
  }

  const endDrag = () => {
    if (draggingObject) {
      onDragEnd?.(draggingObject)
      draggingObject = null
    }
  }

  const isDragging = () => draggingObject !== null

  return {
    startDrag,
    updateDrag,
    endDrag,
    isDragging,
  }
}

/**
 * 启用对象拖拽
 */
export function enableObjectDragging(
  object: THREE.Object3D,
  camera: THREE.Camera,
  renderer: THREE.Renderer,
  config: DragControllerConfig = {}
): () => void {
  const dragController = createDragController(camera, renderer, config)
  const canvas = renderer.domElement as HTMLCanvasElement

  const handleMouseDown = (event: MouseEvent) => {
    const mouse = new THREE.Vector2(
      ((event.clientX - canvas.getBoundingClientRect().left) / canvas.width) * 2 - 1,
      -((event.clientY - canvas.getBoundingClientRect().top) / canvas.height) * 2 + 1
    )
    const intersection = getIntersectedObject(mouse, camera, [object])
    if (intersection) {
      dragController.startDrag(object, intersection)
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (dragController.isDragging()) {
      dragController.updateDrag(event)
    }
  }

  const handleMouseUp = () => {
    if (dragController.isDragging()) {
      dragController.endDrag()
    }
  }

  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseup', handleMouseUp)

  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseup', handleMouseUp)
  }
}

/**
 * 创建选择辅助工具
 */
export function createSelectionHelper(
  object: THREE.Object3D,
  color: string | number = '#ffff00'
): THREE.BoxHelper {
  const helper = new THREE.BoxHelper(object, color)
  return helper
}

/**
 * 高亮显示对象
 */
export function highlightObject(
  object: THREE.Object3D,
  color: string | number = '#ffff00',
  intensity: number = 0.5
): () => void {
  const originalMaterials: THREE.Material[] = []

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalMaterials.push(child.material)
      if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.set(color)
        child.material.emissiveIntensity = intensity
      }
    }
  })

  return () => {
    removeHighlight(object, originalMaterials)
  }
}

/**
 * 移除高亮
 */
export function removeHighlight(object: THREE.Object3D, originalMaterials?: THREE.Material[]): void {
  if (originalMaterials) {
    let index = 0
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && index < originalMaterials.length) {
        child.material = originalMaterials[index++]
      }
    })
  } else {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.set(0x000000)
        child.material.emissiveIntensity = 0
      }
    })
  }
}

/**
 * 创建悬停效果
 */
export function createHoverEffect(
  object: THREE.Object3D,
  options: {
    scale?: number
    color?: string | number
    intensity?: number
  } = {}
): () => void {
  const { scale = 1.1, color, intensity = 0.3 } = options
  const originalScale = object.scale.clone()

  const handleEnter = () => {
    object.scale.multiplyScalar(scale)
    if (color && object instanceof THREE.Mesh) {
      if (object.material instanceof THREE.MeshStandardMaterial) {
        object.material.emissive.set(color)
        object.material.emissiveIntensity = intensity
      }
    }
  }

  const handleLeave = () => {
    object.scale.copy(originalScale)
    if (object instanceof THREE.Mesh) {
      if (object.material instanceof THREE.MeshStandardMaterial) {
        object.material.emissive.set(0x000000)
        object.material.emissiveIntensity = 0
      }
    }
  }

  // 注意：实际使用中需要结合事件系统
  ;(object.userData as any).hoverEnter = handleEnter
  ;(object.userData as any).hoverLeave = handleLeave

  return () => {
    handleLeave()
  }
}

/**
 * 设置点击交互
 */
export function setupClickInteraction(
  object: THREE.Object3D,
  camera: THREE.Camera,
  renderer: THREE.Renderer,
  onClick: (object: THREE.Object3D, intersection: THREE.Intersection) => void
): () => void {
  const canvas = renderer.domElement as HTMLCanvasElement

  const handleClick = (event: MouseEvent) => {
    const mouse = new THREE.Vector2(
      ((event.clientX - canvas.getBoundingClientRect().left) / canvas.width) * 2 - 1,
      -((event.clientY - canvas.getBoundingClientRect().top) / canvas.height) * 2 + 1
    )
    const intersection = getIntersectedObject(mouse, camera, [object])
    if (intersection) {
      onClick(object, intersection)
    }
  }

  canvas.addEventListener('click', handleClick)

  return () => {
    canvas.removeEventListener('click', handleClick)
  }
}

/**
 * 设置双击交互
 */
export function setupDoubleClickInteraction(
  object: THREE.Object3D,
  camera: THREE.Camera,
  renderer: THREE.Renderer,
  onDoubleClick: (object: THREE.Object3D, intersection: THREE.Intersection) => void
): () => void {
  const canvas = renderer.domElement as HTMLCanvasElement
  let clickTimeout: NodeJS.Timeout | null = null

  const handleClick = (event: MouseEvent) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      clickTimeout = null

      const mouse = new THREE.Vector2(
        ((event.clientX - canvas.getBoundingClientRect().left) / canvas.width) * 2 - 1,
        -((event.clientY - canvas.getBoundingClientRect().top) / canvas.height) * 2 + 1
      )
      const intersection = getIntersectedObject(mouse, camera, [object])
      if (intersection) {
        onDoubleClick(object, intersection)
      }
    } else {
      clickTimeout = setTimeout(() => {
        clickTimeout = null
      }, 300)
    }
  }

  canvas.addEventListener('click', handleClick)

  return () => {
    canvas.removeEventListener('click', handleClick)
    if (clickTimeout) {
      clearTimeout(clickTimeout)
    }
  }
}

/**
 * 键盘控制配置
 */
export interface KeyboardControlsConfig {
  onKeyDown?: (key: string, event: KeyboardEvent) => void
  onKeyUp?: (key: string, event: KeyboardEvent) => void
  keys?: string[]
}

/**
 * 设置键盘控制
 */
export function setupKeyboardControls(
  config: KeyboardControlsConfig = {}
): () => void {
  const { onKeyDown, onKeyUp, keys } = config
  const pressedKeys = new Set<string>()

  const handleKeyDown = (event: KeyboardEvent) => {
    if (keys && !keys.includes(event.key)) return
    if (!pressedKeys.has(event.key)) {
      pressedKeys.add(event.key)
      onKeyDown?.(event.key, event)
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (keys && !keys.includes(event.key)) return
    pressedKeys.delete(event.key)
    onKeyUp?.(event.key, event)
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }
}

/**
 * 交互管理器配置
 */
export interface InteractionManagerConfig {
  onPick?: (object: THREE.Object3D, intersection: THREE.Intersection) => void
  onHover?: (object: THREE.Object3D | null) => void
  onDrag?: (object: THREE.Object3D, delta: THREE.Vector3) => void
  enableDrag?: boolean
  enableKeyboard?: boolean
  keyboardConfig?: KeyboardControlsConfig
}

/**
 * 创建交互管理器
 */
export function createInteractionManager(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.Renderer,
  config: InteractionManagerConfig = {}
): {
  cleanup: () => void
  enableDrag: (object: THREE.Object3D) => () => void
} {
  const { onPick, onHover, onDrag, enableDrag = false, enableKeyboard = false, keyboardConfig } = config

  const picking = setupObjectPicking(camera, scene, renderer, {
    onPick,
    onHover: (object) => onHover?.(object ?? null),
  })

  let keyboardCleanup: (() => void) | null = null
  if (enableKeyboard) {
    keyboardCleanup = setupKeyboardControls(keyboardConfig)
  }

  const enableObjectDrag = (object: THREE.Object3D) => {
    if (!enableDrag) return () => {}
    return enableObjectDragging(object, camera, renderer, {
      onDrag,
    })
  }

  return {
    cleanup: () => {
      picking.cleanup()
      keyboardCleanup?.()
    },
    enableDrag: enableObjectDrag,
  }
}

/**
 * 从屏幕坐标转换为世界坐标
 */
export function getWorldPositionFromScreen(
  screenX: number,
  screenY: number,
  depth: number,
  camera: THREE.Camera,
  renderer: THREE.Renderer
): THREE.Vector3 {
  const vector = new THREE.Vector3()
  const rect = (renderer.domElement as HTMLCanvasElement).getBoundingClientRect()

  vector.x = ((screenX - rect.left) / rect.width) * 2 - 1
  vector.y = -((screenY - rect.top) / rect.height) * 2 + 1
  vector.z = depth

  vector.unproject(camera)
  return vector
}

/**
 * 从世界坐标转换为屏幕坐标
 */
export function getScreenPositionFromWorld(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera,
  renderer: THREE.Renderer
): { x: number; y: number; z: number } | null {
  const vector = worldPosition.clone().project(camera)
  const rect = (renderer.domElement as HTMLCanvasElement).getBoundingClientRect()

  const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left
  const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top
  const z = vector.z

  if (z < -1 || z > 1) {
    return null // 对象在相机后面或太远
  }

  return { x, y, z }
}

/**
 * 判断对象是否在视口内
 */
export function isObjectInViewport(
  object: THREE.Object3D,
  camera: THREE.Camera,
  renderer: THREE.Renderer
): boolean {
  const box = new THREE.Box3().setFromObject(object)
  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ]

  const frustum = new THREE.Frustum()
  const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(matrix)

  return corners.some((corner) => {
    const worldCorner = corner.applyMatrix4(object.matrixWorld)
    return frustum.containsPoint(worldCorner)
  })
}
