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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d8dee6" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Line
              type="monotone"
              dataKey="amount"
              name="Chi tiêu"
              stroke="#4f6f9f"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fbfcfd" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
};

export default ExpenseTrendChart;
