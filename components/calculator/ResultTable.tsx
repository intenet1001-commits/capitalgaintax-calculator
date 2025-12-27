'use client';

import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/format';
import { TaxResult, AdditionalTaxResult } from '@/lib/tax-calculator';
import { cn } from '@/lib/utils';

interface ResultTableProps {
  result: TaxResult | AdditionalTaxResult;
  type: 'current' | 'additional';
  currentTax?: number; // 현행 세금 (절세 효과 계산용)
}

function isAdditionalResult(result: TaxResult | AdditionalTaxResult): result is AdditionalTaxResult {
  return 'taxSaving' in result;
}

export function ResultTable({ result, type, currentTax }: ResultTableProps) {
  const isAdditional = type === 'additional' && isAdditionalResult(result);

  return (
    <div className="space-y-3">
      {/* STEP 1: 양도차익 */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">양도차익</span>
        <span>{formatCurrency(result.capitalGain)}</span>
      </div>

      {/* STEP 2: 양도소득금액 */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">양도소득금액</span>
        <span>{formatCurrency(result.totalGains)}</span>
      </div>

      {/* STEP 3: RIA 비과세 - 양도소득금액에서 직접 차감 */}
      {isAdditional && result.riaDeduction > 0 && (
        <>
          <div className="bg-blue-50 dark:bg-blue-950/50 p-2 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                ⓵ 비과세 (양도소득에서 차감)
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground ml-4">
                RIA ({(result.riaDiscountRate * 100).toFixed(0)}% 감면)
              </span>
              <span className="text-green-600 font-medium">-{formatCurrency(result.riaDeduction)}</span>
            </div>
            <div className="text-xs text-muted-foreground ml-4 mt-1">
              min(양도차익, 5천만원) × 감면율 = {formatCurrency(result.riaDeduction)}
            </div>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>→ 과세대상 양도소득금액</span>
            <span>{formatCurrency(result.adjustedTotalGains)}</span>
          </div>
        </>
      )}

      <Separator />

      {/* STEP 4: 소득공제 - 과세표준 계산시 차감 */}
      <div className="space-y-2">
        {isAdditional && (result.riaDeduction > 0 || result.hedgeDeduction > 0) ? (
          <div className="bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-800">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                ⓶ 소득공제 (과세표준 계산시 차감)
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground ml-4">기본공제</span>
              <span className="text-green-600">-{formatCurrency(result.basicDeduction)}</span>
            </div>
            {result.hedgeDeduction > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground ml-4">환헷지 공제</span>
                  <span className="text-green-600">-{formatCurrency(result.hedgeDeduction)}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-4 mt-1">
                  환헷지 금액 × 5% (최대 500만원)
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">기본공제</span>
              <span className="text-green-600">-{formatCurrency(result.basicDeduction)}</span>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* STEP 5: 과세표준 */}
      <div className="flex justify-between text-sm font-medium">
        <span>과세표준</span>
        <span>{formatCurrency(result.taxBase)}</span>
      </div>

      <Separator />

      {/* STEP 6: 세금 계산 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">국세 (20%)</span>
          <span>{formatCurrency(result.nationalTax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">지방소득세 (2%)</span>
          <span>{formatCurrency(result.localTax)}</span>
        </div>

        <div className="flex justify-between font-medium pt-1">
          <span>납부세액 합계</span>
          <span className="text-red-600">{formatCurrency(result.totalTax)}</span>
        </div>
      </div>

      <Separator />

      {/* 실수령액 */}
      <div className={cn(
        "flex justify-between p-3 rounded-lg",
        type === 'current' ? "bg-muted" : "bg-primary/10"
      )}>
        <div>
          <span className="font-semibold">실수령액</span>
          <p className="text-xs text-muted-foreground">(세금 납부 후 실제로 받게 되는 돈)</p>
        </div>
        <span className="text-lg font-bold">{formatCurrency(result.netProceeds)}</span>
      </div>

      {/* 절세 효과 상세 (추가공제 섹션만) */}
      {isAdditional && result.taxSaving > 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-green-700 dark:text-green-300 text-sm">개정법안적용시 절세효과</span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(result.taxSaving)}
            </span>
          </div>

          {/* 절세효과 구성요소 */}
          <div className="text-xs text-green-700 dark:text-green-300 space-y-2 pt-2 border-t border-green-200 dark:border-green-700">
            {result.riaTaxSaving > 0 && (
              <div>
                <div className="flex justify-between">
                  <span className="font-medium">└ RIA 비과세 효과</span>
                  <span className="font-medium">{formatCurrency(result.riaTaxSaving)}</span>
                </div>
                <div className="text-green-600/70 dark:text-green-400/70 ml-3">
                  양도소득 {formatCurrency(result.riaDeduction)} 비과세 → 양도소득 감소 → 세금 {formatCurrency(result.riaTaxSaving)} 절감
                </div>
              </div>
            )}
            {result.hedgeTaxSaving > 0 && (
              <div>
                <div className="flex justify-between">
                  <span className="font-medium">└ 환헷지 소득공제 효과</span>
                  <span className="font-medium">{formatCurrency(result.hedgeTaxSaving)}</span>
                </div>
                <div className="text-green-600/70 dark:text-green-400/70 ml-3">
                  소득공제 {formatCurrency(result.hedgeDeduction)} → 과세표준 감소 → 세금 {formatCurrency(result.hedgeTaxSaving)} 절감
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
