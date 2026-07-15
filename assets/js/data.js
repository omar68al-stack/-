// بيانات تجريبية (Placeholder) — استبدلها بأرقام الخطة التشغيلية الفعلية من ملف الجمعية.
const DASHBOARD_DATA = {
  org: {
    name: "جمعية إعمار المرافق",
    tagline: "الذراع التنفيذي للأمانة لرعاية المرافق وإعادة تأهيلها",
    period: "الخطة التشغيلية 2026",
    chairman: "رئيس مجلس الإدارة",
  },

  kpis: [
    { id: "facilities", label: "المرافق المشمولة بالرعاية", value: 128, unit: "مرفق", delta: "+14 عن الربع السابق", trend: "up" },
    { id: "planProgress", label: "نسبة إنجاز الخطة التشغيلية", value: 62, unit: "%", delta: "+8% عن الربع السابق", trend: "up" },
    { id: "budgetSpent", label: "الميزانية المصروفة", value: 4.2, unit: "م.ر من 6.8", delta: "62% من الميزانية", trend: "flat" },
    { id: "satisfaction", label: "مؤشر رضا المستفيدين", value: 88, unit: "%", delta: "+3% عن الربع السابق", trend: "up" },
  ],

  strategicGoals: [
    { name: "رعاية وصيانة المرافق العامة", progress: 74 },
    { name: "إعادة تأهيل المرافق المتهالكة", progress: 58 },
    { name: "تحسين الجودة الجمالية والتصميم الحضري", progress: 45 },
    { name: "الشراكات المجتمعية والتطوعية", progress: 66 },
    { name: "الاستدامة المالية والتشغيلية", progress: 52 },
  ],

  budgetByCategory: [
    { category: "الصيانة الدورية", allocated: 1800, spent: 1450 },
    { category: "إعادة التأهيل", allocated: 2600, spent: 1620 },
    { category: "التشجير والتجميل", allocated: 900, spent: 610 },
    { category: "الشراكات والفعاليات", allocated: 700, spent: 340 },
    { category: "التشغيل الإداري", allocated: 800, spent: 480 },
  ],

  statusBreakdown: [
    { status: "مكتمل", count: 21, color: "good" },
    { status: "قيد التنفيذ", count: 34, color: "warning" },
    { status: "متأخر", count: 6, color: "critical" },
    { status: "لم يبدأ", count: 12, color: "muted" },
  ],

  projects: [
    { name: "إعادة تأهيل حديقة الواحة", category: "إعادة التأهيل", status: "قيد التنفيذ", progress: 65, allocated: 420, spent: 260, owner: "إدارة المشاريع", due: "2026-09-30" },
    { name: "صيانة الإنارة العامة - الحي الشرقي", category: "الصيانة الدورية", status: "قيد التنفيذ", progress: 80, allocated: 210, spent: 175, owner: "إدارة الصيانة", due: "2026-08-15" },
    { name: "تجميل مدخل المرافق الرئيسي", category: "التشجير والتجميل", status: "متأخر", progress: 30, allocated: 180, spent: 95, owner: "إدارة التشغيل", due: "2026-07-31" },
    { name: "برنامج الشراكة مع المتطوعين", category: "الشراكات والفعاليات", status: "مكتمل", progress: 100, allocated: 150, spent: 148, owner: "إدارة الشراكات", due: "2026-06-01" },
    { name: "تأهيل الملاعب متعددة الأغراض", category: "إعادة التأهيل", status: "قيد التنفيذ", progress: 40, allocated: 560, spent: 210, owner: "إدارة المشاريع", due: "2026-11-15" },
    { name: "تحديث نظام إدارة الأصول", category: "التشغيل الإداري", status: "لم يبدأ", progress: 0, allocated: 260, spent: 0, owner: "إدارة تقنية المعلومات", due: "2027-01-15" },
    { name: "صيانة شبكات الري بالحدائق", category: "الصيانة الدورية", status: "مكتمل", progress: 100, allocated: 190, spent: 182, owner: "إدارة الصيانة", due: "2026-05-20" },
    { name: "مبادرة تشجير الطرق الرئيسية", category: "التشجير والتجميل", status: "قيد التنفيذ", progress: 55, allocated: 240, spent: 130, owner: "إدارة التشغيل", due: "2026-10-01" },
  ],

  // "id" ثابت لضبط حالة القرار في التخزين المحلي للمتصفح
  decisions: [
    {
      id: "DEC-001",
      title: "اعتماد ميزانية إضافية لمشروع تأهيل الملاعب متعددة الأغراض",
      context: "تجاوز حجم الأعمال الفعلي التقديرات الأولية بنسبة 18% بسبب توسعة نطاق السلامة الإنشائية.",
      recommendation: "اعتماد ميزانية إضافية قدرها 95 ألف ريال من بند الطوارئ.",
      requestedBy: "إدارة المشاريع",
      due: "2026-07-25",
      priority: "عالية",
    },
    {
      id: "DEC-002",
      title: "التعاقد مع مشغل صيانة خارجي للإنارة العامة",
      context: "ارتفاع بلاغات الأعطال في الحي الشرقي بنسبة 22% خلال الربع الحالي.",
      recommendation: "الموافقة على التعاقد مع مقاول صيانة معتمد لمدة سنة قابلة للتجديد.",
      requestedBy: "إدارة الصيانة",
      due: "2026-08-01",
      priority: "متوسطة",
    },
    {
      id: "DEC-003",
      title: "تمديد مهلة مشروع تجميل مدخل المرافق الرئيسي",
      context: "تأخر توريد مواد التشطيب من المورد المعتمد بواقع 6 أسابيع.",
      recommendation: "تمديد الموعد المستهدف إلى نهاية سبتمبر 2026 دون غرامات على المقاول.",
      requestedBy: "إدارة التشغيل",
      due: "2026-07-28",
      priority: "عالية",
    },
    {
      id: "DEC-004",
      title: "توسيع برنامج الشراكة مع المتطوعين لمرافق إضافية",
      context: "نجاح المرحلة الأولى بمؤشر رضا 92% وطلب تكرار التجربة في 4 مرافق جديدة.",
      recommendation: "اعتماد التوسعة ضمن ميزانية الشراكات الحالية دون الحاجة لتمويل إضافي.",
      requestedBy: "إدارة الشراكات",
      due: "2026-08-10",
      priority: "منخفضة",
    },
  ],

  risks: [
    { risk: "تأخر توريد مواد التشطيب من الموردين", impact: "critical", likelihood: "متوسطة" },
    { risk: "ارتفاع تكاليف الصيانة الطارئة عن المخطط", impact: "serious", likelihood: "عالية" },
    { risk: "نقص الكوادر الفنية المتخصصة في الترميم", impact: "warning", likelihood: "متوسطة" },
    { risk: "تذبذب مشاركة المتطوعين في المواسم الحارة", impact: "warning", likelihood: "عالية" },
  ],

  timeline: [
    { project: "إعادة تأهيل حديقة الواحة", start: 1, span: 3, status: "warning" },
    { project: "صيانة الإنارة العامة", start: 0, span: 2, status: "warning" },
    { project: "تجميل مدخل المرافق الرئيسي", start: 0, span: 3, status: "critical" },
    { project: "تأهيل الملاعب متعددة الأغراض", start: 1, span: 3, status: "warning" },
    { project: "تحديث نظام إدارة الأصول", start: 2, span: 2, status: "muted" },
  ],
};
