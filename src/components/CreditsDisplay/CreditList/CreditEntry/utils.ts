import { CREDIT_USAGE, type CreditUsageType } from '../../../../types';
export function parseCreditValue(raw: string | number | null | undefined): number | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'number' && isFinite(raw) && raw > 0) return Math.floor(raw);
  if (typeof raw === 'string') {
    // Strip $ and commas and whitespace
    const num = Number(raw.replace(/[^0-9.]/g, ''));
    if (isFinite(num) && num > 0) return Math.floor(num);
  }
  return undefined;
}

export function getMaxValue(creditMaxValue?: number): number {
  const parsed = typeof creditMaxValue === 'number' && isFinite(creditMaxValue) && creditMaxValue > 0
    ? Math.floor(creditMaxValue)
    : undefined;
  return parsed ?? 100;
}

export function clampValue(value: number, maxValue: number): number {
  if (!isFinite(value)) return 0;
  return Math.max(0, Math.min(maxValue, Math.round(value)));
}

export function getValueForUsage(usage: CreditUsageType, maxValue: number): number {
  switch (usage) {
    case CREDIT_USAGE.USED:
      return maxValue;
    case CREDIT_USAGE.PARTIALLY_USED:
      return Math.ceil(maxValue / 2);
    case CREDIT_USAGE.NOT_USED:
    case CREDIT_USAGE.INACTIVE:
    case CREDIT_USAGE.FUTURE:
      return 0;
    default:
      return 0;
  }
}

export function getUsageForValue(value: number, maxValue: number): CreditUsageType {
  if (value <= 0) return CREDIT_USAGE.NOT_USED;
  if (value >= maxValue) return CREDIT_USAGE.USED;
  return CREDIT_USAGE.PARTIALLY_USED;
}


