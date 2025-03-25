"use client"

import { cn } from '@/lib/utils'
import React, { useState, useEffect } from 'react'

interface CurrencyInputProps {
  id?: string
  name: string
  value: number
  onChange: (value: { name: string; value: number }) => void
  placeholder?: string
  className?: string
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = 'Nhập số tiền',
  className = '',
  name = 'chiPhiCong',
  id = 'input'
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : formatCurrency(value))
  }, [value])

  const formatCurrency = (num: number): string => {
    if (!num) return ''
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const parseCurrency = (str: string): number => {
    const cleaned = str.replace(/[^\d]/g, '') // Chỉ giữ lại số
    return cleaned === '' ? 0 : Number(cleaned)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = parseCurrency(inputValue)
    
    setDisplayValue(inputValue) // Hiển thị giá trị đang nhập
    onChange({ name, value: numericValue })
  }

  const handleBlur = () => {
    setDisplayValue(value === 0 ? '' : formatCurrency(value))
  }

  const handleFocus = () => {
    setDisplayValue(value === 0 ? '' : value.toString())
  }

  return (
    <div className={cn("relative w-full", className)}>
      <input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-lime-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        aria-label="Currency input in VND"
      />
      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
        VND
      </span>
    </div>
  )
}