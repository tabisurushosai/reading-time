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
export type SettingsStorageSnapshot = Partial<Pick<StoredSettings, SettingsStorageKey>>;
export type SettingsStoragePatch = SettingsStorageSnapshot;

export interface SettingsStorageAdapter {
  getAll(): Promise<SettingsStorageSnapshot>;
  get(keys: readonly SettingsStorageKey[]): Promise<SettingsStorageSnapshot>;
  set(values: SettingsStoragePatch): Promise<void>;
}

export function resolveSettingsStorageKeys(
  keys: readonly SettingsStorageKey[],
): SettingsStorageKey[] {
  return [...keys];
}
