// Must load before "uuid" — RN/Hermes has no native crypto.getRandomValues,
// so uuid's v7()/v4() throw at runtime on-device without this polyfill.
// (Node has native crypto, which is why this never surfaced in vitest/CI.)
import "react-native-get-random-values";
import { v7 as uuidv7 } from "uuid";

/** Generates a device-local, time-sortable id (UUIDv7) for every new record. */
export function newId(): string {
  return uuidv7();
}
