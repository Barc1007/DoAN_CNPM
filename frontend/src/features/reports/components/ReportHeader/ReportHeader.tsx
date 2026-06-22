import React from "react";
import { Download, Filter } from "lucide-react";
import styles from "./ReportHeader.module.css";

interface ReportHeaderProps {
  isExporting: boolean;
  exportedFileName: string | null;
  onExport: () => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  isExporting,
  exportedFileName,
  onExport,
}) => {
  return (
    <header className={styles.header}>
      <div>
        <h1>Báo cáo & Thống kê</h1>
        <p>Phân tích chi tiết thu chi và xu hướng tài chính</p>
      </div>

      <div className={styles.actions}>
        {exportedFileName && (
          <span className={styles.exportHint}>Đã tạo {exportedFileName}</span>
        )}
        <button className={styles.secondaryButton} type="button" title="Lọc dữ liệu">
          <Filter size={16} />
          <span>Lọc</span>
        </button>
        <button
          className={styles.exportButton}
          type="button"
          onClick={onExport}
          disabled={isExporting}
          title="Xuất báo cáo"
        >
          <Download size={16} />
          <span>{isExporting ? "Đang xuất..." : "Xuất báo cáo"}</span>
        </button>
      </div>
    </header>
  );
};

export default ReportHeader;
