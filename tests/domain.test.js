import assert from "node:assert/strict";
import test from "node:test";

import {
  DOMAIN_ERRORS,
  completeTask,
  createInitialState,
  createTask,
  deleteTask,
  editTask,
  getGamification,
  reopenTask,
  validateState,
} from "../js/domain.js";

function stateWithTask(overrides = {}) {
  return {
    schemaVersion: 1,
    totalXp: 0,
    tasks: [
      {
        id: "task-1",
        text: "Estudar domínio",
        completed: false,
        xpAwarded: false,
        ...overrides,
      },
    ],
  };
}

test("createInitialState returns independent safe states", () => {
  const first = createInitialState();
  const second = createInitialState();

  assert.deepEqual(first, { schemaVersion: 1, totalXp: 0, tasks: [] });
  assert.deepEqual(second, first);
  assert.notStrictEqual(first, second);
  assert.notStrictEqual(first.tasks, second.tasks);
});

test("createTask trims text and creates a pending unrewarded task", () => {
  const initial = createInitialState();
  const result = createTask(initial, "task-1", "  Estudar JavaScript  ");

  assert.equal(result.changed, true);
  assert.equal(result.error, null);
  assert.equal(result.xpDelta, 0);
  assert.deepEqual(result.state.tasks, [
    { id: "task-1", text: "Estudar JavaScript", completed: false, xpAwarded: false },
  ]);
  assert.deepEqual(initial, createInitialState());
  assert.notStrictEqual(result.state, initial);
  assert.notStrictEqual(result.state.tasks, initial.tasks);
});

test("createTask rejects invalid text, invalid IDs and duplicate IDs without changing state", () => {
  const state = stateWithTask();

  for (const [id, text, error] of [
    ["task-2", "   ", DOMAIN_ERRORS.INVALID_TASK_TEXT],
    ["", "Nova tarefa", DOMAIN_ERRORS.INVALID_TASK_ID],
    ["   ", "Nova tarefa", DOMAIN_ERRORS.INVALID_TASK_ID],
    ["task-1", "Nova tarefa", DOMAIN_ERRORS.DUPLICATE_TASK_ID],
  ]) {
    const result = createTask(state, id, text);
    assert.equal(result.changed, false);
    assert.equal(result.error, error);
    assert.strictEqual(result.state, state);
  }
});

test("editTask changes only text and preserves completion and reward", () => {
  const state = stateWithTask({ completed: true, xpAwarded: true });
  state.totalXp = 10;

  const result = editTask(state, "task-1", "  Conteúdo atualizado  ");

  assert.equal(result.changed, true);
  assert.deepEqual(result.state.tasks[0], {
    id: "task-1",
    text: "Conteúdo atualizado",
    completed: true,
    xpAwarded: true,
  });
  assert.equal(result.state.totalXp, 10);
  assert.equal(state.tasks[0].text, "Estudar domínio");
});

test("editTask treats equal normalized text as an idempotent no-op", () => {
  const state = stateWithTask();
  const result = editTask(state, "task-1", "  Estudar domínio ");

  assert.equal(result.changed, false);
  assert.equal(result.error, null);
  assert.strictEqual(result.state, state);
});

test("editTask rejects invalid text and missing tasks", () => {
  const state = stateWithTask();
  const invalidText = editTask(state, "task-1", "  ");
  const missingTask = editTask(state, "missing", "Texto válido");

  assert.equal(invalidText.error, DOMAIN_ERRORS.INVALID_TASK_TEXT);
  assert.equal(missingTask.error, DOMAIN_ERRORS.TASK_NOT_FOUND);
  assert.strictEqual(invalidText.state, state);
  assert.strictEqual(missingTask.state, state);
});

test("deleteTask removes a task without removing earned XP", () => {
  const state = stateWithTask({ completed: true, xpAwarded: true });
  state.totalXp = 10;

  const result = deleteTask(state, "task-1");

  assert.equal(result.changed, true);
  assert.deepEqual(result.state.tasks, []);
  assert.equal(result.state.totalXp, 10);
  assert.equal(state.tasks.length, 1);
});

test("task operations identify a missing task and preserve state", () => {
  const state = stateWithTask();

  for (const operation of [deleteTask, completeTask, reopenTask]) {
    const result = operation(state, "missing");
    assert.equal(result.changed, false);
    assert.equal(result.error, DOMAIN_ERRORS.TASK_NOT_FOUND);
    assert.strictEqual(result.state, state);
  }
});

test("first completion grants exactly 10 XP and records the reward atomically", () => {
  const state = stateWithTask();
  const result = completeTask(state, "task-1");

  assert.equal(result.changed, true);
  assert.equal(result.xpDelta, 10);
  assert.equal(result.state.totalXp, 10);
  assert.equal(result.state.tasks[0].completed, true);
  assert.equal(result.state.tasks[0].xpAwarded, true);
  assert.equal(state.totalXp, 0);
  assert.equal(state.tasks[0].completed, false);
});

test("reopening preserves reward and total XP; recompletion grants no additional XP", () => {
  const completed = completeTask(stateWithTask(), "task-1").state;
  const reopened = reopenTask(completed, "task-1");
  const completedAgain = completeTask(reopened.state, "task-1");

  assert.equal(reopened.changed, true);
  assert.equal(reopened.state.tasks[0].completed, false);
  assert.equal(reopened.state.tasks[0].xpAwarded, true);
  assert.equal(reopened.state.totalXp, 10);
  assert.equal(completedAgain.changed, true);
  assert.equal(completedAgain.xpDelta, 0);
  assert.equal(completedAgain.state.totalXp, 10);
  assert.equal(completedAgain.state.tasks[0].completed, true);
});

