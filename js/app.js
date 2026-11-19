/**
 * ==========================================================================
 * TOPEX Texnikum — O'qituvchi Boshqaruv Tizimi (Soddalashtirilgan)
 * ==========================================================================
 */

let S = Store.load();
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
  chat: "ai",
  aiAutoReply: true,
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
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
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
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.dashboard}</svg>`;
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
const groupById = id => (S.groups || []).find(g => String(g.id) === String(id));
const studentsOf = gid => (S.students || []).filter(s => String(s.groupId) === String(gid));
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
  if (!S.attendance || typeof S.attendance !== "object") return { present: 0, total: 0, pct: 0 };
  Object.keys(S.attendance).forEach(key => {
    if (gid && String(key.split("|")[0]) !== String(gid)) return;
    const rec = S.attendance[key];
    if (rec && typeof rec === "object") {
      Object.values(rec).forEach(v => {
        t++;
        if (v === "keldi") k++;
      });
    }
  });
  return { present: k, total: t, pct: roundPct(k, t) };
}

function studentAvgGrade(sid, gid) {
  if (!S.grades || typeof S.grades !== "object") return null;
  let sum = 0, count = 0;
  Object.keys(S.grades).forEach(k => {
    const parts = k.split("|");
    if (String(parts[1]) === String(sid) && (!gid || String(parts[0]) === String(gid))) {
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
  return (S.students || []).filter(s => s.balance < 0);
}

/* ==========================================================================
   Sahifalar
   ========================================================================== */

/* 1. Asosiy */
function pageDashboard() {
  const wd = weekday(new Date());
  const todayGroups = (S.groups || []).filter(g => {
    const days = Array.isArray(g.days) ? g.days : (typeof g.days === "string" ? g.days.split(",").map(Number) : []);
    return days.includes(wd);
  });
  const st = attStats();
  const announcements = S.announcements || [];
  const teacherName = (S.teacher && (S.teacher.name || S.teacher.fullname)) || "Azamat Qodirov";
  const soundEnabled = !S.settings || S.settings.soundEnabled !== false;
  const isDark = S.session && S.session.theme === "dark";
  const salary = (S.teacher && S.teacher.salary) || 6500000;

  return `
    <!-- Stitch Mobile Title & Greeting (Mobile only) -->
    <div class="mobile-greeting-area">
      <div class="mobile-greeting-texts">
        <h1 class="mobile-greeting-title">Asosiy</h1>
        <p class="mobile-greeting-sub">Xush kelibsiz, ${esc(teacherName)}</p>
      </div>
    </div>

    <!-- Stitch Mobile Quick Status Toolbar (Mobile only) -->
    <div class="mobile-quick-toolbar">
      <div class="mobile-live-status-pill">
        <span class="status-pulse-dot"></span>
        <span class="live-clock-text">--:--</span> • Faol seans
      </div>
      <div class="mobile-quick-btns">
        <button type="button" class="mobile-quick-action-btn" data-act="sound" title="Ovozli bildirishnomalar">
          ${icon(soundEnabled ? "volume" : "volumeX", 16)}
        </button>
        <button type="button" class="mobile-quick-action-btn" data-act="theme" title="Tungi/kunduzgi rejim">
          ${icon(isDark ? "sun" : "moon", 16)}
        </button>
      </div>
    </div>

    <!-- 4 ta Asosiy KPI Kartasi (Mobile: 2x2 grid, Desktop: 4-col) -->
    <div class="grid c4" style="margin-bottom:24px">
      <!-- 1. O'quvchilar -->
      <div class="stat-card" style="cursor:pointer" data-act="go" data-to="#/students">
        <div class="stat-card-left">
          <div class="stat-label">O'quvchilar</div>
          <div class="stat-value">${S.students.length} ta</div>
          <div class="stat-subtext">Talabalar tarkibi</div>
        </div>
        <div class="stat-card-right">
          <div class="stat-icon-wrap tone-indigo">
            ${icon("students", 24)}
          </div>
        </div>
      </div>

      <!-- 2. Davomat -->
      <div class="stat-card" style="cursor:pointer" data-act="go" data-to="#/stats">
        <div class="stat-card-left">
          <div class="stat-label">Davomat</div>
          <div class="stat-value">${st.pct}%</div>
          <div class="stat-subtext">Faol davomat ko'rsatkichi</div>
        </div>
        <div class="stat-card-right">
          <div class="stat-icon-wrap tone-green">
            ${icon("check", 24)}
          </div>
        </div>
      </div>

      <!-- 3. Guruhlar -->
      <div class="stat-card" style="cursor:pointer" data-act="go" data-to="#/groups">
        <div class="stat-card-left">
          <div class="stat-label">Guruhlar</div>
          <div class="stat-value">${S.groups.length} ta</div>
          <div class="stat-subtext">Biriktirilgan guruhlar</div>
        </div>
        <div class="stat-card-right">
          <div class="stat-icon-wrap tone-amber">
            ${icon("schedule", 24)}
          </div>
        </div>
      </div>

      <!-- 4. Oylik (Stitch privacy pattern mask) -->
      <div class="stat-card">
        <div class="stat-card-left">
          <div class="stat-label" style="display:flex;align-items:center;gap:6px">
            Oylik
            <button class="btn ghost sm" data-act="toggle-salary" style="padding:2px 5px" title="${ui.salaryShown ? "Berkitish" : "Ko'rsatish"}">
              ${icon(ui.salaryShown ? "eyeOff" : "eye", 13)}
            </button>
          </div>
          <div class="stat-value">
            ${ui.salaryShown ? `
              <span class="salary-revealed-text" data-act="toggle-salary">${money(salary)}</span>
            ` : `
              <div class="privacy-pattern-box" data-act="toggle-salary" title="Ko'rish uchun bosing">
                <span class="privacy-dots">• • • •</span>
              </div>
            `}
          </div>
          <div class="stat-subtext">Kafedra bo'yicha to'liq</div>
        </div>
        <div class="stat-card-right">
          <div class="stat-icon-wrap tone-red">
            ${icon("profile", 24)}
          </div>
        </div>
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
                    <div style="font-weight:800;font-size:14px;margin-bottom:2px">${esc(g.name || "Guruh")}</div>
                    <div style="font-size:12.5px;color:var(--muted)">${esc(g.course || g.name || "")} · ${esc(g.time ? String(g.time).split(' - ')[0] : (g.timeFrom || "09:00"))} · ${esc(g.room || g.roomId || "304-laboratoriya")}</div>
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
          <div class="stitch-empty-schedule">
            <div class="stitch-empty-icon-circle">
              ${icon("schedule", 26)}
            </div>
            <p class="stitch-empty-title">Bugun rejalashtirilgan darslar yo'q</p>
            <button type="button" class="stitch-empty-btn" data-act="go" data-to="#/schedule">
              <span>Dars jadvalini ko'rish</span>
              <span>→</span>
            </button>
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
          ${announcements.length ? "" : `
            <div class="stitch-empty-announcements">
              <div class="stitch-empty-icon-circle">
                ${icon("chat", 26)}
              </div>
              <p class="stitch-empty-title">Yangi e'lonlar yo'q</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

/* 2. Guruhlar */
function pageGroups() {
  const wd = weekday(new Date());
  let groups = (S.groups || []).slice();
  if (ui.filter === "today") {
    groups = groups.filter(g => {
      const days = Array.isArray(g.days) ? g.days : (typeof g.days === "string" ? g.days.split(",").map(Number) : []);
      return days.includes(wd);
    });
  }

  return `
    <div class="row-head" style="margin-top:0">
      <div>
        <h2>Guruhlar (${(S.groups || []).length})</h2>
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
            const days = Array.isArray(g.days) ? g.days : (typeof g.days === "string" ? g.days.split(",").map(Number) : []);
            const isToday = days.includes(wd);
            const roomClean = String(g.room || g.roomId || "304-laboratoriya")
              .replace("3-bino, ", "")
              .replace("2-bino, ", "")
              .replace("1-bino, ", "");
            const timeClean = g.time ? String(g.time).split(' - ')[0] : (g.timeFrom || "09:00");
            return `
              <tr class="click" data-act="open-group" data-id="${g.id}">
                <td>
                  <b>${esc(g.name || "Guruh")}</b>
                  ${isToday ? `<span class="badge ok" style="margin-left:6px">Bugun</span>` : ""}
                </td>
                <td>${esc(g.course || g.name || "—")}</td>
                <td><b>${gStudents.length}</b></td>
                <td>${esc(roomClean)}</td>
                <td>${esc(timeClean)}</td>
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
  const rec = (S.attendance && S.attendance[key]) ? S.attendance[key] : {};
  const list = studentsOf(g.id);
  const tab = ui.groupTab || "att";

  let tabContent = "";

  if (tab === "att") {
    const presentCount = list.filter(s => rec[s.id] === "keldi").length;
    const absentCount = list.filter(s => rec[s.id] === "kelmadi").length;
    const excusedCount = list.filter(s => rec[s.id] === "sababli").length;

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
      <!-- Stitch Quick Summary Badges (Davomat va baholash) -->
      <div class="att-summary-pills">
        <span class="att-pill total">Jami: <b>${list.length}</b></span>
        <span class="att-pill present">✓ Bor: <b>${presentCount}</b></span>
        <span class="att-pill excused">⏱ Sababli: <b>${excusedCount}</b></span>
        <span class="att-pill absent">✕ Yo'q: <b>${absentCount}</b></span>
      </div>

      <div class="row-head">
        <div class="toolbar">
          <input type="date" class="search" id="att-date" value="${date}">
          <button class="btn success sm" data-act="mark-all" data-gid="${g.id}">${icon("check", 14)} Barchasi 'Bor'</button>
        </div>
        <button class="btn sm" data-act="add-student" data-gid="${g.id}">${icon("plus", 14)} O'quvchi</button>
      </div>

      <!-- Desktop Table View -->
      <div class="card table-wrap desktop-only">
        <table>
          <thead><tr><th>№</th><th>F.I.Sh.</th><th>Telefon</th><th>Davomat</th><th>Baho (1–5)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <!-- Mobile Touch Attendance Cards (Stitch) -->
      <div class="att-mobile-cards">
        ${list.map(s => {
          const cur = rec[s.id] || "";
          const gradeKey = `${g.id}|${s.id}|${date}`;
          const curGrade = S.grades && S.grades[gradeKey] ? S.grades[gradeKey].score : 0;
          return `
            <div class="card" style="padding:14px;border-radius:16px;margin-bottom:10px">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;cursor:pointer" data-act="open-student" data-id="${s.id}">
                  <div class="avatar sm" style="background:${esc(s.avatarColor || g.color || '#6366f1')}">${initials(s.name)}</div>
                  <div style="min-width:0">
                    <div style="font-weight:700;font-size:13.5px;color:var(--text)" class="truncate">${esc(s.name)}</div>
                    <div style="font-size:11px;color:var(--muted)">${esc(s.phone || "#" + s.id)}</div>
                  </div>
                </div>
                ${cur ? `<span class="badge ${cur === 'keldi' ? 'ok' : (cur === 'sababli' ? 'warn' : 'bad')}">${cur === 'keldi' ? 'Bor' : (cur === 'sababli' ? 'Sababli' : 'Yo\'q')}</span>` : ''}
              </div>

              <!-- 3 Attendance Buttons -->
              <div class="att" style="margin-top:10px">
                <button type="button" class="keldi ${cur === "keldi" ? "on" : ""}" data-act="mark" data-sid="${s.id}" data-gid="${g.id}" data-v="keldi">✓ Bor</button>
                <button type="button" class="sababli ${cur === "sababli" ? "on" : ""}" data-act="mark" data-sid="${s.id}" data-gid="${g.id}" data-v="sababli">⏱ Sababli</button>
                <button type="button" class="kelmadi ${cur === "kelmadi" ? "on" : ""}" data-act="mark" data-sid="${s.id}" data-gid="${g.id}" data-v="kelmadi">✕ Yo'q</button>
              </div>

              <!-- Grade Picker -->
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">
                <span style="font-size:11.5px;font-weight:600;color:var(--muted)">Baho:</span>
                <div class="grade-picker">
                  ${[1, 2, 3, 4, 5].map(n => `
                    <button type="button" class="grade-btn g${n} ${curGrade === n ? "on" : ""}" data-act="set-att-grade" data-gid="${g.id}" data-sid="${s.id}" data-date="${date}" data-score="${n}">${n}</button>
                  `).join("")}
                </div>
              </div>
            </div>
          `;
        }).join("")}
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
        <h2>${esc(g.name || "Guruh")}</h2>
        <span style="color:var(--muted);font-size:13px">${esc(g.course || g.name || "")} · ${esc(g.room || g.roomId || "304-laboratoriya")}</span>
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
function getFilteredStudents() {
  const q = (ui.search || "").trim().toLowerCase();
  const filterGid = ui.groupFilter ? String(ui.groupFilter).trim() : "";
  const qDigits = q.replace(/\D/g, "");

  // Agar tanlangan guruh mavjud bo'lmasa, filtrni tozalash
  if (filterGid && !(S.groups || []).some(g => String(g.id) === filterGid)) {
    ui.groupFilter = "";
  }
  const effectiveGid = String(ui.groupFilter || "").trim();

  return (S.students || []).filter(s => {
    // 1. Guruh bo'yicha filtr
    if (effectiveGid && String(s.groupId) !== effectiveGid) {
      return false;
    }

    // 2. Qidiruv so'zi bo'yicha filtr
    if (!q) return true;

    const name = String(s.name || s.fullname || "").toLowerCase();
    const phone = String(s.phone || "").toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "");
    const parentPhone = String(s.parentPhone || "").toLowerCase();
    const parentPhoneDigits = parentPhone.replace(/\D/g, "");
    const parentName = String(s.parentName || s.father || "").toLowerCase();
    const note = String(s.note || "").toLowerCase();

    const g = groupById(s.groupId);
    const groupName = g ? String(g.name || "").toLowerCase() : "";
    const groupCourse = g ? String(g.course || "").toLowerCase() : "";

    const matchName = name.includes(q);
    const matchPhone = phone.includes(q) || (qDigits.length >= 2 && phoneDigits.includes(qDigits));
    const matchParent = parentName.includes(q) || parentPhone.includes(q) || (qDigits.length >= 2 && parentPhoneDigits.includes(qDigits));
    const matchGroup = groupName.includes(q) || groupCourse.includes(q);
    const matchNote = note.includes(q);

    return matchName || matchPhone || matchParent || matchGroup || matchNote;
  });
}

function renderStudentsRows(list) {
  if (!list || !list.length) return "";
  return list.map((s, i) => {
    const g = groupById(s.groupId);
    const avg = studentAvgGrade(s.id);
    const avgNum = avg ? parseFloat(avg) : 0;
    const name = s.name || s.fullname || "—";
    const phone = s.phone || "—";
    const parent = s.parentPhone || s.parentName || s.father || "—";
    const groupName = g ? (g.name || "Guruh") : "—";
    const balance = Number(s.balance) || 0;
    const avatarBg = esc(s.avatarColor || (g && g.color) || '#6366f1');

    return `
      <tr class="click" data-act="open-student" data-id="${s.id}" style="cursor:pointer" title="O'quvchi ma'lumotlarini ko'rish">
        <td>${i + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar sm" style="background:${avatarBg}">${initials(name)}</div>
            <div>
              <b>${esc(name)}</b>
              ${s.note ? `<div style="font-size:11.5px;color:var(--muted)">${esc(s.note)}</div>` : ""}
            </div>
          </div>
        </td>
        <td><span class="badge ${g ? 'primary' : ''}">${esc(groupName)}</span></td>
        <td>${avg ? `<span class="badge ${avgNum >= 4 ? 'ok' : (avgNum >= 3 ? 'warn' : 'bad')}">★ ${avg}</span>` : `<span style="color:var(--muted)">—</span>`}</td>
        <td>${esc(phone)}</td>
        <td>${esc(parent)}</td>
        <td><b class="${balance < 0 ? 'bad' : 'ok'}">${money(balance)}</b></td>
        <td style="text-align:right" onclick="event.stopPropagation()">
          <div style="display:flex;justify-content:flex-end;gap:6px">
            <button type="button" class="btn ghost sm" data-act="edit-student" data-id="${s.id}" title="Tahrirlash">
              ${icon("edit", 13)} Tahrirlash
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function updateStudentsView() {
  const tableBody = document.getElementById("students-table-body");
  const countTitle = document.getElementById("students-count-title");
  const emptyBox = document.getElementById("students-empty");
  const searchWrap = document.querySelector(".search-wrap");

  if (!tableBody) {
    render();
    return;
  }

  const list = getFilteredStudents();

  if (countTitle) {
    countTitle.textContent = `O'quvchilar (${list.length})`;
  }

  tableBody.innerHTML = renderStudentsRows(list);

  if (emptyBox) {
    if (list.length === 0) {
      emptyBox.style.display = "";
      emptyBox.classList.remove("hidden");
    } else {
      emptyBox.style.display = "none";
      emptyBox.classList.add("hidden");
    }
  }

  // Qidiruv maydonidagi tozalash (X) tugmasini dinamik yangilash
  if (searchWrap) {
    let btn = document.getElementById("clear-search-btn");
    const iconSpan = searchWrap.querySelector("span");
    if (ui.search) {
      if (iconSpan) iconSpan.remove();
      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.id = "clear-search-btn";
        btn.setAttribute("data-act", "clear-search");
        btn.setAttribute("title", "Tozalash");
        btn.style.cssText = "position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:16px;line-height:1;padding:2px";
        btn.innerHTML = "&times;";
        searchWrap.appendChild(btn);
      }
    } else {
      if (btn) btn.remove();
      if (!iconSpan) {
        const span = document.createElement("span");
        span.style.cssText = "position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--muted);display:flex;align-items:center";
        span.innerHTML = icon("search", 13);
        searchWrap.appendChild(span);
      }
    }
  }
}

function pageStudents() {
  const list = getFilteredStudents();
  const groups = S.groups || [];

  return `
    <div class="row-head" style="margin-top:0">
      <h2 id="students-count-title">O'quvchilar (${list.length})</h2>
      <div class="toolbar">
        <div class="search-wrap" style="position:relative;display:inline-flex;align-items:center">
          <input class="search" id="search" placeholder="Qidirish (ism, tel, guruh)..." value="${esc(ui.search)}" autocomplete="off" style="padding-right:28px">
          ${ui.search ? `<button type="button" id="clear-search-btn" data-act="clear-search" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:16px;line-height:1;padding:2px" title="Tozalash">&times;</button>` : `<span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--muted);display:flex;align-items:center">${icon("search", 13)}</span>`}
        </div>
        <select class="search" id="group-filter">
          <option value="">Barcha guruhlar (${groups.length})</option>
          ${groups.map(g => `<option value="${g.id}" ${String(ui.groupFilter) === String(g.id) ? "selected" : ""}>${esc(g.name || g.course || "Guruh")}</option>`).join("")}
        </select>
        <button class="btn sm" data-act="add-student" data-gid="${ui.groupFilter || ''}">${icon("plus", 14)} Qo'shish</button>
        <button class="btn ghost sm" data-act="export-csv">${icon("download", 14)} CSV</button>
      </div>
    </div>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>F.I.Sh.</th>
            <th>Guruh</th>
            <th>O'rtacha baho</th>
            <th>Telefon</th>
            <th>Ota-onasi</th>
            <th>Balans</th>
            <th style="text-align:right">Amallar</th>
          </tr>
        </thead>
        <tbody id="students-table-body">
          ${renderStudentsRows(list)}
        </tbody>
      </table>
      <div id="students-empty" class="${list.length ? 'hidden' : 'empty'}" style="${list.length ? 'display:none' : ''}">O'quvchilar topilmadi</div>
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
        const dClasses = (S.groups || []).filter(g => {
          const days = Array.isArray(g.days) ? g.days : (typeof g.days === "string" ? g.days.split(",").map(Number) : []);
          return days.includes(d);
        });
        return `
          <div class="card" style="padding:16px">
            <h3 style="font-size:15px;margin-bottom:10px">${DAYS[d]}</h3>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${dClasses.map(g => {
                const timeText = g.time ? String(g.time).split(' - ')[0] : (g.timeFrom || "09:00");
                const roomText = esc(g.room || g.roomId || "304-laboratoriya");
                return `
                <div class="card" style="padding:10px 12px;cursor:pointer" data-act="open-group" data-id="${g.id}">
                  <b>${esc(g.name || "Guruh")}</b>
                  <div style="font-size:12px;color:var(--muted);margin-top:2px">
                    ${esc(timeText)} · ${roomText}
                  </div>
                </div>
              `}).join("")}
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
  const hwFilter = ui.hwFilter || "all";
  const today = todayISO();
  let list = S.homework || [];

  if (hwFilter === "unchecked") {
    list = list.filter(h => {
      const total = studentsOf(h.groupId).length;
      const done = Object.values(h.done || {}).filter(Boolean).length;
      return done < total;
    });
  } else if (hwFilter === "urgent") {
    list = list.filter(h => {
      const total = studentsOf(h.groupId).length;
      const done = Object.values(h.done || {}).filter(Boolean).length;
      return h.due <= today && done < total;
    });
  } else if (hwFilter === "completed") {
    list = list.filter(h => {
      const total = studentsOf(h.groupId).length;
      const done = Object.values(h.done || {}).filter(Boolean).length;
      return total > 0 && done >= total;
    });
  }

  const allCount = (S.homework || []).length;
  const uncheckedCount = (S.homework || []).filter(h => {
    const total = studentsOf(h.groupId).length;
    const done = Object.values(h.done || {}).filter(Boolean).length;
    return done < total;
  }).length;
  const urgentCount = (S.homework || []).filter(h => {
    const total = studentsOf(h.groupId).length;
    const done = Object.values(h.done || {}).filter(Boolean).length;
    return h.due <= today && done < total;
  }).length;

  return `
    <div class="row-head" style="margin-top:0">
      <div>
        <h2 style="font-size:22px;font-weight:900;letter-spacing:-0.02em">Uy vazifalari</h2>
        <p style="font-size:12.5px;color:var(--muted);margin-top:2px">Jami ${allCount} ta faol topshiriq</p>
      </div>
      <button class="btn sm" data-act="add-hw">${icon("plus", 14)} Yangi vazifa</button>
    </div>

    <!-- Quick Filter Pills (Stitch) -->
    <div class="hw-filters">
      <button type="button" class="hw-filter-pill ${hwFilter === 'all' ? 'active' : ''}" data-act="filter-hw" data-filter="all">
        Barchasi (${allCount})
      </button>
      <button type="button" class="hw-filter-pill ${hwFilter === 'unchecked' ? 'active' : ''}" data-act="filter-hw" data-filter="unchecked">
        Tekshirilmagan ${uncheckedCount ? `<span class="badge bad-sm">${uncheckedCount}</span>` : ''}
      </button>
      <button type="button" class="hw-filter-pill ${hwFilter === 'urgent' ? 'active' : ''}" data-act="filter-hw" data-filter="urgent">
        Muddat yaqin ${urgentCount ? `<span class="badge warn-sm">${urgentCount}</span>` : ''}
      </button>
      <button type="button" class="hw-filter-pill ${hwFilter === 'completed' ? 'active' : ''}" data-act="filter-hw" data-filter="completed">
        Tugallangan
      </button>
    </div>

    <div class="grid c2">
      ${list.map(h => {
        const g = groupById(h.groupId);
        const total = studentsOf(h.groupId).length;
        const done = Object.values(h.done || {}).filter(Boolean).length;
        const isLate = h.due < today;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const isCompleted = total > 0 && done >= total;
        const statusClass = isLate ? "urgent" : (isCompleted ? "completed" : "normal");

        return `
          <div class="hw-task-card ${statusClass}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <span class="badge primary">${esc(g ? g.name : "Guruh")}</span>
              <span class="badge ${isLate ? 'bad' : 'ok'}">${isLate ? 'Muddati o\'tgan' : h.due}</span>
            </div>
            <div>
              <h3 style="font-size:15px;font-weight:700;margin-bottom:4px;color:var(--text)">${esc(h.title)}</h3>
              <p style="color:var(--muted);font-size:12.5px;line-height:1.45">${esc(h.desc)}</p>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-bottom:6px">
                <span>Topshirdi: <b>${done}/${total}</b> o'quvchi</span>
                <span style="font-weight:700;color:var(--primary)">${pct}%</span>
              </div>
              <div class="hw-progress-bar">
                <div class="hw-progress-fill" style="width:${pct}%;background:${isCompleted ? 'var(--ok)' : 'var(--primary)'}"></div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px">
              <button class="btn ghost sm" data-act="check-hw" data-id="${h.id}">${icon("check", 13)} Tekshirish ${total - done > 0 ? `(${total - done})` : ''}</button>
              <button class="btn danger sm" data-act="del-hw" data-id="${h.id}" title="O'chirish">${icon("trash", 13)}</button>
            </div>
          </div>
        `;
      }).join("")}
      ${list.length ? "" : `
        <div class="card" style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--muted)">
          <div class="stitch-empty-icon-circle" style="margin:0 auto 12px">
            ${icon("homework", 26)}
          </div>
          <p style="font-weight:600">Topshiriqlar topilmadi</p>
        </div>
      `}
    </div>
  `;
}

