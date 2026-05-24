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

export function listSettingsStorageKeys(): SettingsStorageKey[] {
  return [...SETTINGS_STORAGE_KEYS];
}
