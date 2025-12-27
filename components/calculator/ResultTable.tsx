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
        <div className="flex items-center gap-2">
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">STEP 1</span>
          <span className="text-muted-foreground">양도차익</span>
        </div>
        <span className="font-medium">{formatCurrency(result.capitalGain)}</span>
      </div>

      <Separator />

      {/* STEP 2: 비과세 (RIA) - 양도차익 단계에서 비과세 제외 */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">STEP 2</span>
          <span className="text-muted-foreground">비과세 (RIA)</span>
        </div>
        {isAdditional && result.riaExemption > 0 ? (
          <span className="text-green-600 font-medium">-{formatCurrency(result.riaExemption)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>

      {/* RIA 상세 내역 */}
      {isAdditional && result.riaExemption > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/50 p-2 rounded border border-blue-200 dark:border-blue-800 ml-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">비과세 한도</span>
            <span>min(양도차익, 5천만원) = {formatCurrency(result.riaEligibleGain)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">감면율</span>
            <span>{(result.riaDiscountRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* 과세대상 양도차익 (= 양도소득금액) */}
      <div className="flex justify-between text-sm font-medium bg-muted/50 p-2 rounded">
        <span>→ 과세대상 양도차익 (양도소득금액)</span>
        <span>{formatCurrency(result.taxableCapitalGain)}</span>
      </div>

      <Separator />

      {/* STEP 3: 소득공제 - 과세표준 계산시 차감 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">STEP 3</span>
            <span className="text-muted-foreground">소득공제</span>
          </div>
        </div>

        <div className="ml-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">기본공제</span>
            <span className="text-green-600">-{formatCurrency(result.basicDeduction)}</span>
          </div>
          {isAdditional && result.hedgeDeduction > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">환헷지 소득공제</span>
                <span className="text-green-600">-{formatCurrency(result.hedgeDeduction)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                └ 환헷지 금액 × 5% (최대 500만원)
              </div>
            </>
          )}
        </div>
      </div>

      {/* 과세표준 */}
      <div className="flex justify-between text-sm font-medium bg-muted/50 p-2 rounded">
        <span>→ 과세표준</span>
        <span>{formatCurrency(result.taxBase)}</span>
      </div>

      <Separator />

      {/* STEP 4: 세금 계산 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">STEP 4</span>
            <span className="text-muted-foreground">세금 (22%)</span>
          </div>
        </div>

        <div className="ml-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">국세 (20%)</span>
            <span>{formatCurrency(result.nationalTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">지방소득세 (2%)</span>
            <span>{formatCurrency(result.localTax)}</span>
          </div>
        </div>

        <div className="flex justify-between font-semibold pt-1 bg-red-50 dark:bg-red-950/50 p-2 rounded">
          <span>→ 납부세액</span>
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
                  양도차익 {formatCurrency(result.riaExemption)} 비과세 → 과세대상 양도차익 감소 → 세금 {formatCurrency(result.riaTaxSaving)} 절감
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
