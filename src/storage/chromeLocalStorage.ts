import {
  SETTINGS_STORAGE_KEYS,
  type SettingsStorageAdapter,
  type SettingsStorageKey,
} from "./settingsStorage";

function normalizeKeys(
  keys: SettingsStorageKey | SettingsStorageKey[] | undefined,
): SettingsStorageKey | SettingsStorageKey[] {
  return keys || SETTINGS_STORAGE_KEYS;
}

export const chromeLocalStorageAdapter: SettingsStorageAdapter = {
  async get(keys) {
    return chrome.storage.local.get(normalizeKeys(keys));
  },
  async set(values) {
    await chrome.storage.local.set(values);
  },
};
