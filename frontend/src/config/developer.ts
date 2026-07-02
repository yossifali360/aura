export const DEVELOPER = {
  name: 'Youssef Ali',
  discordUsername: 'youssefali0025',
  discordId: '1438324695714762834',
} as const

export function getDeveloperDiscordUrl(): string | null {
  if (!DEVELOPER.discordId) return null
  return `https://discord.com/users/${DEVELOPER.discordId}`
}
