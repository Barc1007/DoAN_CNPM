import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Utensils, Home, GraduationCap, Gamepad2 } from "lucide-react";
import styles from "./ChartCard.module.css";
import { formatMoney } from "../../../../utils/formatMoney";
import type { CategorySpend } from "../../../../types/dashboard";

interface ChartCardProps {
  category_spent: CategorySpend[];
  total_expense: number;
}

const ICONS = [Utensils, Home, GraduationCap, Gamepad2];

const ChartCard: React.FC<ChartCardProps> = ({ category_spent, total_expense }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Chi tiêu theo danh mục</h3>
      
      <div className={styles.content}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={category_spent}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={5}
                dataKey="amount"
              >
                {category_spent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className={styles.chartInfo}>
            <p className={styles.chartInfoLabel}>Tổng chi</p>
            <p className={styles.chartInfoValue}>{formatMoney(total_expense)}</p>
          </div>
        </div>

        <div className={styles.legend}>
          {category_spent.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <div key={item.name} className={styles.legendItem}>
                <div className={styles.legendLeft}>
                  <div 
                    className={styles.iconBox} 
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className={styles.categoryName}>{item.name}</p>
                    <p className={styles.categoryPercent}>{item.percentage}%</p>
                  </div>
                </div>
                <p className={styles.categoryAmount}>{formatMoney(item.amount)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
