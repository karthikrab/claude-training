// UI for the to-do app. Task logic lives in todos.js; tasks are saved in localStorage.

const STORAGE_KEY = "training-todos";

let tasks = load();
let filter = "all";

const list = document.getElementById("task-list");
const form = document.getElementById("new-task-form");
const input = document.getElementById("new-task-input");
const summary = document.getElementById("summary");

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {}
  return sampleTasks();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

function update(next) {
  tasks = next;
  render();
}

function render() {
  const visible = filterTasks(tasks, filter);

  list.innerHTML = "";
  if (visible.length === 0) {
    list.innerHTML = '<li class="empty">Nothing here.</li>';
  }

  for (const task of visible) {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => update(toggleTask(tasks, task.id)));

    const label = document.createElement("span");
    label.textContent = task.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "✕";
    del.title = "Delete task";
    del.addEventListener("click", () => update(removeTask(tasks, task.id)));

    li.append(checkbox, label, del);
    list.append(li);
  }

  summary.textContent = `${countRemaining(tasks)} of ${tasks.length} tasks remaining`;
  save();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  update(addTask(tasks, input.value));
  input.value = "";
});

document.querySelectorAll(".filters button").forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".filters button").forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

document.getElementById("clear-done").addEventListener("click", () => update(clearDone(tasks)));
document.getElementById("reset").addEventListener("click", () => update(sampleTasks()));

render();
