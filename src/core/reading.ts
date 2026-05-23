export type ReadingLanguage = "ja" | "en";

export interface TextStats {
  charCount: number;
  wordCount: number;
}

export interface ReadingSpeeds {
  speedJa: number;
  speedEn: number;
}

export const DEFAULT_READING_SPEEDS: ReadingSpeeds = {
  speedJa: 400,
  speedEn: 200,
};

export function countTextStats(text: string): TextStats {
  const trimmedText = text.trim();

  return {
    charCount: text.replace(/\s/g, "").length,
    wordCount: trimmedText ? trimmedText.split(/\s+/).length : 0,
  };
}

export function estimateReadingMinutes(
  stats: TextStats,
  language: ReadingLanguage,
  speeds: ReadingSpeeds,
): number {
  const units = language === "ja" ? stats.charCount : stats.wordCount;
  const speed = language === "ja" ? speeds.speedJa : speeds.speedEn;

  return speed ? Math.ceil(units / speed) : 0;
}
