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
import type { ExpenseTrendPoint, ReportPeriod } from "../../types/report";
import { formatMoneyAxis } from "../../utils/formatReportAxis";

interface ExpenseTrendChartProps {
  data: ExpenseTrendPoint[];
  period: ReportPeriod;
}

const TREND_TITLES: Record<ReportPeriod, string> = {
  week: "Xu hướng chi tiêu tuần này",
  month: "Xu hướng chi tiêu tháng này",
  quarter: "Xu hướng chi tiêu quý này",
  year: "Xu hướng chi tiêu năm nay",
};

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ data, period }) => {
  const chartKey = data.map((item) => `${item.date}-${item.amount}`).join("|");
  const maxAmount = Math.max(0, ...data.map((item) => item.amount));
  const yAxisProps = maxAmount > 0 ? {} : { domain: [0, 1] as [number, number], ticks: [0] };

  return (
    <ChartPanel title={TREND_TITLES[period]} icon={CalendarDays}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart key={chartKey} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7edf3" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              {...yAxisProps}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={formatMoneyAxis}
            />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Line
              type="monotone"
              dataKey="amount"
              name="Chi tiêu"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 5, strokeWidth: 3, fill: "#ffffff" }}
              activeDot={{ r: 7, strokeWidth: 3 }}
              isAnimationActive
              animationBegin={180}
              animationDuration={1100}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
};

export default ExpenseTrendChart;
