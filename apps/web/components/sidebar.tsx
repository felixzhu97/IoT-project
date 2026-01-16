"use client"

import { LayoutDashboard, Cpu, Activity, Settings, Bell, Network, Shield, BarChart3 } from "lucide-react"
import { cn } from "@iot/utils"

const navItems = [
  { icon: LayoutDashboard, label: "仪表盘", active: true },
  { icon: Network, label: "设备网络", active: false },
  { icon: Cpu, label: "设备管理", active: false },
  { icon: Activity, label: "实时监控", active: false },
  { icon: BarChart3, label: "数据分析", active: false },
  { icon: Shield, label: "安全中心", active: false },
  { icon: Bell, label: "告警中心", active: false },
  { icon: Settings, label: "系统设置", active: false },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Network className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">IoT Hub</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              item.active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-xs text-muted-foreground mb-2">系统状态</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-chart-3" />
            <span className="text-sm font-medium text-foreground">运行正常</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
