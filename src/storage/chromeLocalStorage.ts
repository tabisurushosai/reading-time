import {
  resolveSettingsStorageKeys,
  type SettingsStorageAdapter,
} from "./settingsStorage";

export const chromeLocalStorageAdapter: SettingsStorageAdapter = {
  async get(keys) {
    return chrome.storage.local.get(resolveSettingsStorageKeys(keys));
  },
  async set(values) {
    await chrome.storage.local.set(values);
  },
};
