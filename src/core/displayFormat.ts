export type SupportedDisplayLocale = "ja-JP" | "en-US";

export function resolveDisplayLocale(uiLanguage: string): SupportedDisplayLocale {
  return uiLanguage.toLowerCase().startsWith("ja") ? "ja-JP" : "en-US";
}

export function createDisplayNumberFormatter(
  locale: SupportedDisplayLocale,
): Intl.NumberFormat {
  return new Intl.NumberFormat(locale);
}

export function createRelativeDayFormatter(
  locale: SupportedDisplayLocale,
): Intl.RelativeTimeFormat {
  return new Intl.RelativeTimeFormat(locale, {
    numeric: "always",
  });
}
