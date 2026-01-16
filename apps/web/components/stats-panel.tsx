"use client"

import { Card, CardContent } from "@iot/ui"
import { Activity, Zap, Database, AlertTriangle } from "lucide-react"

const stats = [
  {
    title: "数据流量",
    value: "2.4 TB",
    change: "+12%",
    icon: Database,
    color: "text-chart-1",
  },
  {
    title: "活跃连接",
    value: "156",
    change: "+8",
    icon: Activity,
    color: "text-chart-3",
  },
  {
    title: "能耗统计",
    value: "48.2 kWh",
    change: "-5%",
    icon: Zap,
    color: "text-accent",
  },
  {
    title: "活跃告警",
    value: "3",
    change: "+1",
    icon: AlertTriangle,
    color: "text-destructive",
  },
]

export function StatsPanel() {
  return (
    <div className="p-4 border-t border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">系统概览</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-secondary border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
              <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
