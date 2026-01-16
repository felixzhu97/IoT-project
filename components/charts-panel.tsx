"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RealtimeChart } from "./charts/realtime-chart"
import { DeviceStatusPie } from "./charts/device-status-pie"
import { TrafficBarChart } from "./charts/traffic-bar-chart"
import { TemperatureHeatmap } from "./charts/temperature-heatmap"
import { DeviceGauge } from "./charts/device-gauge"

export function ChartsPanel() {
  return (
    <div className="p-4 space-y-4">
      {/* 第一行：实时流量 + 设备状态 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">实时数据流量</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <RealtimeChart />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">设备状态分布</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <DeviceStatusPie />
          </CardContent>
        </Card>
      </div>

      {/* 第二行：设备流量 + 温度热力图 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">设备流量统计</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <TrafficBarChart />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">传感器温度分布</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <TemperatureHeatmap />
          </CardContent>
        </Card>
      </div>

      {/* 第三行：仪表盘 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="py-2">
            <CardTitle className="text-xs font-medium text-card-foreground">CPU 使用率</CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] pt-0">
            <DeviceGauge value={68} title="CPU" color="#f97316" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="py-2">
            <CardTitle className="text-xs font-medium text-card-foreground">内存占用</CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] pt-0">
            <DeviceGauge value={45} title="内存" color="#06b6d4" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="py-2">
            <CardTitle className="text-xs font-medium text-card-foreground">网络负载</CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] pt-0">
            <DeviceGauge value={72} title="网络" color="#8b5cf6" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="py-2">
            <CardTitle className="text-xs font-medium text-card-foreground">存储空间</CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] pt-0">
            <DeviceGauge value={56} title="存储" color="#22c55e" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
