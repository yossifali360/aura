const DEFAULT_API_URL = 'https://aura.youssef-ali.com/api'

/** Full API base including `/api` — used by axios */
export const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

/** Site origin without `/api` — used for OAuth redirects */
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, '')
