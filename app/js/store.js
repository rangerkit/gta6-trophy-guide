// store.js — progress state for Vice City Platinum Path.
// Earned trophies and the spoiler-shield setting live in localStorage only;
// nothing is sent anywhere. Export writes a small JSON file the reader keeps,
// and import reads that same shape back (a bare array of trophy names, the
// shape simple checklists use, is accepted too).

const EARNED_KEY = 'vcpp-earned-v1';
const SETTINGS_KEY = 'vcpp-settings-v1';

export function loadEarned() {
  try {
    const names = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(Array.isArray(names) ? names.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  const fallback = { spoilerShield: true };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return { ...fallback, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch {
    return fallback;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned, trophies) {
  const payload = {
    app: 'Vice City Platinum Path',
    format: 'vcpp-progress-v1',
    exportedAt: new Date().toISOString(),
    earnedCount: earned.size,
    total: trophies.length,
    earned: [...earned],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'vice-city-platinum-path-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseImport(text, trophies) {
  const data = JSON.parse(text);
  const names = Array.isArray(data) ? data : data?.earned;
  if (!Array.isArray(names)) throw new Error('no earned list in that file');
  const valid = new Set(trophies.map((t) => t.name));
  return new Set(names.filter((n) => typeof n === 'string' && valid.has(n)));
}
