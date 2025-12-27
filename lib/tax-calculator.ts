import { TAX_CONSTANTS, ReturnQuarter } from './constants';

// 현행 제도 입력 타입
export interface CurrentTaxInput {
  acquisitionCost: number;  // 취득가액
  saleCost: number;         // 매도가액
  expenses: number;         // 필요경비
  otherGains: number;       // 기타 양도소득금액
}

// 세금 계산 결과 타입
export interface TaxResult {
  capitalGain: number;      // 양도차익
  totalGains: number;       // 총 양도소득금액
  basicDeduction: number;   // 기본공제
  taxBase: number;          // 과세표준
  nationalTax: number;      // 국세 (20%)
  localTax: number;         // 지방소득세 (2%)
  totalTax: number;         // 총 세금
  netProceeds: number;      // 실수령액
}

// 추가공제 입력 타입
export interface AdditionalDeductionInput {
  applyRIA: boolean;              // RIA 공제 적용 여부
  returnQuarter: ReturnQuarter;   // 복귀 시기
  applyHedge: boolean;            // 환헷지 공제 적용 여부
  hedgeAmount: number;            // 환헷지 금액
}

// 추가공제 결과 타입
export interface AdditionalTaxResult extends TaxResult {
  riaEligibleGain: number;        // RIA 대상 양도차익 (양도차익과 5천만원 중 작은 값)
  riaDeduction: number;           // RIA 비과세 양도차익 (대상 양도차익 × 감면율)
  riaDiscountRate: number;        // RIA 감면율
  hedgeDeduction: number;         // 환헷지 공제액 (소득공제)
  adjustedTotalGains: number;     // 공제 후 양도소득금액
  riaTaxSaving: number;           // RIA에 의한 절세액
  hedgeTaxSaving: number;         // 환헷지에 의한 절세액
  taxSaving: number;              // 개정법안적용시 총 절세효과
}

/**
 * 현행 제도 양도소득세 계산
 */
export function calculateCurrentTax(input: CurrentTaxInput): TaxResult {
  const { acquisitionCost, saleCost, expenses, otherGains } = input;

  // 양도차익 = 매도가액 - 취득가액 - 필요경비
  const capitalGain = Math.max(0, saleCost - acquisitionCost - expenses);

  // 총 양도소득금액 = 양도차익 + 기타 양도소득금액
  const totalGains = capitalGain + otherGains;

  // 기본공제 (최대 250만원, 양도소득금액 초과 불가)
  const basicDeduction = Math.min(TAX_CONSTANTS.BASIC_DEDUCTION, totalGains);

  // 과세표준 = 양도소득금액 - 기본공제
  const taxBase = Math.max(0, totalGains - basicDeduction);

  // 세금 계산
  const nationalTax = Math.floor(taxBase * TAX_CONSTANTS.NATIONAL_TAX_RATE);
  const localTax = Math.floor(taxBase * TAX_CONSTANTS.LOCAL_TAX_RATE);
  const totalTax = nationalTax + localTax;

  // 실수령액 = 매도가액 - 총 세금
  const netProceeds = saleCost - totalTax;

  return {
    capitalGain,
    totalGains,
    basicDeduction,
    taxBase,
    nationalTax,
    localTax,
    totalTax,
    netProceeds,
  };
}

/**
 * RIA 감면율 계산
 */
function getRIADiscountRate(quarter: ReturnQuarter): number {
  switch (quarter) {
    case '1Q':
      return TAX_CONSTANTS.RIA_DISCOUNT_1Q;
    case '2Q':
      return TAX_CONSTANTS.RIA_DISCOUNT_2Q;
    case 'H2':
      return TAX_CONSTANTS.RIA_DISCOUNT_H2;
    default:
      return 0;
  }
}

/**
 * 환헷지 공제액 계산
 * 환헷지 금액의 5%, 최대 500만원
 */
function calculateHedgeDeduction(hedgeAmount: number): number {
  // 인정한도 1억원 초과시 1억원으로 제한
  const limitedAmount = Math.min(hedgeAmount, TAX_CONSTANTS.HEDGE_LIMIT);
  // 5% 계산 후 최대 500만원 제한
  const deduction = limitedAmount * TAX_CONSTANTS.HEDGE_DEDUCTION_RATE;
  return Math.min(deduction, TAX_CONSTANTS.HEDGE_MAX_DEDUCTION);
}

/**
 * 추가공제 적용 양도소득세 계산
 * RIA: 소득공제 방식 - 양도차익 최대 5천만원까지 비과세
 * 환헷지: 소득공제 방식 - 기본공제에 추가
 */
export function calculateAdditionalTax(
  currentInput: CurrentTaxInput,
  additionalInput: AdditionalDeductionInput,
  currentResult: TaxResult
): AdditionalTaxResult {
  const { applyRIA, returnQuarter, applyHedge, hedgeAmount } = additionalInput;

  // RIA 감면율
  const riaDiscountRate = applyRIA ? getRIADiscountRate(returnQuarter) : 0;

  // 환헷지 공제액 (소득공제)
  const hedgeDeduction = applyHedge ? calculateHedgeDeduction(hedgeAmount) : 0;

  // RIA 대상 양도차익 (양도차익과 5천만원 중 작은 값)
  const riaEligibleGain = applyRIA ? Math.min(currentResult.capitalGain, TAX_CONSTANTS.RIA_LIMIT) : 0;

  // RIA 비과세 양도차익 = 대상 양도차익 × 감면율
  const riaDeduction = Math.floor(riaEligibleGain * riaDiscountRate);

  // 공제 후 양도소득금액 = 원래 양도소득금액 - RIA 비과세 양도차익
  const adjustedTotalGains = Math.max(0, currentResult.totalGains - riaDeduction);

  // 기본공제 + 환헷지 공제 적용
  const totalBasicDeduction = Math.min(
    TAX_CONSTANTS.BASIC_DEDUCTION + hedgeDeduction,
    adjustedTotalGains
  );

  // 과세표준 = 공제 후 양도소득금액 - (기본공제 + 환헷지공제)
  const adjustedTaxBase = Math.max(0, adjustedTotalGains - totalBasicDeduction);

  // 세금 계산
  const nationalTax = Math.floor(adjustedTaxBase * TAX_CONSTANTS.NATIONAL_TAX_RATE);
  const localTax = Math.floor(adjustedTaxBase * TAX_CONSTANTS.LOCAL_TAX_RATE);
  const totalTax = nationalTax + localTax;

  // 실수령액 = 매도가액 - 총 세금
  const netProceeds = currentInput.saleCost - totalTax;

  // 절세 효과 상세
  const totalTaxRate = TAX_CONSTANTS.NATIONAL_TAX_RATE + TAX_CONSTANTS.LOCAL_TAX_RATE; // 22%
  const riaTaxSaving = Math.floor(riaDeduction * totalTaxRate);
  const hedgeTaxSaving = Math.floor(hedgeDeduction * totalTaxRate);
  const taxSaving = currentResult.totalTax - totalTax;

  return {
    capitalGain: currentResult.capitalGain,
    totalGains: currentResult.totalGains,
    adjustedTotalGains,
    basicDeduction: TAX_CONSTANTS.BASIC_DEDUCTION,
    hedgeDeduction,
    riaEligibleGain,
    riaDeduction,
    riaDiscountRate,
    taxBase: adjustedTaxBase,
    nationalTax,
    localTax,
    totalTax,
    netProceeds,
    riaTaxSaving,
    hedgeTaxSaving,
    taxSaving,
  };
}
