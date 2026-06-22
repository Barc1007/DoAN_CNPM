import React from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./ChartPanel.module.css";

interface ChartPanelProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}

const ChartPanel: React.FC<ChartPanelProps> = ({
  title,
  icon: Icon,
  className = "",
  children,
}) => {
  return (
    <section className={`${styles.panel} ${className}`}>
      <div className={styles.header}>
        <h2>{title}</h2>
        {Icon && <Icon size={18} className={styles.icon} />}
      </div>
      {children}
    </section>
  );
};

export default ChartPanel;
