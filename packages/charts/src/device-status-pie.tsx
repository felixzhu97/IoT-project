"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function DeviceStatusPie() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, "dark");

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "#22d3ee",
        textStyle: { color: "#e2e8f0" },
      },
      legend: {
        orient: "vertical",
        right: 10,
        top: "center",
        textStyle: { color: "#94a3b8", fontSize: 11 },
      },
      series: [
        {
          name: "设备状态",
          type: "pie",
          radius: ["45%", "70%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#0f172a",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              color: "#e2e8f0",
            },
          },
          labelLine: { show: false },
          data: [
            { value: 12, name: "在线", itemStyle: { color: "#22c55e" } },
            { value: 2, name: "警告", itemStyle: { color: "#f97316" } },
            { value: 1, name: "离线", itemStyle: { color: "#ef4444" } },
          ],
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

  return <div ref={chartRef} className="w-full h-full min-h-[180px]" />;
}
