import type { StoredSettings } from "../core/settings";

export type SettingsStorageKey = keyof StoredSettings;
export type SettingsStorageQuery =
  | SettingsStorageKey
  | readonly SettingsStorageKey[];
export type SettingsStorageValues = StoredSettings;

export interface SettingsStorageAdapter {
  get(keys?: SettingsStorageQuery): Promise<SettingsStorageValues>;
  set(values: SettingsStorageValues): Promise<void>;
}

export const SETTINGS_STORAGE_KEYS = [
  "speedJa",
  "speedEn",
  "isPremium",
  "trialStartTs",
  "siteSpeeds",
] as const satisfies readonly SettingsStorageKey[];

export function normalizeSettingsStorageKeys(
  keys?: SettingsStorageQuery,
): SettingsStorageKey[] {
  return keys ? [...(Array.isArray(keys) ? keys : [keys])] : [...SETTINGS_STORAGE_KEYS];
}
