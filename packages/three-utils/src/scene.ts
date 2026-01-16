import * as THREE from 'three'

export interface LightConfig {
  ambient?: {
    intensity?: number
    color?: string | number
  }
  pointLights?: Array<{
    position: [number, number, number]
    intensity?: number
    color?: string | number
    distance?: number
    decay?: number
  }>
  spotLights?: Array<{
    position: [number, number, number]
    target?: [number, number, number]
    intensity?: number
    color?: string | number
    angle?: number
    penumbra?: number
    distance?: number
    decay?: number
  }>
  directionalLights?: Array<{
    position: [number, number, number]
    intensity?: number
    color?: string | number
  }>
}

/**
 * 创建默认灯光配置
 */
export function createDefaultLights(): LightConfig {
  return {
    ambient: {
      intensity: 0.3,
      color: '#ffffff',
    },
    pointLights: [
      {
        position: [10, 10, 10],
        intensity: 1,
        color: '#3b82f6',
      },
      {
        position: [-10, -10, -10],
        intensity: 0.5,
        color: '#22c55e',
      },
    ],
    spotLights: [
      {
        position: [0, 10, 0],
        intensity: 0.8,
        color: '#ffffff',
        angle: 0.5,
        penumbra: 1,
      },
    ],
  }
}

/**
 * 创建环境光
 */
export function createAmbientLight(
  intensity: number = 0.3,
  color: string | number = '#ffffff'
): THREE.AmbientLight {
  return new THREE.AmbientLight(color, intensity)
}

/**
 * 创建点光源配置
 */
export function createPointLights(
  configs: Array<{
    position: [number, number, number]
    intensity?: number
    color?: string | number
    distance?: number
    decay?: number
  }>
): THREE.PointLight[] {
  return configs.map(
    (config) =>
      new THREE.PointLight(
        config.color ?? '#ffffff',
        config.intensity ?? 1,
        config.distance,
        config.decay ?? 2
      )
  )
}

/**
 * 创建聚光灯
 */
export function createSpotLight(
  position: [number, number, number],
  target?: [number, number, number],
  options: {
    intensity?: number
    color?: string | number
    angle?: number
    penumbra?: number
    distance?: number
    decay?: number
  } = {}
): THREE.SpotLight {
  const {
    intensity = 1,
    color = '#ffffff',
    angle = Math.PI / 3,
    penumbra = 0,
    distance = 0,
    decay = 2,
  } = options

  const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay)
  light.position.set(...position)

  if (target) {
    light.target.position.set(...target)
  }

  return light
}

/**
 * 创建方向光
 */
export function createDirectionalLight(
  position: [number, number, number],
  options: {
    intensity?: number
    color?: string | number
  } = {}
): THREE.DirectionalLight {
  const { intensity = 1, color = '#ffffff' } = options
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(...position)
  return light
}

/**
 * 设置场景环境
 * @param scene 场景对象
 * @param config 灯光配置
 */
export function setupEnvironment(scene: THREE.Scene, config?: LightConfig): void {
  const lightConfig = config ?? createDefaultLights()

  // 环境光
  if (lightConfig.ambient) {
    const ambientLight = createAmbientLight(
      lightConfig.ambient.intensity,
      lightConfig.ambient.color
    )
    scene.add(ambientLight)
  }

  // 点光源
  if (lightConfig.pointLights) {
    const pointLights = createPointLights(lightConfig.pointLights)
    pointLights.forEach((light, index) => {
      const config = lightConfig.pointLights![index]
      light.position.set(...config.position)
      scene.add(light)
    })
  }

  // 聚光灯
  if (lightConfig.spotLights) {
    lightConfig.spotLights.forEach((config) => {
      const spotLight = createSpotLight(
        config.position,
        config.target,
        {
          intensity: config.intensity,
          color: config.color,
          angle: config.angle,
          penumbra: config.penumbra,
          distance: config.distance,
          decay: config.decay,
        }
      )
      scene.add(spotLight)
      if (config.target) {
        scene.add(spotLight.target)
      }
    })
  }

  // 方向光
  if (lightConfig.directionalLights) {
    lightConfig.directionalLights.forEach((config) => {
      const directionalLight = createDirectionalLight(config.position, {
        intensity: config.intensity,
        color: config.color,
      })
      scene.add(directionalLight)
    })
  }
}

/**
 * 创建半球光（用于更自然的环境光照）
 */
export function createHemisphereLight(
  skyColor: string | number = '#87ceeb',
  groundColor: string | number = '#8b7355',
  intensity: number = 0.5
): THREE.HemisphereLight {
  return new THREE.HemisphereLight(skyColor, groundColor, intensity)
}

/**
 * 创建矩形光（用于更真实的光照）
 */
export function createRectAreaLight(
  position: [number, number, number],
  width: number = 10,
  height: number = 10,
  options: {
    intensity?: number
    color?: string | number
  } = {}
): THREE.RectAreaLight {
  const { intensity = 1, color = '#ffffff' } = options
  const light = new THREE.RectAreaLight(color, intensity, width, height)
  light.position.set(...position)
  return light
}