/* Markdown formatlash (AI javoblari uchun) */
function renderChatMarkdown(text) {
  if (!text) return "";
  let html = esc(text);

  // Ko'p qatorli kod bloklari ```lang\ncode\n```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const rawCode = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    return `<div class="chat-code-block">
      <div class="chat-code-header">
        <span>${lang || 'kod'}</span>
        <button type="button" class="chat-copy-btn" data-act="copy-code" data-code="${esc(rawCode.trim())}">Nusxa olish</button>
      </div>
      <pre><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Bir qatorli kod `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Qalin matn **matn**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

  // Qiya matn *matn*
  html = html.replace(/\*([^*]+)\*/g, '<i>$1</i>');

  // Qator tashlash
  html = html.replace(/\n/g, '<br>');

  return html;
}

// Mijoz tomonidagi sun'iy intellekt (Fallback)
function generateClientAIResponse(message, context = {}) {
  const q = String(message || '').trim().toLowerCase();
  const teacherName = context.teacherName || (S.teacher && S.teacher.name) || "Ustoz";
  const groupName = context.groupName || "Topex guruhi";

  if (/^(salom|assalomu\s*alaykum|hayrli\s*(kun|tong|kech)|privet|hi|hello)/i.test(q)) {
    return `Assalomu alaykum, hurmatli **${teacherName}**! 🌟\n\nMen **Topex AI** — sizning dars va metodika bo'yicha sun'iy intellekt yordamchingizman. Bugun qanday yordam bera olaman?\n\n• 📋 **Dars rejasi va konspekt** tuzish (45 yoki 80 daqiqalik)\n• 💡 **Amaliy mashq va uy vazifasi** tayyorlash\n• 💻 **Dasturlash (React, JavaScript, Python, SQL)** bo'yicha kod va tushuntirish\n• ❓ **Oraliq nazorat uchun test savollari** tuzish\n• 👥 **${groupName} guruhi faolligini oshirish**\n\nSavolingizni yoki mavzuni yozing, darhol javob beraman!`;
  }

  if (/(sen\s*kimsan|o'zing\s*haqingda|kim\s*bu|vazifang|botmisan|bot\s*haqida)/i.test(q)) {
    return `🤖 **Men — Topex Ustoz AI yordamchisiman!**\n\nMen TOPEX Texnikum o'qituvchilari uchun maxsus integratsiya qilingan sun'iy intellekt tizimiman.\n\n**Mening vazifalarim:**\n1. **Dars konspektlari:** Darsning har bir bosqichini daqiqama-daqiqa rejalashtirib berish.\n2. **Texnik kodlar:** Frontend, Backend, Ma'lumotlar bazasi bo'yicha toza kod namunalari va xatolarni tahlil qilish.\n3. **Baholash va testlar:** Murakkablik darajasi bo'yicha test savollari va to'g'ri javoblar kalitini tuzish.\n4. **Pedagogika:** Talabalar bilan ishlash, davomatni nazorat qilish va darsni interaktiv o'tish metodlari.`;
  }

  if (/(rahmat|katta\s*rahmat|tashakkur|zo'r|super|gap\s*yo'q|tushundim|barakalla|yaxshi)/i.test(q)) {
    return `Arzimaydi, **${teacherName}**! Sizga foydam tekkanidan juda xursandman. 🤝✨\n\nDarslaringiz sermahsul o'tsin! Yangi savollar yoki vazifalar bo'lsa, bemalol murojaat qiling.`;
  }

  if (/(dars\s*reja|konspekt|dars\s*ishlanma|darsni\s*reja|mavzu\s*reja)/i.test(q)) {
    return `📋 **80 daqiqalik namunaviy dars rejasi:**\n\n**Mavzu:** Interaktiv amaliy mashg'ulot\n**Guruh:** ${groupName}\n**O'qituvchi:** ${teacherName}\n\n---\n\n### ⏱️ Dars bosqichlari:\n\n1. **Tashkiliy qism va Davomat (5 daqiqa):**\n   - Davomatni Topex tizimida belgilash.\n   - O'tgan mavzu bo'yicha 3 ta tezkor savol (Warm-up).\n\n2. **Yangi mavzu bayoni (25 daqiqa):**\n   - Nazariy tushunchalar va amaliy ahamiyati.\n   - Doskada yoki ekranda jonli namoyish (Live coding / misollar).\n   - Talabalar bilan "savol-javob" dialogi.\n\n3. **Amaliy mustaqil mashg'ulot (35 daqiqa):**\n   - Talabalarga individual va juftlikda topshiriq berish.\n   - O'qituvchi tomonidan auditoriya bo'ylab yo'naltirish va xatolarni ko'rsatish.\n\n4. **Mustahkamlash va Baholash (10 daqiqa):**\n   - 2 nafar talabaning ishini umumiy ekranda ko'rib chiqish.\n   - Topex Jurnalida ballarni qo'yish (1-5 baho).\n\n5. **Xulosa va Uyga vazifa (5 daqiqa):**\n   - Asosiy xulosalar va keyingi dars mavzusi anonsi.\n\n💡 *Aniq mavzuni aytsangiz (masalan, "React State" yoki "Python Funksiyalar"), aynan shu mavzuga mos konspekt tayyorlayman!*`;
  }

  if (/(uyga\s*vazifa|vazifa\s*tuz|topshiriq|amaliy\s*ish|homework)/i.test(q)) {
    return `💡 **Guruh uchun 3 bosqichli amaliy uy vazifasi:**\n\n**Guruh:** ${groupName}\n\n---\n\n### 🟢 1-Bosqich (Boshlang'ich — 60-70 ball):\n- Darsda ko'rsatilgan kodni mustaqil qaytadan yozing va har bir qatorga izoh (komment) bering.\n- Natijani skrinshot qilib daftarga yoki platformaga yuklang.\n\n### 🟡 2-Bosqich (O'rta — 70-85 ball):\n- Loyihaga kamida 2 ta yangi funksiya (masalan: qidiruv, saralash yoki tozalash) qo'shing.\n- Foydalanuvchi noto'g'ri qiymat kiritganda xatolik xabarini ko'rsating.\n\n### 🔴 3-Bosqich (A'lochi / Murakkab — 85-100 ball):\n- Loyihani to'liq yakunlab, zamonaviy UI dizayn bering.\n- GitHub repositoriyasiga yuklab, havolasini taqdim eting.\n\n🎯 *Ushbu vazifani "Vazifalar" bo'limiga to'g'ridan-to'g'ri nusxalashingiz mumkin!*`;
  }

  if (/(test|nazorat\s*savol|savollar\s*tuz|quiz|imtihon)/i.test(q)) {
    return `📝 **Mavzuni tekshirish uchun 5 ta nazorat test savoli:**\n\n---\n\n**1-savol:** Dasturlashda o'zgarmas qiymatlarni saqlash uchun qaysi kalit so'z ishlatiladi?\n- A) \`var\`\n- B) \`let\`\n- C) \`const\` ✅\n- D) \`static\`\n\n**2-savol:** Funksiyaning asosiy afzalligi nimada?\n- A) Kod hajmini ko'paytirish\n- B) Kodni qayta ishlatish (reusability) va tartibga solish ✅\n- C) Faqat grafik chizish\n- D) Kompyuterni o'chirish\n\n**3-savol:** Xatoliklarni xavfsiz ushlash uchun qaysi blok qo'llaniladi?\n- A) \`for...while\`\n- B) \`try...catch\` ✅\n- C) \`if...else\`\n- D) \`break...continue\`\n\n**4-savol:** Asinxron kod bilan ishlashda qaysi konstruktsiya qo'llaniladi?\n- A) \`async / await\` ✅\n- B) \`input / output\`\n- C) \`push / pop\`\n- D) \`class / extends\`\n\n**5-savol:** Git tizimida o'zgarishlarni commit qilish buyrug'i qaysi?\n- A) \`git pull\`\n- B) \`git commit -m "xabar"\` ✅\n- C) \`git clone\`\n- D) \`git status\`\n\n---\n✅ **To'g'ri javoblar:** 1-C, 2-B, 3-B, 4-A, 5-B.`;
  }

  if (/(react|hooks|usestate|useeffect|component|jsx|props|frontend)/i.test(q)) {
    return `⚛️ **React bo'yicha namunaviy kod va tushuntirish:**\n\nKomponent holati (State) va nojo'ya ta'sirlarni (Side-effect) boshqarish:\n\n\`\`\`jsx\nimport React, { useState, useEffect } from 'react';\n\nfunction AttendanceCounter() {\n  const [studentsCount, setStudentsCount] = useState(0);\n  const [group, setGroup] = useState("${groupName}");\n\n  // Sarlavhani yangilab turish\n  useEffect(() => {\n    document.title = \`\${group}: \${studentsCount} ta talaba keldi\`;\n  }, [studentsCount, group]);\n\n  return (\n    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>\n      <h3>{group} — Dars Davomati</h3>\n      <p style={{ fontSize: '18px' }}>Kelganlar: <b>{studentsCount}</b> nafar</p>\n      \n      <div style={{ display: 'flex', gap: '8px' }}>\n        <button onClick={() => setStudentsCount(c => c + 1)}>+ Keldi</button>\n        <button onClick={() => setStudentsCount(c => Math.max(0, c - 1))}>- Kamaytirish</button>\n        <button onClick={() => setStudentsCount(0)}>Qayta o'rnatish</button>\n      </div>\n    </div>\n  );\n}\n\nexport default AttendanceCounter;\n\`\`\`\n\n💡 **Eslatma:** \`useState\` komponent qayta render bo'lganda ham o'zgaruvchi qiymatini saqlab qoladi.`;
  }

  if (/(python|django|fastapi|flask|backend|pip|list|dict)/i.test(q)) {
    return `🐍 **Python dasturlash tili bo'yicha misol:**\n\nTalabalar ballarini hisoblovchi toza va ixcham funksiya:\n\n\`\`\`python\n# O'quvchilar ro'yxati\nstudents_data = [\n    {"name": "Azizbek Karimov", "grades": [5, 4, 5, 5]},\n    {"name": "Dilnoza Aliyeva", "grades": [4, 5, 4, 4]},\n    {"name": "Bobur Saidov", "grades": [3, 4, 4, 3]}\n]\n\ndef analyze_students(students):\n    print("📊 Guruh o'quvchilari natijalari:")\n    for s in students:\n        avg = sum(s["grades"]) / len(s["grades"])\n        status = "A'lochi" if avg >= 4.5 else ("Yaxshi" if avg >= 3.5 else "Qoniqarli")\n        print(f"👤 {s['name']}: O'rtacha ball = {avg:.1f} ({status})")\n\nanalyze_students(students_data)\n\`\`\`\n\n💡 Talabalarga tushuntirish uchun: \`sum()\` va \`len()\` o'rnatilgan Python funksiyalari hisoblanadi.`;
  }

  if (/(javascript|js|async|await|promise|array|map|filter|reduce)/i.test(q)) {
    return `⚡ **JavaScript (ES6+) zamonaviy usullari:**\n\nMassivlar bilan ishlash va ma'lumotlarni saralash:\n\n\`\`\`javascript\n// O'quvchilar ro'yxati\nconst students = [\n  { id: 1, name: "Azizbek", score: 95 },\n  { id: 2, name: "Dilnoza", score: 88 },\n  { id: 3, name: "Bobur", score: 72 }\n];\n\n// 1. A'lochilarni filtrlash (score >= 85)\nconst topStudents = students.filter(s => s.score >= 85);\nconsole.log("A'lochilar:", topStudents);\n\n// 2. Ismlar ro'yxatini olish\nconst names = students.map(s => s.name);\nconsole.log("Ismlar:", names);\n\n// 3. O'rtacha ballni hisoblash (reduce)\nconst totalScore = students.reduce((sum, s) => sum + s.score, 0);\nconst avgScore = (totalScore / students.length).toFixed(1);\nconsole.log("O'rtacha ball:", avgScore);\n\`\`\``;
  }

  if (/(davomat|kelmadi|kelmayapti|qiziqish|sust|faol\s*emas|motivatsiya)/i.test(q)) {
    return `👥 **Talabalar davomati va faolligini oshirish bo'yicha tavsiyalar:**\n\n1. **Dars boshida tezkor viktorina:** Darsning dastlabki 5 daqiqasida o'tgan mavzudan qiziqarli savol bering va faol javob berganlarga Topex Jurnalida +1 ball qo'shing.\n2. **Juftlikda ishlash (Pair work):** Dars qoldiruvchi yoki sust o'quvchini kuchliroq talaba bilan juft qiling.\n3. **Amaliy loyihalar:** Quruq nazariya o'rniga "Bu bilim bilan qanday real sayt/dastur quramiz" degan maqsad qo'ying.\n4. **Shaxsiy suhbat:** Darsdan so'ng 2 daqiqa xoli suhbatlashib, qiyinlik tug'dirayotgan joyini so'rang.`;
  }

  return `💡 **Topex AI Yordamchisi javobi:**\n\nHurmatli **${teacherName}**, savolingiz:\n*"${message}"*\n\nUshbu masala bo'yicha asosiy tavsiyalar:\n\n1. **Bosqichma-bosqichlik:** Mavzuni oddiy tushunchalardan murakkablariga qarab tushuntiring.\n2. **Jonli amaliyot:** Har bir qoidani kod yoki real hayotiy misol bilan mustahkamlang.\n3. **Qayta aloqa:** Mavzu so'ngida talabalardan 1-2 ta misol yechishni so'rang.\n\nAniqroq mavzu yoki kod namunasi kerak bo'lsa, mavzuni yozing — darhol tayyorlab beraman! ✨`;
}

