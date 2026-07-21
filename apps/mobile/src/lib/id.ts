import { v7 as uuidv7 } from "uuid";

/** Generates a device-local, time-sortable id (UUIDv7) for every new record. */
export function newId(): string {
  return uuidv7();
}
