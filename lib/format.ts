// 숫자 포맷팅 유틸리티

/**
 * 숫자를 천단위 콤마가 포함된 문자열로 변환
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

/**
 * 숫자를 원화 형식으로 변환 (예: 1,000,000원)
 */
export function formatCurrency(value: number): string {
  return `${formatNumber(value)}원`;
}

/**
 * 콤마가 포함된 문자열을 숫자로 변환
 */
export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * 입력값에서 숫자만 추출하여 포맷팅된 문자열 반환
 */
export function formatInputValue(value: string): string {
  const num = parseFormattedNumber(value);
  return num > 0 ? formatNumber(num) : '';
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