// Server yoki mijoz orqali AI javobini olish
async function requestAIResponse(userText, chatId) {
  const g = groupById(chatId);
  const groupName = g ? g.name : "Topex guruhi";
  const teacherName = (S.teacher && S.teacher.name) || "Ustoz";

  try {
    const res = await API.chatWithAI(userText, groupName, chatId);
    if (res && res.reply) return res.reply;
  } catch (e) {
    console.warn("AI server javobi olinmadi, mijoz dvigateli ishlatilmoqda:", e.message);
  }

  return generateClientAIResponse(userText, { teacherName, groupName, groupId: chatId });
}

function scrollChatToBottom() {
  setTimeout(() => {
    const el = document.getElementById("msgs");
    if (el) el.scrollTop = el.scrollHeight;
  }, 40);
}

/* 7. Chat */
function pageChat() {
  S.chats = S.chats || {};
  if (!ui.chat) ui.chat = "ai";

  // Agar guruh tanlangan bo'lsa, mavjudligini tekshirish
  if (ui.chat !== "ai" && !groupById(ui.chat) && S.groups && S.groups[0]) {
    ui.chat = S.groups[0].id;
  }

  const isAi = ui.chat === "ai";
  const g = isAi ? null : groupById(ui.chat);
  const msgs = S.chats[ui.chat] || [];
  const groupsList = S.groups || [];

  scrollChatToBottom();

  return `
    <div class="chat">
      <!-- Chap tomon: Chatlar ro'yxati -->
      <div class="card chat-list">
        <!-- 1. AI Yordamchi (Doimo yuqorida qadalgan) -->
        <div class="chat-item ${isAi ? 'on' : ''}" data-act="open-chat" data-id="ai">
          <div class="avatar ai-avatar" style="width:34px;height:34px;font-size:14px">🤖</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <b>Topex AI Assistent</b>
              <span class="ai-badge-pill">✨ AI</span>
            </div>
            <div style="font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              Ta'lim va dars yordamchisi
            </div>
          </div>
        </div>

        ${groupsList.length ? `
          <div class="chat-section-label">O'quv guruhlari (${groupsList.length})</div>
          ${groupsList.map(x => {
            const isCur = String(x.id) === String(ui.chat);
            const stuCount = studentsOf(x.id).length;
            return `
              <div class="chat-item ${isCur ? 'on' : ''}" data-act="open-chat" data-id="${x.id}">
                <div class="avatar" style="width:32px;height:32px;font-size:12px;background:${esc(x.color || '#6366f1')}">${initials(x.name)}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.name)}</div>
                  <div style="font-size:11.5px;color:var(--muted)">${stuCount} ta o'quvchi</div>
                </div>
              </div>
            `;
          }).join("")}
        ` : ""}
      </div>

      <!-- O'ng tomon: Chat oynasi -->
      <div class="card chat-box">
        <div class="chat-head">
          ${isAi ? `
            <div class="chat-head-main">
              <div class="chat-head-info">
                <div class="avatar ai-avatar" style="width:36px;height:36px;font-size:16px">🤖</div>
                <div>
                  <div class="chat-head-title">Topex AI Ta'lim Yordamchisi <span class="badge primary-sm">✨ GPT / Gemini</span></div>
                  <div class="chat-head-sub">🟢 Doimo onlayn · Dars rejalari, kodlar, testlar va metodika</div>
                </div>
              </div>
              <div class="chat-head-actions">
                <button class="btn ghost sm" data-act="clear-chat" data-id="ai" title="Suhbat tarixini tozalash">${icon("trash", 13)} Tozalash</button>
              </div>
            </div>
          ` : `
            <div class="chat-head-main">
              <div class="chat-head-info">
                <div class="avatar" style="width:36px;height:36px;font-size:13px;background:${esc(g ? g.color : '#6366f1')}">${initials(g ? g.name : "Guruh")}</div>
                <div>
                  <div class="chat-head-title">${g ? esc(g.name) : "Guruh chati"}</div>
                  <div class="chat-head-sub">${g ? esc(g.course || "") : ""} · ${studentsOf(ui.chat).length} ta o'quvchi</div>
                </div>
              </div>
              <div class="chat-head-actions">
                <label class="ai-toggle-label" title="AI avto-javobi yoqilganda savollaringizga sun'iy intellekt javob beradi">
                  <input type="checkbox" id="ai-auto-toggle" ${ui.aiAutoReply !== false ? "checked" : ""}>
                  <span>✨ AI Avto-javob</span>
                </label>
              </div>
            </div>
          `}
        </div>

        <div class="msgs" id="msgs">
          ${msgs.length ? msgs.map(m => {
            const isMe = m.from === "me";
            const isAiMsg = m.from === "ai" || m.sender === "Topex AI";
            const timeStr = m.t ? new Date(m.t).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : "";
            
            if (isAiMsg) {
              return `
                <div class="msg ai">
                  <div class="msg-sender">
                    <span class="avatar sm ai-avatar" style="width:18px;height:18px;font-size:10px">🤖</span>
                    <span>Topex AI</span>
                    <span class="ai-badge-pill">Javob</span>
                  </div>
                  <div>${renderChatMarkdown(m.text)}</div>
                  <small>${timeStr}</small>
                </div>
              `;
            }
            
            return `
              <div class="msg ${isMe ? "me" : ""}">
                ${!isMe && m.sender ? `<div class="msg-sender">${esc(m.sender)}</div>` : ""}
                <div>${esc(m.text)}</div>
                <small>${timeStr}</small>
              </div>
            `;
          }).join("") : `
            <div style="text-align:center;padding:40px 20px;color:var(--muted)">
              <div style="font-size:42px;margin-bottom:10px">${isAi ? "🤖" : "💬"}</div>
              <h3 style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">
                ${isAi ? "Topex AI Yordamchisiga xush kelibsiz!" : "Guruh suhbati bo'sh"}
              </h3>
              <p style="font-size:13px;max-width:440px;margin:0 auto">
                ${isAi ? "Dars rejalari, konspektlar, dasturlash kodlari, test savollari yoki metodik yordam bo'yicha istalgan savolingizni yozing." : "Xabar yozing yoki quyidagi tayyor tugmalardan foydalaning."}
              </p>
            </div>
          `}

          ${ui.isTyping ? `
            <div class="typing-box" style="animation:fadeIn 0.2s">
              <span class="avatar sm ai-avatar" style="width:18px;height:18px;font-size:10px">🤖</span>
              <span>Topex AI javob tayyorlamoqda...</span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          ` : ""}
        </div>

        <!-- Tezkor AI takliflari (Quick Chips) -->
        <div class="chat-chips">
          <button type="button" class="chat-chip" data-act="quick-prompt" data-p="80 daqiqalik dars konspekti tuzib ber">📋 Dars rejasi (80 daqiqa)</button>
          <button type="button" class="chat-chip" data-act="quick-prompt" data-p="Mavzu bo'yicha 3 bosqichli uy vazifasi tuzib ber">💡 Yangi uy vazifasi</button>
          <button type="button" class="chat-chip" data-act="quick-prompt" data-p="Mavzu bo'yicha 5 ta test savoli tuzib ber">❓ 5 ta test savoli</button>
          <button type="button" class="chat-chip" data-act="quick-prompt" data-p="React Hooks useState va useEffect bo'yicha misol kod yozib ber">⚛️ React Hooks kodi</button>
          <button type="button" class="chat-chip" data-act="quick-prompt" data-p="Darsda talabalar davomatini va faolligini qanday oshirish mumkin?">👥 Faollikni oshirish</button>
        </div>

        <form class="chat-form" id="chat-form">
          <input name="text" id="chat-input" placeholder="${isAi ? "AI ga savol yoki mavzu yozing (masalan: 'Python funksiyalar dars rejasi')..." : "Xabar yozing (AI avtomatik javob beradi)..."}" autocomplete="off" required>
          <button class="btn sm" type="submit" id="chat-send-btn" title="Yuborish">${icon("send", 14)}</button>
        </form>
      </div>
    </div>
  `;
}

