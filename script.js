// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch(err => console.log("❌ SW registration failed", err));
}

let alarms = [];
let alarmTimers = {};
let correctAnswer = null;
const alarmAudio = document.getElementById("alarmAudio");

// Show live time, date, day
function updateClock() {
  const now = new Date();
  document.getElementById("liveDate").textContent = "📅 " + now.toLocaleDateString();
  document.getElementById("liveDay").textContent = "📆 " + now.toLocaleString("en-us", { weekday: "long" });
  document.getElementById("liveTime").textContent = "🕒 " + now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

// Add Alarm
function addAlarm() {
  const timeInput = document.getElementById("alarmTime").value;
  if (!timeInput) {
    alert("Please select a time!");
    return;
  }
  const id = Date.now().toString();
  alarms.push({ id, time: timeInput });
  scheduleAlarm(id, timeInput);
  renderAlarms();
  document.getElementById("alarmTime").value = "";
}

// Schedule Alarm
function scheduleAlarm(id, time) {
  const now = new Date();
  const alarmDate = new Date(now.toDateString() + ' ' + time);
  if (alarmDate <= now) alarmDate.setDate(alarmDate.getDate() + 1);

  const delay = alarmDate - now;
  clearTimeout(alarmTimers[id]);
  alarmTimers[id] = setTimeout(() => triggerAlarm(id), delay);
}

// Trigger alarm
function triggerAlarm(id) {
  generatePuzzle(id);
  document.getElementById("puzzleScreen").classList.remove("hidden");
  alarmAudio.currentTime = 0;
  alarmAudio.play().catch(err => console.warn("Autoplay blocked:", err));
}

// Generate puzzle
function generatePuzzle(id) {
  const a = Math.floor(Math.random() * 50) + 1;
  const b = Math.floor(Math.random() * 30) + 1;
  correctAnswer = a + b;
  document.getElementById("puzzleQuestion").textContent = `What is ${a} + ${b}?`;
  document.getElementById("submitAnswerBtn").onclick = () => checkAnswer(id);
}

// Check answer
function checkAnswer(id) {
  const userAns = parseInt(document.getElementById("answerInput").value);
  if (userAns === correctAnswer) {
    alert("✅ Correct! Alarm stopped.");
    document.getElementById("puzzleScreen").classList.add("hidden");
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    deleteAlarm(id);
  } else {
    alert("❌ Incorrect! Try again.");
  }
}

// Render alarms
function renderAlarms() {
  const list = document.getElementById("alarmsList");
  list.innerHTML = "";
  alarms.forEach(alarm => {
    const li = document.createElement("li");
    li.id = `alarm-${alarm.id}`;
    li.innerHTML = `
      ⏰ <strong>${alarm.time}</strong>
      <button onclick="showEditForm('${alarm.id}')">✏️ Edit</button>
      <button onclick="deleteAlarm('${alarm.id}')">🗑️ Delete</button>
    `;
    list.appendChild(li);
  });
}

// Edit alarm
function showEditForm(id) {
  const alarm = alarms.find(a => a.id === id);
  const li = document.getElementById(`alarm-${id}`);
  li.innerHTML = `
    ⏰ <input type="time" id="editInput-${id}" value="${alarm.time}" />
    <button onclick="updateAlarmTime('${id}')">💾 Update</button>
    <button onclick="renderAlarms()">❌ Cancel</button>
  `;
}

// Update time
function updateAlarmTime(id) {
  const newTime = document.getElementById(`editInput-${id}`).value;
  if (!newTime) {
    alert("Please select a new time!");
    return;
  }
  const alarm = alarms.find(a => a.id === id);
  if (alarm) {
    alarm.time = newTime;
    scheduleAlarm(id, newTime);
    renderAlarms();
  }
}

// Delete alarm
function deleteAlarm(id) {
  alarms = alarms.filter(a => a.id !== id);
  clearTimeout(alarmTimers[id]);
  delete alarmTimers[id];
  renderAlarms();
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
}
