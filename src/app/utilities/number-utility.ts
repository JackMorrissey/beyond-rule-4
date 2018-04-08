export const round = (val: number, decimalDigits: number = 2) => {
  return Number(val.toFixed(decimalDigits));
};
