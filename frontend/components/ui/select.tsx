'use client'

import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options?: { label: string; value: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, options = [], ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium mb-2">{label}</label>}
        <select
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
        {helperText && <p className="text-sm text-muted-foreground mt-1">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
