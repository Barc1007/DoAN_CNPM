/**
 * Formats a date to "Thứ ..., ngày ..., tháng ..., ..." format
 * or simple "14 thg 4"
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayName = weekdays[d.getDay()];
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  return `${dayName}, ${day} tháng ${month}, ${year}`;
};

export const formatShortDate = (date: Date | string | number): string => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day} thg ${month}`;
};
