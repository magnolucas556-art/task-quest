import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../js/domain.js";
import { STORAGE_KEY, STORAGE_STATUS, loadState, saveState } from "../js/storage.js";

function createFakeStorage(initialValue = null) {
  let value = initialValue;
  let writes = 0;

  return {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, nextValue) {
      assert.equal(key, STORAGE_KEY);
      value = nextValue;
      writes += 1;
    },
    get value() {
      return value;
    },
    get writes() {
      return writes;
    },
  };
}

function validState(overrides = {}) {
  return {
    schemaVersion: 2,
    totalXp: 10,
    tasks: [
      {
        id: "task-1",
        text: "Persistir tarefa",
        completed: true,
        xpAwarded: true,
        priority: "high",
        dueDate: "2026-09-20",
      },
    ],
    ...overrides,
  };
}

test("saves and restores the complete valid document", () => {
  const storage = createFakeStorage();
  const state = validState();

  assert.deepEqual(saveState(state, storage), {
    status: STORAGE_STATUS.SUCCESS,
    persisted: true,
  });
  assert.equal(storage.writes, 1);

  const loaded = loadState(storage);
  assert.equal(loaded.status, STORAGE_STATUS.SUCCESS);
  assert.equal(loaded.persisted, true);
  assert.deepEqual(loaded.state, state);
  assert.notStrictEqual(loaded.state, state);
});

test("treats a missing key as first use without writing", () => {
  const storage = createFakeStorage();
  const loaded = loadState(storage);

  assert.equal(loaded.status, STORAGE_STATUS.MISSING);
  assert.equal(loaded.persisted, false);
  assert.deepEqual(loaded.state, createInitialState());
  assert.equal(storage.writes, 0);
});

test("rejects unreadable JSON and does not overwrite it", () => {
  const storage = createFakeStorage("{not-json");
  const loaded = loadState(storage);

  assert.equal(loaded.status, STORAGE_STATUS.INVALID);
  assert.deepEqual(loaded.state, createInitialState());
  assert.equal(storage.value, "{not-json");
  assert.equal(storage.writes, 0);
});

test("rejects missing and unknown schema versions", () => {
  for (const state of [
    { totalXp: 0, tasks: [] },
    { schemaVersion: 99, totalXp: 0, tasks: [] },
  ]) {
    const storage = createFakeStorage(JSON.stringify(state));
    assert.equal(loadState(storage).status, STORAGE_STATUS.INVALID);
    assert.equal(storage.writes, 0);
  }
});

test("rejects malformed fields, invalid tasks and duplicate IDs as a whole", () => {
  const duplicate = validState();
  duplicate.totalXp = 20;
  duplicate.tasks.push({ ...duplicate.tasks[0] });

  const invalidStates = [
    { schemaVersion: 2, totalXp: 0 },
    { schemaVersion: 2, totalXp: 0, tasks: "not-an-array" },
    validState({ tasks: [{ ...validState().tasks[0], id: "" }] }),
    validState({ tasks: [{ ...validState().tasks[0], text: "   " }] }),
    validState({ tasks: [{ ...validState().tasks[0], completed: "yes" }] }),
    validState({ tasks: [{ ...validState().tasks[0], xpAwarded: "yes" }] }),
    validState({ tasks: [{ ...validState().tasks[0], completed: true, xpAwarded: false }] }),
    duplicate,
  ];

  for (const state of invalidStates) {
    const storage = createFakeStorage(JSON.stringify(state));
    const loaded = loadState(storage);
    assert.equal(loaded.status, STORAGE_STATUS.INVALID);
    assert.deepEqual(loaded.state, createInitialState());
    assert.equal(storage.writes, 0);
  }
});

test("rejects invalid XP and never recovers valid XP from invalid tasks", () => {
  const invalidXpValues = [-10, 5, 10.5, Number.MAX_SAFE_INTEGER + 1];

  for (const totalXp of invalidXpValues) {
    const storage = createFakeStorage(JSON.stringify({ schemaVersion: 2, totalXp, tasks: [] }));
    assert.equal(loadState(storage).status, STORAGE_STATUS.INVALID);
  }

  const mixedDocument = validState({
    totalXp: 100,
    tasks: [validState().tasks[0], { id: "broken", text: "", completed: false, xpAwarded: false }],
  });
  const loaded = loadState(createFakeStorage(JSON.stringify(mixedDocument)));
  assert.equal(loaded.status, STORAGE_STATUS.INVALID);
  assert.equal(loaded.state.totalXp, 0);
  assert.deepEqual(loaded.state.tasks, []);
});

test("rejects XP lower than represented rewards but accepts historical XP after deletion", () => {
  const inconsistent = validState({ totalXp: 0 });
  const historical = { schemaVersion: 2, totalXp: 200, tasks: [] };

  assert.equal(
    loadState(createFakeStorage(JSON.stringify(inconsistent))).status,
    STORAGE_STATUS.INVALID,
  );
  assert.deepEqual(
    loadState(createFakeStorage(JSON.stringify(historical))),
    { status: STORAGE_STATUS.SUCCESS, state: historical, persisted: true },
  );
});

test("reports unavailable storage and protected read failures", () => {
  assert.deepEqual(loadState(null), {
    status: STORAGE_STATUS.UNAVAILABLE,
    state: createInitialState(),
    persisted: false,
  });

  const failingStorage = {
    getItem() {
      throw new Error("read failed");
    },
    setItem() {},
  };
  assert.equal(loadState(failingStorage).status, STORAGE_STATUS.READ_FAILURE);
});

test("rejects invalid state before writing", () => {
  const storage = createFakeStorage();
  const result = saveState({ schemaVersion: 2, totalXp: 5, tasks: [] }, storage);

  assert.deepEqual(result, { status: STORAGE_STATUS.INVALID, persisted: false });
  assert.equal(storage.writes, 0);
});

test("reports write failure and later persists the complete current state", () => {
  let shouldFail = true;
  let savedValue = null;
  const storage = {
    getItem() {
      return savedValue;
    },
    setItem(_key, value) {
      if (shouldFail) {
        throw new Error("write failed");
      }
      savedValue = value;
    },
  };

  const firstState = validState();
  assert.deepEqual(saveState(firstState, storage), {
    status: STORAGE_STATUS.WRITE_FAILURE,
    persisted: false,
  });

  const currentState = validState({
    totalXp: 20,
    tasks: [
      firstState.tasks[0],
      { id: "task-2", text: "Estado mais recente", completed: true, xpAwarded: true, priority: "medium", dueDate: null },
    ],
  });
  shouldFail = false;
  assert.deepEqual(saveState(currentState, storage), {
    status: STORAGE_STATUS.SUCCESS,
    persisted: true,
  });
  assert.deepEqual(JSON.parse(savedValue), currentState);
});

test("migrates a complete V1 document once while preserving XP and reward history", () => {
  const legacy = {
    schemaVersion: 1,
    totalXp: 10,
    tasks: [{ id: "legacy", text: "Tarefa antiga", completed: true, xpAwarded: true }],
  };
  const storage = createFakeStorage(JSON.stringify(legacy));
  const loaded = loadState(storage);

  assert.equal(loaded.status, STORAGE_STATUS.MIGRATED);
  assert.equal(loaded.persisted, true);
  assert.equal(loaded.state.schemaVersion, 2);
  assert.deepEqual(loaded.state.tasks[0], {
    ...legacy.tasks[0],
    priority: "medium",
    dueDate: null,
  });
  assert.equal(loaded.state.totalXp, 10);
  assert.equal(storage.writes, 1);
  assert.equal(loadState(storage).status, STORAGE_STATUS.SUCCESS);
});
