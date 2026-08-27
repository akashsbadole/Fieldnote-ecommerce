"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="h-56 w-full border border-line p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--color-muted)" }}
            axisLine={{ stroke: "var(--color-line)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={45}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
            contentStyle={{
              background: "var(--color-ink)",
              border: "none",
              borderRadius: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--color-paper)",
            }}
            labelStyle={{ color: "var(--color-paper)" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-rust)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-rust)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
