# PORTING

reading-time を iOS / Android など Chrome 拡張以外へ移植する際の指針。

## 分離方針

- `src/core/` は純ロジック専用。`chrome.*`、DOM、通信、プラットフォーム API に依存しない。
- 読了時間計算、文字数/単語数集計、試用期間判定、サイト別速度の適用は `src/core/` の関数を使う。
- 保存は `src/storage/settingsStorage.ts` の `SettingsStorageAdapter` 越しに行う。
- 保存キーは `SETTINGS_STORAGE_KEYS` を単一の一覧として扱い、移植先でも同じキー名・値型を使う。
- Chrome 拡張では `src/storage/chromeLocalStorage.ts` が `chrome.storage.local` をラップする。

## 移植時に差し替える場所

1. `SettingsStorageAdapter` を実装し、既存キーを維持する。
   - `speedJa`
   - `speedEn`
   - `isPremium`
   - `trialStartTs`
   - `siteSpeeds`
   - `hasSeenOnboarding`
2. UI 層からは保存先を直接触らず、アダプタの `get` / `set` を呼ぶ。
3. ページ本文の取得やバッジ表示など、プラットフォーム固有 API は UI / adapter 層に閉じ込める。

## iOS / Android アプリ化時の実装メモ

- `src/core/` は TypeScript の純関数として扱い、Chrome 拡張以外でもそのまま再利用する。
- ネイティブ保存先を使う場合も、`SettingsStorageAdapter` と同じ `get(keys?)` / `set(values)` の境界に合わせる。
- `get(keys?)` は `SettingsStorageSelection` を受け取り、未指定の場合は `SETTINGS_STORAGE_KEYS` の全キーを返す。
- `set(values)` は `SettingsStorageValues` を受け取り、渡されたキーだけを保存する。保存済みの他キーは消さない。
- UI は本文テキスト、現在ドメイン、表示文言、バッジ相当の表示などを各プラットフォームで取得し、読了時間計算や設定正規化は `src/core/` に渡す。
- 新しい保存項目が必要になった場合は、既存キーの意味を変えずに `SETTINGS_STORAGE_KEYS`、`SettingsStorageAdapter`、移植先アダプタを同時に更新する。

## 互換性の注意

- 保存データ形式は既存 Chrome 版と同じキー・値を使う。
- 権限追加、外部 API、CDN、remote code、eval は導入しない。
- `src/core/` にプラットフォーム依存が入った場合は、移植前に adapter または UI 層へ戻す。
