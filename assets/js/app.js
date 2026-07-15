const STORAGE_KEY = "emaar-decisions-state-v1";
const THEME_KEY = "emaar-theme";

const STATUS_BADGE = {
  "مكتمل": "good",
  "قيد التنفيذ": "warning",
  "متأخر": "critical",
  "لم يبدأ": "muted",
};
const IMPACT_LABEL = { good: "منخفض", warning: "متوسط", serious: "مرتفع", critical: "حرج" };

function loadDecisionState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveDecisionState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function badge(statusLabel) {
  const kind = STATUS_BADGE[statusLabel] || "muted";
  return `<span class="badge badge-${kind}"><span class="dot" style="background:var(--${kind === "muted" ? "muted-status" : kind})"></span>${statusLabel}</span>`;
}

function renderKPIs() {
  const el = document.getElementById("kpi-grid");
  el.innerHTML = DASHBOARD_DATA.kpis
    .map(
      (k) => `
    <div class="card stat-tile">
      <div class="stat-label">${k.label}</div>
      <div class="stat-value">${k.value}<span class="unit">${k.unit}</span></div>
      <div class="stat-delta ${k.trend}">${k.trend === "up" ? "▲" : k.trend === "down" ? "▼" : "―"} ${k.delta}</div>
    </div>`
    )
    .join("");
}

function renderProjectsTable(filterStatus) {
  const tbody = document.getElementById("projects-tbody");
  const rows = DASHBOARD_DATA.projects.filter((p) => !filterStatus || p.status === filterStatus);
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">لا توجد مشاريع مطابقة</div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows
    .map(
      (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${badge(p.status)}</td>
      <td>
        <div class="progress-cell">
          <div class="hbar-track" style="width:70px"><div class="hbar-fill" style="width:${p.progress}%; background:var(--series-1)"></div></div>
          <span>${p.progress}%</span>
        </div>
      </td>
      <td>${p.allocated.toLocaleString("ar")} / ${p.spent.toLocaleString("ar")} ألف ريال</td>
      <td>${p.owner}</td>
      <td>${p.due}</td>
    </tr>`
    )
    .join("");
}

function renderProjectFilters() {
  const wrap = document.getElementById("project-filters");
  const statuses = ["الكل", ...Array.from(new Set(DASHBOARD_DATA.projects.map((p) => p.status)))];
  wrap.innerHTML = statuses
    .map((s, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-status="${s === "الكل" ? "" : s}">${s}</button>`)
    .join("");
  wrap.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      wrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderProjectsTable(chip.getAttribute("data-status"));
    });
  });
}

function renderRisks() {
  const tbody = document.getElementById("risks-tbody");
  tbody.innerHTML = DASHBOARD_DATA.risks
    .map(
      (r) => `
    <tr>
      <td>${r.risk}</td>
      <td><span class="badge badge-${r.impact === "good" ? "good" : r.impact}"><span class="dot" style="background:var(--${r.impact})"></span>${IMPACT_LABEL[r.impact]}</span></td>
      <td>${r.likelihood}</td>
    </tr>`
    )
    .join("");
}

function pendingDecisionCount() {
  const state = loadDecisionState();
  return DASHBOARD_DATA.decisions.filter((d) => !state[d.id]).length;
}

function renderDecisions() {
  const state = loadDecisionState();
  const wrap = document.getElementById("decisions-list");
  wrap.innerHTML = DASHBOARD_DATA.decisions
    .map((d) => {
      const resolved = state[d.id];
      const actionLabel = resolved ? { approved: "تمت الموافقة", deferred: "تم التأجيل", rejected: "تم الرفض" }[resolved.action] : null;
      const actionKind = resolved ? { approved: "good", deferred: "warning", rejected: "critical" }[resolved.action] : null;
      return `
      <div class="decision-card ${resolved ? "resolved" : ""}" data-id="${d.id}">
        <div class="decision-head">
          <div>
            <div class="decision-title">${d.title}</div>
            <div class="decision-meta">
              <span>مقدَّم من: ${d.requestedBy}</span>
              <span>الموعد النهائي: ${d.due}</span>
              <span class="priority-pill priority-${d.priority}">أولوية ${d.priority}</span>
            </div>
          </div>
        </div>
        <div class="decision-body">
          <div><b>السياق:</b> ${d.context}</div>
          <div style="margin-top:6px"><b>التوصية:</b> ${d.recommendation}</div>
        </div>
        ${
          resolved
            ? `<div class="decision-status-line">
                <span class="badge badge-${actionKind}">${actionLabel}</span>
                ${resolved.note ? `<span>— ملاحظة: ${resolved.note}</span>` : ""}
                <button class="btn btn-ghost btn-sm reopen-btn">تراجع عن القرار</button>
              </div>`
            : `<div class="decision-actions">
                <button class="btn btn-approve btn-sm" data-action="approved">اعتماد</button>
                <button class="btn btn-defer btn-sm" data-action="deferred">تأجيل</button>
                <button class="btn btn-reject btn-sm" data-action="rejected">رفض</button>
              </div>
              <textarea class="decision-note-input" placeholder="أضف ملاحظة اختيارية على القرار..."></textarea>`
        }
      </div>`;
    })
    .join("");

  wrap.querySelectorAll(".decision-card").forEach((card) => {
    const id = card.getAttribute("data-id");
    card.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const note = card.querySelector(".decision-note-input")?.value.trim() || "";
        const st = loadDecisionState();
        st[id] = { action: btn.getAttribute("data-action"), note, at: new Date().toISOString() };
        saveDecisionState(st);
        renderDecisions();
        updateDecisionBadge();
      });
    });
    card.querySelector(".reopen-btn")?.addEventListener("click", () => {
      const st = loadDecisionState();
      delete st[id];
      saveDecisionState(st);
      renderDecisions();
      updateDecisionBadge();
    });
  });
}

function updateDecisionBadge() {
  const badgeEl = document.getElementById("decisions-badge");
  const n = pendingDecisionCount();
  if (n > 0) {
    badgeEl.textContent = n;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
  }
}

function initNav() {
  const links = document.querySelectorAll(".nav-link[data-view]");
  const views = document.querySelectorAll("section.view");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      const target = link.getAttribute("data-view");
      views.forEach((v) => v.classList.toggle("active", v.id === target));
    });
  });
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  const btn = document.getElementById("theme-toggle");
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  });
}

function initHeader() {
  document.getElementById("org-name").textContent = DASHBOARD_DATA.org.name;
  document.getElementById("org-tagline").textContent = DASHBOARD_DATA.org.tagline;
  document.getElementById("org-period").textContent = DASHBOARD_DATA.org.period;
  document.getElementById("last-update").textContent = new Date().toLocaleDateString("ar-SA-u-ca-gregory", {
    year: "numeric", month: "long", day: "numeric",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initNav();
  initTheme();
  renderKPIs();
  renderStrategicGoals("goals-chart", DASHBOARD_DATA.strategicGoals);
  renderBudgetChart("budget-chart", DASHBOARD_DATA.budgetByCategory);
  renderStatusDonut("status-donut", "status-legend", DASHBOARD_DATA.statusBreakdown);
  renderTimeline("timeline-chart", DASHBOARD_DATA.timeline);
  renderProjectFilters();
  renderProjectsTable();
  renderRisks();
  renderDecisions();
  updateDecisionBadge();

  document.getElementById("print-btn").addEventListener("click", () => window.print());
});
