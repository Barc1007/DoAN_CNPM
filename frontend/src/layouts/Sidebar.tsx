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
import { useAuth } from "../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Ánh xạ thuộc tính snake_case từ schema User
  const displayName = user?.full_name || user?.username || "Khách";
  const displayEmail = user?.email || "guest@studentmoney.com";
  // Sinh ký tự Avatar từ chữ cái đầu
  const initials = displayName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "SV";

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
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>{displayName}</p>
          <p className={styles.profileEmail}>{displayEmail}</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
