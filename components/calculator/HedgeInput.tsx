'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputField } from './InputField';
import { TAX_CONSTANTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';

interface HedgeInputProps {
  enabled: boolean;
  amount: number;
  onEnabledChange: (enabled: boolean) => void;
  onAmountChange: (amount: number) => void;
}

export function HedgeInput({
  enabled,
  amount,
  onEnabledChange,
  onAmountChange,
}: HedgeInputProps) {
  const handleMaxAmount = () => {
    onAmountChange(TAX_CONSTANTS.HEDGE_LIMIT);
  };

  const isOverLimit = amount > TAX_CONSTANTS.HEDGE_LIMIT;
  const hedgeDeduction = Math.min(
    amount * TAX_CONSTANTS.HEDGE_DEDUCTION_RATE,
    TAX_CONSTANTS.HEDGE_MAX_DEDUCTION
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hedge-enabled"
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
        />
        <Label htmlFor="hedge-enabled" className="text-sm font-medium cursor-pointer">
          환헷지 추가공제 적용
        </Label>
      </div>

      {enabled && (
        <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <InputField
                id="hedge-amount"
                label="환헷지 금액 (선물환 매입액)"
                value={amount}
                onChange={onAmountChange}
                placeholder="0"
                max={TAX_CONSTANTS.HEDGE_LIMIT}
                showWarning={isOverLimit}
                warningMessage={`인정한도 ${formatCurrency(TAX_CONSTANTS.HEDGE_LIMIT)}을 초과했습니다.`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMaxAmount}
              className="whitespace-nowrap mb-[2px]"
            >
              최대금액 적용
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 인별 인정한도: 年 평균잔액 기준 {formatCurrency(TAX_CONSTANTS.HEDGE_LIMIT)}</p>
            <p>• 공제율: 환헷지 금액의 5%</p>
            <p>• 최대 공제 한도: {formatCurrency(TAX_CONSTANTS.HEDGE_MAX_DEDUCTION)}</p>
            {amount > 0 && (
              <p className="text-primary font-medium pt-1">
                → 예상 공제액: {formatCurrency(hedgeDeduction)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
