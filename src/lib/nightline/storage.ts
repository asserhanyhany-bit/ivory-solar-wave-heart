const AGE_KEY = "nightline.age18";
const SOUND_KEY = "nightline.sound";
const BLOCK_KEY = "nightline.blocked";
const INTERESTS_KEY = "nightline.interests";

export function hasAgeConfirm(): boolean {
  try {
    return localStorage.getItem(AGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAgeConfirm(ok: boolean) {
  try {
    if (ok) localStorage.setItem(AGE_KEY, "1");
    else localStorage.removeItem(AGE_KEY);
  } catch {
    /* ignore */
  }
}

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function readBlocked(): string[] {
  try {
    const raw = localStorage.getItem(BLOCK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(-80);
  } catch {
    return [];
  }
}

export function addBlocked(id: string) {
  const next = [...new Set([...readBlocked(), id])].slice(-80);
  try {
    localStorage.setItem(BLOCK_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function stashInterests(chips: string[]) {
  try {
    sessionStorage.setItem(INTERESTS_KEY, JSON.stringify(chips));
  } catch {
    /* ignore */
  }
}

export function takeInterests(): string[] {
  try {
    const raw = sessionStorage.getItem(INTERESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}
