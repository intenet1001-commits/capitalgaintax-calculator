'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HedgeInput } from './HedgeInput';
import { ResultTable } from './ResultTable';
import { AdditionalDeductionInput, AdditionalTaxResult, TaxResult } from '@/lib/tax-calculator';
import { TAX_CONSTANTS, ReturnQuarter, QUARTER_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';

interface NewTaxSectionProps {
  input: AdditionalDeductionInput;
  result: AdditionalTaxResult;
  currentResult: TaxResult;
  saleCost: number;
  onInputChange: <K extends keyof AdditionalDeductionInput>(
    field: K,
    value: AdditionalDeductionInput[K]
  ) => void;
}

export function NewTaxSection({
  input,
  result,
  currentResult,
  saleCost,
  onInputChange,
}: NewTaxSectionProps) {
  return (
    <Card className="h-full border-primary/50">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">추가공제 적용</CardTitle>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">예정</span>
        </div>
        <CardDescription>
          2025.12.24 기획재정부 발표 기준 (조특법 의원입법 예정)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* RIA 공제 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">
            국내시장 복귀계좌(RIA) 세제지원
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ria-enabled"
                checked={input.applyRIA}
                onCheckedChange={(checked) => onInputChange('applyRIA', checked === true)}
              />
              <Label htmlFor="ria-enabled" className="text-sm font-medium cursor-pointer">
                RIA 세제지원 적용
              </Label>
            </div>

            {input.applyRIA && (
              <div className="ml-6 space-y-4 p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">비과세 비율 (매도금액 기준)</Label>
                  <div className="p-3 bg-background rounded border text-sm">
                    <span className="font-semibold">{(result.riaExemptionRatio * 100).toFixed(1)}%</span>
                    <span className="text-muted-foreground ml-2">
                      = min({formatCurrency(TAX_CONSTANTS.RIA_LIMIT)}, 매도금액) / 매도금액
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">RIA 대상 양도차익 (자동계산)</Label>
                  <div className="p-3 bg-background rounded border text-sm">
                    <span className="font-semibold">{formatCurrency(result.riaEligibleGain)}</span>
                    <span className="text-muted-foreground ml-2">
                      = 양도차익 × {(result.riaExemptionRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">복귀 시기</Label>
                  <Select
                    value={input.returnQuarter}
                    onValueChange={(v) => onInputChange('returnQuarter', v as ReturnQuarter)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="복귀 시기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(QUARTER_LABELS) as [ReturnQuarter, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 2025.12.23.까지 보유한 해외주식 매각 후</p>
                  <p>• 원화 환전 → 국내 주식 1년 장기투자 조건</p>
                  <p>• <strong>매도금액 {formatCurrency(TAX_CONSTANTS.RIA_LIMIT)} 한도</strong>로 비례 비과세</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 환헷지 공제 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">환헷지 양도소득세 공제</h3>

          <HedgeInput
            enabled={input.applyHedge}
            amount={input.hedgeAmount}
            onEnabledChange={(v) => onInputChange('applyHedge', v)}
            onAmountChange={(v) => onInputChange('hedgeAmount', v)}
          />
        </div>

        <Separator />

        {/* 결과 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">계산 결과</h3>
          <ResultTable result={result} type="additional" currentTax={currentResult.totalTax} />
        </div>
      </CardContent>
    </Card>
  );
}
