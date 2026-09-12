import { createInitialState, validateState } from "./domain.js";

export const STORAGE_KEY = "taskQuest.state";

export const STORAGE_STATUS = Object.freeze({
  SUCCESS: "SUCCESS",
  MISSING: "MISSING",
  INVALID: "INVALID",
  UNAVAILABLE: "UNAVAILABLE",
  READ_FAILURE: "READ_FAILURE",
  WRITE_FAILURE: "WRITE_FAILURE",
});

/** @typedef {ReturnType<typeof createInitialState>} AppState */

/**
 * @typedef {object} StorageLike
 * @property {(key: string) => string | null} getItem
 * @property {(key: string, value: string) => void} setItem
 */

/**
 * Loads and validates the complete persisted document.
 *
 * @param {unknown} [storageOverride]
 * @returns {{status: string, state: AppState, persisted: boolean}}
 */
export function loadState(storageOverride) {
  const resolved = resolveStorage(storageOverride);
  if (!resolved.storage) {
    return loadFallback(resolved.status);
  }

  let serialized;
  try {
    serialized = resolved.storage.getItem(STORAGE_KEY);
  } catch {
    return loadFallback(STORAGE_STATUS.READ_FAILURE);
  }

  if (serialized === null) {
    return loadFallback(STORAGE_STATUS.MISSING);
  }

  let candidate;
  try {
    candidate = JSON.parse(serialized);
  } catch {
    return loadFallback(STORAGE_STATUS.INVALID);
  }

  try {
    if (!validateState(candidate).valid) {
      return loadFallback(STORAGE_STATUS.INVALID);
    }
  } catch {
    return loadFallback(STORAGE_STATUS.INVALID);
  }

  return {
    status: STORAGE_STATUS.SUCCESS,
    state: /** @type {AppState} */ (candidate),
    persisted: true,
  };
}

/**
 * Validates and writes the complete current document.
 *
 * @param {AppState} state
 * @param {unknown} [storageOverride]
 * @returns {{status: string, persisted: boolean}}
 */
export function saveState(state, storageOverride) {
  try {
    if (!validateState(state).valid) {
      return { status: STORAGE_STATUS.INVALID, persisted: false };
    }
  } catch {
    return { status: STORAGE_STATUS.INVALID, persisted: false };
  }

  const resolved = resolveStorage(storageOverride);
  if (!resolved.storage) {
    return { status: resolved.status, persisted: false };
  }

  let serialized;
  try {
    serialized = JSON.stringify(state);
    resolved.storage.setItem(STORAGE_KEY, serialized);
  } catch {
    return { status: STORAGE_STATUS.WRITE_FAILURE, persisted: false };
  }

  return { status: STORAGE_STATUS.SUCCESS, persisted: true };
}

/**
 * @param {string} status
 * @returns {{status: string, state: AppState, persisted: boolean}}
 */
function loadFallback(status) {
  return {
    status,
    state: createInitialState(),
    persisted: false,
  };
}

/**
 * @param {unknown} storageOverride
 * @returns {{storage: StorageLike | null, status: string}}
 */
function resolveStorage(storageOverride) {
  if (storageOverride !== undefined) {
    return isStorageLike(storageOverride)
      ? { storage: storageOverride, status: STORAGE_STATUS.SUCCESS }
      : { storage: null, status: STORAGE_STATUS.UNAVAILABLE };
  }

  try {
    const nativeStorage = globalThis.localStorage;
    return isStorageLike(nativeStorage)
      ? { storage: nativeStorage, status: STORAGE_STATUS.SUCCESS }
      : { storage: null, status: STORAGE_STATUS.UNAVAILABLE };
  } catch {
    return { storage: null, status: STORAGE_STATUS.UNAVAILABLE };
  }
}

/**
 * @param {unknown} candidate
 * @returns {candidate is StorageLike}
 */
function isStorageLike(candidate) {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "getItem" in candidate &&
    typeof candidate.getItem === "function" &&
    "setItem" in candidate &&
    typeof candidate.setItem === "function"
  );
}
