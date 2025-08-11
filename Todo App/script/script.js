const API_BASE = 'http://localhost:4000';

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const dueDateInput = document.getElementById("dueDate");
const dueTimeInput = document.getElementById("dueTime");
const plannedTimeInput = document.getElementById("plannedTime");
const timeUnitSelect = document.getElementById("timeUnit");
const userEmailInput = document.getElementById("userEmail");
const saveEmailBtn = document.getElementById("saveEmailBtn");
const emailStatus = document.getElementById("emailStatus");

if (window.emailjs) {
  emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
}

let tasks = [];
let settings = JSON.parse(localStorage.getItem("settings")) || { email: "" };
let useBackend = false;

userEmailInput.value = settings.email || "";

async function tryEnableBackend() {
  if (!settings.email) return false;
  try {
    const res = await fetch(`${API_BASE}/api/tasks?email=${encodeURIComponent(settings.email)}`);
    if (!res.ok) return false;
    useBackend = true;
    const remoteTasks = await res.json();
    // Optionally migrate local tasks if backend empty
    const local = JSON.parse(localStorage.getItem('tasks') || '[]');
    if (Array.isArray(local) && local.length && remoteTasks.length === 0) {
      for (const t of local) {
        await createTaskBackend({
          text: t.text,
          dueDate: t.dueDate || null,
          dueTime: t.dueTime || null,
          dueDateTimeISO: t.dueDateTimeISO || null,
          plannedTime: t.plannedTime ?? null,
          timeUnit: t.timeUnit || 'hours',
          completed: !!t.completed,
        });
      }
    }
    tasks = await fetchTasksBackend();
    renderTasks();
    return true;
  } catch (_) {
    useBackend = false;
    return false;
  }
}

