import assert from "node:assert/strict";
import test from "node:test";
import { THEME_KEY, createThemeController, getSystemTheme, normalizeTheme } from "../js/theme.js";

function createDocument() {
  const attributes = new Map();
  const label = {};
  const button = {
    setAttribute(name, value) { attributes.set(name, value); },
    querySelector() { return label; },
  };
  return {
    documentElement: { dataset: {}, style: {} },
    getElementById() { return button; },
    attributes,
    label,
  };
}

test("normalizes themes and derives the system preference", () => {
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("sepia"), null);
  assert.equal(getSystemTheme({ matches: true }), "dark");
  assert.equal(getSystemTheme({ matches: false }), "light");
});

test("uses the stored theme and persists an accessible toggle", () => {
  const documentRef = createDocument();
  const values = new Map([[THEME_KEY, "dark"]]);
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
  const controller = createThemeController(documentRef, storage, { matches: false });
  assert.equal(controller.getTheme(), "dark");
  assert.equal(documentRef.documentElement.dataset.theme, "dark");
  assert.equal(documentRef.attributes.get("aria-pressed"), "true");
  assert.deepEqual(controller.toggle(), { theme: "light", persisted: true });
  assert.equal(values.get(THEME_KEY), "light");
  assert.equal(documentRef.label.textContent, "Modo claro");
});

test("falls back to the system theme when storage is unavailable", () => {
  const documentRef = createDocument();
  const storage = {
    getItem() { throw new Error("unavailable"); },
    setItem() { throw new Error("unavailable"); },
  };
  const controller = createThemeController(documentRef, storage, { matches: true });
  assert.equal(controller.getTheme(), "dark");
  assert.deepEqual(controller.toggle(), { theme: "light", persisted: false });
});
