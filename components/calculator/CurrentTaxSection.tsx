'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InputField } from './InputField';
import { ResultTable } from './ResultTable';
import { CurrentTaxInput, TaxResult } from '@/lib/tax-calculator';

interface CurrentTaxSectionProps {
  input: CurrentTaxInput;
  result: TaxResult;
  onInputChange: (field: keyof CurrentTaxInput, value: number) => void;
}

export function CurrentTaxSection({ input, result, onInputChange }: CurrentTaxSectionProps) {
  return (
    <Card className="h-full">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">현행 제도</CardTitle>
        <CardDescription>
          기본공제 250만원, 세율 22% (국세 20% + 지방소득세 2%)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* 입력 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">거래 정보 입력</h3>

          <InputField
            id="acquisition-cost"
            label="취득가액"
            value={input.acquisitionCost}
            onChange={(v) => onInputChange('acquisitionCost', v)}
            required
            description="해외주식 매입 금액"
          />

          <InputField
            id="sale-cost"
            label="매도가액"
            value={input.saleCost}
            onChange={(v) => onInputChange('saleCost', v)}
            required
            description="해외주식 매도 금액"
          />

          <InputField
            id="expenses"
            label="필요경비"
            value={input.expenses}
            onChange={(v) => onInputChange('expenses', v)}
            description="수수료, 증권거래세 등"
          />

          <InputField
            id="other-gains"
            label="기타 양도소득금액"
            value={input.otherGains}
            onChange={(v) => onInputChange('otherGains', v)}
            description="다른 해외주식 거래 손익 합산"
          />
        </div>

        <Separator />

        {/* 결과 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">계산 결과</h3>
          <ResultTable result={result} type="current" />
        </div>
      </CardContent>
    </Card>
  );
}
