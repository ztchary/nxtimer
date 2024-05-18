var state = {
  NONE: 0,
  INSPECT: 1,
  TIMING: 2,
  READY: 3,
  state: 0,
  ts: 0,
  time: 0,
  times: [],
  newbest: false,
  inspenable: false
}

var spacebar = {
  pressed: false,
  heldfor: 0,
  supress: false
}

var dom = {}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function toTime(s) {
  if (s < 60) {
    return s.toFixed(2);
  }
  return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60).toFixed(2);
}

function fromTime(t) {
  let [s, m] = t.split(":").reverse();
  m ??= 0;
  return Number(m) * 60 + Number(s);
}

function keydown(e) {
  if (e.key == "Escape") {
    state.state = state.NONE;
    state.time = 0;
  }
  if (e.key != " ") {
    return;
  }
  e.preventDefault();
  spacedown();
}

function keyup(e) {
  if (e.key != " ") {
    return;
  }
  spaceup();
}

function spacedown() {
  if (spacebar.pressed || spacebar.supress) {
    return;
  }
  spacebar.pressed = true;

  if (state.inspenable && state.state == state.NONE) {
    spacebar.supress = true;
    spacebar.pressed = false;
    state.state = state.INSPECT;
    state.time = 16;
    return;
  } else if (state.state == state.TIMING) {
    spacebar.supress = true;
    spacebar.pressed = false;
    state.state = state.NONE;
    state.time = round2(state.time);
    state.times.push(state.time);
    updateStats();
    saveTimes();
    displayScramble();
  }
}

function spaceup() {
  if (spacebar.supress) {
    spacebar.pressed = false;
    spacebar.heldfor = 0;
    spacebar.supress = false;
    return;
  }

  if (state.state != state.TIMING) {
    if (spacebar.heldfor >= 0.5) {
      state.state = state.TIMING;
      state.time = 0;
      console.log("start");
    }
  }

  spacebar.pressed = false;
  spacebar.heldfor = 0;
}

function drawLoop(ts) {
  ts /= 1000;
  dt = ts - state.ts;
  state.ts = ts;
  if (spacebar.pressed) {
    spacebar.heldfor += dt;
  }

  let color;
  if (spacebar.pressed) {
    color = spacebar.heldfor >= 0.5 ? "#8f8" : "#f88";
  } else {
    color = state.newbest ? "#ff8" : "#eee";
  }
  timer.style.color = color;
  if (state.state == state.TIMING) {
    state.time += dt;
  }
  timer.innerHTML = toTime(state.time);
  if (state.state == state.INSPECT) {
    state.time -= dt;
    timer.innerHTML = Math.floor(state.time);
    if (state.time < 0) {
      timer.innerHTML = "0";
    }
  }
  timer.style.fontSize = (window.innerWidth / 10).toString() + "px";
  window.requestAnimationFrame(drawLoop);
}

function updateStats() {
  let min = Math.min(...state.times);
  let l5 = state.times.slice(Math.max(0, state.times.length - 5));
  let avg5 = l5.reduce((a, b) => a + b, 0) / l5.length;
  let l12 = state.times.slice(Math.max(0, state.times.length - 12));
  let avg12 = l12.reduce((a, b) => a + b, 0) / l12.length;
  avg5 = avg5 ? avg5 : 0;
  avg12 = avg12 ? avg12 : 0;
  min = min == Infinity ? 0 : min;
  dom.statmin.innerHTML = toTime(min);
  dom.stat5.innerHTML = toTime(avg5);
  dom.stat12.innerHTML = toTime(avg12);
  state.newbest = state.time == min;
}

function saveTimes() {
  let t = [];
  for (let time of state.times) {
    t.push(Math.round(time * 100));
  }
  localStorage.setItem(dom.stype.value, t.join(";"));
}

function loadTimes() {
  state.times = [];
  let times = localStorage.getItem(dom.stype.value);
  if (!times) {
    return;
  }
  for (let time of times.split(";")) {
    state.times.push(time / 100);
  }
}

function saveSettings() {
  localStorage.setItem("settings", [dom.stype.value, Number(state.inspenable)].join(";"))
}

function loadSettings() {
  if (!localStorage.getItem("settings")) {
    dom.stype.value = "3x3";
    state.inspenable = true;
    inspToggle();
    return;
  }
  [dom.stype.value, state.inspenable] = localStorage.getItem("settings").split(";");
  dom.stype.value ??= "3x3";
  state.inspenable = state.inspenable == 1;
  dom.insp.innerHTML = state.inspenable ? "on" : "off";
  dom.insp.style.color = state.inspenable ? "#8f8" : "#f88";
}

function resetStats() {
  localStorage.removeItem(dom.stype.value);
  state.times = [];
  state.time = 0;
  updateStats();
}

function displayScramble(_) {
  let scramble = genScramble(dom.stype.value);
  dom.scramble.style.fontSize = '' + window.innerWidth / Math.min(100, scramble.length) + 'px';
  dom.scramble.innerHTML = scramble;
}

function editTimes() {
  let times = state.times.map(toTime).join(", ");
  dom.timearea.value = times;
  dom.times.style.display = "flex";
}

function doneEditTimes() {
  state.times = dom.timearea.value ? dom.timearea.value.split(", ").map(fromTime) : [];
  saveTimes();
  updateStats();
  dom.times.style.display = "none";
}

function inspToggle() {
  state.inspenable = !state.inspenable;
  dom.insp.innerHTML = state.inspenable ? "on" : "off";
  dom.insp.style.color = state.inspenable ? "#8f8" : "#f88";
  saveSettings();
}

function changeType() {
  loadTimes();
  updateStats();
  displayScramble();
  saveSettings();
}

window.onload = function() {
  dom.scramble = document.getElementById("scramble");
  dom.stype = document.getElementById("stype");
  dom.stat5 = document.getElementById("avg5");
  dom.stat12 = document.getElementById("avg12");
  dom.statmin = document.getElementById("min");
  dom.reset = document.getElementById("reset");
  dom.timer = document.getElementById("timer");
  dom.times = document.querySelector(".times");
  dom.edit = document.getElementById("edit");
  dom.editdone = document.getElementById("editdone");
  dom.timearea = document.getElementById("timearea");
  dom.insp = document.getElementById("insp");
  dom.skip = document.getElementById("skip");

  dom.reset.addEventListener("click", resetStats);
  dom.edit.addEventListener("click", editTimes);
  dom.editdone.addEventListener("click", doneEditTimes);
  dom.insp.addEventListener("click", inspToggle);
  dom.skip.addEventListener("click", displayScramble);
  dom.stype.addEventListener("change", changeType);

  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
  document.addEventListener("touchstart", spacedown);
  document.addEventListener("touchend", spaceup);

  initScrambles(dom.stype);
  loadSettings();
  loadTimes();
  updateStats();
  displayScramble();
  window.requestAnimationFrame(drawLoop);
};