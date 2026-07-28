import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "../../db/client";
import { categories } from "../../db/schema";
import { nowIso } from "../../lib/dates";
import { newId } from "../../lib/id";

export interface CategoryRow {
  id: string;
  name: string;
  color: string;
}

export async function listCategories(profileId: string): Promise<CategoryRow[]> {
  return db
    .select({ id: categories.id, name: categories.name, color: categories.color })
    .from(categories)
    .where(and(eq(categories.profileId, profileId), isNull(categories.deletedAt)))
    .orderBy(asc(categories.name));
}

export async function createCategory(
  profileId: string,
  name: string,
  color: string,
): Promise<void> {
  await db.insert(categories).values({ id: newId(), profileId, name: name.trim(), color });
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await db
    .update(categories)
    .set({ name: name.trim(), updatedAt: nowIso() })
    .where(eq(categories.id, id));
}

export async function updateCategoryColor(id: string, color: string): Promise<void> {
  await db.update(categories).set({ color, updatedAt: nowIso() }).where(eq(categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
  await db
    .update(categories)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(categories.id, id));
}
