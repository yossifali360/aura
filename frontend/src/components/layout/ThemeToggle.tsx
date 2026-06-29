import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'rounded-xl p-2 text-slate-600 transition cursor-pointer hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        className,
      )}
    >
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
