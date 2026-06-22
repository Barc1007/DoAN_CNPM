import React from "react";
import { formatMoney } from "../../../../utils/formatMoney";
import styles from "./CategoryBreakdownTable.module.css";
import type { CategoryReportItem } from "../../types/report";

interface CategoryBreakdownTableProps {
  data: CategoryReportItem[];
}

const CategoryBreakdownTable: React.FC<CategoryBreakdownTableProps> = ({ data }) => {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>Chi tiết theo danh mục</h2>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Danh mục</th>
              <th>Số tiền</th>
              <th>Tỷ lệ</th>
              <th>So với kỳ trước</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const isIncrease = item.previous_change > 0;

              return (
                <tr key={item.category_id}>
                  <td>
                    <span className={styles.categoryName}>
                      <span className={styles.dot} style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                  </td>
                  <td className={styles.amount}>{formatMoney(item.amount)}</td>
                  <td>{item.percentage.toFixed(1)}%</td>
                  <td className={isIncrease ? styles.increase : styles.decrease}>
                    {isIncrease ? "+" : ""}
                    {item.previous_change}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CategoryBreakdownTable;
