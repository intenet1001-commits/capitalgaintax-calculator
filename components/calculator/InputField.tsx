'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatInputValue, parseFormattedNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  max?: number;
  showWarning?: boolean;
  warningMessage?: string;
}

export function InputField({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  required = false,
  disabled = false,
  description,
  max,
  showWarning = false,
  warningMessage,
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numValue = parseFormattedNumber(rawValue);
    onChange(numValue);
  };

  const displayValue = value > 0 ? formatInputValue(value.toString()) : '';
  const isOverMax = max !== undefined && value > max;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-8',
            isOverMax && 'border-red-500 focus-visible:ring-red-500',
            disabled && 'bg-muted'
          )}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          원
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {(showWarning || isOverMax) && warningMessage && (
        <p className="text-xs text-red-500">{warningMessage}</p>
      )}
    </div>
  );
}
