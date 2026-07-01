import { useAuthStore } from '@/store/authStore'

export function useAuthHydrated() {
  return useAuthStore((s) => s.hasHydrated)
}
