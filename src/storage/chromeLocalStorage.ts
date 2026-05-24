import {
  SETTINGS_STORAGE_KEYS,
  resolveSettingsStorageKeys,
  type SettingsStorageAdapter,
} from "./settingsStorage";

export const chromeLocalStorageAdapter: SettingsStorageAdapter = {
  async getAll() {
    return chrome.storage.local.get(resolveSettingsStorageKeys(SETTINGS_STORAGE_KEYS));
  },
  async get(keys) {
    return chrome.storage.local.get(resolveSettingsStorageKeys(keys));
  },
  async set(values) {
    await chrome.storage.local.set(values);
  },
};
