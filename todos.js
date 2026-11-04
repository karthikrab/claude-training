// Pure task logic, shared by the browser (app.js) and the tests (node --test).
// Every function returns a new array and never mutates its input.

const SAMPLE_TASKS = [
  { text: "Install Claude Code and sign in", done: true },
  { text: "Ask Claude to explain this project", done: false },
  { text: "Add a 'due date' field to tasks", done: false },
  { text: "Write a unit test for the task list", done: false },
  { text: "Commit your changes with a clear message", done: false },
];

function makeTask(text, done = false) {
  return { id: Date.now().toString(36) + Math.random().toString(36).slice(2), text, done };
}

function sampleTasks() {
  return SAMPLE_TASKS.map((t) => makeTask(t.text, t.done));
}

function addTask(tasks, text) {
  const trimmed = text.trim();
  if (!trimmed) return tasks;
  return [...tasks, makeTask(trimmed)];
}

function toggleTask(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

function removeTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

function clearDone(tasks) {
  return tasks.filter((t) => !t.done);
}

function filterTasks(tasks, filter) {
  if (filter === "active") return tasks.filter((t) => !t.done);
  if (filter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

function countRemaining(tasks) {
  return tasks.filter((t) => !t.done).length;
}

if (typeof module !== "undefined") {
  module.exports = {
    SAMPLE_TASKS,
    makeTask,
    sampleTasks,
    addTask,
    toggleTask,
    removeTask,
    clearDone,
    filterTasks,
    countRemaining,
  };
}
