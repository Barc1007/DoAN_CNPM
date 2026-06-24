import React from 'react';
import type { SettingSectionType } from '../types/settings';
import SettingItem from './SettingItem';
import styles from './SettingSection.module.css';

interface SettingSectionProps {
  section: SettingSectionType;
  onToggle?: (id: string, value: boolean) => void;
  onLinkClick?: (id: string) => void;
}

const SettingSection: React.FC<SettingSectionProps> = ({ section, onToggle, onLinkClick }) => {
  const { title, icon: Icon, items } = section;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        {Icon && <Icon size={18} className={styles.sectionIcon} />}
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.itemsContainer}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <SettingItem item={item} onToggle={onToggle} onLinkClick={onLinkClick} />
            {index < items.length - 1 && <div className={styles.divider} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SettingSection;
