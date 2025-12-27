import { TaxCalculator } from '@/components/calculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            해외주식 양도소득세 계산기
          </h1>
          <p className="text-muted-foreground">
            현행 제도와 추가공제 제도(예정)를 비교하여 절세 효과를 확인하세요
          </p>
        </div>

        {/* 계산기 */}
        <TaxCalculator />

        {/* 푸터 */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">
            만든사람 : CS CHOI (무료로 기부합니다, 실제 세금계산은 세무전문가와 상담하세요)
          </p>
          <p>
            본 계산기는 2025년 12월 24일 기획재정부 발표 자료를 기반으로 제작되었습니다.
          </p>
        </footer>
      </main>
    </div>
  );
}
