# PORTING

reading-time を iOS / Android など Chrome 拡張以外へ移植する際の指針。

## 分離方針

- `src/core/` は純ロジック専用。`chrome.*`、DOM、通信、プラットフォーム API に依存しない。
- 読了時間計算、文字数/単語数集計、試用期間判定、サイト別速度の適用は `src/core/` の関数を使う。
- 保存は `src/storage/settingsStorage.ts` の `SettingsStorageAdapter` 越しに行う。
- 保存キーは `SETTINGS_STORAGE_KEYS` を単一の一覧として扱い、移植先でも同じキー名・値型を使う。
- Chrome 拡張では `src/storage/chromeLocalStorage.ts` が `chrome.storage.local` をラップする。
- `SettingsStorageAdapter` は Chrome API の形ではなく、`readAll` / `read` / `write` のキー値境界として移植先が実装する。

## 移植時に差し替える場所

1. `SettingsStorageAdapter` を実装し、既存キーを維持する。
   - `speedJa`
   - `speedEn`
   - `isPremium`
   - `trialStartTs`
   - `siteSpeeds`
   - `hasSeenOnboarding`
2. UI 層からは保存先を直接触らず、アダプタの `readAll` / `read` / `write` を呼ぶ。
3. ページ本文の取得やバッジ表示など、プラットフォーム固有 API は UI / adapter 層に閉じ込める。

## iOS / Android アプリ化時の実装メモ

- `src/core/` は TypeScript の純関数として扱い、Chrome 拡張以外でもそのまま再利用する。
- ネイティブ保存先を使う場合も、`SettingsStorageAdapter` と同じ `readAll()` / `read(key)` / `write(values)` の境界に合わせる。
- `readAll()` は `SETTINGS_STORAGE_KEYS` の全キーを対象に、保存済みのキーだけを `SettingsStorageSnapshot` として返す。
- `read(key)` は `SettingsStorageKey` を 1 つ受け取り、そのキーの値または `undefined` を返す。
- `write(values)` は `SettingsStoragePatch` を受け取り、渡されたキーだけを保存する。保存済みの他キーは消さない。
- UI は本文テキスト、現在ドメイン、表示文言、バッジ相当の表示などを各プラットフォームで取得し、読了時間計算や設定正規化は `src/core/` に渡す。
- 新しい保存項目が必要になった場合は、既存キーの意味を変えずに `SETTINGS_STORAGE_KEYS`、`SettingsStorageAdapter`、移植先アダプタを同時に更新する。

## Adapter 実装チェックリスト

- `src/core/` から保存 API を直接呼ばず、保存値は UI / adapter 層から引数として渡す。
- iOS / Android では Keychain、SharedPreferences、SQLite など保存先を選んでも、外側の IF は `SettingsStorageAdapter` に合わせる。
- `readAll()` は初期表示や設定正規化向け、`read(key)` は単一キー更新前の再読込向けに使い分ける。
- Chrome 版と同じ保存キー・値型を維持し、既存ユーザーの `chrome.storage.local` データを変換なしで扱える状態を保つ。

## 互換性の注意

- 保存データ形式は既存 Chrome 版と同じキー・値を使う。
- 権限追加、外部 API、CDN、remote code、eval は導入しない。
- `src/core/` にプラットフォーム依存が入った場合は、移植前に adapter または UI 層へ戻す。