/* 8. Profil */
function pageProfile(tab = "personal") {
  const t = S.teacher || {};
  const teacherName = t.name || t.fullname || "Azamat Qodirov";
  const teacherInitials = initials(teacherName);
  const teacherPhone = t.phone || "+998 90 765 43 21";
  const teacherRole = t.title || "Katta o'qituvchi / Dasturlash kafedrasi";
  const teacherRoom = t.room || "3-bino, 302-auditoriya";

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
        <div style="font-weight:700;font-size:15px;margin-bottom:14px;color:var(--text)">Shaxsiy ma'lumotlar</div>
        <div class="form-grid">
          <div class="field"><label>Ism</label><input name="name" value="${esc(teacherName)}" required></div>
          <div class="field"><label>Lavozim</label><input name="title" value="${esc(teacherRole)}" required></div>
          <div class="field"><label>Telefon</label><input name="phone" value="${esc(teacherPhone)}"></div>
          <div class="field"><label>Xona</label><input name="room" value="${esc(teacherRoom)}"></div>
        </div>
        <button class="btn sm" type="submit" style="margin-top:14px">Saqlash</button>
      </form>
    `;
  }

  if (tab === "salary") {
    body = `
      <div class="card" style="max-width:480px">
        <div style="font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px">Joriy oylik maosh</div>
        <div style="font-size:26px;font-weight:900;color:var(--ok);margin-bottom:8px">${money(t.salary || 6500000)}</div>
        <div style="font-size:13px;color:var(--muted)">Oylik maosh to'liq hisoblangan va tasdiqlangan</div>
      </div>
    `;
  }

  if (tab === "security") {
    body = `
      <form id="pass-form" class="card" style="max-width:480px">
        <div style="font-weight:700;font-size:15px;margin-bottom:14px;color:var(--text)">Parolni yangilash</div>
        <div class="field"><label>Login</label><input name="login" value="${esc(t.login || "ustoz")}" required></div>
        <div class="field"><label>Joriy parol</label><input type="password" name="old" required></div>
        <div class="field"><label>Yangi parol</label><input type="password" name="pw" minlength="4" required></div>
        <button class="btn sm" type="submit" style="margin-top:14px">Yangilash</button>
      </form>
    `;
  }

  if (tab === "settings") {
    body = `
      <div class="card" style="max-width:480px">
        <div style="font-weight:700;font-size:15px;margin-bottom:14px;color:var(--text)">Ilova sozlamalari</div>
        <div class="switch">
          <span>Ovoz effektlari</span>
          <input type="checkbox" id="sound-toggle" ${S.settings && S.settings.soundEnabled ? 'checked' : ''}>
        </div>
      </div>
    `;
  }

  return `
    <!-- Stitch Teacher Profile Overview Card -->
    <div class="profile-overview-card">
      <div style="display:flex;align-items:center;gap:16px;min-width:0">
        <div class="profile-avatar-large">
          <span>${teacherInitials}</span>
          <span class="profile-verified-badge" title="Tasdiqlangan">✓</span>
        </div>
        <div style="min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <h2 style="font-size:18px;font-weight:800;color:var(--text);letter-spacing:-0.01em" class="truncate">${esc(teacherName)}</h2>
          </div>
          <p style="font-size:12.5px;color:var(--muted);margin-top:2px">ID: #EDU-84291</p>
          <div style="display:inline-flex;align-items:center;gap:6px;margin-top:4px">
            <span class="status-pulse-dot"></span>
            <span style="font-size:11.5px;font-weight:700;color:var(--ok)">Ustoz • Faol</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs">
      ${tabs.map(([k, n]) => `<a class="${tab === k ? 'on' : ''}" data-act="go" data-to="#/profile/${k}">${n}</a>`).join("")}
    </div>
    ${body}
  `;
}

/* Shell va Router */
const NAV = [
  ["dashboard", "dashboard", "Asosiy"],
  ["groups", "groups", "Guruhlar"],
  ["schedule", "schedule", "Jadval"],
  ["students", "students", "O'quvchilar"],
  ["homework", "homework", "Vazifalar"],
  ["stats", "stats", "Statistika"],
  ["chat", "chat", "Chat"],
  ["profile", "profile", "Profil"]
];

function loginPage() {
  setTimeout(() => {
    const phoneInput = document.getElementById("login-phone-input");
    if (phoneInput && typeof TopexDB !== "undefined") {
      TopexDB.bindPhoneInput(phoneInput);
    }
  }, 10);

  return `
    <div class="login-wrap">
      <form class="login-card" id="login-form">
        <div class="login-brand">
          <div class="logo-box">T</div>
          <div>
            <div style="font-weight:800;font-size:17px;line-height:1.2">Topex Ustoz</div>
            <div style="font-size:11.5px;color:var(--muted);font-weight:500">O'qituvchi Boshqaruv Tizimi</div>
          </div>
        </div>

        <h2 style="font-size:20px;font-weight:800;margin-bottom:6px">Tizimga kirish</h2>
        <p style="font-size:13px;color:var(--muted);margin-bottom:18px">O'qituvchi hisobingizga kiring</p>

        <div id="login-error" class="login-error hidden"></div>

        <div class="field">
          <label>Telefon raqam</label>
          <input type="tel" name="phone" id="login-phone-input" placeholder="+998 90 123 45 67" maxlength="17" required autofocus autocomplete="tel" inputmode="numeric">
        </div>
        <div class="field">
          <label>Parol</label>
          <div class="pw-toggle-wrap">
            <input type="password" name="pw" id="login-pw-input" placeholder="Parolingizni kiriting" required autocomplete="current-password">
            <button type="button" class="pw-toggle-btn" id="pw-toggle-btn" title="Parolni ko'rsatish/yashirish">
              ${icon("eye", 18)}
            </button>
          </div>
        </div>

        <button class="btn" id="login-submit-btn" style="width:100%;margin-top:12px;height:42px" type="submit">Kirish</button>
        
        <!-- Test uchun tezkor kirish tugmasi -->
        <div class="quick-demo-box">
          <button type="button" class="btn ghost sm quick-login-btn" data-phone="+998 90 765 43 21" data-pw="1234" style="width:100%;justify-content:center;gap:6px">
            ⚡ Ustoz hisobini to'ldirish (+998 90 765 43 21)
          </button>
        </div>
      </form>
    </div>
  `;
}

function closeMobileSidebar() {
  ui.menu = false;
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar) sidebar.classList.remove("open");
  if (backdrop) backdrop.classList.remove("open");
  document.body.classList.remove("sidebar-open-locked");
}

function openMobileSidebar() {
  ui.menu = true;
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar) sidebar.classList.add("open");
  if (backdrop) backdrop.classList.add("open");
  document.body.classList.add("sidebar-open-locked");
}

let currentViewKey = null;

function render() {
  document.documentElement.setAttribute("data-theme", S.session.theme || "light");

  if (!S.session.in) {
    currentViewKey = null;
    $app.innerHTML = loginPage();
    if (typeof TopexDB !== "undefined" && !TopexDB.isLocalDevelopment()) {
      const demoBox = $app.querySelector(".quick-demo-box");
      if (demoBox) demoBox.remove();
    }
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

  $app.innerHTML = UILayout.DashboardLayout({
    role: "teacher",
    activeNav,
    title: TITLES[route] || "Asosiy",
    navItems: NAV.map(([id, iconName, label]) => {
      let count = null;
      if (id === "students") count = S.students ? S.students.length : 0;
      if (id === "groups") count = S.groups ? S.groups.length : 0;
      if (id === "homework") count = S.homework ? S.homework.length : 0;
      return {
        id,
        icon: iconName,
        label,
        count,
        href: `#/${id}`,
        attr: `data-act="go" data-to="#/${id}"`
      };
    }),
    user: {
      ...(S.teacher || {}),
      name: (S.teacher && S.teacher.name) || "Azamat Qodirov",
      soundEnabled: Boolean(S.settings && S.settings.soundEnabled)
    },
    bodyHtml: content,
    onLogout: "logout()",
    sidebarCollapsed: ui.sidebarCollapsed,
    sidebarMenuOpen: ui.menu,
    pageClass: `${isPageSwitch ? "page-enter " : ""}page-body`
  });

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

