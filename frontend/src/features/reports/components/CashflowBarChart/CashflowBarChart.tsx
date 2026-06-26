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
    <ChartPanel title="Dòng tiền thu chi" icon={BarChart3}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(value) => `${Number(value) / 1000000}tr`}
            />
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              cursor={{ fill: "#f4f6f8" }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="income" name="Thu nhập" fill="#2f8f89" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Chi tiêu" fill="#a74756" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
};

export default CashflowBarChart;