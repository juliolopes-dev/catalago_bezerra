interface BadgeProps {
  variant?: 'default' | 'yellow' | 'success' | 'warning' | 'danger' | 'outline'
  children: React.ReactNode
  className?: string
}

const variants = {
  default: 'bg-[#F8F8F8] text-[#4F4F4F] border border-[#D3D3D3]',
  yellow: 'bg-[#F5AD00]/10 text-[#9A6D00] border border-[#F5AD00]/30',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  outline: 'bg-transparent text-[#3F3F3F] border border-[#D3D3D3]',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
