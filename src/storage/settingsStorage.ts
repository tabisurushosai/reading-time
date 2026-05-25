import type { StoredSettings } from "../core/settings";

export const SETTINGS_STORAGE_KEYS = [
  "speedJa",
  "speedEn",
  "isPremium",
  "trialStartTs",
  "siteSpeeds",
  "hasSeenOnboarding",
] as const satisfies readonly (keyof StoredSettings)[];

export type SettingsStorageKey = (typeof SETTINGS_STORAGE_KEYS)[number];
export type SettingsStorageValues = Pick<StoredSettings, SettingsStorageKey>;
export type SettingsStorageSnapshot = Partial<SettingsStorageValues>;
export type SettingsStoragePatch = SettingsStorageSnapshot;
export type SettingsStorageValue<K extends SettingsStorageKey> = SettingsStorageValues[K];

const settingsStorageKeySet = new Set<SettingsStorageKey>(SETTINGS_STORAGE_KEYS);

/**
 * Platform-neutral settings storage boundary.
 * Implementations must preserve these key names and value shapes.
 */
export interface SettingsStorageReader {
  readAll(): Promise<SettingsStorageSnapshot>;
  read<K extends SettingsStorageKey>(
    key: K,
  ): Promise<SettingsStorageValue<K> | undefined>;
}

export interface SettingsStorageWriter {
  write(values: SettingsStoragePatch): Promise<void>;
}

export interface SettingsStorageAdapter
  extends SettingsStorageReader,
    SettingsStorageWriter {}

export function isSettingsStorageKey(key: PropertyKey): key is SettingsStorageKey {
  return typeof key === "string" && settingsStorageKeySet.has(key as SettingsStorageKey);
}

export function pickSettingsStorageSnapshot(
  values: Record<string, unknown>,
): SettingsStorageSnapshot {
  const entries = SETTINGS_STORAGE_KEYS.flatMap((key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? [[key, values[key]]] : [],
  );

  return Object.fromEntries(entries) as SettingsStorageSnapshot;
}

export function listSettingsStorageKeys(): SettingsStorageKey[] {
  return [...SETTINGS_STORAGE_KEYS];
}
