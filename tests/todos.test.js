const test = require("node:test");
const assert = require("node:assert");
const {
  makeTask,
  sampleTasks,
  addTask,
  toggleTask,
  removeTask,
  clearDone,
  filterTasks,
  countRemaining,
} = require("../todos.js");

test("sampleTasks returns the five starter tasks", () => {
  const tasks = sampleTasks();
  assert.strictEqual(tasks.length, 5);
  assert.strictEqual(tasks[0].done, true);
});

test("sampleTasks gives each task a unique id", () => {
  const tasks = sampleTasks();
  const ids = new Set(tasks.map((t) => t.id));
  assert.strictEqual(ids.size, tasks.length);
});

test("makeTask defaults done to false", () => {
  const task = makeTask("Write docs");
  assert.strictEqual(task.text, "Write docs");
  assert.strictEqual(task.done, false);
  assert.ok(task.id);
});

test("makeTask honors an explicit done value", () => {
  const task = makeTask("Already finished", true);
  assert.strictEqual(task.done, true);
});

test("addTask appends a trimmed, not-done task", () => {
  const tasks = addTask([], "  Buy milk  ");
  assert.strictEqual(tasks.length, 1);
  assert.strictEqual(tasks[0].text, "Buy milk");
  assert.strictEqual(tasks[0].done, false);
});

test("addTask ignores empty or whitespace-only text", () => {
  const original = [makeTask("Existing")];
  assert.strictEqual(addTask(original, "").length, 1);
  assert.strictEqual(addTask(original, "   ").length, 1);
});

test("addTask does not mutate the input array", () => {
  const original = [];
  addTask(original, "New task");
  assert.strictEqual(original.length, 0);
});

test("toggleTask flips done for the matching id and leaves others untouched", () => {
  const tasks = [makeTask("A"), makeTask("B", true)];
  const toggled = toggleTask(tasks, tasks[0].id);
  assert.strictEqual(toggled[0].done, true);
  assert.strictEqual(toggled[1].done, true);
  assert.strictEqual(tasks[0].done, false, "original array must not be mutated");
});

test("toggleTask leaves the list unchanged for an unknown id", () => {
  const tasks = [makeTask("A")];
  const toggled = toggleTask(tasks, "no-such-id");
  assert.strictEqual(toggled[0].done, false);
});

test("removeTask drops the matching task", () => {
  const tasks = [makeTask("A"), makeTask("B")];
  const remaining = removeTask(tasks, tasks[0].id);
  assert.strictEqual(remaining.length, 1);
  assert.strictEqual(remaining[0].text, "B");
});

test("removeTask leaves the list unchanged for an unknown id", () => {
  const tasks = [makeTask("A")];
  const remaining = removeTask(tasks, "no-such-id");
  assert.strictEqual(remaining.length, 1);
});

test("clearDone keeps only the not-done tasks", () => {
  const tasks = [makeTask("A", true), makeTask("B", false), makeTask("C", true)];
  const remaining = clearDone(tasks);
  assert.strictEqual(remaining.length, 1);
  assert.strictEqual(remaining[0].text, "B");
});

test("filterTasks returns active, done or all tasks", () => {
  const tasks = [makeTask("A", true), makeTask("B", false)];
  assert.strictEqual(filterTasks(tasks, "active").length, 1);
  assert.strictEqual(filterTasks(tasks, "active")[0].text, "B");
  assert.strictEqual(filterTasks(tasks, "done").length, 1);
  assert.strictEqual(filterTasks(tasks, "done")[0].text, "A");
  assert.strictEqual(filterTasks(tasks, "all").length, 2);
});

test("countRemaining counts only the not-done tasks", () => {
  const tasks = [makeTask("A", true), makeTask("B", false), makeTask("C", false)];
  assert.strictEqual(countRemaining(tasks), 2);
});

test("countRemaining is zero when everything is done", () => {
  const tasks = [makeTask("A", true), makeTask("B", true)];
  assert.strictEqual(countRemaining(tasks), 0);
});

test("the task list behaves correctly across a full add/toggle/filter/remove/clear sequence", () => {
  let tasks = sampleTasks();
  assert.strictEqual(tasks.length, 5);

  tasks = addTask(tasks, "Write a unit test for the task list");
  assert.strictEqual(tasks.length, 6);
  const newTask = tasks[tasks.length - 1];
  assert.strictEqual(newTask.done, false);

  tasks = toggleTask(tasks, newTask.id);
  assert.strictEqual(tasks.find((t) => t.id === newTask.id).done, true);
  assert.strictEqual(countRemaining(tasks), filterTasks(tasks, "active").length);

  const doneBefore = filterTasks(tasks, "done").length;
  tasks = removeTask(tasks, newTask.id);
  assert.strictEqual(tasks.length, 5);
  assert.strictEqual(filterTasks(tasks, "done").length, doneBefore - 1);

  tasks = clearDone(tasks);
  assert.strictEqual(tasks.length, countRemaining(tasks));
  assert.ok(tasks.every((t) => !t.done));
});
