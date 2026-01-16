"use client"

import { useEffect, useRef } from "react"
import * as echarts from "echarts"

export function RealtimeChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current, "dark")

    const data: number[] = []
    const xAxisData: string[] = []
    const now = Date.now()

    for (let i = 0; i < 60; i++) {
      const time = new Date(now - (59 - i) * 1000)
      xAxisData.push(time.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      data.push(Math.random() * 100 + 50)
    }

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      grid: {
        top: 30,
        right: 20,
        bottom: 30,
        left: 50,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "#22d3ee",
        textStyle: { color: "#e2e8f0" },
      },
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          name: "数据流量",
          type: "line",
          smooth: true,
          symbol: "none",
          data: data,
          lineStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "#06b6d4" },
              { offset: 1, color: "#22d3ee" },
            ]),
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(34, 211, 238, 0.3)" },
              { offset: 1, color: "rgba(34, 211, 238, 0)" },
            ]),
          },
        },
      ],
    }

    chartInstance.current.setOption(option)

    // 实时更新数据
    const interval = setInterval(() => {
      const now = new Date()
      xAxisData.shift()
      xAxisData.push(now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      data.shift()
      data.push(Math.random() * 100 + 50)

      chartInstance.current?.setOption({
        xAxis: { data: xAxisData },
        series: [{ data: data }],
      })
    }, 1000)

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener("resize", handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  return <div ref={chartRef} className="w-full h-full min-h-[200px]" />
}
