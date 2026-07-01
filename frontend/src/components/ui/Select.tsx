import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  size?: 'default' | 'sm'
}

const sizeClasses = {
  default: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-sm',
}

function parseOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || child.type !== 'option') return []

    const option = child as ReactElement<{
      value?: string | number
      children?: ReactNode
      disabled?: boolean
    }>

    return [
      {
        value: String(option.props.value ?? ''),
        label: option.props.children,
        disabled: option.props.disabled,
      },
    ]
  })
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      id: idProp,
      size = 'default',
      disabled,
      children,
      value = '',
      onChange,
      onBlur,
      name,
      required,
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const listboxId = `${id}-listbox`
    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLUListElement>(null)
    const [open, setOpen] = useState(false)
    const [menuStyle, setMenuStyle] = useState<CSSProperties>({})

    const options = useMemo(() => parseOptions(children), [children])
    const selected = options.find((option) => option.value === String(value))

    const setButtonRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const updateMenuPosition = useCallback(() => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const menuHeight = menuRef.current?.offsetHeight ?? 240
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < menuHeight && rect.top > menuHeight

      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        top: openUpward ? rect.top - 4 : rect.bottom + 4,
        transform: openUpward ? 'translateY(-100%)' : undefined,
        zIndex: 9999,
      })
    }, [])

    useEffect(() => {
      if (!open) return

      updateMenuPosition()
      window.addEventListener('scroll', updateMenuPosition, true)
      window.addEventListener('resize', updateMenuPosition)

      return () => {
        window.removeEventListener('scroll', updateMenuPosition, true)
        window.removeEventListener('resize', updateMenuPosition)
      }
    }, [open, updateMenuPosition])

    useLayoutEffect(() => {
      if (!open) return
      updateMenuPosition()
    }, [open, options, updateMenuPosition])

    useEffect(() => {
      if (!open) return

      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node
        if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return

        setOpen(false)
        onBlur?.({ target: { name, value: String(value) } } as React.FocusEvent<HTMLSelectElement>)
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setOpen(false)
      }

      document.addEventListener('mousedown', onPointerDown)
      document.addEventListener('keydown', onKeyDown)

      return () => {
        document.removeEventListener('mousedown', onPointerDown)
        document.removeEventListener('keydown', onKeyDown)
      }
    }, [name, onBlur, open, value])

    const selectValue = (nextValue: string) => {
      onChange?.({ target: { name, value: nextValue } } as React.ChangeEvent<HTMLSelectElement>)
      setOpen(false)
    }

    const menu = open ? (
      <ul
        ref={menuRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={id}
        style={menuStyle}
        className="max-h-60 overflow-y-auto rounded-xl border border-slate-200/80 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        {options.map((option) => {
          const isSelected = option.value === String(value)

          return (
            <li key={`${option.value}-${String(option.label)}`} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => selectValue(option.value)}
                className={cn(
                  'flex w-full px-4 py-2.5 text-start text-sm transition',
                  isSelected
                    ? 'bg-aura-500/10 font-medium text-aura-600 dark:text-aura-400'
                    : 'text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
                  option.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>
    ) : null

    return (
      <div className={label || error ? 'space-y-1.5' : undefined} ref={containerRef}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div className="group relative">
          <button
            ref={setButtonRef}
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-required={required}
            onClick={() => {
              if (!disabled) setOpen((current) => !current)
            }}
            className={cn(
              'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/80 text-start text-slate-900 shadow-sm backdrop-blur-sm transition',
              'hover:border-aura-500/40 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-aura-400/50 dark:hover:bg-slate-900',
              'focus:border-aura-500 focus:outline-none focus:ring-2 focus:ring-aura-500/25',
              'disabled:cursor-not-allowed disabled:opacity-60',
              sizeClasses[size],
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className,
            )}
          >
            <span className="truncate">{selected?.label ?? '\u00a0'}</span>
            <ChevronDown
              aria-hidden
              className={cn(
                'size-4 shrink-0 text-slate-400 transition-transform dark:text-slate-500',
                open && 'rotate-180',
                !disabled && 'group-hover:text-aura-500',
                disabled && 'opacity-60',
              )}
            />
          </button>

          {menu && createPortal(menu, document.body)}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
