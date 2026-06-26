import type { ElementType } from 'react';

export interface SettingItemType {
  id: string;
  icon: ElementType;
  label: string;
  description?: string;
  value?: boolean | string;
  type: 'toggle' | 'link' | 'select';
  path?: string;
}

export interface SettingSectionType {
  id: string;
  title: string;
  icon?: ElementType;
  items: SettingItemType[];
}
