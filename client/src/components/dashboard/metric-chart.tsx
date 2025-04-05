import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricChartProps } from "@/types";
import Chart from "chart.js/auto";

export default function MetricChart({ 
  title, 
  chartData, 
  type = "line",
  height = 225
}: MetricChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type,
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                }
              },
              x: {
                grid: {
                  display: false,
                  drawBorder: false
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, type]);

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <Select defaultValue="7d">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Past 24 hours</SelectItem>
              <SelectItem value="7d">Past 7 days</SelectItem>
              <SelectItem value="30d">Past 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div style={{ height: `${height}px` }}>
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
