const THEME_KEY = "emaar-theme";

const PERSPECTIVE_BY_KEY = Object.fromEntries(PERSPECTIVES.map((p) => [p.key, p]));

const SUPPORT_BADGE = {
  "للتسويق": "warning",
  "داخلي": "muted",
  "مدعومة": "good",
};
const IMPACT_LABEL = { good: "منخفض", warning: "متوسط", serious: "مرتفع", critical: "حرج" };

function fmtSAR(n) { return `${Number(n).toLocaleString("ar")} ريال`; }

function initiativeProgress(init) {
  if (!init.target) return 0;
  return Math.max(0, Math.min(100, Math.round((init.achieved / init.target) * 100)));
}
function daysBetween(a, b) { return (b - a) / 86400000; }
function elapsedPct(init) {
  const start = new Date(init.start), end = new Date(init.end), today = new Date();
  const total = daysBetween(start, end);
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((daysBetween(start, today) / total) * 100)));
}
function initiativeStatus(init) {
  const progress = initiativeProgress(init);
  const today = new Date();
  const start = new Date(init.start), end = new Date(init.end);
  if (progress >= 100) return "مكتمل";
  if (today < start) return "لم يبدأ";
  if (today > end) return "متأخر";
  return "قيد التنفيذ";
}
function targetLabel(init) {
  return init.targetIsPercent ? `${init.target}%` : init.target.toLocaleString("ar");
}
function achievedLabel(init) {
  return init.targetIsPercent ? `${init.achieved}%` : init.achieved.toLocaleString("ar");
}

function badge(kind, label) {
  return `<span class="badge badge-${kind}"><span class="dot" style="background:var(--${kind === "muted" ? "muted-status" : kind})"></span>${label}</span>`;
}
function statusBadge(statusLabel) {
  const kind = { "مكتمل": "good", "قيد التنفيذ": "warning", "متأخر": "critical", "لم يبدأ": "muted" }[statusLabel] || "muted";
  return badge(kind, statusLabel);
}
function supportBadge(label) {
  return badge(SUPPORT_BADGE[label] || "muted", label);
}
function perspectivePill(key) {
  const p = PERSPECTIVE_BY_KEY[key];
  return `<span class="pill" style="background:color-mix(in srgb, var(${p.seriesVar}) 16%, transparent); color:var(${p.seriesVar})">${p.name}</span>`;
}

// ---------- تجميعات مشتقة من قائمة المبادرات ----------
function computeAggregates() {
  const inits = DASHBOARD_DATA.initiatives;
  const totalBudget = inits.reduce((s, i) => s + i.budget, 0);
  const totalSpent = inits.reduce((s, i) => s + i.spent, 0);
  const avgProgress = Math.round(inits.reduce((s, i) => s + initiativeProgress(i), 0) / inits.length);
  const planElapsed = elapsedPct({ start: DASHBOARD_DATA.planStart, end: DASHBOARD_DATA.planEnd });

  const perspectiveStats = PERSPECTIVES.map((p) => {
    const items = inits.filter((i) => i.perspective === p.key);
    const budget = items.reduce((s, i) => s + i.budget, 0);
    const progress = items.length ? Math.round(items.reduce((s, i) => s + initiativeProgress(i), 0) / items.length) : 0;
    return { ...p, budget, progress, count: items.length };
  });

  return { totalBudget, totalSpent, avgProgress, planElapsed, perspectiveStats };
}

function renderKPIs() {
  const agg = computeAggregates();
  const kpis = [
    { label: "إجمالي المبادرات التنفيذية", value: DASHBOARD_DATA.initiatives.length, unit: "مبادرة", note: "عبر 4 أبعاد استراتيجية" },
    { label: "إجمالي الميزانية المعتمدة", value: agg.totalBudget.toLocaleString("ar"), unit: "ريال", note: agg.totalSpent > 0 ? `صُرف ${agg.totalSpent.toLocaleString("ar")} ريال` : "لم يُسجَّل صرف حتى تاريخه" },
    { label: "متوسط نسبة تحقق المؤشرات", value: agg.avgProgress, unit: "%", note: "بحسب آخر تحديث في الملف المصدر" },
    { label: "الوقت المنقضي من عمر الخطة", value: agg.planElapsed, unit: "%", note: `${DASHBOARD_DATA.planStart} — ${DASHBOARD_DATA.planEnd}` },
  ];
  document.getElementById("kpi-grid").innerHTML = kpis
    .map(
      (k) => `
    <div class="card stat-tile">
      <div class="stat-label">${k.label}</div>
      <div class="stat-value">${k.value}<span class="unit">${k.unit}</span></div>
      <div class="stat-delta">${k.note}</div>
    </div>`
    )
    .join("");
}

