// 세금 계산 관련 상수
export const TAX_CONSTANTS = {
  // 현행 제도
  BASIC_DEDUCTION: 2_500_000,       // 기본공제 250만원
  NATIONAL_TAX_RATE: 0.20,          // 국세 20%
  LOCAL_TAX_RATE: 0.02,             // 지방소득세 2%
  TOTAL_TAX_RATE: 0.22,             // 합계 22%

  // 추가공제 관련 (2025.12.24 기획재정부 발표)
  RIA_LIMIT: 50_000_000,            // RIA 매도금액 한도 5천만원
  HEDGE_LIMIT: 100_000_000,         // 환헷지 인정한도 1억원
  HEDGE_DEDUCTION_RATE: 0.05,       // 환헷지 공제율 5%
  HEDGE_MAX_DEDUCTION: 5_000_000,   // 환헷지 최대 공제 500만원

  // RIA 감면율
  RIA_DISCOUNT_1Q: 1.0,             // 1분기 100%
  RIA_DISCOUNT_2Q: 0.8,             // 2분기 80%
  RIA_DISCOUNT_H2: 0.5,             // 하반기 50%
} as const;

export type ReturnQuarter = '1Q' | '2Q' | 'H2';

export const QUARTER_LABELS: Record<ReturnQuarter, string> = {
  '1Q': '2026년 1분기 (100% 감면)',
  '2Q': '2026년 2분기 (80% 감면)',
  'H2': '2026년 하반기 (50% 감면)',
};
