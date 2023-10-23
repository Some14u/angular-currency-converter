export const formatCurrency = (value: number): number => {
  if (!isNaN(value)) {
    return Number(value.toFixed(2));
  }
  return value;
};
