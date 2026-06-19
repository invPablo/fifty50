import type { CurrencyCode } from '@/types/models';

export const Currencies: { code: CurrencyCode; symbol: string }[] = [
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
];

export function currencySymbol(code: CurrencyCode): string {
  return Currencies.find((c) => c.code === code)?.symbol ?? code;
}
