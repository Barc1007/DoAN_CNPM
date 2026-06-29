const numberFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
});

export const formatMoneyAxis = (value: number | string): string => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount === 0) {
    return "0đ";
  }

  if (Math.abs(amount) < 1_000_000) {
    return `${numberFormatter.format(amount)}đ`;
  }

  return `${numberFormatter.format(amount / 1_000_000)}tr`;
};
