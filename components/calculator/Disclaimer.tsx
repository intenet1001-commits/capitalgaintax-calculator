'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function Disclaimer() {
  return (
    <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">중요 고지사항</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm space-y-1">
        <p>• 우측의 추가공제 계산은 현재 논의 중인 제도를 기반으로 한 예상치입니다.</p>
        <p>• 세부 규정이 확정되지 않았으므로 실제 시행 시 계산 결과가 달라질 수 있습니다.</p>
        <p>• 본 계산기는 참고용이며, 실제 세무 신고 시에는 세무 전문가와 상담하시기 바랍니다.</p>
        <p>• 최종 법령 시행 후 정확한 계산을 위해 업데이트될 예정입니다.</p>
      </AlertDescription>
    </Alert>
  );
}
