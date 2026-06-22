import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import ChartPanel from "../ChartPanel/ChartPanel";
import styles from "./CashflowBarChart.module.css";
import type { CashflowPoint } from "../../types/report";

interface CashflowBarChartProps {
  data: CashflowPoint[];
}

const CashflowBarChart: React.FC<CashflowBarChartProps> = ({ data }) => {
  return (
    <ChartPanel title="Thu chi theo thời gian" icon={BarChart3}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d8dee6" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} cursor={{ fill: "#f4f6f8" }} />
            <Legend iconType="circle" />
            <Bar dataKey="income" name="Thu nhập" fill="#2f8f89" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" name="Chi tiêu" fill="#d19832" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
};

export default CashflowBarChart;
