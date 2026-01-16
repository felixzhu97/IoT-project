"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Html } from "@react-three/drei"
import { Suspense, useRef } from "react"
import * as THREE from "three"

interface Scene3DProps {
  selectedDevice: string | null
  onSelectDevice: (id: string | null) => void
}

const devices = [
  { id: "hub-001", name: "中央网关", position: [0, 0, 0] as [number, number, number], type: "hub", status: "online" },
  {
    id: "sensor-001",
    name: "温度传感器 A",
    position: [3, 1.5, 2] as [number, number, number],
    type: "sensor",
    status: "online",
  },
  {
    id: "sensor-002",
    name: "温度传感器 B",
    position: [-3, 1, 2] as [number, number, number],
    type: "sensor",
    status: "online",
  },
  {
    id: "sensor-003",
    name: "湿度传感器",
    position: [2, -1, -2] as [number, number, number],
    type: "sensor",
    status: "warning",
  },
  {
    id: "camera-001",
    name: "监控摄像头 1",
    position: [-2, 2, -2] as [number, number, number],
    type: "camera",
    status: "online",
  },
  {
    id: "camera-002",
    name: "监控摄像头 2",
    position: [4, 0, -1] as [number, number, number],
    type: "camera",
    status: "online",
  },
  {
    id: "actuator-001",
    name: "智能开关",
    position: [-4, -1, 0] as [number, number, number],
    type: "actuator",
    status: "online",
  },
  {
    id: "actuator-002",
    name: "电机控制器",
    position: [1, -2, 3] as [number, number, number],
    type: "actuator",
    status: "offline",
  },
]

function DeviceNode({
  device,
  isSelected,
  onSelect,
}: {
  device: (typeof devices)[0]
  isSelected: boolean
  onSelect: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const getColor = () => {
    if (device.status === "offline") return "#ef4444"
    if (device.status === "warning") return "#f59e0b"
    if (device.type === "hub") return "#3b82f6"
    return "#22c55e"
  }

  const getSize = () => {
    if (device.type === "hub") return 0.6
    return 0.35
  }

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={device.position}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          {device.type === "hub" ? (
            <octahedronGeometry args={[getSize(), 0]} />
          ) : device.type === "camera" ? (
            <coneGeometry args={[getSize(), getSize() * 1.5, 6]} />
          ) : (
            <boxGeometry args={[getSize(), getSize(), getSize()]} />
          )}
          <meshStandardMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={isSelected ? 0.8 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* 光晕效果 */}
        <mesh scale={1.5}>
          {device.type === "hub" ? (
            <octahedronGeometry args={[getSize(), 0]} />
          ) : (
            <sphereGeometry args={[getSize(), 16, 16]} />
          )}
          <meshBasicMaterial color={getColor()} transparent opacity={isSelected ? 0.2 : 0.1} />
        </mesh>

        {/* 设备标签 */}
        <Html position={[0, getSize() + 0.5, 0]} center distanceFactor={10}>
          <div
            className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-all ${
              isSelected ? "bg-primary text-primary-foreground" : "bg-card/90 text-card-foreground"
            }`}
          >
            {device.name}
          </div>
        </Html>
      </group>
    </Float>
  )
}

function ConnectionLines() {
  const hubPosition = new THREE.Vector3(0, 0, 0)

  return (
    <group>
      {devices
        .filter((d) => d.type !== "hub")
        .map((device, index) => {
          const devicePosition = new THREE.Vector3(...device.position)
          const points = [hubPosition, devicePosition]
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

          return (
            <line key={device.id} geometry={lineGeometry}>
              <lineBasicMaterial
                color={device.status === "offline" ? "#ef4444" : "#3b82f6"}
                transparent
                opacity={0.4}
                linewidth={1}
              />
            </line>
          )
        })}
    </group>
  )
}

function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[20, 20, 20, 20]} />
      <meshStandardMaterial color="#1a1a2e" wireframe transparent opacity={0.3} />
    </mesh>
  )
}

export function Scene3D({ selectedDevice, onSelectDevice }: Scene3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22c55e" />
          <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.5} penumbra={1} />

          <Environment preset="night" />

          <ConnectionLines />
          <GridFloor />

          {devices.map((device) => (
            <DeviceNode
              key={device.id}
              device={device}
              isSelected={selectedDevice === device.id}
              onSelect={() => onSelectDevice(selectedDevice === device.id ? null : device.id)}
            />
          ))}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
