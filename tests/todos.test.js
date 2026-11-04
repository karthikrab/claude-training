const test = require("node:test");
const assert = require("node:assert");
const { addTask, sampleTasks } = require("../todos.js");

test("sampleTasks returns the five starter tasks", () => {
  const tasks = sampleTasks();
  assert.strictEqual(tasks.length, 5);
  assert.strictEqual(tasks[0].done, true);
});

test("addTask appends a trimmed, not-done task", () => {
  const tasks = addTask([], "  Buy milk  ");
  assert.strictEqual(tasks.length, 1);
  assert.strictEqual(tasks[0].text, "Buy milk");
  assert.strictEqual(tasks[0].done, false);
});
