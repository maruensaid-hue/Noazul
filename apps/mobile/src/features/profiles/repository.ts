import { asc, eq, isNull } from "drizzle-orm";

import { db } from "../../db/client";
import { categories, profiles } from "../../db/schema";
import { nowIso } from "../../lib/dates";
import { newId } from "../../lib/id";

export const DEFAULT_PROFILE_NAME = "Casa";

/** Categories every fresh profile starts with, matching common BR household expenses. */
export const DEFAULT_CATEGORIES: readonly { name: string; color: string }[] = [
  { name: "Moradia", color: "#6366F1" },
  { name: "Alimentação", color: "#F59E0B" },
  { name: "Transporte", color: "#3B82F6" },
  { name: "Saúde", color: "#EF4444" },
  { name: "Educação", color: "#10B981" },
  { name: "Lazer", color: "#EC4899" },
  { name: "Salário", color: "#22C55E" },
  { name: "Outros", color: "#6B7280" },
];

export interface ProfileRow {
  id: string;
  name: string;
  isDefault: boolean;
}

export async function listProfiles(): Promise<ProfileRow[]> {
  return db
    .select({ id: profiles.id, name: profiles.name, isDefault: profiles.isDefault })
    .from(profiles)
    .where(isNull(profiles.deletedAt))
    .orderBy(asc(profiles.name));
}

/** The profile the app should open into on next boot (see setActiveProfile). */
export async function getActiveProfileId(): Promise<string | undefined> {
  const [row] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.isDefault, true))
    .limit(1);
  return row?.id;
}

async function seedDefaultCategories(profileId: string): Promise<void> {
  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      id: newId(),
      profileId,
      name: category.name,
      color: category.color,
    })),
  );
}

/**
 * Creates a profile with its starter categories and returns its id. Used by
 * both onboarding (the very first profile) and the profiles CRUD screen
 * (every profile after that).
 */
export async function createProfile(
  name: string,
  options?: { isDefault?: boolean },
): Promise<string> {
  const id = newId();
  await db.insert(profiles).values({
    id,
    name: name.trim() || DEFAULT_PROFILE_NAME,
    isDefault: options?.isDefault ?? false,
  });
  await seedDefaultCategories(id);
  return id;
}

export async function renameProfile(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  await db.update(profiles).set({ name: trimmed, updatedAt: nowIso() }).where(eq(profiles.id, id));
}

/**
 * Marks `id` as the profile to open into next boot, clearing the flag from
 * every other profile first (only one can be default at a time).
 */
export async function setActiveProfile(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(profiles).set({ isDefault: false, updatedAt: nowIso() }).where(isNull(profiles.deletedAt));
    await tx.update(profiles).set({ isDefault: true, updatedAt: nowIso() }).where(eq(profiles.id, id));
  });
}

/**
 * Soft-deletes a profile. Refuses to delete the last remaining one — the app
 * always needs at least one profile to open into. If the deleted profile was
 * active, promotes another remaining profile to active so the app never ends
 * up with zero active profiles mid-session.
 */
export async function deleteProfile(id: string): Promise<void> {
  const remaining = await listProfiles();
  if (remaining.length <= 1) {
    throw new Error("Não é possível excluir o único perfil.");
  }

  const wasActive = remaining.find((profile) => profile.id === id)?.isDefault ?? false;

  await db.update(profiles).set({ deletedAt: nowIso(), updatedAt: nowIso() }).where(eq(profiles.id, id));

  if (wasActive) {
    const nextActive = remaining.find((profile) => profile.id !== id);
    if (nextActive) {
      await setActiveProfile(nextActive.id);
    }
  }
}
