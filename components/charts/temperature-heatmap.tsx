"use client"

import { useEffect, useRef } from "react"
import * as echarts from "echarts"

export function TemperatureHeatmap() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current, "dark")

    const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
    const sensors = ["传感器A", "传感器B", "传感器C"]

    const data: [number, number, number][] = []
    for (let i = 0; i < sensors.length; i++) {
      for (let j = 0; j < hours.length; j++) {
        data.push([j, i, Math.round(20 + Math.random() * 15)])
      }
    }

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        position: "top",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "#22d3ee",
        textStyle: { color: "#e2e8f0" },
        formatter: (params: any) => `${sensors[params.value[1]]}<br/>${hours[params.value[0]]}: ${params.value[2]}°C`,
      },
      grid: {
        top: 10,
        right: 60,
        bottom: 30,
        left: 70,
      },
      xAxis: {
        type: "category",
        data: hours,
        splitArea: { show: true },
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94a3b8", fontSize: 10 },
      },
      yAxis: {
        type: "category",
        data: sensors,
        splitArea: { show: true },
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94a3b8", fontSize: 10 },
      },
      visualMap: {
        min: 18,
        max: 35,
        calculable: true,
        orient: "vertical",
        right: 0,
        top: "center",
        textStyle: { color: "#94a3b8", fontSize: 10 },
        inRange: {
          color: ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#ef4444"],
        },
      },
      series: [
        {
          name: "温度",
          type: "heatmap",
          data: data,
          label: {
            show: true,
            color: "#fff",
            fontSize: 10,
            formatter: (params: any) => params.value[2],
          },
          itemStyle: {
            borderColor: "#0f172a",
            borderWidth: 2,
            borderRadius: 4,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    }

    chartInstance.current.setOption(option)

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  return <div ref={chartRef} className="w-full h-full min-h-[160px]" />
}
