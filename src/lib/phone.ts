export function formatCustomerPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  let spanishNumber = "";

  if (/^[6789]\d{8}$/.test(digits)) {
    spanishNumber = digits;
  } else if (/^34[6789]\d{8}$/.test(digits)) {
    spanishNumber = digits.slice(2);
  } else if (/^0034[6789]\d{8}$/.test(digits)) {
    spanishNumber = digits.slice(4);
  }

  if (!spanishNumber) return trimmed;

  return `+34 ${spanishNumber.slice(0, 3)} ${spanishNumber.slice(3, 5)} ${spanishNumber.slice(5, 7)} ${spanishNumber.slice(7, 9)}`;
}
