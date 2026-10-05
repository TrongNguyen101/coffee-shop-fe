import { useRef, useState } from 'react';
import { Input, type InputProps, type InputRef } from 'antd';
import type { ClipboardEvent, CompositionEvent } from 'react';

interface DrinkPriceInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

// VND has no decimal part; Vietnamese format groups thousands with a dot (35.000).
const THOUSANDS_SEPARATOR = '.';
const PASTED_PRICE_PATTERN = /^(?:\d+|\d{1,3}(?:[.,]\d{3})+)$/;

function normalizePrice(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

function formatInputPrice(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
}

function getCaretPosition(formattedValue: string, semanticLength: number): number {
  if (semanticLength === 0) return 0;

  let semanticIndex = 0;
  for (let index = 0; index < formattedValue.length; index += 1) {
    if (formattedValue[index] !== THOUSANDS_SEPARATOR) semanticIndex += 1;
    if (semanticIndex === semanticLength) return index + 1;
  }

  return formattedValue.length;
}

export function DrinkPriceInput({ value = '', onChange, ...props }: DrinkPriceInputProps) {
  const inputRef = useRef<InputRef>(null);
  // Vietnamese IMEs (Telex/VNI) compose text; rewriting the value mid-composition breaks them.
  const isComposingRef = useRef(false);
  const [composingText, setComposingText] = useState<string | null>(null);

  const updatePrice = (input: HTMLInputElement) => {
    const inputValue = input.value;
    const caret = input.selectionStart ?? inputValue.length;
    const normalizedValue = normalizePrice(inputValue);
    const normalizedPrefix = normalizePrice(inputValue.slice(0, caret));
    const formattedValue = formatInputPrice(normalizedValue);

    input.value = formattedValue;
    onChange?.(normalizedValue);
    requestAnimationFrame(() => {
      inputRef.current?.input?.setSelectionRange(
        getCaretPosition(formattedValue, normalizedPrefix.length),
        getCaretPosition(formattedValue, normalizedPrefix.length),
      );
    });
  };

  const handleChange: NonNullable<InputProps['onChange']> = (event) => {
    if (isComposingRef.current) {
      setComposingText(event.target.value);
      return;
    }

    updatePrice(event.target);
  };

  const handleCompositionStart = (event: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = true;
    setComposingText(event.currentTarget.value);
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    setComposingText(null);
    updatePrice(event.currentTarget);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    props.onPaste?.(event);
    if (event.defaultPrevented) return;

    const pastedValue = event.clipboardData.getData('text').trim();
    if (!PASTED_PRICE_PATTERN.test(pastedValue)) event.preventDefault();
  };

  return (
    <Input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={composingText ?? formatInputPrice(value)}
      onChange={handleChange}
      onPaste={handlePaste}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      suffix="đ"
      placeholder="35.000"
    />
  );
}
