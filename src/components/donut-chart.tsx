"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface DonutChartProps {
  title: string;
  data: ChartData[];
  icon?: React.ReactNode;
}

const COLORS = [
  "#10B981", // Emerald (Em dia)
  "#F59E0B", // Amber (Atenção)
  "#EF4444", // Red (Crítico)
  "#7C3AED", // Violet (Atrasado)
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#6366F1", // Indigo
];

export function DonutChart({ title, data, icon }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Use custom colors if provided, otherwise use default
  const getColor = (index: number, item: ChartData) => {
    return item.color || COLORS[index % COLORS.length];
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="shrink-0 text-blue-600">{icon}</span>}
          <CardTitle className="truncate text-base font-semibold text-gray-900 sm:text-lg">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-center">
          <div className="relative h-48 w-48 sm:h-64 sm:w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((item, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(index, item)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} (${Math.round((Number(value) / total) * 100)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
                style={{ backgroundColor: getColor(index, item) }}
              />
              <span className="text-[10px] text-gray-600 sm:text-xs">
                {item.name} {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
