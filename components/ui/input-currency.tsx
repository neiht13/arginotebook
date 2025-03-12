"use client"

import { cn } from '@/lib/utils'
import React, { useState, useEffect } from 'react'

interface CurrencyInputProps {
    id?: string,
    name: string,
  value: number
  onChange: (value: {name: string, value: number}) => void
  placeholder?: string
  className?: string
}

export default function CurrencyInput({ value, onChange, placeholder = 'Nhập số tiền', className = '' , name='chiPhiCong', id = 'input'}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    setDisplayValue(formatCurrency(value))
  }, [value])

  const formatCurrency = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const parseCurrency = (str: string): number => {
    return Number(str.replace(/\./g, '').replace(' VND', ''))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^\d]/g, '')
    const numericValue = Number(inputValue)
    
    if (!isNaN(numericValue)) {
      onChange({name: name, value:numericValue})
    }
  }

  const handleBlur = () => {
    setDisplayValue(formatCurrency(value))
  }

  const handleFocus = () => {
    setDisplayValue(value.toString())
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
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0  focus-visible:border-lime-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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