function startAutoCloseTimer(duration = 5000) {
  if (window.innerWidth <= 900) return;
  if (ui.sidebarPinned) return;
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  if (!ui.sidebarCollapsed || !sidebar.classList.contains("hover-expanded")) return;

  const timerBar = document.getElementById("sidebar-timer-bar");
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
  }, duration);
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
  ui.sidebarPinned = false;
  localStorage.removeItem("topex_sidebar_pinned");
  window._sidebarJustClosed = false;

  const layout = document.querySelector(".layout");
  const sidebar = document.getElementById("sidebar");
  if (layout) layout.classList.remove("sidebar-collapsed");
  if (sidebar) {
    sidebar.classList.remove("collapsed", "hover-expanded");
    const pinBtn = sidebar.querySelector(".sidebar-pin-btn");
    if (pinBtn) pinBtn.classList.remove("active");
  }
  startAutoCloseTimer(5000);
  if (showToast) toast("Sidebar ochildi (5s) ⏱️");
}

function setupSidebarEvents() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  // Agar foydalanuvchi tugma orqali hozirgina yopgan bo'lsa, hover bilan qayta ochilmasin
  if (window._sidebarJustClosed) {
    sidebar.classList.remove("hover-expanded");
  } else if (window._sidebarIsHovered && ui.sidebarCollapsed) {
    sidebar.classList.add("hover-expanded");
  }

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

    startAutoCloseTimer(5000);
  };

}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  document.querySelectorAll("#digital-clock, .clock-text, .live-clock-text").forEach(el => {
    el.textContent = timeStr;
  });
}
setInterval(updateClock, 1000);