function renderPerspectiveSummary() {
  const agg = computeAggregates();
  const topKey = agg.perspectiveStats.slice().sort((a, b) => b.budget - a.budget)[0].key;
  document.getElementById("perspective-summary").innerHTML = agg.perspectiveStats
    .map(
      (p) => `
    <div class="goal-card ${p.key === topKey ? "highlight" : ""}">
      <div class="goal-name">${p.name}</div>
      <div class="goal-budget">${p.budget.toLocaleString("ar")} ر.س</div>
      <div class="goal-meta-row">
        <span class="goal-count-badge">${p.count}</span> عدد المبادرات
      </div>
      <div class="goal-progress-value">${p.progress}% نسبة الإنجاز</div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${p.progress}%; background:var(${p.seriesVar})"></div></div>
    </div>`
    )
    .join("");

  const top = agg.perspectiveStats.find((p) => p.key === topKey);
  const pct = Math.round((top.budget / agg.totalBudget) * 100);
  document.getElementById("budget-concentration-note").textContent =
    `${pct}% من الميزانية الإجمالية (${agg.totalBudget.toLocaleString("ar")} ريال) موجَّه إلى "${top.name}" وحده.`;
}

function matchesSearch(init, term) {
  if (!term) return true;
  const hay = `${init.name} ${init.kpi} ${init.owner}`.toLowerCase();
  return hay.includes(term.toLowerCase());
}

function renderInitiativesTable() {
  const perspective = document.getElementById("perspective-select").value;
  const term = document.getElementById("search-input").value.trim();
  const tbody = document.getElementById("projects-tbody");
  const rows = DASHBOARD_DATA.initiatives.filter(
    (i) => (!perspective || i.perspective === perspective) && matchesSearch(i, term)
  );
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">لا توجد مبادرات مطابقة</div></td></tr>`;
    return;
  }
  tbody.innerHTML = rows
    .map((i) => {
      const progress = initiativeProgress(i);
      const status = initiativeStatus(i);
      const rowId = `init-desc-${i.id}`;
      return `
    <tr class="init-row" data-target="${rowId}" style="cursor:pointer">
      <td>${perspectivePill(i.perspective)}</td>
      <td class="cell-nowrap">${i.name} <span style="color:var(--text-muted); font-size:11px">ⓘ</span></td>
      <td>${statusBadge(status)}</td>
      <td>
        <div class="progress-cell">
          <div class="hbar-track" style="width:70px"><div class="hbar-fill" style="width:${progress}%; background:var(${PERSPECTIVE_BY_KEY[i.perspective].seriesVar})"></div></div>
          <span class="cell-nowrap">${progress}%</span>
        </div>
      </td>
      <td class="cell-nowrap">${i.kpi}: ${achievedLabel(i)} / ${targetLabel(i)}</td>
      <td class="cell-nowrap">${fmtSAR(i.budget)}</td>
      <td class="cell-nowrap">${i.owner}</td>
      <td>${supportBadge(i.support)}</td>
    </tr>
    <tr class="init-desc-row" id="${rowId}" style="display:none">
      <td colspan="8">
        <div class="cell-desc" style="max-width:none; padding:4px 2px">
          ${i.description}<br/>
          <span style="color:var(--text-muted)">الفترة: ${i.start} — ${i.end} · الوقت المنقضي من مدة المبادرة: ${elapsedPct(i)}%</span>
        </div>
      </td>
    </tr>`;
    })
    .join("");

  tbody.querySelectorAll(".init-row").forEach((row) => {
    row.addEventListener("click", () => {
      const desc = document.getElementById(row.getAttribute("data-target"));
      desc.style.display = desc.style.display === "none" ? "table-row" : "none";
    });
  });
}

function initTableControls() {
  const select = document.getElementById("perspective-select");
  PERSPECTIVES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.key;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
  select.addEventListener("change", renderInitiativesTable);
  document.getElementById("search-input").addEventListener("input", renderInitiativesTable);
}

function renderRisks() {
  document.getElementById("risks-tbody").innerHTML = DASHBOARD_DATA.risks
    .map(
      (r) => `
    <tr>
      <td class="cell-desc" style="max-width:520px">${r.risk}</td>
      <td>${badge(r.impact, IMPACT_LABEL[r.impact])}</td>
      <td class="cell-nowrap">${r.likelihood}</td>
    </tr>`
    )
    .join("");
}

function initTabs() {
  const links = document.querySelectorAll(".tab-link[data-view]");
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

function renderAll() {
  document.getElementById("last-update").textContent = new Date().toLocaleDateString("ar-SA-u-ca-gregory", {
    year: "numeric", month: "long", day: "numeric",
  });
  renderKPIs();
  renderPerspectiveSummary();
  renderInitiativesTable();
  renderRisks();
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initTheme();
  initTableControls();
  renderAll();

  document.getElementById("refresh-btn").addEventListener("click", renderAll);
  document.getElementById("print-btn").addEventListener("click", () => window.print());
});