function loadLocal() {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveLocal() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  const now = new Date();
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id ?? index;

    const due = getTaskDueDate(task);
    const isOverdue = due && !task.completed && due < now;
    const plannedText = task.plannedTime ? `${task.plannedTime} ${task.timeUnit === 'minutes' ? 'min' : 'hrs'}` : '—';

    li.innerHTML = `
      <div class="text">
        <span class="title">${escapeHtml(task.text)}</span>
        <span class="meta">
          Due: <span class="chip ${isOverdue ? 'overdue' : ''}">${due ? formatDateTime(due) : 'No date'}</span>
          • Planned: <span class="chip">${plannedText}</span>
        </span>
      </div>
      <div class="actions">
        <button class="action complete-btn">${task.completed ? "Undo" : "Complete"}</button>
        <button class="action edit-btn">Edit</button>
        <button class="action delete-btn">Delete</button>
      </div>
    `;

    li.querySelector(".complete-btn").addEventListener("click", async () => {
      const toggled = { ...task, completed: !task.completed };
      if (useBackend) {
        await updateTaskBackend(toggled);
        tasks = await fetchTasksBackend();
      } else {
        tasks[index].completed = !tasks[index].completed;
        saveLocal();
      }
      renderTasks();
    });

    li.querySelector(".edit-btn").addEventListener("click", async () => {
      const newText = prompt("Edit task:", task.text) || task.text;
      const newDueDate = prompt("Edit due date (YYYY-MM-DD):", task.dueDate || "") || task.dueDate || "";
      const newDueTime = prompt("Edit due time (e.g., 7:30 pm):", task.dueTime || "") || task.dueTime || "";
      const newPlanned = prompt("Edit planned time (number):", task.plannedTime ?? "") || task.plannedTime || "";
      const newUnit = prompt("Edit time unit (hours/minutes):", task.timeUnit || "hours") || task.timeUnit || "hours";
      const updated = {
        ...task,
        text: newText.trim(),
        dueDate: newDueDate.trim(),
        dueTime: newDueTime.trim(),
        plannedTime: newPlanned === "" ? null : parseFloat(newPlanned),
        timeUnit: newUnit === 'minutes' ? 'minutes' : 'hours',
      };
      updated.dueDateTimeISO = computeDueISO(updated.dueDate, updated.dueTime);
      updated.__notified = false;
      if (useBackend) {
        await updateTaskBackend(updated);
        tasks = await fetchTasksBackend();
      } else {
        tasks[index] = updated;
        saveLocal();
      }
      renderTasks();
    });

    li.querySelector(".delete-btn").addEventListener("click", async () => {
      if (useBackend) {
        await deleteTaskBackend(task);
        tasks = await fetchTasksBackend();
      } else {
        tasks.splice(index, 1);
        saveLocal();
      }
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

async function fetchTasksBackend() {
  const res = await fetch(`${API_BASE}/api/tasks?email=${encodeURIComponent(settings.email)}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

async function createTaskBackend(task) {
  const payload = { ...task, email: settings.email };
  const res = await fetch(`${API_BASE}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
}

async function updateTaskBackend(task) {
  const id = task.id;
  const payload = { ...task, email: settings.email };
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

async function deleteTaskBackend(task) {
  const id = task.id;
  const res = await fetch(`${API_BASE}/api/tasks/${id}?email=${encodeURIComponent(settings.email)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

function saveTasksLocalAndRender() {
  saveLocal();
  renderTasks();
  scheduleNotifications();
}

addTaskBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const dueTime = dueTimeInput.value.trim();
  const plannedVal = plannedTimeInput.value;
  const timeUnit = timeUnitSelect.value;
  if (!text) return;
  const plannedTime = plannedVal ? parseFloat(plannedVal) : null;
  const dueDateTimeISO = computeDueISO(dueDate, dueTime);
  const newTask = { text, completed: false, dueDate, dueTime, dueDateTimeISO, plannedTime, timeUnit, __notified: false };

  if (useBackend) {
    await createTaskBackend(newTask);
    tasks = await fetchTasksBackend();
    renderTasks();
  } else {
    tasks.push(newTask);
    saveTasksLocalAndRender();
  }

  taskInput.value = "";
  dueDateInput.value = "";
  dueTimeInput.value = "";
  plannedTimeInput.value = "";
  timeUnitSelect.value = "hours";
});

[taskInput, dueDateInput, dueTimeInput, plannedTimeInput].forEach(el => {
  el.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTaskBtn.click();
  });
});

saveEmailBtn.addEventListener("click", async () => {
  const email = userEmailInput.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailStatus.textContent = "Please enter a valid email address.";
    emailStatus.style.color = "#9c1a29";
    return;
  }
  settings.email = email;
  localStorage.setItem("settings", JSON.stringify(settings));

  // Try to register on backend
  try {
    const res = await fetch(`${API_BASE}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (res.ok) {
      emailStatus.textContent = "Email saved. Server reminders 1 day before are enabled.";
      emailStatus.style.color = "#1b7f5d";
      await tryEnableBackend();
      return;
    }
  } catch (_) {}

  emailStatus.textContent = "Email saved locally. Client reminders will be used.";
  emailStatus.style.color = "#1b7f5d";
  useBackend = false;
  scheduleNotifications();
});

function scheduleNotifications() {
  if (useBackend) return; // server handles reminders
  if (window.__notifyInterval) clearInterval(window.__notifyInterval);
  window.__notifyInterval = setInterval(checkForNotifications, 30 * 60 * 1000);
  checkForNotifications();
}

function checkForNotifications() {
  if (!settings.email) return;
  const now = new Date();
  tasks.forEach(task => {
    if (task.completed) return;
    const due = getTaskDueDate(task);
    if (!due) return;
    const msInDay = 24 * 60 * 60 * 1000;
    const diffMs = due - now;
    const oneDayBeforeStart = msInDay;
    const oneDayBeforeEnd = msInDay - (30 * 60 * 1000); // 23.5h
    if (diffMs <= oneDayBeforeStart && diffMs >= oneDayBeforeEnd && !task.__notified) {
      sendEmailReminder(task);
      task.__notified = true;
      saveLocal();
    }
  });
}

function getTaskDueDate(task) {
  if (task.dueDateTimeISO) return new Date(task.dueDateTimeISO);
  if (!task.dueDate) return null;
  return new Date(task.dueDate);
}

function computeDueISO(dateStr, timeStr) {
  if (!dateStr) return null;
  let hours = 9, minutes = 0; // default 9:00 AM if time missing
  if (timeStr) {
    const parsed = parseTime12h(timeStr);
    if (parsed) { hours = parsed.hours; minutes = parsed.minutes; }
  }
  const [y,m,d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m-1), d, hours, minutes, 0);
  return dt.toISOString();
}

function parseTime12h(input) {
  const str = input.trim().toLowerCase().replace(/\s+/g,'');
  const match = str.match(/^(\d{1,2})(?::(\d{1,2}))?(am|pm)$/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  let m = match[2] ? parseInt(match[2], 10) : 0;
  const mer = match[3];
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  if (mer === 'am') { if (h === 12) h = 0; } else { if (h !== 12) h += 12; }
  return { hours: h, minutes: m };
}

function sendEmailReminder(task) {
  if (!window.emailjs) return;
  const due = getTaskDueDate(task);
  const templateParams = {
    to_email: settings.email,
    task_title: task.text,
    task_due_date: due ? formatDateTime(due) : 'No date',
  };
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
    .then(() => console.log("Reminder email sent to", settings.email))
    .catch(err => console.warn("Failed to send email:", err));
}

function formatDateTime(date) {
  const datePart = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart} • ${timePart}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

(async function init() {
  loadLocal();
  renderTasks();
  scheduleNotifications();
  await tryEnableBackend();
})();