window.addEventListener("hashchange", () => {
  ui.menu = false;
  render();
});

/* Hodisalar */
document.addEventListener("click", async e => {
  // Tezkor test login tugmasi
  const quickBtn = e.target.closest(".quick-login-btn");
  if (quickBtn) {
    const phone = quickBtn.dataset.phone;
    const pw = quickBtn.dataset.pw;
    const phoneInp = document.getElementById("login-phone-input");
    const pwInp = document.getElementById("login-pw-input");
    if (phoneInp) phoneInp.value = phone;
    if (pwInp) pwInp.value = pw;
    toast("Test ma'lumotlari kiritildi!", "ok");
    return;
  }

  const toggleBtn = e.target.closest("#pw-toggle-btn");
  if (toggleBtn) {
    const pwInput = document.getElementById("login-pw-input");
    if (pwInput) {
      const isPw = pwInput.type === "password";
      pwInput.type = isPw ? "text" : "password";
      toggleBtn.innerHTML = icon(isPw ? "eyeOff" : "eye", 18);
    }
    return;
  }

  // Boshqa joy bosilganda sidebarni yopish (Click outside)
  const sidebar = document.getElementById("sidebar");
  const isInsideSidebar = sidebar && sidebar.contains(e.target);
  const isSidebarTrigger = e.target.closest("[data-act='open-sidebar']") ||
                           e.target.closest("[data-act='menu']") ||
                           e.target.closest("[data-act='toggle-sidebar']") ||
                           e.target.closest(".sidebar-top-btn") ||
                           e.target.closest(".topbar-brand");

  if (!isInsideSidebar && !isSidebarTrigger) {
    if (ui.menu) {
      closeMobileSidebar();
    }
    if (!ui.sidebarCollapsed && !ui.sidebarPinned) {
      collapseSidebar(false);
    } else if (sidebar && sidebar.classList.contains("hover-expanded")) {
      sidebar.classList.remove("hover-expanded");
      cancelSidebarTimer();
    }
  }

  const el = e.target.closest("[data-act]");
  if (!el) return;
  Sound.click();

  const act = el.dataset.act;
  const id = el.dataset.id;

  switch (act) {
    case "go":
      if (window.innerWidth <= 900) closeMobileSidebar();
      location.hash = el.dataset.to;
      break;
    case "brand-click": {
      if (window.innerWidth <= 900) {
        closeMobileSidebar();
        location.hash = "#/dashboard";
      } else {
        if (ui.sidebarCollapsed) {
          expandSidebar();
        } else {
          location.hash = "#/dashboard";
        }
      }
      break;
    }
    case "close-sidebar-mobile": {
      closeMobileSidebar();
      break;
    }
    case "close-sidebar-now": {
      if (window.innerWidth <= 900) {
        closeMobileSidebar();
      } else {
        collapseSidebar();
      }
      break;
    }
    case "open-sidebar":
    case "menu": {
      if (window.innerWidth <= 900) {
        if (ui.menu) closeMobileSidebar();
        else openMobileSidebar();
      } else {
        expandSidebar();
      }
      break;
    }
    case "toggle-sidebar": {
      if (window.innerWidth <= 900) {
        if (ui.menu) closeMobileSidebar();
        else openMobileSidebar();
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
        ui.sidebarCollapsed = false;
        localStorage.setItem("topex_sidebar_pinned", "true");
        if (pinBtn) pinBtn.classList.add("active");
        const layout = document.querySelector(".layout");
        if (layout) layout.classList.remove("sidebar-collapsed");
        if (sidebar) sidebar.classList.remove("collapsed", "hover-expanded");
        toast("Sidebar qadandi — o'zi yopilmaydi 📌");
      } else {
        localStorage.removeItem("topex_sidebar_pinned");
        if (pinBtn) pinBtn.classList.remove("active");
        startAutoCloseTimer(5000);
        toast("Avto-yopilish yoqildi (5s) ⏱️");
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
      await Store.logout();
      S = Store.state;
      render();
      toast("Tizimdan chiqildi");
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
    case "filter-hw":
      ui.hwFilter = el.dataset.filter || "all";
      render();
      break;
    case "open-group":
      if (window.innerWidth <= 900) closeMobileSidebar();
      ui.attDate = null;
      ui.groupTab = "att";
      location.hash = "#/group/" + id;
      break;
    case "set-group-tab":
      ui.groupTab = el.dataset.tab;
      render();
      break;
    case "open-chat":
      if (window.innerWidth <= 900) closeMobileSidebar();
      ui.chat = id;
      location.hash = "#/chat";
      render();
      scrollChatToBottom();
      break;
    case "quick-prompt": {
      const promptText = el.dataset.p;
      const chatInput = document.getElementById("chat-input");
      const chatForm = document.getElementById("chat-form");
      if (chatInput && chatForm) {
        chatInput.value = promptText;
        chatForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }
      break;
    }
    case "clear-chat": {
      const cid = el.dataset.id || ui.chat;
      if (confirm("Ushbu suhbat tarixini tozalashni xohlaysizmi?")) {
        if (!S.chats) S.chats = {};
        S.chats[cid] = [];
        save();
        render();
        toast("Suhbat tozalandi");
      }
      break;
    }
    case "copy-code": {
      const code = el.dataset.code || (el.closest(".chat-code-block") ? el.closest(".chat-code-block").querySelector("pre code").innerText : "");
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code);
        const orig = el.textContent;
        el.textContent = "Nusxalandi! ✓";
        setTimeout(() => { el.textContent = orig; }, 2000);
      }
      break;
    }
    case "mark": {
      const gid = el.dataset.gid;
      const sid = el.dataset.sid;
      const v = el.dataset.v;
      const date = ui.attDate || todayISO();
      try {
        await Store.recordAttendance(gid, date, { [sid]: v });
      } catch (err) {
        console.error("Davomat xatosi:", err);
      }
      render();
      break;
    }
    case "set-att-grade": {
      const gid = el.dataset.gid;
      const sid = el.dataset.sid;
      const date = el.dataset.date || (ui.attDate || todayISO());
      const score = parseInt(el.dataset.score, 10);
      const gradeKey = `${gid}|${sid}|${date}`;
      const student = S.students.find(s => String(s.id) === String(sid));

      if (S.grades && S.grades[gradeKey] && S.grades[gradeKey].score === score) {
        await Store.recordGrade(gid, sid, date, 0, gradeKey, "");
        toast(`${student ? student.name : "O'quvchi"}: baho olib tashlandi`);
      } else {
        await Store.recordGrade(gid, sid, date, score, gradeKey, "");
        await Store.recordAttendance(gid, date, { [sid]: "keldi" });
        toast(`${student ? student.name : "O'quvchi"}: ${score} baho qo'yildi`, "ok");
      }
      render();
      break;
    }
    case "edit-grade": {
      const gid = el.dataset.gid;
      const sid = el.dataset.sid;
      const t = el.dataset.t;
      const tname = el.dataset.tname || `${t}-dars`;
      const s = S.students.find(x => String(x.id) === String(sid));
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
      const key = el.dataset.key;
      const val = parseInt(el.dataset.val, 10);
      const parts = key.split("|");
      const gid = parts[0];
      const sid = parts[1];
      await Store.recordGrade(gid, sid, todayISO(), val, key, "");
      closeModal();
      render();
      if (val > 0) toast(`Baho saqlandi: ${val}`, "ok");
      else toast("Baho o'chirildi");
      break;
    }
    case "mark-all": {
      const gid = el.dataset.gid;
      const date = ui.attDate || todayISO();
      const records = {};
      studentsOf(gid).forEach(s => (records[s.id] = "keldi"));
      await Store.recordAttendance(gid, date, records);
      fireConfetti();
      render();
      toast("Barchasi keldi deb belgilandi", "ok");
      break;
    }
    case "clear-search": {
      ui.search = "";
      const inp = document.getElementById("search");
      if (inp) {
        inp.value = "";
        inp.focus();
      }
      updateStudentsView();
      break;
    }
    case "add-student":
      studentForm(null, el.dataset.gid || ui.groupFilter);
      break;
    case "open-student":
    case "edit-student":
      studentForm(S.students.find(s => String(s.id) === String(id)));
      break;
    case "del-student":
      if (confirm("O'quvchini o'chirishni xohlaysizmi?")) {
        S.students = S.students.filter(s => String(s.id) !== String(id));
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
    updateStudentsView();
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
    updateStudentsView();
  }
  if (e.target.id === "group-filter") {
    ui.groupFilter = e.target.value;
    updateStudentsView();
  }
});

document.addEventListener("submit", async e => {
  const f = e.target;
  if (f.id === "login-form") {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const btn = f.querySelector("button[type=submit]");
    const errBox = document.getElementById("login-error");
    if (errBox) errBox.classList.add("hidden");

    const phoneVal = (d.phone || d.login || "").trim();
    const digits = phoneVal.replace(/\D/g, "");

    // Telefon raqami tekshiruvi (faqat raqamlar bo'lishi kerak, string+number emas)
    if (digits.length < 9) {
      if (errBox) {
        errBox.textContent = "Iltimos, to'liq telefon raqam kiriting (masalan: +998 90 123 45 67)";
        errBox.classList.remove("hidden");
      }
      toast("Telefon raqam to'liq kiritilishi shart", "bad");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Kirilmoqda...";
    }
    try {
      const res = await API.login(phoneVal, d.pw);
      if (!S.session) S.session = {};
      S.session.in = true;
      S.session.user = res.user;
      await Store.syncFromServer();
      S = Store.state;
      if (!S.session) S.session = {};
      S.session.in = true;
      if (!S.teacher) {
        S.teacher = res.user || {
          name: "Azamat Qodirov",
          phone: phoneVal,
          salary: 6500000
        };
      }
      if (!S.teacher.salary) S.teacher.salary = 6500000;
      currentViewKey = null;
      location.hash = "#/dashboard";
      render();
      fireConfetti();
      toast("Xush kelibsiz, " + (res.user && (res.user.fullname || res.user.name) ? (res.user.fullname || res.user.name) : "Ustoz") + "!", "ok");
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || "Telefon raqam yoki parol noto'g'ri";
        errBox.classList.remove("hidden");
      }
      toast(err.message || "Telefon raqam yoki parol noto'g'ri", "bad");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Kirish";
      }
    }
  }

  if (f.id === "profile-form") {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    try {
      await Store.saveProfile(d);
      S = Store.state;
      render();
      toast("Profil saqlandi", "ok");
    } catch (err) {
      toast(err.message || "Profilni saqlashda xatolik", "bad");
    }
  }

  if (f.id === "pass-form") {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (!d.pw || d.pw.length < 6) {
      toast("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak", "bad");
      return;
    }
    try {
      await API.updatePassword(d.old, d.pw);
      f.reset();
      toast("Parol muvaffaqiyatli yangilandi", "ok");
    } catch (err) {
      toast(err.message || "Parolni yangilashda xatolik", "bad");
    }
  }

  if (f.id === "chat-form") {
    e.preventDefault();
    const input = f.querySelector("input[name='text']");
    const text = input ? input.value.trim() : "";
    if (!text) return;
    input.value = "";

    S.chats = S.chats || {};
    const chatId = ui.chat || "ai";
    S.chats[chatId] = S.chats[chatId] || [];

    const myMsg = {
      from: "me",
      sender: (S.teacher && S.teacher.name) || "Ustoz",
      text,
      t: Date.now()
    };
    S.chats[chatId].push(myMsg);
    save();
    render();
    scrollChatToBottom();

    try { API.sendChatMessage(chatId, myMsg); } catch(e) {}

    const isAiChat = chatId === "ai";
    const autoReplyOn = ui.aiAutoReply !== false;

    if (isAiChat || autoReplyOn) {
      ui.isTyping = true;
      render();
      scrollChatToBottom();

      try {
        const reply = await requestAIResponse(text, chatId);
        ui.isTyping = false;
        const aiMsg = {
          from: "ai",
          sender: "Topex AI",
          text: reply,
          t: Date.now()
        };
        S.chats[chatId].push(aiMsg);
        save();
        try { API.sendChatMessage(chatId, aiMsg); } catch(e) {}
        if (Sound && Sound.success) Sound.success();
        render();
        scrollChatToBottom();
      } catch (err) {
        ui.isTyping = false;
        render();
        toast("AI javobida xatolik: " + err.message, "bad");
      }
    }
  }
});

