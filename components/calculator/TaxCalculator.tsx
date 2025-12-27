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

      {/* 계산 흐름 설명 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border text-sm space-y-3">
        <h3 className="font-semibold">📋 양도소득세 계산 흐름</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-background rounded border text-center">
            <div className="text-muted-foreground mb-1">STEP 1</div>
            <div className="font-medium">매도가액 - 취득가액 - 필요경비</div>
            <div className="text-primary font-semibold mt-1">→ 양도차익</div>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-800 text-center">
            <div className="text-blue-600 dark:text-blue-400 mb-1">STEP 2</div>
            <div className="font-medium">양도차익 - 비과세(RIA)</div>
            <div className="text-blue-600 dark:text-blue-400 font-semibold mt-1">→ 과세대상 양도차익</div>
            <div className="text-muted-foreground text-[10px]">(= 양도소득금액)</div>
          </div>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded border border-amber-200 dark:border-amber-800 text-center">
            <div className="text-amber-600 dark:text-amber-400 mb-1">STEP 3</div>
            <div className="font-medium">양도소득금액 - 기본공제 - 특별공제</div>
            <div className="text-amber-600 dark:text-amber-400 font-semibold mt-1">→ 과세표준</div>
            <div className="text-muted-foreground text-[10px]">(환헤지 소득공제 등)</div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-950/50 rounded border border-red-200 dark:border-red-800 text-center">
            <div className="text-red-600 dark:text-red-400 mb-1">STEP 4</div>
            <div className="font-medium">과세표준 × 22%</div>
            <div className="text-red-600 dark:text-red-400 font-semibold mt-1">→ 납부세액</div>
            <div className="text-muted-foreground text-[10px]">(국세 20% + 지방세 2%)</div>
          </div>
        </div>
      </div>

      {/* 계산 예시 가이드 */}
      <div className="p-4 bg-muted/30 rounded-lg border text-sm space-y-4">
        <div>
          <h3 className="font-semibold mb-2">📊 계산 예시</h3>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded border text-xs">
            <span>취득가액 <strong>1천만원</strong></span>
            <span className="text-muted-foreground">→</span>
            <span>매도가액 <strong>1억원</strong></span>
            <span className="text-muted-foreground">|</span>
            <span>필요경비 <strong>10만원</strong></span>
          </div>
        </div>

        <div className="space-y-3">
          {/* 현행 제도 */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border space-y-2">
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 pb-2 border-b">🔴 현행 제도</div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">STEP 1</span>
                <span>1억 - 1천만 - 10만 = <strong>양도차익 8,990만원</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">STEP 2</span>
                <span className="text-muted-foreground">비과세 없음 → 양도소득금액 = 8,990만원</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">STEP 3</span>
                <span>8,990만 - 250만(기본공제) = <strong>과세표준 8,740만원</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-200 dark:bg-red-800 px-1.5 py-0.5 rounded">STEP 4</span>
                <span>8,740만 × 22% = <strong className="text-red-600">납부세액 1,923만원</strong></span>
              </div>
            </div>
          </div>

          {/* 개정안: RIA만 적용 */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
            <div className="font-semibold text-sm text-blue-700 dark:text-blue-300 pb-2 border-b border-blue-200 dark:border-blue-700">🔵 개정안 (RIA 비과세 적용, 1분기 100%)</div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">STEP 1</span>
                <span>양도차익 = <strong>8,990만원</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">STEP 2</span>
                <span>8,990만 - <span className="text-green-600 font-medium">5천만(비과세)</span> = <strong>과세대상 양도차익 3,990만원</strong></span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 ml-14">└ 비과세 = min(8,990만, 5천만) × 100% = 5천만원</div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">STEP 3</span>
                <span>3,990만 - 250만(기본공제) = <strong>과세표준 3,740만원</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-orange-200 dark:bg-orange-800 px-1.5 py-0.5 rounded">STEP 4</span>
                <span>3,740만 × 22% = <strong className="text-orange-600">납부세액 823만원</strong></span>
              </div>
            </div>
          </div>

          {/* 개정안: RIA + 환헷지 적용 */}
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
            <div className="font-semibold text-sm text-green-700 dark:text-green-300 pb-2 border-b border-green-200 dark:border-green-700">🟢 개정안 (RIA + 환헷지 소득공제 적용)</div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-200 dark:bg-green-800 px-1.5 py-0.5 rounded">STEP 1</span>
                <span>양도차익 = <strong>8,990만원</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-200 dark:bg-green-800 px-1.5 py-0.5 rounded">STEP 2</span>
                <span>8,990만 - <span className="text-green-600 font-medium">5천만(비과세)</span> = <strong>양도소득금액 3,990만원</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-200 dark:bg-green-800 px-1.5 py-0.5 rounded">STEP 3</span>
                <span>3,990만 - 250만 - <span className="text-green-600 font-medium">500만(환헷지)</span> = <strong>과세표준 3,240만원</strong></span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 ml-14">└ 환헷지 소득공제 = 1억 × 5% = 500만원 (최대한도)</div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-300 dark:bg-green-700 px-1.5 py-0.5 rounded font-medium">STEP 4</span>
                <span>3,240만 × 22% = <strong className="text-green-600">납부세액 713만원</strong></span>
              </div>
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
