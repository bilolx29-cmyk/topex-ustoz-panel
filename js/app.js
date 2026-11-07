/**
 * ==========================================================================
 * TOPEX Texnikum — O'qituvchi Boshqaruv Tizimi (Soddalashtirilgan)
 * ==========================================================================
 */

const S = Store.load();
const $app = document.getElementById("app");

const DAYS = ["", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const DAYS_SHORT = ["", "Du", "Se", "Chor", "Pay", "Ju", "Sha", "Yak"];
const STATUS = { keldi: "Keldi", kelmadi: "Kelmadi", sababli: "Sababli" };

const TITLES = {
  dashboard: "Asosiy",
  groups: "Guruhlar",
  group: "Guruh",
  students: "O'quvchilar",
  student: "O'quvchi ma'lumotlari",
  schedule: "Dars jadvali",
  homework: "Uy vazifalari",
  stats: "Statistika",
  chat: "Chat",
  profile: "Profil"
};

let ui = {
  filter: "all",
  search: "",
  groupFilter: "",
  chat: "g1",
  attDate: null,
  groupTab: "att",
  salaryShown: false,
  menu: false,
  isTyping: false,
  sidebarCollapsed: false,
  sidebarPinned: localStorage.getItem("topex_sidebar_pinned") === "true"
};

/* SVG Ikonkalar */
function icon(name, size = 18, cls = "") {
  const icons = {
    dashboard: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    groups: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    students: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    schedule: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    journal: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><polyline points="10 2 10 10 13 7 16 10 16 2"/>',
    stats: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    homework: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    profile: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    volumeX: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    eye: '<path d="2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><line x1="2" x2="22" y1="2" y2="22"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    pinOff: '<line x1="2" x2="22" y1="2" y2="22"/><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    panelLeftClose: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
    panelLeftOpen: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>'
  };
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.dashboard}</svg>`;
}

/* Ovoz effektlari */
const Sound = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  play(freq, dur = 0.08) {
    if (!S.settings || !S.settings.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  },
  click() { this.play(700, 0.05); },
  success() {
    if (!S.settings || !S.settings.soundEnabled) return;
    [520, 650, 780].forEach((f, i) => setTimeout(() => this.play(f, 0.12), i * 60));
  }
};

/* Bayramona salut (Confetti) */
function fireConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 160,
      y: canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -10 - 3,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.life -= 0.015;
      if (p.life > 0) {
        alive = true;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    if (alive) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

/* Yordamchi metodlar */
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const todayISO = () => iso(new Date());
const weekday = d => (d.getDay() === 0 ? 7 : d.getDay());
const money = n => Number(n).toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";
const initials = n => (n || "?").split(/[\s|]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
const groupById = id => S.groups.find(g => g.id === id);
const studentsOf = gid => S.students.filter(s => s.groupId === gid);
const save = () => Store.save();
const roundPct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function toast(msg, type = "ok") {
  Sound.success();
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${esc(msg)}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add("toast-leaving");
    setTimeout(() => el.remove(), 260);
  }, 2200);
}

function modal(title, body, onSubmit, submitText = "Saqlash") {
  Sound.click();
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="overlay" data-act="close-modal-bg">
      <form class="modal" id="modal-form">
        <div class="modal-header">
          <h3>${esc(title)}</h3>
          <button type="button" class="modal-close" data-act="close-modal">${icon("x", 18)}</button>
        </div>
        ${body}
        <div class="actions">
          <button type="button" class="btn ghost" data-act="close-modal">Bekor qilish</button>
          ${onSubmit ? `<button class="btn" type="submit">${esc(submitText)}</button>` : ""}
        </div>
      </form>
    </div>`;
  const form = document.getElementById("modal-form");
  form.addEventListener("click", e => {
    if (e.target.closest("[data-act]")) return;
    e.stopPropagation();
  });
  if (onSubmit) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      onSubmit(Object.fromEntries(new FormData(form)));
    });
  }
}

function closeModal() {
  const root = document.getElementById("modal-root");
  const overlay = root.querySelector(".overlay");
  if (!overlay) {
    root.innerHTML = "";
    return;
  }
  overlay.classList.add("modal-closing");
  setTimeout(() => {
    root.innerHTML = "";
  }, 200);
}

function attStats(gid) {
  let k = 0, t = 0;
  Object.keys(S.attendance).forEach(key => {
    if (gid && key.split("|")[0] !== gid) return;
    Object.values(S.attendance[key]).forEach(v => {
      t++;
      if (v === "keldi") k++;
    });
  });
  return { present: k, total: t, pct: roundPct(k, t) };
}

function studentAvgGrade(sid, gid) {
  if (!S.grades) return null;
  let sum = 0, count = 0;
  Object.keys(S.grades).forEach(k => {
    const parts = k.split("|");
    if (parts[1] === sid && (!gid || parts[0] === gid)) {
      const g = S.grades[k];
      const val = typeof g === "number" ? g : (g && g.score ? g.score : 0);
      if (val > 0) {
        sum += val;
        count++;
      }
    }
  });
  return count ? (sum / count).toFixed(1) : null;
}

function debtors() {
  return S.students.filter(s => s.balance < 0);
}

/* ==========================================================================
   Sahifalar
   ========================================================================== */

