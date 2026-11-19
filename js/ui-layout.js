/**
 * ==========================================================================
 * TOPEX Tizimi — Yagona DashboardLayout va Dizayn Komponentlari
 * USTOZ, DIREKTOR va DEVELOPER panellari uchun yagona dizayn tizimi
 * ==========================================================================
 */

const UILayout = {
  // Lucide uslubidagi SVG ikonkalar (stroke-width: 1.75)
  icon(name, size = 20, cls = "") {
    const icons = {
      dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
      groups: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      teachers: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      students: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      schedule: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
      journal: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><polyline points="10 2 10 10 13 7 16 10 16 2"/>',
      homework: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/>',
      stats: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
      chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      profile: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
      finance: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
      announcements: '<path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      roles: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      logs: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
      pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
      chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
      chevronRight: '<polyline points="9 18 15 12 9 6"/>',
      menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
      volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
      volumeX: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
      eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/>',
      moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
      check: '<polyline points="20 6 9 17 4 12"/>',
      search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
      plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
      trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
      edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
      x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      arrowRight: '<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>'
    };
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.dashboard}</svg>`;
  },

  IconButton({ iconName, size = 18, className = "header-circle-btn", actionAttr = "", title = "", active = false }) {
    return `<button type="button" class="${className}${active ? " active" : ""}" ${actionAttr} title="${title}" aria-label="${title}">${this.icon(iconName, size)}</button>`;
  },

  // 1. STAT CARD (Katta oq karta, 64px ikonka kvadrati bilan)
  StatCard({ label, value, iconName, colorPair = "indigo", subtext = "" }) {
    const tone = ["indigo", "green", "amber", "red"].includes(colorPair) ? colorPair : "indigo";

    return `
      <div class="stat-card">
        <div class="stat-card-left">
          <div class="stat-label">${label}</div>
          <div class="stat-value">${value}</div>
          ${subtext ? `<div class="stat-subtext">${subtext}</div>` : ""}
        </div>
        <div class="stat-card-right">
          <div class="stat-icon-wrap tone-${tone}">
            ${this.icon(iconName, 26)}
          </div>
        </div>
      </div>
    `;
  },

  // 2. KONTENT PANELI (Katta oq panel, rounded-2xl, border)
  Panel({ title, iconName, badgeText, badgeColor = "green", contentHtml, actionsHtml = "" }) {
    return `
      <div class="content-panel">
        <div class="content-panel-header">
          <div class="content-panel-title">
            ${iconName ? this.icon(iconName, 22) : ""}
            <span>${title}</span>
          </div>
          <div class="content-panel-badge-wrap">
            ${actionsHtml || ""}
            ${badgeText ? this.Badge({ text: badgeText, color: badgeColor }) : ""}
          </div>
        </div>
        <div class="content-panel-body">
          ${contentHtml}
        </div>
      </div>
    `;
  },

  // 3. RO'YXAT ELEMENTI (ListItem: #FAFBFE ichki karta, rounded-2xl)
  ListItem({ title, subtitle, badgeText, badgeColor = "indigo", actionText = "Ochish →", actionAttr = "" }) {
    return `
      <div class="content-list-item">
        <div class="list-item-left">
          <div class="list-item-title">${title}</div>
          ${subtitle ? `<div class="list-item-sub">${subtitle}</div>` : ""}
        </div>
        <div class="list-item-right">
          ${badgeText ? this.Badge({ text: badgeText, color: badgeColor }) : ""}
          ${actionText ? `<button class="list-item-btn" ${actionAttr}>${actionText}</button>` : ""}
        </div>
      </div>
    `;
  },

  // 4. BO'SH HOLAT (EmptyState)
  EmptyState({ text = "Ma'lumotlar mavjud emas", iconName = "dashboard" }) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${this.icon(iconName, 36)}</div>
        <div class="empty-state-text">${text}</div>
      </div>
    `;
  },

  // 5. PILL BADGE (Rounded-full yupqa pill)
  Badge({ text, color = "indigo" }) {
    const tone = ["indigo", "green", "amber", "red", "slate"].includes(color) ? color : "indigo";
    return `<span class="badge-pill tone-${tone}">${text}</span>`;
  },

  Pill(options) {
    return this.Badge(options);
  },

  // 6. DASHBOARD LAYOUT (Sidebar + Header + Body)
  DashboardLayout({
    role = "teacher", // "teacher" | "director" | "developer"
    activeNav = "dashboard",
    title = "Asosiy",
    navItems = [],
    user = {},
    bodyHtml = "",
    onLogout = "location.href='index.html'",
    sidebarCollapsed = false,
    sidebarMenuOpen = false,
    pageClass = ""
  }) {
    const isPinned = localStorage.getItem("topex_sidebar_pinned") === "true";
    const isTeacher = role === "teacher";
    const isSidebarCollapsed = sidebarCollapsed ||
      (!isTeacher && localStorage.getItem("topex_sidebar_collapsed") === "true");
    const actionAttr = (layoutAction, teacherAction) => isTeacher
      ? `data-act="${teacherAction}"`
      : `data-layout-act="${layoutAction}"`;
    const initials = (name) => {
      if (!name) return "TP";
      const parts = String(name).trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return String(name).slice(0, 2).toUpperCase();
    };

    const userName = String(user.name || user.fullname || (role === "developer" ? "Developer" : (role === "director" ? "Direktor" : "Ustoz")));
    const userInitials = initials(userName);
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const soundEnabled = user.soundEnabled !== false;

    const sidebarClass = [
      "sidebar",
      isPinned ? "pinned" : "",
      isSidebarCollapsed ? "collapsed" : "",
      sidebarMenuOpen ? "mobile-open open" : ""
    ].filter(Boolean).join(" ");

    const isTabDashboard = activeNav === "dashboard";
    const isTabStudents = activeNav === "students";
    const isTabSchedule = activeNav === "schedule";
    const isTabGroups = activeNav === "groups";

    return `
      <!-- Backdrop overlay for mobile drawer -->
      <div class="sidebar-backdrop ${sidebarMenuOpen ? "open" : ""}" id="sidebar-backdrop" ${actionAttr("close-mobile-sidebar", "close-sidebar-mobile")}></div>
      <div class="layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}" id="app-layout">
        <!-- Sidebar / Mobile Drawer -->
        <aside class="${sidebarClass}" id="sidebar">
          ${isTeacher ? `<div class="sidebar-timer-bar" id="sidebar-timer-bar" title="5 soniyada yopiladi"></div>` : ""}
          <div class="sidebar-top">
            <div class="sidebar-brand ${isTeacher ? "brand" : ""}" ${isTeacher ? 'data-act="brand-click"' : ""}>
              <div class="brand-logo">T</div>
              <div class="brand-info-wrap">
                <span class="brand-name">Topex</span>
                <span class="brand-sub-badge">O'QITUVCHI PORTALI</span>
              </div>
            </div>

            <!-- Mobile Drawer Close Button -->
            <button type="button" class="mobile-drawer-close-btn" ${actionAttr("close-mobile-sidebar", "close-sidebar-mobile")} aria-label="Menyuni yopish" title="Menyuni yopish">
              ${this.icon("x", 18)}
            </button>

            <!-- Desktop Controls -->
            <div class="sidebar-controls sidebar-header-actions desktop-only">
              ${this.IconButton({
                iconName: "pin",
                size: 16,
                className: "icon-control-btn sidebar-pin-btn",
                actionAttr: actionAttr("pin-sidebar", "toggle-sidebar-pin"),
                title: "Sidebarni qotirish",
                active: isPinned
              })}
              ${this.IconButton({
                iconName: isSidebarCollapsed ? "chevronRight" : "chevronLeft",
                size: 16,
                className: "icon-control-btn sidebar-collapse-btn sidebar-toggle-btn",
                actionAttr: actionAttr("collapse-sidebar", "toggle-sidebar"),
                title: "Sidebarni yig'ish"
              })}
            </div>
          </div>

          <!-- Drawer Teacher Profile Card (Mobile Only) -->
          <div class="drawer-user-card" ${isTeacher ? 'data-act="go" data-to="#/profile"' : 'data-layout-act="open-profile"'}>
            <div class="drawer-user-avatar">${userInitials}</div>
            <div class="drawer-user-info">
              <div class="drawer-user-name">${userName}</div>
              <div class="drawer-user-status">
                <span class="status-pulse-dot"></span>
                <span>Faol seans</span>
              </div>
            </div>
          </div>

          <nav class="sidebar-nav nav">
            <div class="drawer-section-label">MENYU</div>
            ${navItems.map(item => {
              const countBadge = item.count != null ? `<span class="nav-count-badge">${item.count}</span>` : "";
              const aiBadge = item.id === "chat" ? `<span class="nav-ai-badge">✨ AI</span>` : "";
              return `
                <a href="${item.href || '#'}" class="sidebar-nav-item ${activeNav === item.id ? 'active' : ''}" data-nav-id="${item.id}" title="${item.label}" ${item.attr || ""}>
                  <div class="nav-icon-wrap">
                    ${this.icon(item.icon, 20)}
                  </div>
                  <span class="nav-item-text">${item.label}</span>
                  ${aiBadge || countBadge || (activeNav === item.id ? '<span class="nav-active-dot"></span>' : '')}
                </a>
              `;
            }).join("")}
          </nav>

          <div class="sidebar-bottom ${isTeacher ? "bottom" : ""}">
            <!-- Drawer Quick Switches (Mobile Only) -->
            <div class="drawer-quick-switches">
              <button type="button" class="drawer-switch-btn ${soundEnabled ? 'active' : ''}" ${actionAttr("toggle-sound", "sound")}>
                ${this.icon(soundEnabled ? "volume" : "volumeX", 15)}
                <span>${soundEnabled ? "Ovozli" : "Tovushsiz"}</span>
              </button>
              <button type="button" class="drawer-switch-btn ${isDark ? 'active' : ''}" ${actionAttr("toggle-theme", "theme")}>
                ${this.icon(isDark ? "sun" : "moon", 15)}
                <span>${isDark ? "Kunduzgi" : "Tungi"}</span>
              </button>
            </div>

            <button class="sidebar-logout-btn logout-btn" ${isTeacher ? 'data-act="logout"' : `onclick="${onLogout}"`}>
              ${this.icon("logout", 20)}
              <span class="nav-item-text">Tizimdan chiqish</span>
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
          <!-- Header (Yuqori panel) -->
          <header class="app-header">
            <div class="header-left">
              <!-- Mobile Brand Logo & Subtitle (Stitch header design) -->
              <div class="mobile-brand-box" ${isTeacher ? 'data-act="brand-click"' : ''}>
                <div class="brand-logo sm">T</div>
                <div class="brand-text-col">
                  <span class="brand-title-text">Topex Ustoz</span>
                  <span class="brand-sub-text">O'QITUVCHI PORTALI</span>
                </div>
              </div>

              <!-- Desktop Page Title -->
              <div class="desktop-header-left">
                ${this.IconButton({
                  iconName: "menu",
                  size: 22,
                  className: "mobile-menu-btn desktop-only",
                  actionAttr: actionAttr("open-mobile-sidebar", "open-sidebar"),
                  title: "Menyuni ochish"
                })}
                <h1 class="header-page-title">${title}</h1>
              </div>
            </div>

            <div class="header-right">
              <!-- Active Role Pill (Stitch: 🧑‍🏫 Ustoz) -->
              <div class="header-role-pill">
                <span class="role-emoji">🧑‍🏫</span>
                <span class="role-text">Ustoz</span>
              </div>

              <!-- Jonli soat pill -->
              <div class="header-clock-pill">
                <span class="clock-dot animate-pulse"></span>
                <span id="digital-clock" class="clock-text">--:--</span>
              </div>

              <!-- Tovush tugmasi -->
              ${this.IconButton({
                iconName: soundEnabled ? "volume" : "volumeX",
                actionAttr: actionAttr("toggle-sound", "sound"),
                title: "Ovoz"
              })}

              <!-- Dark / Light mode tugmasi -->
              ${this.IconButton({
                iconName: isDark ? "sun" : "moon",
                actionAttr: actionAttr("toggle-theme", "theme"),
                title: "Mavzu"
              })}

              <!-- Foydalanuvchi avatar tugmasi (Stitch) -->
              <div class="header-user-pill" ${isTeacher ? 'data-act="go" data-to="#/profile"' : 'data-layout-act="open-profile"'} title="Shaxsiy profil">
                <div class="user-avatar">${userInitials}</div>
                <span class="user-name desktop-only">${userName}</span>
              </div>
            </div>
          </header>

          <!-- Sahifa Kontenti -->
          <div class="page-container ${pageClass}" id="page-container">
            ${bodyHtml}
          </div>
        </main>
      </div>

      <!-- Stitch Mobile Bottom Navigation Bar (Fixed) -->
      <nav class="mobile-bottom-tabs" data-purpose="mobile-bottom-tabs">
        <button type="button" class="bottom-tab-item ${isTabDashboard ? 'active' : ''}" data-act="go" data-to="#/dashboard">
          <div class="bottom-tab-icon">
            ${this.icon('dashboard', 22)}
            ${isTabDashboard ? '<span class="bottom-tab-dot"></span>' : ''}
          </div>
          <span class="bottom-tab-text">Asosiy</span>
        </button>
        <button type="button" class="bottom-tab-item ${isTabStudents ? 'active' : ''}" data-act="go" data-to="#/students">
          <div class="bottom-tab-icon">
            ${this.icon('students', 22)}
            ${isTabStudents ? '<span class="bottom-tab-dot"></span>' : ''}
          </div>
          <span class="bottom-tab-text">O'quvchilar</span>
        </button>
        <button type="button" class="bottom-tab-item ${isTabSchedule ? 'active' : ''}" data-act="go" data-to="#/schedule">
          <div class="bottom-tab-icon">
            ${this.icon('schedule', 22)}
            ${isTabSchedule ? '<span class="bottom-tab-dot"></span>' : ''}
          </div>
          <span class="bottom-tab-text">Jadval</span>
        </button>
        <button type="button" class="bottom-tab-item ${isTabGroups ? 'active' : ''}" data-act="go" data-to="#/groups">
          <div class="bottom-tab-icon">
            ${this.icon('groups', 22)}
            ${isTabGroups ? '<span class="bottom-tab-dot"></span>' : ''}
          </div>
          <span class="bottom-tab-text">Guruhlar</span>
        </button>
        <button type="button" class="bottom-tab-item ${sidebarMenuOpen ? 'active' : ''}" data-act="open-sidebar" aria-label="Menyuni ochish">
          <div class="bottom-tab-icon">
            ${this.icon('menu', 22)}
          </div>
          <span class="bottom-tab-text">Menyu</span>
        </button>
      </nav>
    `;
  },

  // Soatni yangilash
  startClock() {
    function tick() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${h}:${m}`;
      document.querySelectorAll(".clock-text, #digital-clock, .live-clock-text").forEach(el => {
        el.textContent = timeStr;
      });
    }
    tick();
    setInterval(tick, 1000);
  },

  // Hodisalarni boshqarish
  initEvents() {
    document.addEventListener("mouseover", (e) => {
      const sidebar = e.target.closest("#sidebar");
      if (sidebar && !sidebar.contains(e.relatedTarget) && window.innerWidth > 900 && sidebar.classList.contains("collapsed")) {
        sidebar.classList.add("hover-expanded");
      }
    });

    document.addEventListener("mouseout", (e) => {
      const sidebar = e.target.closest("#sidebar");
      if (sidebar && !sidebar.contains(e.relatedTarget)) {
        sidebar.classList.remove("hover-expanded");
      }
    });

    document.addEventListener("click", (e) => {
      const actBtn = e.target.closest("[data-layout-act]");
      if (!actBtn) return;
      const act = actBtn.dataset.layoutAct;

      if (act === "collapse-sidebar") {
        const layout = document.getElementById("app-layout");
        const sidebar = document.getElementById("sidebar");
        if (layout && sidebar) {
          const isCollapsed = layout.classList.toggle("sidebar-collapsed");
          sidebar.classList.toggle("collapsed", isCollapsed);
          localStorage.setItem("topex_sidebar_collapsed", String(isCollapsed));
          actBtn.innerHTML = UILayout.icon(isCollapsed ? "chevronRight" : "chevronLeft", 16);
        }
      }

      if (act === "pin-sidebar") {
        const isPinned = localStorage.getItem("topex_sidebar_pinned") === "true";
        if (isPinned) {
          localStorage.removeItem("topex_sidebar_pinned");
          actBtn.classList.remove("active");
        } else {
          localStorage.setItem("topex_sidebar_pinned", "true");
          actBtn.classList.add("active");
          const layout = document.getElementById("app-layout");
          const sidebar = document.getElementById("sidebar");
          if (layout && sidebar) {
            layout.classList.remove("sidebar-collapsed");
            sidebar.classList.remove("collapsed");
            localStorage.removeItem("topex_sidebar_collapsed");
          }
        }
      }

      if (act === "open-mobile-sidebar") {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.add("mobile-open");
        const backdrop = document.getElementById("sidebar-backdrop");
        if (backdrop) backdrop.classList.add("open");
      }

      if (act === "close-mobile-sidebar") {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.remove("mobile-open", "open");
        const backdrop = document.getElementById("sidebar-backdrop");
        if (backdrop) backdrop.classList.remove("open");
      }

      if (act === "open-profile") {
        location.hash = "#/profile";
      }

      if (act === "toggle-theme") {
        const cur = document.documentElement.getAttribute("data-theme") || "light";
        const next = cur === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("topex_theme", next);
        actBtn.innerHTML = UILayout.icon(next === "dark" ? "sun" : "moon", 18);
      }

      if (act === "toggle-sound") {
        const isMuted = localStorage.getItem("topex_sound_muted") === "true";
        localStorage.setItem("topex_sound_muted", String(!isMuted));
        actBtn.innerHTML = UILayout.icon(isMuted ? "volume" : "volumeX", 18);
      }
    });
  }
};

// Global initsializatsiya
if (typeof document !== "undefined") {
  const savedTheme = localStorage.getItem("topex_theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
  UILayout.initEvents();
  setTimeout(() => UILayout.startClock(), 100);
}
