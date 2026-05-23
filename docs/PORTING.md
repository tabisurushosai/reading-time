# PORTING

reading-time を iOS / Android など Chrome 拡張以外へ移植する際の指針。

## 分離方針

- `src/core/` は純ロジック専用。`chrome.*`、DOM、通信、プラットフォーム API に依存しない。
- 読了時間計算、文字数/単語数集計、試用期間判定、サイト別速度の適用は `src/core/` の関数を使う。
- 保存は `src/storage/settingsStorage.ts` の `SettingsStorageAdapter` 越しに行う。
- Chrome 拡張では `src/storage/chromeLocalStorage.ts` が `chrome.storage.local` をラップする。

## 移植時に差し替える場所

1. `SettingsStorageAdapter` を実装し、既存キーを維持する。
   - `speedJa`
   - `speedEn`
   - `isPremium`
   - `trialStartTs`
   - `siteSpeeds`
2. UI 層からは保存先を直接触らず、アダプタの `get` / `set` を呼ぶ。
3. ページ本文の取得やバッジ表示など、プラットフォーム固有 API は UI / adapter 層に閉じ込める。

## 互換性の注意

- 保存データ形式は既存 Chrome 版と同じキー・値を使う。
- 権限追加、外部 API、CDN、remote code、eval は導入しない。
- `src/core/` にプラットフォーム依存が入った場合は、移植前に adapter または UI 層へ戻す。
