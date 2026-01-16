"use client"

import { useEffect, useRef } from "react"
import * as echarts from "echarts"

interface DeviceGaugeProps {
  value: number
  title: string
  color: string
}

export function DeviceGauge({ value, title, color }: DeviceGaugeProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current, "dark")

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      series: [
        {
          type: "gauge",
          startAngle: 200,
          endAngle: -20,
          center: ["50%", "60%"],
          radius: "90%",
          min: 0,
          max: 100,
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [0.3, "#16a34a"],
                [0.7, color],
                [1, "#dc2626"],
              ],
            },
          },
          pointer: {
            icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
            length: "50%",
            width: 8,
            offsetCenter: [0, "-10%"],
            itemStyle: { color: "auto" },
          },
          axisTick: {
            length: 8,
            lineStyle: { color: "auto", width: 1 },
          },
          splitLine: {
            length: 12,
            lineStyle: { color: "auto", width: 2 },
          },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 10,
            distance: 15,
          },
          title: {
            offsetCenter: [0, "70%"],
            fontSize: 12,
            color: "#94a3b8",
          },
          detail: {
            fontSize: 20,
            offsetCenter: [0, "40%"],
            valueAnimation: true,
            formatter: "{value}%",
            color: "#e2e8f0",
          },
          data: [{ value, name: title }],
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
  }, [value, title, color])

  return <div ref={chartRef} className="w-full h-full min-h-[150px]" />
}
