/**
 * Discord avatar URL from a user ID (default avatar) or an explicit CDN URL.
 * For a member's real profile picture, set `avatarUrl` on the team member
 * (right-click their avatar in Discord → Copy Link).
 */
export function getDiscordAvatarUrl(discordId: string, avatarUrl?: string, name?: string): string {
  if (avatarUrl) return avatarUrl

  if (!discordId || !/^\d{17,20}$/.test(discordId)) {
    const label = encodeURIComponent(name?.trim() || 'Member')
    return `https://ui-avatars.com/api/?name=${label}&background=dc2626&color=fff&size=256`
  }

  const index = Number(BigInt(discordId) >> 22n) % 6
  return `https://cdn.discordapp.com/embed/avatars/${index}.png?size=256`
}
