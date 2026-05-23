import type { StoredSettings } from "../core/settings";

export type SettingsStorageKey = keyof StoredSettings;

export interface SettingsStorageAdapter {
  get(keys?: SettingsStorageKey | SettingsStorageKey[]): Promise<StoredSettings>;
  set(values: StoredSettings): Promise<void>;
}

export const SETTINGS_STORAGE_KEYS: SettingsStorageKey[] = [
  "speedJa",
  "speedEn",
  "isPremium",
  "trialStartTs",
  "siteSpeeds",
];
