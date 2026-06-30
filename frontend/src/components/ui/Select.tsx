import { ChevronDown } from 'lucide-react'
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  size?: 'default' | 'sm'
}

const sizeClasses = {
  default: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-sm',
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, size = 'default', disabled, children, ...props }, ref) => (
    <div className={label || error ? 'space-y-1.5' : undefined}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="group relative">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            'w-full cursor-pointer appearance-none rounded-xl border border-slate-200/80 bg-white/80 pr-10 text-slate-900 shadow-sm backdrop-blur-sm transition',
            'hover:border-aura-500/40 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-aura-400/50 dark:hover:bg-slate-900',
            'focus:border-aura-500 focus:outline-none focus:ring-2 focus:ring-aura-500/25',
            'disabled:cursor-not-allowed disabled:opacity-60',
            sizeClasses[size],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className={cn(
            'pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500',
            !disabled && 'group-hover:text-aura-500',
            disabled && 'opacity-60',
          )}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  ),
)

Select.displayName = 'Select'
