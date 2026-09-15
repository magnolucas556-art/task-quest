import assert from "node:assert/strict";
import test from "node:test";

import {
  beginEditing,
  cancelEditing,
  completeTask,
  createTask,
  deleteTask,
  editTask,
  getAppSnapshot,
  initializeApp,
  reopenTask,
} from "../js/app.js";
import { STORAGE_STATUS } from "../js/storage.js";

function createStorage(initialState = null) {
  let value = initialState === null ? null : JSON.stringify(initialState);
  let writes = 0;
  let failNextWrite = false;

  return {
    getItem() {
      return value;
    },
    setItem(_key, nextValue) {
      if (failNextWrite) {
        failNextWrite = false;
        throw new Error("write failed");
      }
      value = nextValue;
      writes += 1;
    },
    failOnce() {
      failNextWrite = true;
    },
    readState() {
      return value === null ? null : JSON.parse(value);
    },
    get writes() {
      return writes;
    },
  };
}

function pendingTasksState() {
  return {
    schemaVersion: 2,
    totalXp: 0,
    tasks: [
      { id: "task-1", text: "Primeira", completed: false, xpAwarded: false, priority: "medium", dueDate: null },
      { id: "task-2", text: "Segunda", completed: false, xpAwarded: false, priority: "medium", dueDate: null },
    ],
  };
}

test("initializes first use without persisting automatically", () => {
  const storage = createStorage();
  const snapshot = initializeApp(storage);

  assert.deepEqual(snapshot.state, { schemaVersion: 2, totalXp: 0, tasks: [] });
  assert.equal(snapshot.context.initializationStatus, STORAGE_STATUS.MISSING);
  assert.equal(snapshot.context.firstUse, true);
  assert.equal(snapshot.context.volatile, false);
  assert.equal(storage.writes, 0);
});

test("requests another browser UUID when the first value collides", () => {
  const state = {
    schemaVersion: 2,
    totalXp: 0,
    tasks: [{ id: "collision", text: "Existente", completed: false, xpAwarded: false, priority: "medium", dueDate: null }],
  };
  const storage = createStorage(state);
  const originalRandomUuid = globalThis.crypto.randomUUID;
  const ids = ["collision", "unique-id"];
  let calls = 0;
  globalThis.crypto.randomUUID = () => {
    const id = ids[calls];
    calls += 1;
    return id;
  };

  try {
    initializeApp(storage);
    const result = createTask("  Nova tarefa  ");

    assert.equal(calls, 2);
    assert.equal(result.changed, true);
    assert.equal(result.state.tasks[1].id, "unique-id");
    assert.equal(result.state.tasks[1].text, "Nova tarefa");
    assert.equal(result.persistence?.status, STORAGE_STATUS.SUCCESS);
    assert.equal(storage.writes, 1);
  } finally {
    globalThis.crypto.randomUUID = originalRandomUuid;
  }
});

test("keeps changed memory state after failure and persists all changes on recovery", () => {
  const storage = createStorage(pendingTasksState());
  initializeApp(storage);
  storage.failOnce();

  const failed = completeTask("task-1");
  assert.equal(failed.changed, true);
  assert.equal(failed.state.totalXp, 10);
  assert.equal(failed.persistence?.status, STORAGE_STATUS.WRITE_FAILURE);
  assert.equal(failed.context.volatile, true);
  assert.equal(storage.readState().totalXp, 0);

  const recovered = completeTask("task-2");
  assert.equal(recovered.state.totalXp, 20);
  assert.equal(recovered.persistence?.status, STORAGE_STATUS.SUCCESS);
  assert.equal(recovered.context.volatile, false);
  assert.equal(storage.readState().totalXp, 20);
  assert.equal(storage.readState().tasks.every((task) => task.completed), true);
});

test("does not write when a domain operation has no effect", () => {
  const state = pendingTasksState();
  state.totalXp = 10;
  state.tasks[0] = { ...state.tasks[0], completed: true, xpAwarded: true };
  const storage = createStorage(state);
  initializeApp(storage);

  const result = completeTask("task-1");
  assert.equal(result.changed, false);
  assert.equal(result.persistence, null);
  assert.equal(storage.writes, 0);
});

test("keeps editing transient and clears it after a successful edit", () => {
  const storage = createStorage(pendingTasksState());
  initializeApp(storage);

  assert.equal(beginEditing("missing"), false);
  assert.equal(beginEditing("task-1"), true);
  assert.equal(getAppSnapshot().context.editingTaskId, "task-1");

  const result = editTask("task-1", "Texto atualizado");
  assert.equal(result.changed, true);
  assert.equal(result.context.editingTaskId, null);
  assert.equal(result.state.tasks[0].text, "Texto atualizado");
  assert.equal(storage.readState().tasks[0].text, "Texto atualizado");
});

test("keeps editing on invalid input and coordinates cancel, reopen and delete", () => {
  const state = pendingTasksState();
  state.totalXp = 10;
  state.tasks[0] = { ...state.tasks[0], completed: true, xpAwarded: true };
  const storage = createStorage(state);
  initializeApp(storage);

  assert.equal(beginEditing("task-1"), true);
  const invalidEdit = editTask("task-1", "   ");
  assert.equal(invalidEdit.changed, false);
  assert.equal(invalidEdit.context.editingTaskId, "task-1");
  assert.equal(storage.writes, 0);

  cancelEditing();
  assert.equal(getAppSnapshot().context.editingTaskId, null);

  const reopened = reopenTask("task-1");
  assert.equal(reopened.changed, true);
  assert.equal(reopened.state.tasks[0].completed, false);
  assert.equal(reopened.state.totalXp, 10);

  const deleted = deleteTask("task-2");
  assert.equal(deleted.changed, true);
  assert.deepEqual(deleted.state.tasks.map((task) => task.id), ["task-1"]);
  assert.equal(storage.writes, 2);
});

test("distinguishes invalid recovery from an unavailable volatile session", () => {
  const invalidStorage = createStorage();
  invalidStorage.setItem("ignored", "not-json");
  const recovered = initializeApp(invalidStorage);

  assert.equal(recovered.context.recoveredFromInvalidData, true);
  assert.equal(recovered.context.volatile, false);
  assert.deepEqual(recovered.state, { schemaVersion: 2, totalXp: 0, tasks: [] });

  const unavailable = initializeApp(null);
  assert.equal(unavailable.context.initializationStatus, STORAGE_STATUS.UNAVAILABLE);
  assert.equal(unavailable.context.volatile, true);
});
