"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function TrafficBarChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, "dark");

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "#22d3ee",
        textStyle: { color: "#e2e8f0" },
      },
      grid: {
        top: 30,
        right: 20,
        bottom: 40,
        left: 50,
      },
      xAxis: {
        type: "category",
        data: [
          "网关",
          "传感器A",
          "传感器B",
          "摄像头1",
          "摄像头2",
          "开关",
          "控制器",
        ],
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { color: "#94a3b8", fontSize: 10, rotate: 30 },
      },
      yAxis: {
        type: "value",
        name: "MB/s",
        nameTextStyle: { color: "#94a3b8" },
        axisLine: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          name: "上行流量",
          type: "bar",
          stack: "total",
          barWidth: 20,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#06b6d4" },
              { offset: 1, color: "#0891b2" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: [120, 45, 38, 85, 92, 15, 0],
        },
        {
          name: "下行流量",
          type: "bar",
          stack: "total",
          barWidth: 20,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#f97316" },
              { offset: 1, color: "#ea580c" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: [80, 12, 10, 120, 135, 8, 0],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  return <div ref={chartRef} className="w-full h-full min-h-[200px]" />;
}
