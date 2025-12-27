'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Disclaimer } from './Disclaimer';
import { CurrentTaxSection } from './CurrentTaxSection';
import { NewTaxSection } from './NewTaxSection';
import {
  CurrentTaxInput,
  AdditionalDeductionInput,
  calculateCurrentTax,
  calculateAdditionalTax,
} from '@/lib/tax-calculator';

const initialCurrentInput: CurrentTaxInput = {
  acquisitionCost: 0,
  saleCost: 0,
  expenses: 0,
  otherGains: 0,
};

const initialAdditionalInput: AdditionalDeductionInput = {
  applyRIA: false,
  returnQuarter: '1Q',
  applyHedge: false,
  hedgeAmount: 0,
};

export function TaxCalculator() {
  const [currentInput, setCurrentInput] = useState<CurrentTaxInput>(initialCurrentInput);
  const [additionalInput, setAdditionalInput] = useState<AdditionalDeductionInput>(initialAdditionalInput);

  // 현행 제도 계산 결과
  const currentResult = useMemo(
    () => calculateCurrentTax(currentInput),
    [currentInput]
  );

  // 추가공제 적용 계산 결과
  const additionalResult = useMemo(
    () => calculateAdditionalTax(currentInput, additionalInput, currentResult),
    [currentInput, additionalInput, currentResult]
  );

  // 현행 제도 입력 변경 핸들러
  const handleCurrentInputChange = (field: keyof CurrentTaxInput, value: number) => {
    setCurrentInput((prev) => ({ ...prev, [field]: value }));
  };

  // 추가공제 입력 변경 핸들러
  const handleAdditionalInputChange = <K extends keyof AdditionalDeductionInput>(
    field: K,
    value: AdditionalDeductionInput[K]
  ) => {
    setAdditionalInput((prev) => ({ ...prev, [field]: value }));
  };

  // 초기화
  const handleReset = () => {
    setCurrentInput(initialCurrentInput);
    setAdditionalInput(initialAdditionalInput);
  };

  return (
    <div className="space-y-6">
      {/* 디스클레이머 */}
      <Disclaimer />

      {/* 초기화 버튼 */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          초기화
        </Button>
      </div>

      {/* 투컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌측: 현행 제도 */}
        <CurrentTaxSection
          input={currentInput}
          result={currentResult}
          onInputChange={handleCurrentInputChange}
        />

        {/* 우측: 추가공제 적용 */}
        <NewTaxSection
          input={additionalInput}
          result={additionalResult}
          currentResult={currentResult}
          saleCost={currentInput.saleCost}
          onInputChange={handleAdditionalInputChange}
        />
      </div>

      {/* 계산 예시 가이드 */}
      <div className="p-4 bg-muted/30 rounded-lg border text-sm space-y-4">
        <div>
          <h3 className="font-semibold mb-2">📊 계산 예시</h3>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded border text-xs">
            <span>매입 <strong>1천만원</strong></span>
            <span className="text-muted-foreground">→</span>
            <span>매도 <strong>1억원</strong></span>
            <span className="text-muted-foreground">|</span>
            <span>필요경비 <strong>10만원</strong></span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Step 1: 양도차익 */}
          <div className="p-2 bg-background rounded border">
            <div className="font-medium text-xs text-muted-foreground mb-1">STEP 1. 양도차익 계산</div>
            <div className="text-sm">
              1억원 - 1천만원 - 10만원 = <strong>8,990만원</strong>
            </div>
          </div>

          {/* Step 2: 현행 제도 */}
          <div className="p-2 bg-background rounded border">
            <div className="font-medium text-xs text-muted-foreground mb-1">STEP 2. 현행 제도</div>
            <div className="text-sm space-y-0.5">
              <div>과세표준: 8,990만원 - 250만원(기본공제) = <strong>8,740만원</strong></div>
              <div>납부세액: 8,740만원 × 22% = <strong className="text-red-600">1,923만원</strong></div>
            </div>
          </div>

          {/* Step 3: RIA 적용 */}
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
            <div className="font-medium text-xs text-blue-700 dark:text-blue-300 mb-1">STEP 3. RIA 비과세 적용 (1분기 100%)</div>
            <div className="text-sm space-y-0.5">
              <div>RIA 비과세: min(8,990만원, 5천만원) × 100% = <strong>5천만원</strong></div>
              <div>과세대상 소득: 8,990만원 - 5천만원 = 3,990만원</div>
              <div>과세표준: 3,990만원 - 250만원 = <strong>3,740만원</strong></div>
              <div>납부세액: 3,740만원 × 22% = <strong className="text-orange-600">823만원</strong></div>
            </div>
          </div>

          {/* Step 4: 환헷지 추가 */}
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
            <div className="font-medium text-xs text-amber-700 dark:text-amber-300 mb-1">STEP 4. 환헷지 소득공제 추가 (1억원)</div>
            <div className="text-sm space-y-0.5">
              <div>환헷지 공제: 1억원 × 5% = <strong>500만원</strong> (최대한도)</div>
              <div>과세표준: 3,990만원 - 250만원 - 500만원 = <strong>3,240만원</strong></div>
              <div>납부세액: 3,240만원 × 22% = <strong className="text-green-600">713만원</strong></div>
            </div>
          </div>

          {/* 절세효과 요약 - 강조 버전 */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg border-2 border-green-300 dark:border-green-700">
            <div className="font-bold text-sm text-green-700 dark:text-green-300 mb-3">💰 절세효과 한눈에 보기</div>

            {/* 세금 비교 시각화 */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">현행</div>
                <div className="text-2xl font-bold text-red-600 line-through decoration-2">1,923만원</div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">→</span>
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">-63%</span>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">개정안</div>
                <div className="text-2xl font-bold text-green-600">713만원</div>
              </div>
            </div>

            {/* 절세금액 강조 */}
            <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-green-700 dark:text-green-300 mb-1">절세 금액</div>
              <div className="text-3xl font-black text-green-600 dark:text-green-400">
                1,210만원
                <span className="text-lg ml-1">절감!</span>
              </div>
            </div>

            {/* 비교 바 */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-12 text-right text-muted-foreground">현행</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-12 text-right text-muted-foreground">개정안</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '37%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
