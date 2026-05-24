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
export type SettingsStorageSelection =
  | SettingsStorageKey
  | readonly SettingsStorageKey[];
export type SettingsStorageValues = Partial<Pick<StoredSettings, SettingsStorageKey>>;

export interface SettingsStorageAdapter {
  get(keys?: SettingsStorageSelection): Promise<SettingsStorageValues>;
  set(values: SettingsStorageValues): Promise<void>;
}

export function resolveSettingsStorageKeys(
  keys?: SettingsStorageSelection,
): SettingsStorageKey[] {
  return keys ? [...(Array.isArray(keys) ? keys : [keys])] : [...SETTINGS_STORAGE_KEYS];
}