test("repeated complete and reopen events are idempotent", () => {
  const completed = completeTask(stateWithTask(), "task-1").state;
  const repeatedCompletion = completeTask(completed, "task-1");
  const reopened = reopenTask(completed, "task-1").state;
  const repeatedReopen = reopenTask(reopened, "task-1");

  assert.equal(repeatedCompletion.changed, false);
  assert.equal(repeatedCompletion.xpDelta, 0);
  assert.strictEqual(repeatedCompletion.state, completed);
  assert.equal(repeatedReopen.changed, false);
  assert.strictEqual(repeatedReopen.state, reopened);
});

test("a pending rewarded task is valid and can be completed without XP", () => {
  const state = stateWithTask({ completed: false, xpAwarded: true });
  state.totalXp = 10;

  assert.equal(validateState(state).valid, true);
  const result = completeTask(state, "task-1");
  assert.equal(result.changed, true);
  assert.equal(result.xpDelta, 0);
  assert.equal(result.state.totalXp, 10);
});

test("validateState rejects invalid task shape and inconsistent completion/reward", () => {
  const invalidStates = [
    stateWithTask({ text: "   " }),
    stateWithTask({ completed: true, xpAwarded: false }),
    stateWithTask({ completed: "yes" }),
    stateWithTask({ unexpected: true }),
  ];

  for (const state of invalidStates) {
    assert.deepEqual(validateState(state), {
      valid: false,
      error: DOMAIN_ERRORS.INVALID_STATE,
    });
  }
});

test("validateState rejects duplicate and empty task IDs", () => {
  const duplicateIds = stateWithTask();
  duplicateIds.tasks.push({ ...duplicateIds.tasks[0] });

  for (const state of [duplicateIds, stateWithTask({ id: "" }), stateWithTask({ id: "  " })]) {
    assert.equal(validateState(state).valid, false);
  }
});

test("validateState rejects malformed app state and invalid XP", () => {
  const invalidStates = [
    null,
    {},
    { schemaVersion: 2, totalXp: 0, tasks: [] },
    { schemaVersion: 1, totalXp: -10, tasks: [] },
    { schemaVersion: 1, totalXp: 5, tasks: [] },
    { schemaVersion: 1, totalXp: 10.5, tasks: [] },
    { schemaVersion: 1, totalXp: 0, tasks: [], extra: true },
  ];

  for (const state of invalidStates) {
    assert.equal(validateState(state).valid, false);
  }
});

test("validateState rejects XP lower than represented rewards", () => {
  const state = stateWithTask({ completed: false, xpAwarded: true });
  assert.equal(validateState(state).valid, false);
});

test("validateState accepts XP greater than represented rewards after deletions", () => {
  const state = createInitialState();
  state.totalXp = 200;
  assert.equal(validateState(state).valid, true);
});

test("operations reject an invalid source state without mutating it", () => {
  const state = stateWithTask({ completed: true, xpAwarded: false });
  const snapshot = structuredClone(state);
  const result = createTask(state, "task-2", "Tarefa válida");

  assert.equal(result.changed, false);
  assert.equal(result.error, DOMAIN_ERRORS.INVALID_STATE);
  assert.strictEqual(result.state, state);
  assert.deepEqual(state, snapshot);
});

test("gamification derives level and current-cycle progress at all required boundaries", () => {
  const cases = [
    [0, 1, 0],
    [90, 1, 90],
    [100, 2, 0],
    [130, 2, 30],
    [190, 2, 90],
    [200, 3, 0],
  ];

  for (const [totalXp, level, progress] of cases) {
    assert.deepEqual(getGamification(totalXp), {
      valid: true,
      error: null,
      level,
      progress,
    });
  }
});

test("gamification rejects invalid XP values", () => {
  for (const totalXp of [-10, 5, 10.5, "100", null]) {
    assert.deepEqual(getGamification(totalXp), {
      valid: false,
      error: DOMAIN_ERRORS.INVALID_STATE,
      level: null,
      progress: null,
    });
  }
});

test("completion metadata detects level-ups at 90→100 and 190→200 only once", () => {
  for (const [startingXp, expectedPrevious, expectedCurrent] of [
    [90, 1, 2],
    [190, 2, 3],
  ]) {
    const state = stateWithTask();
    state.totalXp = startingXp;
    const result = completeTask(state, "task-1");

    assert.equal(result.levelUp, true);
    assert.equal(result.previousLevel, expectedPrevious);
    assert.equal(result.currentLevel, expectedCurrent);
    assert.equal(result.xpDelta, 10);

    const repeated = completeTask(result.state, "task-1");
    assert.equal(repeated.levelUp, false);
    assert.equal(repeated.xpDelta, 0);
  }
});

test("successful updates preserve references for untouched tasks", () => {
  const state = stateWithTask();
  state.tasks.push({
    id: "task-2",
    text: "Tarefa intacta",
    completed: false,
    xpAwarded: false,
  });

  const result = editTask(state, "task-1", "Texto alterado");

  assert.notStrictEqual(result.state, state);
  assert.notStrictEqual(result.state.tasks, state.tasks);
  assert.notStrictEqual(result.state.tasks[0], state.tasks[0]);
  assert.strictEqual(result.state.tasks[1], state.tasks[1]);
});
