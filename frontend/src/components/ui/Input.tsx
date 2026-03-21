import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-bold text-brand-gray uppercase tracking-widest ml-0.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-10 w-full rounded-lg border bg-brand-surface px-4 text-[13px] text-brand-black placeholder-brand-text/40 transition-all duration-200
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-danger/50' : 'border-brand-light hover:border-brand-text/50'}
            ${className}`}
          {...props}
        />
        {error && <span className="text-[11px] font-bold text-danger mt-0.5 ml-0.5">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
