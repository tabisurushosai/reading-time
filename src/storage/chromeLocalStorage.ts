import {
  pickSettingsStorageSnapshot,
  listSettingsStorageKeys,
  type SettingsStorageAdapter,
  type SettingsStorageKey,
  type SettingsStoragePatch,
  type SettingsStorageSnapshot,
  type SettingsStorageValue,
} from "./settingsStorage";

export interface ChromeSettingsStorageArea {
  get(keys: SettingsStorageKey | SettingsStorageKey[]): Promise<Record<string, unknown>>;
  set(values: SettingsStoragePatch): Promise<void>;
}

export function createChromeLocalStorageAdapter(
  storageArea: ChromeSettingsStorageArea,
): SettingsStorageAdapter {
  return {
    async readAll(): Promise<SettingsStorageSnapshot> {
      return pickSettingsStorageSnapshot(await storageArea.get(listSettingsStorageKeys()));
    },
    async read<K extends SettingsStorageKey>(
      key: K,
    ): Promise<SettingsStorageValue<K> | undefined> {
      const values = pickSettingsStorageSnapshot(await storageArea.get(key));

      return values[key] as SettingsStorageValue<K> | undefined;
    },
    async write(values) {
      await storageArea.set(values);
    },
  };
}

export const chromeLocalStorageAdapter = createChromeLocalStorageAdapter(
  chrome.storage.local,
);
