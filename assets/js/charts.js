// رسم المخططات: عناصر SVG/HTML بسيطة بدون أي مكتبات خارجية (لضمان عمل الموقع بدون اتصال إنترنت)

const STATUS_COLOR_VAR = {
  good: "--good",
  warning: "--warning",
  serious: "--serious",
  critical: "--critical",
  muted: "--muted-status",
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function showTip(evt, text) {
  const tip = document.getElementById("tooltip");
  tip.textContent = text;
  tip.style.display = "block";
  positionTip(evt);
}
function positionTip(evt) {
  const tip = document.getElementById("tooltip");
  const pad = 14;
  tip.style.left = evt.clientX + pad + "px";
  tip.style.top = evt.clientY + pad + "px";
}
function hideTip() {
  document.getElementById("tooltip").style.display = "none";
}
function bindTip(el, text) {
  el.addEventListener("mousemove", (e) => showTip(e, text));
  el.addEventListener("mouseenter", (e) => showTip(e, text));
  el.addEventListener("mouseleave", hideTip);
}

// ---------- الأهداف الاستراتيجية: أشرطة أفقية ----------
function renderStrategicGoals(containerId, goals) {
  const el = document.getElementById(containerId);
  const seriesVars = ["--series-1", "--series-2", "--series-3", "--series-4", "--series-5"];
  el.innerHTML = goals
    .map((g, i) => {
      const color = `var(${seriesVars[i % seriesVars.length]})`;
      return `
      <div class="hbar-row">
        <div class="hbar-label">${g.name}</div>
        <div class="hbar-track"><div class="hbar-fill" style="width:${g.progress}%; background:${color}"></div></div>
        <div class="hbar-value">${g.progress}%</div>
      </div>`;
    })
    .join("");
}

// ---------- الميزانية: أعمدة مزدوجة (المخصص/المصروف) ----------
function renderBudgetChart(containerId, rows) {
  const el = document.getElementById(containerId);
  const max = Math.max(...rows.map((r) => r.allocated)) * 1.15;
  el.innerHTML = rows
    .map((r) => {
      const hAlloc = Math.round((r.allocated / max) * 100);
      const hSpent = Math.round((r.spent / max) * 100);
      return `
      <div class="bar-group">
        <div class="bars">
          <div class="bar" data-tip="المخصص: ${r.allocated} ألف ريال" style="height:${hAlloc}%; background: var(--series-1)"></div>
          <div class="bar" data-tip="المصروف: ${r.spent} ألف ريال" style="height:${hSpent}%; background: var(--series-2)"></div>
        </div>
        <div class="cat-label">${r.category}</div>
      </div>`;
    })
    .join("");
  el.querySelectorAll(".bar[data-tip]").forEach((bar) => bindTip(bar, bar.getAttribute("data-tip")));
}

// ---------- توزيع حالة المشاريع: دونات ----------
function renderStatusDonut(containerId, legendId, rows) {
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = rows.reduce((s, x) => s + x.count, 0);

  let offset = 0;
  const segments = rows
    .map((row) => {
      const frac = row.count / total;
      const len = frac * circumference;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="var(${STATUS_COLOR_VAR[row.color] || "--muted-status"})"
        stroke-width="${stroke}"
        stroke-dasharray="${len} ${circumference - len}"
        stroke-dashoffset="${-offset}"
        data-tip="${row.status}: ${row.count} (${Math.round(frac * 100)}%)"
        transform="rotate(-90 ${cx} ${cy})" />`;
      offset += len;
      return seg;
    })
    .join("");

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--grid)" stroke-width="${stroke}" />
      ${segments}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-center-value">${total}</text>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-center-label">مشروع</text>
    </svg>`;

  document.getElementById(containerId).innerHTML = svg;
  document.querySelectorAll(`#${containerId} circle[data-tip]`).forEach((c) => bindTip(c, c.getAttribute("data-tip")));

  document.getElementById(legendId).innerHTML = rows
    .map(
      (row) => `<div class="legend-item">
        <span class="legend-swatch" style="background:var(${STATUS_COLOR_VAR[row.color] || "--muted-status"})"></span>
        ${row.status} (${row.count})
      </div>`
    )
    .join("");
}

// ---------- الجدول الزمني للمشاريع (ربع سنوي) ----------
function renderTimeline(containerId, rows) {
  const el = document.getElementById(containerId);
  const quarters = ["الربع 1", "الربع 2", "الربع 3", "الربع 4"];
  const quartersHtml = `
    <div class="timeline-quarters">
      <div></div>
      <div class="q-labels">${quarters.map((q) => `<div>${q}</div>`).join("")}</div>
    </div>`;

  const rowsHtml = rows
    .map((r) => {
      const leftPct = (r.start / 4) * 100;
      const widthPct = (r.span / 4) * 100;
      return `
      <div class="timeline-row">
        <div class="hbar-label">${r.project}</div>
        <div class="timeline-track">
          <div class="timeline-bar" data-tip="${r.project}"
            style="right:${leftPct}%; width:${widthPct}%; background:var(${STATUS_COLOR_VAR[r.status] || "--muted-status"})"></div>
        </div>
      </div>`;
    })
    .join("");

  el.innerHTML = quartersHtml + rowsHtml;
  el.querySelectorAll(".timeline-bar[data-tip]").forEach((b) => bindTip(b, b.getAttribute("data-tip")));
}
