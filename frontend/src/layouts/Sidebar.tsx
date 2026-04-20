import React from "react";
import { 
  Home, 
  Wallet, 
  ArrowRightLeft, 
  LayoutGrid, 
  PieChart, 
  Target, 
  Bell, 
  Settings, 
  LogOut,
  Wallet2
} from "lucide-react";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Trang chủ", active: true },
  { icon: Wallet, label: "Ví của tôi" },
  { icon: ArrowRightLeft, label: "Giao dịch" },
  { icon: LayoutGrid, label: "Danh mục" },
  { icon: PieChart, label: "Ngân sách" },
  { icon: Target, label: "Mục tiêu" },
  { icon: PieChart, label: "Báo cáo" },
  { icon: Bell, label: "Thông báo" },
  { icon: Settings, label: "Cài đặt" },
];

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Wallet2 size={24} />
        </div>
        <div>
          <h1 className={styles.logoText}>StudentMoney</h1>
          <span className={styles.logoSub}>Quản lý chi tiêu</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <a 
                href="#" 
                className={clsx(styles.navItem, item.active && styles.active)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.profileCard}>
        <div className={styles.avatar}>SV</div>
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>Sinh Viên A</p>
          <p className={styles.profileEmail}>sinhvien@edu.vn</p>
        </div>
        <button className={styles.logoutBtn}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
