const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  return num
    .toString()
    .replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)] || d);
}

export const persianNumber = toPersianDigits;

export function formatDistance(km: number): string {

  if (km < 1) {
    return 'کمتر از ۱ کیلومتر';
  }
  return `${toPersianDigits(km)} کیلومتری شما`;
}

export function formatAge(age: number): string {
  return `${toPersianDigits(age)} سال`;
}
