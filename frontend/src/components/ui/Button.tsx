import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2'

    const variants = {
      primary:
        'bg-[#F5AD00] text-[#252525] hover:bg-[#D99900] focus-visible:outline-[#F5AD00]',
      secondary:
        'bg-white text-[#3F3F3F] border border-[#D3D3D3] hover:border-[#F5AD00] hover:text-[#252525] focus-visible:outline-[#F5AD00]',
      ghost:
        'text-[#3F3F3F] hover:bg-[#F8F8F8] focus-visible:outline-[#D3D3D3]',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-5 text-sm',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