document.addEventListener("change", e => {
  if (e.target && e.target.id === "ai-auto-toggle") {
    ui.aiAutoReply = e.target.checked;
    toast(ui.aiAutoReply ? "AI avto-javob yoqildi ✨" : "AI avto-javob o'chirildi");
  }
});

/* Formalar */
function groupForm() {
  modal("Yangi guruh", `
    <div class="field"><label>Guruh nomi</label><input name="name" required placeholder="FN-25"></div>
    <div class="field"><label>Kurs</label><input name="course" required placeholder="Frontend"></div>
    <div class="form-grid">
      <div class="field"><label>Xona</label><input name="room" value="304-laboratoriya" required></div>
      <div class="field"><label>Vaqt</label><input name="time" value="09:00 - 10:30" required></div>
    </div>
    <div class="field"><label>Kunlar (1=Du, 3=Chor, 5=Ju)</label><input name="days" value="1,3,5" required></div>
  `, async d => {
    const days = d.days.split(",").map(x => parseInt(x.trim(), 10)).filter(x => x >= 1 && x <= 7);
    await Store.createGroup({
      name: d.name,
      course: d.course,
      room: d.room,
      time: d.time,
      days: days.length ? days : [1, 3, 5]
    });
    closeModal();
    fireConfetti();
    render();
    toast("Guruh qo'shildi", "ok");
  });
}

