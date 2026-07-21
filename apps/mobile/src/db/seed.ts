import { eq } from "drizzle-orm";

import { newId } from "../lib/id";
import type { Database } from "./client";
import { categories, profiles } from "./schema";

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

/**
 * Runs once on first boot: creates the default "Casa" profile and its starter
 * categories if no profile exists yet. Idempotent — safe to call on every launch.
 */
export async function seedDefaultProfile(db: Database): Promise<void> {
  const existing = await db.select({ id: profiles.id }).from(profiles).limit(1);
  if (existing.length > 0) {
    return;
  }

  const profileId = newId();

  await db.insert(profiles).values({
    id: profileId,
    name: DEFAULT_PROFILE_NAME,
    isDefault: true,
  });

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      id: newId(),
      profileId,
      name: category.name,
      color: category.color,
    })),
  );
}

export async function getDefaultProfileId(db: Database): Promise<string | undefined> {
  const [row] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.isDefault, true))
    .limit(1);
  return row?.id;
}
