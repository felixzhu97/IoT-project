"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Scene3D } from "./scene-3d"
import { DevicePanel } from "./device-panel"
import { ChartsPanel } from "./charts-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@iot/ui"
import { Network, BarChart3 } from "lucide-react"

export function IoTDashboard() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">设备网络</h1>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">12 设备在线</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />
              实时同步
            </div>
          </div>
        </header>
        <Tabs defaultValue="network" className="flex-1 flex flex-col">
          <div className="border-b border-border px-6">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger value="network" className="data-[state=active]:bg-secondary gap-2">
                <Network className="w-4 h-4" />
                设备网络
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-secondary gap-2">
                <BarChart3 className="w-4 h-4" />
                数据分析
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="network" className="flex-1 flex m-0">
            <div className="flex-1 relative">
              <Scene3D selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />
            </div>
            <div className="w-80 border-l border-border">
              <DevicePanel selectedDevice={selectedDevice} />
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="flex-1 overflow-auto m-0">
            <ChartsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