function studentForm(s, gid) {
  const v = s || { name: "", phone: "+998 90 ", parentPhone: "+998 93 ", balance: 0, groupId: gid || (S.groups[0] || {}).id };
  modal(s ? "Tahrirlash" : "Yangi o'quvchi", `
    <div class="field"><label>F.I.Sh.</label><input name="name" required value="${esc(v.name || v.fullname || '')}"></div>
    <div class="form-grid">
      <div class="field">
        <label>Guruh</label>
        <select name="groupId">
          ${S.groups.map(g => `<option value="${g.id}" ${String(g.id) === String(v.groupId) ? "selected" : ""}>${esc(g.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Telefon</label><input name="phone" value="${esc(v.phone || '')}"></div>
      <div class="field"><label>Ota-onasi</label><input name="parentPhone" value="${esc(v.parentPhone || v.father || '')}"></div>
      <div class="field"><label>Balans</label><input type="number" name="balance" value="${esc(v.balance || 0)}"></div>
    </div>
  `, async d => {
    d.balance = Number(d.balance) || 0;
    if (s) {
      await Store.updateStudent(s.id, d);
    } else {
      await Store.createStudent(d);
    }
    closeModal();
    render();
    toast("O'quvchi saqlandi", "ok");
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
  `, async d => {
    await Store.createHomework({ groupId: d.groupId, title: d.title, desc: d.desc, due: d.due, done: {} });
    closeModal();
    render();
    toast("Vazifa berildi", "ok");
  });
}

function checkHw(id) {
  const h = S.homework.find(x => String(x.id) === String(id));
  if (!h) return;
  const list = studentsOf(h.groupId);

  modal(h.title, `
    <div style="max-height:50vh;overflow-y:auto">
      ${list.map(s => `
        <label class="switch">
          <span>${esc(s.name || s.fullname)}</span>
          <input type="checkbox" name="${s.id}" ${h.done && h.done[s.id] ? "checked" : ""}>
        </label>
      `).join("")}
    </div>
  `, async d => {
    for (const s of list) {
      const isDone = !!d[s.id];
      await Store.setHomeworkDone(h.id, s.id, isDone);
    }
    closeModal();
    render();
    toast("Vazifalar saqlandi", "ok");
  });
}

function exportCSV() {
  const list = typeof getFilteredStudents === "function" ? getFilteredStudents() : S.students;
  const head = ["F.I.Sh.", "Guruh", "Telefon", "Ota-onasi", "Balans"];
  const rows = (list || []).map(s => [
    s.name || s.fullname || "",
    (groupById(s.groupId) || {}).name || "",
    s.phone || "",
    s.parentPhone || s.parentName || s.father || "",
    s.balance || 0
  ]);
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

window.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (document.activeElement && document.activeElement.id === "search" && ui.search) {
      ui.search = "";
      document.activeElement.value = "";
      updateStudentsView();
      return;
    }
    if (ui.menu) closeMobileSidebar();
    closeModal();
  }
});

async function initApp() {
  if (API.isLoggedIn()) {
    try {
      await Store.syncFromServer();
      S = Store.state;
    } catch (e) {
      console.warn("Init sync failed:", e);
    }
  }
  render();
  hidePreloader();
}

initApp();
