import { DEFAULT_READING_SPEEDS, type ReadingSpeeds } from "./reading";

export const TRIAL_DAYS = 7;

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export type SiteSpeeds = Record<string, Partial<ReadingSpeeds>>;

export interface StoredSettings extends Partial<ReadingSpeeds> {
  isPremium?: boolean;
  trialStartTs?: number;
  siteSpeeds?: SiteSpeeds;
  hasSeenOnboarding?: boolean;
}

export interface EffectiveSettings extends ReadingSpeeds {
  isPremium: boolean;
  trialStartTs: number;
  siteSpeeds: SiteSpeeds;
  hasSeenOnboarding: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidSpeed(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value !== 0;
}

function normalizeSpeed(value: unknown, fallback: number): number {
  return isValidSpeed(value) ? value : fallback;
}

function normalizeOptionalSpeed(value: unknown): number | undefined {
  return isValidSpeed(value) ? value : undefined;
}

function normalizeSiteSpeeds(value: unknown): SiteSpeeds {
  if (!isRecord(value)) {
    return {};
  }

  const normalized: SiteSpeeds = {};

  for (const [domain, rawSpeeds] of Object.entries(value)) {
    if (!isRecord(rawSpeeds)) {
      continue;
    }

    const domainSpeeds: Partial<ReadingSpeeds> = {};
    const speedJa = normalizeOptionalSpeed(rawSpeeds["speedJa"]);
    const speedEn = normalizeOptionalSpeed(rawSpeeds["speedEn"]);

    if (speedJa !== undefined) {
      domainSpeeds.speedJa = speedJa;
    }

    if (speedEn !== undefined) {
      domainSpeeds.speedEn = speedEn;
    }

    normalized[domain] = domainSpeeds;
  }

  return normalized;
}

export function normalizeStoredSettings(
  stored: StoredSettings,
  defaultTrialStartTs: number,
): EffectiveSettings {
  return {
    speedJa: normalizeSpeed(stored.speedJa, DEFAULT_READING_SPEEDS.speedJa),
    speedEn: normalizeSpeed(stored.speedEn, DEFAULT_READING_SPEEDS.speedEn),
    isPremium: Boolean(stored.isPremium),
    trialStartTs: stored.trialStartTs || defaultTrialStartTs,
    siteSpeeds: normalizeSiteSpeeds(stored.siteSpeeds),
    hasSeenOnboarding: Boolean(stored.hasSeenOnboarding),
  };
}

export function applySiteSpeeds(
  speeds: ReadingSpeeds,
  siteSpeeds: SiteSpeeds,
  domain: string | undefined,
): ReadingSpeeds {
  if (!domain || !siteSpeeds[domain]) {
    return speeds;
  }

  const domainSpeeds = siteSpeeds[domain];

  return {
    speedJa: normalizeSpeed(domainSpeeds.speedJa, speeds.speedJa),
    speedEn: normalizeSpeed(domainSpeeds.speedEn, speeds.speedEn),
  };
}

export function getTrialRemainingDays(
  trialStartTs: number,
  nowTs: number,
): number {
  const trialElapsed = nowTs - trialStartTs;

  return Math.max(0, TRIAL_DAYS - trialElapsed / DAY_IN_MS);
}

export function hasPremiumAccess(
  isPremium: boolean,
  trialStartTs: number,
  nowTs: number,
): boolean {
  return isPremium || getTrialRemainingDays(trialStartTs, nowTs) > 0;
}

export function setDomainSpeeds(
  siteSpeeds: SiteSpeeds,
  domain: string,
  speeds: ReadingSpeeds,
): SiteSpeeds {
  return {
    ...siteSpeeds,
    [domain]: {
      speedJa: speeds.speedJa,
      speedEn: speeds.speedEn,
    },
  };
}
