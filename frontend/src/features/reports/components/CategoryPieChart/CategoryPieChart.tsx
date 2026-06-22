import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatMoney } from "../../../../utils/formatMoney";
import ChartPanel from "../ChartPanel/ChartPanel";
import styles from "./CategoryPieChart.module.css";
import type { CategoryReportItem } from "../../types/report";

interface CategoryPieChartProps {
  data: CategoryReportItem[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  return (
    <ChartPanel title="Chi tiêu theo danh mục" icon={PieChartIcon}>
      <div className={styles.content}>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={86}
                paddingAngle={3}
              >
                {data.map((item) => (
                  <Cell key={item.category_id} fill={item.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.legend}>
          {data.map((item) => (
            <div key={item.category_id} className={styles.legendItem}>
              <span className={styles.dot} style={{ backgroundColor: item.color }} />
              <span className={styles.name}>{item.name}</span>
              <strong>{item.percentage.toFixed(1)}%</strong>
            </div>
          ))}
        </div>
      </div>
    </ChartPanel>
  );
};

export default CategoryPieChart;
