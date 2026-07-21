import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "../../db/client";
import { categories } from "../../db/schema";

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
