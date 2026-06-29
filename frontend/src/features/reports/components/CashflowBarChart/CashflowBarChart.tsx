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
import { formatMoneyAxis } from "../../utils/formatReportAxis";

interface CashflowBarChartProps {
  data: CashflowPoint[];
}

const CashflowBarChart: React.FC<CashflowBarChartProps> = ({ data }) => {
  const chartKey = data.map((item) => `${item.label}-${item.income}-${item.expense}`).join("|");
  const maxAmount = Math.max(0, ...data.flatMap((item) => [item.income, item.expense]));
  const yAxisProps = maxAmount > 0 ? {} : { domain: [0, 1] as [number, number], ticks: [0] };

  return (
    <ChartPanel title="Dòng tiền thu chi" icon={BarChart3}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart key={chartKey} data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7edf3" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              {...yAxisProps}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={formatMoneyAxis}
            />
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              cursor={{ fill: "#f4f6f8" }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar
              dataKey="income"
              name="Thu nhập"
              fill="#18b985"
              radius={[8, 8, 0, 0]}
              isAnimationActive
              animationBegin={120}
              animationDuration={900}
            />
            <Bar
              dataKey="expense"
              name="Chi tiêu"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
              isAnimationActive
              animationBegin={260}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
};

export default CashflowBarChart;
