export function getTeamGridClass(count: number): string {
  if (count <= 1) {
    return 'mx-auto max-w-xs grid-cols-1'
  }

  if (count === 2) {
    return 'mx-auto max-w-2xl grid-cols-1 sm:grid-cols-2'
  }

  if (count === 3) {
    return 'mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  }

  return 'mx-auto max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}
