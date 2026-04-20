/**
 * Formats a number to Vietnamese Dong (VND)
 * Example: 12450000 -> 12.450.000 đ
 */
export const formatMoney = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
};
