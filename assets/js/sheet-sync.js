// يجيب أحدث بيانات المبادرات مباشرة من شيت Google (منشور للويب) عند فتح الموقع.
// إذا تعذّر الاتصال (لا إنترنت، أو تغيّرت إعدادات النشر)، يبقى الموقع يعرض
// النسخة الاحتياطية المدمجة في assets/js/data.js دون أي كسر.

const SHEET_PUBLISH_KEY = "2PACX-1vTNSfD9g7SkK6d8T89Rdb5bTrf1X_sYVZVrbo1LvrLcwVFZjAB439-jAxLJye2oYw";

function sheetCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_PUBLISH_KEY}/pub?gid=${gid}&single=true&output=csv`;
}

const SHEET_SOURCES = {
  beneficiaries: sheetCsvUrl(491891042),
  financial: sheetCsvUrl(539878785),
  internal: sheetCsvUrl(873560772),
  learning: sheetCsvUrl(507901612),
};

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvToObjects(text) {
  const rows = parseCSV(text).filter((r) => r.some((c) => c.trim() !== ""));
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
}

function parseNum(s) {
  const cleaned = String(s ?? "").replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseSheetDate(s) {
  if (!s) return null;
  s = s.trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function rowToInitiative(obj, perspective, idx) {
  const name = obj["المبادرة التنفيذية"];
  if (!name) return null;
  const targetRaw = obj["المستهدف"] || "";
  return {
    id: `${perspective}-${idx}`,
    perspective,
    name,
    description: obj["وصف المبادرة"] || "",
    kpi: obj["مؤشر أداء المبادرة"] || "",
    target: parseNum(targetRaw),
    targetIsPercent: targetRaw.includes("%"),
    achieved: parseNum(obj["المتحقق"]),
    owner: obj["مسؤول المبادرة"] || "",
    start: parseSheetDate(obj["البداية"]) || DASHBOARD_DATA.planStart,
    end: parseSheetDate(obj["النهاية"]) || DASHBOARD_DATA.planEnd,
    budget: parseNum(obj["التكلفة المالية"]),
    spent: parseNum(obj["المصروف"]),
    support: (obj["توفر الدعم"] || "داخلي").trim(),
  };
}

const PERSPECTIVE_LABEL_FOR_ERRORS = {
  beneficiaries: "بعد المستفيدين",
  financial: "البعد المالي",
  internal: "بعد العمليات الداخلية",
  learning: "بعد التعلم والنمو",
};

async function fetchPerspectiveRows(perspective, url) {
  let res;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (networkErr) {
    // فشل على مستوى الشبكة قبل وصول أي استجابة — الحالة الأكثر شيوعًا لهذا هي
    // رفض CORS من متصفح المستخدم (المتصفح يمنع قراءة الاستجابة رغم وصولها).
    throw new Error(`تعذّر الوصول لتبويب "${PERSPECTIVE_LABEL_FOR_ERRORS[perspective]}" — على الأغلب رفض CORS من المتصفح. تفصيل: ${networkErr.message}`);
  }
  if (!res.ok) {
    throw new Error(`تبويب "${PERSPECTIVE_LABEL_FOR_ERRORS[perspective]}" أعاد HTTP ${res.status} — تأكد أن التبويب منشور للويب.`);
  }
  const text = await res.text();
  const rows = csvToObjects(text)
    .map((obj, idx) => rowToInitiative(obj, perspective, idx))
    .filter(Boolean);
  if (!rows.length) {
    throw new Error(`تبويب "${PERSPECTIVE_LABEL_FOR_ERRORS[perspective]}" رجع بدون صفوف صالحة — تحقّق من رابط النشر أو أسماء الأعمدة.`);
  }
  return rows;
}

// يحاول تحديث DASHBOARD_DATA.initiatives من الشيت الحي. يُرجع حالة النتيجة
// (نجاح/فشل) دون رمي استثناء، حتى يستمر عرض النسخة الاحتياطية عند الفشل.
async function syncFromSheet() {
  try {
    const entries = await Promise.all(
      Object.entries(SHEET_SOURCES).map(async ([key, url]) => [key, await fetchPerspectiveRows(key, url)])
    );
    const live = entries.flatMap(([, rows]) => rows);
    DASHBOARD_DATA.initiatives = live;
    DASHBOARD_DATA._sync = { ok: true, at: new Date() };
  } catch (err) {
    DASHBOARD_DATA._sync = { ok: false, at: new Date(), error: String(err && err.message ? err.message : err) };
  }
  return DASHBOARD_DATA._sync;
}
