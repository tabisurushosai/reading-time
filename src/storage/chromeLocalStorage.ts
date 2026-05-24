import {
  normalizeSettingsStorageKeys,
  type SettingsStorageAdapter,
} from "./settingsStorage";

export const chromeLocalStorageAdapter: SettingsStorageAdapter = {
  async get(keys) {
    return chrome.storage.local.get(normalizeSettingsStorageKeys(keys));
  },
  async set(values) {
    await chrome.storage.local.set(values);
  },
};
