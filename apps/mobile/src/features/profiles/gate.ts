/** Free tier caps profiles at 1 (noazul-blueprint.md §4 Fase 5, "Gate de perfis"). */
export const FREE_PROFILE_LIMIT = 1;

export function canCreateProfile(isPremium: boolean, currentProfileCount: number): boolean {
  return isPremium || currentProfileCount < FREE_PROFILE_LIMIT;
}
