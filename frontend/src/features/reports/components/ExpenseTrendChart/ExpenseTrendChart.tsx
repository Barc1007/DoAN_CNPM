import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import ChartPanel from "../ChartPanel/ChartPanel";
import styles from "./ExpenseTrendChart.module.css";
import type { ExpenseTrendPoint } from "../../types/report";

interface ExpenseTrendChartProps {
  data: ExpenseTrendPoint[];
}

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ data }) => {
  return (
    <ChartPanel title="Xu hướng chi tiêu" icon={CalendarDays}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(value) => `${Number(value) / 1000000}tr`}
            />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Line
              type="monotone"
              dataKey="amount"
              name="Chi tiêu"
              stroke="#2f8f89"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
};

export default ExpenseTrendChart;