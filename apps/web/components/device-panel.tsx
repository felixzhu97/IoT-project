"use client"

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@iot/ui"
import { Wifi, Thermometer, Camera, Zap, Clock, Signal } from "lucide-react"

interface DevicePanelProps {
  selectedDevice: string | null
}

const deviceDetails: Record<
  string,
  {
    name: string
    type: string
    status: string
    ip: string
    lastSeen: string
    metrics: { label: string; value: string }[]
  }
> = {
  "hub-001": {
    name: "中央网关",
    type: "网关设备",
    status: "online",
    ip: "192.168.1.1",
    lastSeen: "实时在线",
    metrics: [
      { label: "连接设备", value: "7" },
      { label: "数据吞吐", value: "1.2 GB/h" },
      { label: "运行时间", value: "45 天" },
    ],
  },
  "sensor-001": {
    name: "温度传感器 A",
    type: "环境传感器",
    status: "online",
    ip: "192.168.1.10",
    lastSeen: "2秒前",
    metrics: [
      { label: "当前温度", value: "24.5°C" },
      { label: "湿度", value: "65%" },
      { label: "电池", value: "85%" },
    ],
  },
  "sensor-002": {
    name: "温度传感器 B",
    type: "环境传感器",
    status: "online",
    ip: "192.168.1.11",
    lastSeen: "1秒前",
    metrics: [
      { label: "当前温度", value: "22.1°C" },
      { label: "湿度", value: "58%" },
      { label: "电池", value: "92%" },
    ],
  },
  "sensor-003": {
    name: "湿度传感器",
    type: "环境传感器",
    status: "warning",
    ip: "192.168.1.12",
    lastSeen: "5分钟前",
    metrics: [
      { label: "湿度", value: "78%" },
      { label: "温度", value: "26.3°C" },
      { label: "电池", value: "15%" },
    ],
  },
  "camera-001": {
    name: "监控摄像头 1",
    type: "视频设备",
    status: "online",
    ip: "192.168.1.20",
    lastSeen: "实时在线",
    metrics: [
      { label: "分辨率", value: "1080p" },
      { label: "帧率", value: "30 fps" },
      { label: "存储", value: "256 GB" },
    ],
  },
  "camera-002": {
    name: "监控摄像头 2",
    type: "视频设备",
    status: "online",
    ip: "192.168.1.21",
    lastSeen: "实时在线",
    metrics: [
      { label: "分辨率", value: "4K" },
      { label: "帧率", value: "60 fps" },
      { label: "存储", value: "512 GB" },
    ],
  },
  "actuator-001": {
    name: "智能开关",
    type: "执行器",
    status: "online",
    ip: "192.168.1.30",
    lastSeen: "1秒前",
    metrics: [
      { label: "状态", value: "开启" },
      { label: "功率", value: "150W" },
      { label: "今日用电", value: "2.4 kWh" },
    ],
  },
  "actuator-002": {
    name: "电机控制器",
    type: "执行器",
    status: "offline",
    ip: "192.168.1.31",
    lastSeen: "2小时前",
    metrics: [
      { label: "状态", value: "离线" },
      { label: "转速", value: "N/A" },
      { label: "错误", value: "连接超时" },
    ],
  },
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-chart-3 text-chart-3"
    case "warning":
      return "bg-accent text-accent"
    case "offline":
      return "bg-destructive text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "online":
      return "在线"
    case "warning":
      return "警告"
    case "offline":
      return "离线"
    default:
      return "未知"
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case "网关设备":
      return Wifi
    case "环境传感器":
      return Thermometer
    case "视频设备":
      return Camera
    case "执行器":
      return Zap
    default:
      return Signal
  }
}

export function DevicePanel({ selectedDevice }: DevicePanelProps) {
  const device = selectedDevice ? deviceDetails[selectedDevice] : null

  if (!device) {
    return (
      <div className="flex-1 p-4">
        <Card className="h-full bg-card border-border">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Signal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">点击3D场景中的设备</p>
              <p className="text-sm">查看详细信息</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = getIcon(device.type)

  return (
    <div className="flex-1 p-4 overflow-auto">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base text-card-foreground">{device.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{device.type}</p>
              </div>
            </div>
            <Badge variant="outline" className={`${getStatusColor(device.status)} border-current`}>
              {getStatusText(device.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IP 地址</span>
              <span className="font-mono text-card-foreground">{device.ip}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> 最后响应
              </span>
              <span className="text-card-foreground">{device.lastSeen}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-3">设备指标</p>
            <div className="space-y-3">
              {device.metrics.map((metric) => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="text-sm font-semibold text-card-foreground">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
