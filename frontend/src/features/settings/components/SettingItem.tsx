import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { SettingItemType } from '../types/settings';
import styles from './SettingItem.module.css';
import clsx from 'clsx';

interface SettingItemProps {
  item: SettingItemType;
  onToggle?: (id: string, value: boolean) => void;
  onLinkClick?: (id: string) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ item, onToggle, onLinkClick }) => {
  const { icon: Icon, label, description, type, value, id } = item;

  const handleClick = () => {
    if (type === 'link' && onLinkClick) {
      onLinkClick(id);
    }
  };

  return (
    <div className={clsx(styles.item, type === 'link' && styles.clickable)} onClick={handleClick}>
      <div className={styles.iconContainer}>
        <Icon size={20} className={styles.icon} />
      </div>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
      <div className={styles.action}>
        {type === 'toggle' && (
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={!!value} 
              onChange={(e) => onToggle?.(item.id, e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        )}
        {type === 'link' && <ChevronRight size={18} className={styles.arrow} />}
        {type === 'select' && <span className={styles.value}>{value}</span>}
      </div>
    </div>
  );
};

export default SettingItem;
