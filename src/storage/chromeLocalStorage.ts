import {
  listSettingsStorageKeys,
  type SettingsStorageAdapter,
  type SettingsStorageKey,
  type SettingsStorageSnapshot,
  type SettingsStorageValue,
} from "./settingsStorage";

export const chromeLocalStorageAdapter: SettingsStorageAdapter = {
  async readAll() {
    return chrome.storage.local.get(listSettingsStorageKeys());
  },
  async read<K extends SettingsStorageKey>(
    key: K,
  ): Promise<SettingsStorageValue<K> | undefined> {
    const values = (await chrome.storage.local.get(key)) as SettingsStorageSnapshot;

    return values[key] as SettingsStorageValue<K> | undefined;
  },
  async write(values) {
    await chrome.storage.local.set(values);
  },
};