/* 1. Asosiy */
function pageDashboard() {
  const wd = weekday(new Date());
  const todayGroups = S.groups.filter(g => g.days.includes(wd));
  const st = attStats();
  const announcements = S.announcements || [];

  return `
    <!-- 4 ta Asosiy KPI Kartasi -->
    <div class="grid c4" style="margin-bottom:20px">
      <div class="card stat-card" style="cursor:pointer" data-act="go" data-to="#/students">
        <div>
          <div class="stat-label">O'quvchilar</div>
          <div class="stat-value">${S.students.length}</div>
        </div>
        <div class="stat-icon">${icon("students", 20)}</div>
      </div>

      <div class="card stat-card emerald" style="cursor:pointer" data-act="go" data-to="#/stats">
        <div>
          <div class="stat-label">Davomat</div>
          <div class="stat-value">${st.pct}%</div>
        </div>
        <div class="stat-icon emerald">${icon("check", 20)}</div>
      </div>

      <div class="card stat-card amber" style="cursor:pointer" data-act="go" data-to="#/groups">
        <div>
          <div class="stat-label">Guruhlar</div>
          <div class="stat-value">${S.groups.length}</div>
        </div>
        <div class="stat-icon amber">${icon("schedule", 20)}</div>
      </div>

      <div class="card stat-card rose">
        <div>
          <div class="stat-label" style="display:flex;align-items:center;gap:6px">
            Oylik
            <button class="btn ghost sm" data-act="toggle-salary" style="padding:2px 5px" title="${ui.salaryShown ? "Berkitish" : "Ko'rsatish"}">
              ${icon(ui.salaryShown ? "eyeOff" : "eye", 13)}
            </button>
          </div>
          <div class="stat-value" style="font-size:22px">
            <span class="tg-spoiler ${ui.salaryShown ? "revealed" : ""}" data-act="toggle-salary" title="${ui.salaryShown ? "Berkitish" : "Ko'rish uchun bosing"}">
              <span class="tg-spoiler-text">${money(S.teacher.salary)}</span>
            </span>
          </div>
        </div>
        <div class="stat-icon rose">${icon("profile", 20)}</div>
      </div>
    </div>

    <!-- Bugungi darslar va Ma'muriyat e'lonlari -->
    <div class="grid c2">
      <!-- Bugungi darslar -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3 style="font-size:16px;font-weight:800;display:flex;align-items:center;gap:8px">
            ${icon("schedule", 18)} Bugungi darslar
          </h3>
          <span class="badge ok">${DAYS[wd] || "Bugun"}</span>
        </div>

        ${todayGroups.length ? `
          <div style="display:flex;flex-direction:column;gap:10px">
            ${todayGroups.map(g => {
              const count = studentsOf(g.id).length;
              return `
                <div class="card" style="padding:14px;background:var(--bg);display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer" data-act="open-group" data-id="${g.id}">
                  <div>
                    <div style="font-weight:800;font-size:14px;margin-bottom:2px">${esc(g.name)}</div>
                    <div style="font-size:12.5px;color:var(--muted)">${esc(g.course)} · ${esc(g.time.split(' - ')[0])} · ${esc(g.room)}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="badge primary">${count} o'quvchi</span>
                    <button class="btn ghost sm" data-act="open-group" data-id="${g.id}">Ochish →</button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        ` : `
          <div style="text-align:center;padding:36px 16px;color:var(--muted)">
            <p style="font-weight:600;margin-bottom:10px">Bugun rejalashtirilgan darslar yo'q</p>
            <a class="btn ghost sm" data-act="go" data-to="#/schedule">Dars jadvalini ko'rish →</a>
          </div>
        `}
      </div>

      <!-- Ma'muriyat e'lonlari -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3 style="font-size:16px;font-weight:800;display:flex;align-items:center;gap:8px">
            ${icon("chat", 18)} Ma'muriyat e'lonlari
          </h3>
          <span class="badge primary">${announcements.length} ta e'lon</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px">
          ${announcements.map(a => `
            <div style="padding:12px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--line);transition:all 0.22s var(--ease-soft)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;gap:8px">
                <b style="font-size:13.5px">${esc(a.title)}</b>
                <span class="badge ${a.badgeType || 'primary'}">${esc(a.badge || 'E\'lon')}</span>
              </div>
              <p style="font-size:12.5px;color:var(--muted);line-height:1.45;margin-bottom:6px">${esc(a.content)}</p>
              <div style="font-size:11px;color:var(--muted);display:flex;justify-content:space-between">
                <span>${esc(a.author || "O'quv bo'limi")}</span>
                <span>${esc(a.date)}</span>
              </div>
            </div>
          `).join("")}
          ${announcements.length ? "" : `<div class="empty">Yangi e'lonlar yo'q</div>`}
        </div>
      </div>
    </div>
  `;
}

/* 2. Guruhlar */
function pageGroups() {
  const wd = weekday(new Date());
  let groups = S.groups.slice();
  if (ui.filter === "today") groups = groups.filter(g => g.days.includes(wd));

  return `
    <div class="row-head" style="margin-top:0">
      <div>
        <h2>Guruhlar (${S.groups.length})</h2>
        <span style="color:var(--muted);font-size:13px">Barcha biriktirilgan o'quv guruhlari</span>
      </div>
      <div class="toolbar">
        <div class="seg">
          <button class="${ui.filter === "all" ? "on" : ""}" data-act="filter" data-v="all">Barchasi</button>
          <button class="${ui.filter === "today" ? "on" : ""}" data-act="filter" data-v="today">Bugun</button>
        </div>
      </div>
    </div>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Guruh</th>
            <th>Kurs</th>
            <th>Talabalar</th>
            <th>Xona</th>
            <th>Vaqt</th>
            <th>Davomat</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${groups.map(g => {
            const gStudents = studentsOf(g.id);
            const gAtt = attStats(g.id);
            const isToday = g.days.includes(wd);
            return `
              <tr class="click" data-act="open-group" data-id="${g.id}">
                <td>
                  <b>${esc(g.name)}</b>
                  ${isToday ? `<span class="badge ok" style="margin-left:6px">Bugun</span>` : ""}
                </td>
                <td>${esc(g.course)}</td>
                <td><b>${gStudents.length}</b></td>
                <td>${esc(g.room.replace("3-bino, ", "").replace("2-bino, ", "").replace("1-bino, ", ""))}</td>
                <td>${g.time.split(' - ')[0]}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-track" style="width:60px;height:6px">
                      <div class="progress-fill" style="width:${gAtt.pct}%;background:var(--ok)"></div>
                    </div>
                    <b>${gAtt.pct}%</b>
                  </div>
                </td>
                <td>
                  <button class="btn ghost sm" data-act="open-group" data-id="${g.id}">Ochish →</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
      ${groups.length ? "" : `<div class="empty">Guruhlar mavjud emas</div>`}
    </div>
  `;
}

/* 2. Guruh Tafsilotlari */
function pageGroup(id) {
  const g = groupById(id);
  if (!g) return `<div class="empty">Guruh topilmadi</div>`;

  const date = ui.attDate || todayISO();
  const key = g.id + "|" + date;
  const rec = S.attendance[key] || {};
  const list = studentsOf(g.id);
  const tab = ui.groupTab || "att";

  let tabContent = "";

  if (tab === "att") {
    const rows = list.map((s, i) => {
      const cur = rec[s.id] || "";
      const gradeKey = `${g.id}|${s.id}|${date}`;
      const curGrade = S.grades && S.grades[gradeKey] ? S.grades[gradeKey].score : 0;
      return `
        <tr>
          <td>${i + 1}</td>
          <td class="click" data-act="open-student" data-id="${s.id}" style="cursor:pointer" title="O'quvchi ma'lumotlarini ko'rish"><b>${esc(s.name)}</b></td>
          <td>${esc(s.phone)}</td>
          <td>
            <div class="att">
              <button type="button" class="keldi ${cur === "keldi" ? "on" : ""}" data-act="mark" data-sid="${s.id}" data-gid="${g.id}" data-v="keldi">Keldi</button>
              <button type="button" class="kelmadi ${cur === "kelmadi" ? "on" : ""}" data-act="mark" data-sid="${s.id}" data-gid="${g.id}" data-v="kelmadi">Kelmadi</button>
              <button type="button" class="sababli ${cur === "sababli" ? "on" : ""}" data-act="mark" data-sid="${s.id}" data-gid="${g.id}" data-v="sababli">Sababli</button>
            </div>
          </td>
          <td>
            <div class="grade-picker">
              ${[1, 2, 3, 4, 5].map(n => `
                <button type="button" class="grade-btn g${n} ${curGrade === n ? "on" : ""}" data-act="set-att-grade" data-gid="${g.id}" data-sid="${s.id}" data-date="${date}" data-score="${n}" title="${n} baho">${n}</button>
              `).join("")}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    tabContent = `
      <div class="row-head">
        <div class="toolbar">
          <input type="date" class="search" id="att-date" value="${date}">
          <button class="btn success sm" data-act="mark-all" data-gid="${g.id}">${icon("check", 14)} Hammasi keldi</button>
        </div>
        <button class="btn sm" data-act="add-student" data-gid="${g.id}">${icon("plus", 14)} O'quvchi</button>
      </div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>№</th><th>F.I.Sh.</th><th>Telefon</th><th>Davomat</th><th>Baho (1–5)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  if (tab === "grades") {
    const topics = ["1-dars", "2-dars", "3-dars", "4-dars", "Oraliq"];
    const rows = list.map((s, i) => {
      let sum = 0, count = 0;
      const cells = topics.map((t, tIdx) => {
        const gradeKey = `${g.id}|${s.id}|t${tIdx + 1}`;
        const val = S.grades && S.grades[gradeKey] ? S.grades[gradeKey].score : 0;
        if (val) { sum += val; count++; }
        return `<td style="text-align:center"><span class="grade-chip g${val || 'none'}" data-act="edit-grade" data-gid="${g.id}" data-sid="${s.id}" data-t="${tIdx + 1}" data-tname="${t}" title="Baholash uchun bosing">${val || "—"}</span></td>`;
      }).join("");

      return `<tr><td>${i + 1}</td><td class="click" data-act="open-student" data-id="${s.id}" style="cursor:pointer" title="O'quvchi ma'lumotlarini ko'rish"><b>${esc(s.name)}</b></td>${cells}<td style="text-align:center"><b>${count ? (sum / count).toFixed(1) : "—"}</b></td></tr>`;
    }).join("");

    tabContent = `
      <div class="card table-wrap" style="margin-top:14px">
        <table>
          <thead>
            <tr><th>№</th><th>F.I.Sh.</th>${topics.map(t => `<th style="text-align:center">${t}</th>`).join("")}<th style="text-align:center">O'rtacha</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  if (tab === "students") {
    tabContent = `
      <div class="row-head">
        <h2>O'quvchilar (${list.length})</h2>
        <button class="btn sm" data-act="add-student" data-gid="${g.id}">${icon("plus", 14)} Qo'shish</button>
      </div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>№</th><th>F.I.Sh.</th><th>Telefon</th><th>Ota-ona</th><th>O'rtacha baho</th><th>Balans</th><th style="text-align:right">Amallar</th></tr></thead>
          <tbody>
            ${list.map((s, i) => {
              const avg = studentAvgGrade(s.id, g.id);
              const avgNum = avg ? parseFloat(avg) : 0;
              return `
              <tr class="click" data-act="open-student" data-id="${s.id}">
                <td>${i + 1}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar sm" style="background:${esc(s.avatarColor || g.color || '#6366f1')}">${initials(s.name)}</div>
                    <div>
                      <b>${esc(s.name)}</b>
                      ${s.note ? `<div style="font-size:11.5px;color:var(--muted)">${esc(s.note)}</div>` : ''}
                    </div>
                  </div>
                </td>
                <td>${esc(s.phone)}</td>
                <td>${esc(s.parentPhone || s.parentName || "—")}</td>
                <td>${avg ? `<span class="badge ${avgNum >= 4 ? 'ok' : (avgNum >= 3 ? 'warn' : 'bad')}">★ ${avg}</span>` : `<span style="color:var(--muted)">—</span>`}</td>
                <td><b class="${s.balance < 0 ? 'bad' : 'ok'}">${money(s.balance)}</b></td>
                <td style="text-align:right">
                  <div style="display:inline-flex;align-items:center;gap:6px">
                    <button class="btn ghost sm" data-act="edit-student" data-id="${s.id}" title="Tahrirlash">
                      ${icon("edit", 14)} Tahrirlash
                    </button>
                    <button class="btn ghost sm" data-act="open-student" data-id="${s.id}" title="Ko'rish">
                      Ochish →
                    </button>
                  </div>
                </td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div style="margin-bottom:14px">
      <a class="btn ghost sm" data-act="go" data-to="#/groups">${icon("arrowLeft", 14)} Orqaga</a>
    </div>

    <div class="row-head" style="margin-top:0">
      <div>
        <h2>${esc(g.name)}</h2>
        <span style="color:var(--muted);font-size:13px">${esc(g.course)} · ${esc(g.room)}</span>
      </div>
    </div>

    <div class="tabs">
      <a class="${tab === "att" ? "on" : ""}" data-act="set-group-tab" data-tab="att">Davomat</a>
      <a class="${tab === "grades" ? "on" : ""}" data-act="set-group-tab" data-tab="grades">Jurnal</a>
      <a class="${tab === "students" ? "on" : ""}" data-act="set-group-tab" data-tab="students">O'quvchilar</a>
    </div>

    ${tabContent}
  `;
}

/* 3. O'quvchilar */
function pageStudents() {
  const q = ui.search.toLowerCase();
  let list = S.students.filter(s => {
    const matchGroup = !ui.groupFilter || s.groupId === ui.groupFilter;
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.phone.includes(q);
    return matchGroup && matchSearch;
  });

  return `
    <div class="row-head" style="margin-top:0">
      <h2>O'quvchilar (${list.length})</h2>
      <div class="toolbar">
        <input class="search" id="search" placeholder="Qidirish..." value="${esc(ui.search)}">
        <select class="search" id="group-filter">
          <option value="">Barcha guruhlar</option>
          ${S.groups.map(g => `<option value="${g.id}" ${ui.groupFilter === g.id ? "selected" : ""}>${esc(g.name)}</option>`).join("")}
        </select>
        <button class="btn sm" data-act="add-student">${icon("plus", 14)} Qo'shish</button>
        <button class="btn ghost sm" data-act="export-csv">${icon("download", 14)} CSV</button>
      </div>
    </div>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr><th>№</th><th>F.I.Sh.</th><th>Guruh</th><th>O'rtacha baho</th><th>Telefon</th><th>Ota-onasi</th><th>Balans</th></tr>
        </thead>
        <tbody>
          ${list.map((s, i) => {
            const g = groupById(s.groupId);
            const avg = studentAvgGrade(s.id);
            const avgNum = avg ? parseFloat(avg) : 0;
            return `
              <tr>
                <td>${i + 1}</td>
                <td><b>${esc(s.name)}</b></td>
                <td>${esc(g ? g.name : "—")}</td>
                <td>${avg ? `<span class="badge ${avgNum >= 4 ? 'ok' : (avgNum >= 3 ? 'warn' : 'bad')}">★ ${avg}</span>` : `<span style="color:var(--muted)">—</span>`}</td>
                <td>${esc(s.phone)}</td>
                <td>${esc(s.parentPhone)}</td>
                <td><b class="${s.balance < 0 ? 'bad' : 'ok'}">${money(s.balance)}</b></td>

              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
      ${list.length ? "" : `<div class="empty">O'quvchilar topilmadi</div>`}
    </div>
  `;
}

/* 4. Dars Jadvali */
function pageSchedule() {
  const daysList = [1, 2, 3, 4, 5, 6];
  return `
    <div class="row-head" style="margin-top:0">
      <h2>Dars jadvali</h2>
    </div>

    <div class="grid c3">
      ${daysList.map(d => {
        const dClasses = S.groups.filter(g => g.days.includes(d));
        return `
          <div class="card" style="padding:16px">
            <h3 style="font-size:15px;margin-bottom:10px">${DAYS[d]}</h3>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${dClasses.map(g => `
                <div class="card" style="padding:10px 12px;cursor:pointer" data-act="open-group" data-id="${g.id}">
                  <b>${esc(g.name)}</b>
                  <div style="font-size:12px;color:var(--muted);margin-top:2px">
                    ${g.time.split(' - ')[0]} · ${esc(g.room)}
                  </div>
                </div>
              `).join("")}
              ${dClasses.length ? "" : `<div style="color:var(--muted);font-size:12px">Dars yo'q</div>`}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/* 5. Statistika */
function pageStats() {
  const all = attStats();
  const deb = debtors();

  return `
    <div class="row-head" style="margin-top:0">
      <h2>Statistika</h2>
    </div>

    <div class="grid c4" style="margin-bottom:18px">
      <div class="card stat-card"><div><div class="stat-label">Guruhlar</div><div class="stat-value">${S.groups.length}</div></div></div>
      <div class="card stat-card emerald"><div><div class="stat-label">O'quvchilar</div><div class="stat-value">${S.students.length}</div></div></div>
      <div class="card stat-card amber"><div><div class="stat-label">Davomat</div><div class="stat-value">${all.pct}%</div></div></div>
      <div class="card stat-card rose"><div><div class="stat-label">Qarzdorlar</div><div class="stat-value">${deb.length}</div></div></div>
    </div>

    <div class="grid c2">
      <div class="card">
        <h3 style="margin-bottom:14px">Guruhlar davomati</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${S.groups.map(g => {
            const a = attStats(g.id);
            return `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px">
                  <span>${esc(g.name)}</span>
                  <span>${a.pct}%</span>
                </div>
                <div class="progress-track" style="height:8px">
                  <div class="progress-fill" style="width:${a.pct}%;background:var(--primary)"></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom:14px">Qarzdor o'quvchilar</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Ism</th><th>Guruh</th><th>Qarz</th></tr></thead>
            <tbody>
              ${deb.map(s => `<tr><td>${esc(s.name)}</td><td>${esc((groupById(s.groupId) || {}).name || "")}</td><td><b class="bad">${money(s.balance)}</b></td></tr>`).join("")}
            </tbody>
          </table>
          ${deb.length ? "" : `<div class="empty">Qarzdor yo'q</div>`}
        </div>
      </div>
    </div>
  `;
}

/* 6. Uy Vazifalari */
function pageHomework() {
  return `
    <div class="row-head" style="margin-top:0">
      <h2>Uy vazifalari</h2>
      <button class="btn sm" data-act="add-hw">${icon("plus", 14)} Yangi vazifa</button>
    </div>

    <div class="grid c2">
      ${S.homework.map(h => {
        const g = groupById(h.groupId);
        const total = studentsOf(h.groupId).length;
        const done = Object.values(h.done).filter(Boolean).length;
        const isLate = h.due < todayISO();

        return `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <b>${esc(g ? g.name : "")}</b>
              <span class="tag ${isLate ? 'bad' : 'ok'}">${h.due}</span>
            </div>
            <h3 style="font-size:15px;margin-bottom:4px">${esc(h.title)}</h3>
            <p style="color:var(--muted);font-size:13px;margin-bottom:12px">${esc(h.desc)}</p>
            <div style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Topshirdi: <b>${done}/${total}</b></div>
            <div style="display:flex;gap:8px">
              <button class="btn ghost sm" data-act="check-hw" data-id="${h.id}">${icon("check", 13)} Tekshirish</button>
              <button class="btn danger sm" data-act="del-hw" data-id="${h.id}">${icon("trash", 13)}</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/* 7. Chat */
function pageChat() {
  if (!groupById(ui.chat) && S.groups[0]) ui.chat = S.groups[0].id;
  const g = groupById(ui.chat);
  const msgs = S.chats[ui.chat] || [];

  return `
    <div class="chat">
      <div class="card chat-list">
        ${S.groups.map(x => `
          <div class="chat-item ${x.id === ui.chat ? 'on' : ''}" data-act="open-chat" data-id="${x.id}">
            <div class="avatar" style="width:30px;height:30px;font-size:12px">${initials(x.name)}</div>
            <b>${esc(x.name)}</b>
          </div>
        `).join("")}
      </div>

      <div class="card chat-box">
        <div class="chat-head">
          <b>${g ? esc(g.name) : "Chat"}</b>
        </div>

        <div class="msgs" id="msgs">
          ${msgs.map(m => `
            <div class="msg ${m.from === "me" ? "me" : ""}">
              <div>${esc(m.text)}</div>
              <small>${new Date(m.t).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</small>
            </div>
          `).join("")}
          ${ui.isTyping ? `
            <div class="typing-box">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          ` : ""}
        </div>

        <form class="chat-form" id="chat-form">
          <input name="text" placeholder="Xabar yozing..." autocomplete="off" required>
          <button class="btn sm" type="submit">${icon("send", 14)}</button>
        </form>
      </div>
    </div>
  `;
}

/* 8. Profil */
function pageProfile(tab = "personal") {
  const t = S.teacher;
  const tabs = [
    ["personal", "Shaxsiy"],
    ["salary", "Oylik"],
    ["security", "Xavfsizlik"],
    ["settings", "Sozlamalar"]
  ];

  let body = "";

  if (tab === "personal") {
    body = `
      <form id="profile-form" class="card" style="max-width:580px">
        <div class="form-grid">
          <div class="field"><label>Ism</label><input name="name" value="${esc(t.name)}" required></div>
          <div class="field"><label>Lavozim</label><input name="title" value="${esc(t.title)}" required></div>
          <div class="field"><label>Telefon</label><input name="phone" value="${esc(t.phone)}"></div>
          <div class="field"><label>Xona</label><input name="room" value="${esc(t.room)}"></div>
        </div>
        <button class="btn sm" type="submit">Saqlash</button>
      </form>
    `;
  }

  if (tab === "salary") {
    body = `
      <div class="card" style="max-width:480px">
        <div style="font-size:24px;font-weight:800;color:var(--ok);margin-bottom:12px">${money(t.salary)}</div>
        <div style="font-size:13px;color:var(--muted)">Oylik maosh to'liq hisoblangan</div>
      </div>
    `;
  }

  if (tab === "security") {
    body = `
      <form id="pass-form" class="card" style="max-width:480px">
        <div class="field"><label>Login</label><input name="login" value="${esc(t.login)}" required></div>
        <div class="field"><label>Joriy parol</label><input type="password" name="old" required></div>
        <div class="field"><label>Yangi parol</label><input type="password" name="pw" minlength="4" required></div>
        <button class="btn sm" type="submit">Yangilash</button>
      </form>
    `;
  }

  if (tab === "settings") {
    body = `
      <div class="card" style="max-width:480px">
        <div class="switch">
          <span>Tovush effektlari</span>
          <input type="checkbox" id="sound-toggle" ${S.settings && S.settings.soundEnabled ? 'checked' : ''}>
        </div>
      </div>
    `;
  }

  return `
    <div class="tabs">
      ${tabs.map(([k, n]) => `<a class="${tab === k ? 'on' : ''}" data-act="go" data-to="#/profile/${k}">${n}</a>`).join("")}
    </div>
    ${body}
  `;
}

/* Shell va Router */
const NAV = [
  ["dashboard", "dashboard", "Asosiy"],
  ["groups", "schedule", "Guruhlar"],
  ["schedule", "schedule", "Jadval"],
  ["students", "students", "O'quvchilar"],
  ["homework", "homework", "Vazifalar"],
  ["stats", "stats", "Statistika"],
  ["chat", "chat", "Chat"],
  ["profile", "profile", "Profil"]
];

function loginPage() {
  return `
    <div class="login-wrap">
      <form class="login-card" id="login-form">
        <div class="login-brand">
          <div class="logo-box">T</div>
          <span>Topex Ustoz</span>
        </div>

        <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">Kirish</h2>

        <div class="field">
          <label>Login</label>
          <input name="login" value="ustoz" required autofocus>
        </div>
        <div class="field">
          <label>Parol</label>
          <input type="password" name="pw" value="1234" required>
        </div>

        <button class="btn" style="width:100%;margin-top:8px" type="submit">Kirish</button>
        <div style="font-size:12px;color:var(--muted);text-align:center;margin-top:14px">Login: <b>ustoz</b>, Parol: <b>1234</b></div>
      </form>
    </div>
  `;
}

let currentViewKey = null;

function render() {
  document.documentElement.setAttribute("data-theme", S.session.theme || "light");

  if (!S.session.in) {
    currentViewKey = null;
    $app.innerHTML = loginPage();
    return;
  }

  const [route, a1] = (location.hash.replace(/^#\/?/, "") || "dashboard").split("/");
  const newViewKey = route + "/" + (a1 || "") + "/" + (ui.groupTab || "") + "/" + (ui.filter || "");
  const isPageSwitch = currentViewKey !== newViewKey;
  currentViewKey = newViewKey;

  let content = "";

  if (route === "dashboard") content = pageDashboard();
  else if (route === "groups") content = pageGroups();
  else if (route === "group") content = pageGroup(a1);
  else if (route === "students") content = pageStudents();
  else if (route === "schedule") content = pageSchedule();
  else if (route === "stats") content = pageStats();
  else if (route === "homework") content = pageHomework();
  else if (route === "chat") content = pageChat();
  else if (route === "profile") content = pageProfile(a1);
  else content = pageDashboard();

  const activeNav = route === "group" ? "groups" : route;

  $app.innerHTML = `
    <div class="layout ${ui.sidebarCollapsed ? "sidebar-collapsed" : ""}">
      <aside class="sidebar ${ui.menu ? "open" : ""} ${ui.sidebarCollapsed ? "collapsed" : ""}" id="sidebar">
        <div class="sidebar-timer-bar" id="sidebar-timer-bar" title="10 soniyada yopiladi"></div>
        <div class="brand-wrapper">
          <div class="brand" data-act="brand-click" title="${ui.sidebarCollapsed ? "Sidebarni ochish" : "Asosiy sahifaga o'tish"}">
            <div class="logo-box">T</div>
            <span class="brand-name">Topex</span>
          </div>
          <div class="sidebar-header-actions">
            <button class="icon-btn sm sidebar-pin-btn ${ui.sidebarPinned ? "active" : ""}" data-act="toggle-sidebar-pin" title="${ui.sidebarPinned ? "Qadalgan (o'zi yopilmaydi). Avto-rejimga o'tish uchun bosing" : "Qadab qo'yish (avto-yopilmasligi uchun)"}">
              ${icon("pin", 15)}
            </button>
            <button class="icon-btn sm sidebar-toggle-btn" data-act="close-sidebar-now" title="Sidebarni darhol yopish (10 soniya kutmasdan)">
              ${icon("chevronLeft", 16)}
            </button>
          </div>
        </div>

        <nav class="nav">
          ${NAV.map(([k, ic, n]) => `
            <a class="${activeNav === k ? "active" : ""}" data-act="go" data-to="#/${k}" title="${n}">
              ${icon(ic, 18)}
              <span>${n}</span>
            </a>
          `).join("")}
        </nav>

        <div class="bottom nav">
          <a class="logout-btn" data-act="logout" title="Chiqish">
            ${icon("logout", 18)}
            <span>Chiqish</span>
          </a>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="topbar-left">
            <button class="icon-btn sidebar-top-btn" data-act="open-sidebar" title="Sidebarni ochish">
              ${icon("menu", 18)}
            </button>
            <div class="topbar-brand" data-act="open-sidebar" title="Sidebarni ochish">
              <div class="logo-box sm">T</div>
              <span class="topbar-brand-name">Topex</span>
            </div>
            <h1>${TITLES[route] || 'Asosiy'}</h1>
          </div>

          <div class="top-right">
            <div class="live-clock">
              <span class="live-dot"></span>
              <span id="digital-clock">--:--</span>
            </div>

            <button class="icon-btn" data-act="sound" title="Ovoz">
              ${icon(S.settings && S.settings.soundEnabled ? "volume" : "volumeX", 17)}
            </button>

            <button class="icon-btn" data-act="theme" title="Mavzu">
              ${icon(S.session.theme === "dark" ? "sun" : "moon", 17)}
            </button>

            <div class="user-profile-chip" data-act="go" data-to="#/profile">
              <div class="avatar">${initials(S.teacher.name)}</div>
              <span>${esc(S.teacher.name.split(" ")[0])}</span>
            </div>
          </div>
        </div>

        <div class="page-body ${isPageSwitch ? "page-enter" : ""}" id="page-body">
          ${content}
        </div>
      </main>
    </div>
  `;

  updateClock();
  const m = document.getElementById("msgs");
  if (m) m.scrollTop = m.scrollHeight;
  setupSidebarEvents();
}

let sidebarTimer = null;
window._sidebarIsHovered = false;
window._sidebarJustClosed = false;

function cancelSidebarTimer() {
  if (sidebarTimer) {
    clearTimeout(sidebarTimer);
    sidebarTimer = null;
  }
  const timerBar = document.getElementById("sidebar-timer-bar");
  if (timerBar) {
    timerBar.classList.remove("running");
  }
}

function collapseSidebar(showToast = true) {
  cancelSidebarTimer();
  ui.sidebarCollapsed = true;
  ui.sidebarPinned = false;
  localStorage.removeItem("topex_sidebar_pinned");
  window._sidebarIsHovered = false;
  window._sidebarJustClosed = true;

  const layout = document.querySelector(".layout");
  const sidebar = document.getElementById("sidebar");
  if (layout) layout.classList.add("sidebar-collapsed");
  if (sidebar) {
    sidebar.classList.add("collapsed");
    sidebar.classList.remove("hover-expanded");
    const pinBtn = sidebar.querySelector(".sidebar-pin-btn");
    if (pinBtn) pinBtn.classList.remove("active");
  }
  if (showToast) toast("Sidebar yopildi");
}

function expandSidebar(showToast = true) {
  cancelSidebarTimer();
  ui.sidebarCollapsed = false;
  ui.sidebarPinned = true;
  localStorage.setItem("topex_sidebar_pinned", "true");
  window._sidebarJustClosed = false;

  const layout = document.querySelector(".layout");
  const sidebar = document.getElementById("sidebar");
  if (layout) layout.classList.remove("sidebar-collapsed");
  if (sidebar) {
    sidebar.classList.remove("collapsed", "hover-expanded");
    const pinBtn = sidebar.querySelector(".sidebar-pin-btn");
    if (pinBtn) pinBtn.classList.add("active");
  }
  if (showToast) toast("Sidebar ochildi 📌");
}

function setupSidebarEvents() {
  const sidebar = document.getElementById("sidebar");
  const timerBar = document.getElementById("sidebar-timer-bar");
  if (!sidebar) return;

  // Agar foydalanuvchi tugma orqali hozirgina yopgan bo'lsa, hover bilan qayta ochilmasin
  if (window._sidebarJustClosed) {
    sidebar.classList.remove("hover-expanded");
  } else if (window._sidebarIsHovered && ui.sidebarCollapsed) {
    sidebar.classList.add("hover-expanded");
  }

  const startAutoCloseTimer = () => {
    if (window.innerWidth <= 900) return;
    if (ui.sidebarPinned) return;
    if (ui.sidebarCollapsed && !sidebar.classList.contains("hover-expanded")) return;

    if (timerBar) {
      timerBar.classList.remove("running");
      void timerBar.offsetWidth;
      timerBar.classList.add("running");
    }

    if (sidebarTimer) clearTimeout(sidebarTimer);
    sidebarTimer = setTimeout(() => {
      if (!window._sidebarIsHovered && !ui.sidebarPinned) {
        collapseSidebar(false);
      }
    }, 10000);
  };

  sidebar.onmouseenter = () => {
    if (window.innerWidth <= 900) return;
    if (window._sidebarJustClosed) return;

    window._sidebarIsHovered = true;
    cancelSidebarTimer();

    if (ui.sidebarCollapsed) {
      sidebar.classList.add("hover-expanded");
    }
  };

  sidebar.onmouseleave = () => {
    if (window.innerWidth <= 900) return;
    window._sidebarIsHovered = false;
    window._sidebarJustClosed = false;

    startAutoCloseTimer();
  };

  if (!window._sidebarIsHovered && !ui.sidebarPinned && !ui.sidebarCollapsed && !sidebarTimer && !window._sidebarJustClosed) {
    startAutoCloseTimer();
  }
}

function updateClock() {
  const el = document.getElementById("digital-clock");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}
setInterval(updateClock, 1000);

window.addEventListener("hashchange", () => {
  ui.menu = false;
  render();
});

/* Hodisalar */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  Sound.click();

  const act = el.dataset.act;
  const id = el.dataset.id;

  switch (act) {
    case "go":
      location.hash = el.dataset.to;
      break;
    case "brand-click": {
      if (ui.sidebarCollapsed) {
        expandSidebar();
      } else {
        location.hash = "#/dashboard";
      }
      break;
    }
    case "close-sidebar-now": {
      collapseSidebar();
      break;
    }
    case "open-sidebar":
    case "menu": {
      if (window.innerWidth <= 900) {
        ui.menu = !ui.menu;
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.toggle("open", ui.menu);
      } else {
        expandSidebar();
      }
      break;
    }
    case "toggle-sidebar": {
      if (window.innerWidth <= 900) {
        ui.menu = !ui.menu;
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.toggle("open", ui.menu);
      } else {
        if (ui.sidebarCollapsed) {
          expandSidebar();
        } else {
          collapseSidebar();
        }
      }
      break;
    }
    case "toggle-sidebar-pin": {
      cancelSidebarTimer();
      ui.sidebarPinned = !ui.sidebarPinned;
      const sidebar = document.getElementById("sidebar");
      const pinBtn = sidebar ? sidebar.querySelector(".sidebar-pin-btn") : null;
      if (ui.sidebarPinned) {
        expandSidebar(false);
        if (pinBtn) pinBtn.classList.add("active");
        toast("Sidebar qadandi — o'zi yopilmaydi 📌");
      } else {
        localStorage.removeItem("topex_sidebar_pinned");
        if (pinBtn) pinBtn.classList.remove("active");
        toast("Avto-yopilish yoqildi (10s) ⏱️");
      }
      break;
    }
    case "theme":
      S.session.theme = S.session.theme === "dark" ? "light" : "dark";
      save();
      render();
      break;
    case "sound":
      if (!S.settings) S.settings = {};
      S.settings.soundEnabled = !S.settings.soundEnabled;
      save();
      render();
      break;
    case "logout":
      S.session.in = false;
      save();
      render();
      break;
    case "close-modal":
      closeModal();
      break;
    case "close-modal-bg":
      if (e.target === el) closeModal();
      break;
    case "toggle-salary":
      ui.salaryShown = !ui.salaryShown;
      render();
      break;
    case "filter":
      ui.filter = el.dataset.v;
      render();
      break;
    case "open-group":
      ui.attDate = null;
      ui.groupTab = "att";
      location.hash = "#/group/" + id;
      break;
    case "set-group-tab":
      ui.groupTab = el.dataset.tab;
      render();
      break;
    case "open-chat":
      ui.chat = id;
      location.hash = "#/chat";
      render();
      break;
    case "mark": {
      const key = el.dataset.gid + "|" + (ui.attDate || todayISO());
      S.attendance[key] = S.attendance[key] || {};
      S.attendance[key][el.dataset.sid] = el.dataset.v;
      save();
      render();
      break;
    }
    case "set-att-grade": {
      if (!S.grades) S.grades = {};
      const gid = el.dataset.gid;
      const sid = el.dataset.sid;
      const date = el.dataset.date || (ui.attDate || todayISO());
      const score = parseInt(el.dataset.score, 10);
      const gradeKey = `${gid}|${sid}|${date}`;
      const student = S.students.find(s => s.id === sid);

      if (S.grades[gradeKey] && S.grades[gradeKey].score === score) {
        delete S.grades[gradeKey];
        toast(`${student ? student.name : "O'quvchi"}: baho olib tashlandi`);
      } else {
        S.grades[gradeKey] = { score: score, date: date };
        const attKey = gid + "|" + date;
        if (!S.attendance[attKey]) S.attendance[attKey] = {};
        if (!S.attendance[attKey][sid] || S.attendance[attKey][sid] === "kelmadi") {
          S.attendance[attKey][sid] = "keldi";
        }
        toast(`${student ? student.name : "O'quvchi"}: ${score} baho qo'yildi`, "ok");
      }
      save();
      render();
      break;
    }
    case "edit-grade": {
      const gid = el.dataset.gid;
      const sid = el.dataset.sid;
      const t = el.dataset.t;
      const tname = el.dataset.tname || `${t}-dars`;
      const s = S.students.find(x => x.id === sid);
      const gradeKey = `${gid}|${sid}|t${t}`;
      const cur = S.grades && S.grades[gradeKey] ? S.grades[gradeKey].score : 0;

      modal(`${s ? s.name : "O'quvchi"} — ${tname}`, `
        <div style="text-align:center;padding:12px 0 8px">
          <p style="color:var(--muted);font-size:14px;margin-bottom:18px">1 dan 5 gacha baho tanlang:</p>
          <div style="display:flex;justify-content:center;gap:10px;margin-bottom:16px">
            ${[1, 2, 3, 4, 5].map(n => `
              <button type="button" 
                class="grade-btn-large g${n} ${cur === n ? "on" : ""}" 
                data-act="save-grade-val" 
                data-key="${gradeKey}" 
                data-val="${n}">
                ${n}
              </button>
            `).join("")}
          </div>
          ${cur ? `
            <button type="button" class="btn ghost sm danger" data-act="save-grade-val" data-key="${gradeKey}" data-val="0" style="margin-top:6px">
              ${icon("trash", 13)} Bahoni o'chirish
            </button>
          ` : ""}
        </div>
      `, null, "");
      break;
    }
    case "save-grade-val": {
      if (!S.grades) S.grades = {};
      const key = el.dataset.key;
      const val = parseInt(el.dataset.val, 10);
      if (val > 0) {
        S.grades[key] = { score: val, date: todayISO() };
        toast(`Baho saqlandi: ${val}`, "ok");
      } else {
        delete S.grades[key];
        toast("Baho o'chirildi");
      }
      save();
      closeModal();
      render();
      break;
    }
    case "mark-all": {
      const key = el.dataset.gid + "|" + (ui.attDate || todayISO());
      S.attendance[key] = {};
      studentsOf(el.dataset.gid).forEach(s => (S.attendance[key][s.id] = "keldi"));
      save();
      fireConfetti();
      render();
      toast("Barchasi keldi deb belgilandi");
      break;
    }
    case "add-student":
      studentForm(null, el.dataset.gid);
      break;
    case "edit-student":
      studentForm(S.students.find(s => s.id === id));
      break;
    case "del-student":
      if (confirm("O'quvchini o'chirishni xohlaysizmi?")) {
        S.students = S.students.filter(s => s.id !== id);
        save();
        render();
        toast("O'chirildi");
      }
      break;
    case "add-group":
      groupForm();
      break;
    case "del-group":
      toast("Guruhni faqat admin o'chira oladi. Ustozda bu huquq yo'q", "bad");
      break;
    case "add-hw":
      hwForm();
      break;
    case "check-hw":
      checkHw(id);
      break;
    case "del-hw":
      if (confirm("Vazifa o'chirilsinmi?")) {
        S.homework = S.homework.filter(h => h.id !== id);
        save();
        render();
      }
      break;
    case "export-csv":
      exportCSV();
      break;
  }
});

document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "att-date") {
    ui.attDate = t.value || todayISO();
    render();
  }
  if (t.id === "group-filter") {
    ui.groupFilter = t.value;
    render();
  }
  if (t.id === "sound-toggle") {
    if (!S.settings) S.settings = {};
    S.settings.soundEnabled = t.checked;
    save();
  }
});

document.addEventListener("input", e => {
  if (e.target.id === "search") {
    ui.search = e.target.value;
    const pos = e.target.selectionStart;
    render();
    const inp = document.getElementById("search");
    if (inp) {
      inp.focus();
      inp.setSelectionRange(pos, pos);
    }
  }
});

document.addEventListener("submit", e => {
  const f = e.target;
  if (f.id === "login-form") {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (d.login === S.teacher.login && d.pw === S.teacher.password) {
      S.session.in = true;
      save();
      location.hash = "#/dashboard";
      fireConfetti();
      render();
    } else {
      toast("Login yoki parol noto'g'ri", "bad");
    }
  }

  if (f.id === "profile-form") {
    e.preventDefault();
    Object.assign(S.teacher, Object.fromEntries(new FormData(f)));
    save();
    render();
    toast("Saqlandi");
  }

  if (f.id === "pass-form") {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (d.old !== S.teacher.password) {
      toast("Joriy parol noto'g'ri", "bad");
      return;
    }
    S.teacher.login = d.login.trim();
    S.teacher.password = d.pw;
    save();
    f.reset();
    toast("Parol yangilandi");
  }

  if (f.id === "chat-form") {
    e.preventDefault();
    const text = new FormData(f).get("text").trim();
    if (!text) return;

    S.chats[ui.chat] = S.chats[ui.chat] || [];
    S.chats[ui.chat].push({
      from: "me",
      text,
      t: Date.now()
    });
    save();
    render();

    ui.isTyping = true;
    render();
    setTimeout(() => {
      ui.isTyping = false;
      const replies = ["Tushundim, ustoz!", "Rahmat!", "Vazifani topshiraman."];
      S.chats[ui.chat].push({
        from: "them",
        text: replies[Math.floor(Math.random() * replies.length)],
        t: Date.now()
      });
      save();
      render();
    }, 1100);
  }
});

/* Formalar */
function groupForm() {
  modal("Yangi guruh", `
    <div class="field"><label>Guruh nomi</label><input name="name" required placeholder="FN-25"></div>
    <div class="field"><label>Kurs</label><input name="course" required placeholder="Frontend"></div>
    <div class="form-grid">
      <div class="field"><label>Xona</label><input name="room" value="304-xona" required></div>
      <div class="field"><label>Vaqt</label><input name="time" value="09:00" required></div>
    </div>
    <div class="field"><label>Kunlar (1=Du, 3=Chor, 5=Ju)</label><input name="days" value="1,3,5" required></div>
  `, d => {
    const days = d.days.split(",").map(x => parseInt(x.trim(), 10)).filter(x => x >= 1 && x <= 7);
    S.groups.push({
      id: Store.uid("g"),
      name: d.name,
      course: d.course,
      room: d.room,
      time: d.time,
      days: days.length ? days : [1, 3, 5]
    });
    save();
    closeModal();
    fireConfetti();
    render();
    toast("Guruh qo'shildi");
  });
}

function studentForm(s, gid) {
  const v = s || { name: "", phone: "+998 90 ", parentPhone: "+998 93 ", balance: 0, groupId: gid || (S.groups[0] || {}).id };
  modal(s ? "Tahrirlash" : "Yangi o'quvchi", `
    <div class="field"><label>F.I.Sh.</label><input name="name" required value="${esc(v.name)}"></div>
    <div class="form-grid">
      <div class="field">
        <label>Guruh</label>
        <select name="groupId">
          ${S.groups.map(g => `<option value="${g.id}" ${g.id === v.groupId ? "selected" : ""}>${esc(g.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Telefon</label><input name="phone" value="${esc(v.phone)}"></div>
      <div class="field"><label>Ota-onasi</label><input name="parentPhone" value="${esc(v.parentPhone)}"></div>
      <div class="field"><label>Balans</label><input type="number" name="balance" value="${esc(v.balance)}"></div>
    </div>
  `, d => {
    d.balance = Number(d.balance) || 0;
    if (s) Object.assign(s, d);
    else S.students.push(Object.assign({ id: Store.uid("s") }, d));
    save();
    closeModal();
    render();
    toast("Saqlandi");
  });
}

function hwForm() {
  if (!S.groups.length) { toast("Avval guruh oching", "bad"); return; }
  const due = new Date(Date.now() + 3 * 864e5);
  modal("Yangi vazifa", `
    <div class="field">
      <label>Guruh</label>
      <select name="groupId">${S.groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select>
    </div>
    <div class="field"><label>Sarlavha</label><input name="title" required></div>
    <div class="field"><label>Tavsif</label><textarea name="desc" rows="3" required></textarea></div>
    <div class="field"><label>Muddati</label><input type="date" name="due" value="${iso(due)}" required></div>
  `, d => {
    S.homework.push({ id: Store.uid("h"), groupId: d.groupId, title: d.title, desc: d.desc, due: d.due, done: {} });
    save();
    closeModal();
    render();
    toast("Vazifa berildi");
  });
}

function checkHw(id) {
  const h = S.homework.find(x => x.id === id);
  if (!h) return;
  const list = studentsOf(h.groupId);

  modal(h.title, `
    <div style="max-height:50vh;overflow-y:auto">
      ${list.map(s => `
        <label class="switch">
          <span>${esc(s.name)}</span>
          <input type="checkbox" name="${s.id}" ${h.done[s.id] ? "checked" : ""}>
        </label>
      `).join("")}
    </div>
  `, d => {
    h.done = {};
    Object.keys(d).forEach(k => (h.done[k] = true));
    save();
    closeModal();
    render();
    toast("Saqlandi");
  });
}

function exportCSV() {
  const head = ["F.I.Sh.", "Guruh", "Telefon", "Ota-onasi", "Balans"];
  const rows = S.students.map(s => [s.name, (groupById(s.groupId) || {}).name || "", s.phone, s.parentPhone, s.balance]);
  const csv = "\uFEFF" + [head].concat(rows).map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `oquvchilar_${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function hidePreloader() {
  const p = document.getElementById("app-preloader");
  if (!p) return;
  setTimeout(() => {
    p.classList.add("fade-out");
    setTimeout(() => {
      try { p.remove(); } catch(e) {}
    }, 450);
  }, 450);
}

render();
hidePreloader();
