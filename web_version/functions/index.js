/**
 * ═══════════════════════════════════════════════════════════
 * EL-KKETA Daily Report - Firebase Cloud Function
 * ═══════════════════════════════════════════════════════════
 * يعمل كل يوم الساعة 9:00 صباحاً (توقيت القاهرة)
 * بدون الحاجة لتشغيل أي جهاز 24 ساعة
 * ═══════════════════════════════════════════════════════════
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.database();

// ضبط المنطقة الزمنية على أوروبا (نفس منطقة Firebase DB)
setGlobalOptions({ region: "europe-west1" });

// ══════════════════════════════════════════════
// 🔑 إعدادات Telegram - اضبطها هنا
// ══════════════════════════════════════════════
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || "YOUR_CHAT_ID_HERE";

// ══════════════════════════════════════════════
// 📊 الدالة الرئيسية: تقرير يومي - 9 صباحاً
// ══════════════════════════════════════════════
exports.dailyReport = onSchedule(
  {
    schedule: "0 6 * * *",   // 6 UTC = 9 صباحاً بتوقيت القاهرة
    timeZone: "UTC",
    region: "europe-west1",
  },
  async () => {
    try {
      const report = await buildDailyReport();
      await sendTelegram(report);
      console.log("✅ Daily report sent successfully");
    } catch (err) {
      console.error("❌ Error in dailyReport:", err);
    }
  }
);

// ══════════════════════════════════════════════
// 🧪 دالة اختبار يدوي - للتجربة قبل الـ Deploy
// افتح: https://<region>-elkhotta.cloudfunctions.net/testReport
// ══════════════════════════════════════════════
exports.testReport = onRequest(
  { region: "europe-west1" },
  async (req, res) => {
    try {
      const report = await buildDailyReport();
      await sendTelegram(report);
      res.status(200).send("✅ تم إرسال التقرير بنجاح!\n\n" + report);
    } catch (err) {
      console.error(err);
      res.status(500).send("❌ خطأ: " + err.message);
    }
  }
);

// ══════════════════════════════════════════════
// 📋 بناء التقرير اليومي من Firebase
// ══════════════════════════════════════════════
async function buildDailyReport() {
  const now     = new Date();
  const todayMs = getStartOfDayEgypt(now);

  // جلب البيانات من Firebase بالتوازي
  const [studentsSnap, examSnap, activitySnap, securitySnap, auditSnap] =
    await Promise.all([
      db.ref("Students").once("value"),
      db.ref("ExamResults").once("value"),
      db.ref("ActivityLogs").orderByChild("timestamp").startAt(todayMs).once("value"),
      db.ref("SecurityAlerts").orderByChild("timestamp").startAt(todayMs).once("value"),
      db.ref("AuditLogs").orderByChild("timestamp").startAt(todayMs).once("value"),
    ]);

  // ── الطلاب ──────────────────────────────
  const studentsData = studentsSnap.val() || {};
  let totalStudents = 0;
  let newTodayStudents = 0;
  const newStudentNames = [];

  // Students قد تكون byCode / byUid / أو مباشرة
  const studentsList = extractStudents(studentsData);
  totalStudents = studentsList.length;

  studentsList.forEach((s) => {
    const reg = s.registeredAt || s.createdAt || s.joinedAt || 0;
    if (reg >= todayMs) {
      newTodayStudents++;
      if (s.name || s.studentName) {
        newStudentNames.push(s.name || s.studentName);
      }
    }
  });

  // ── الامتحانات ───────────────────────────
  const examsData = examSnap.val() || {};
  let totalExamsToday = 0;
  let totalScore = 0;
  let totalScoreCount = 0;
  let highestScore = 0;
  let highestScoreName = "";

  Object.values(examsData).forEach((entry) => {
    // ExamResults قد تكون بداخلها نتائج متعددة
    const results = typeof entry === "object" && !entry.score ? Object.values(entry) : [entry];
    results.forEach((r) => {
      const ts = r.timestamp || r.submittedAt || r.time || 0;
      if (ts >= todayMs) {
        totalExamsToday++;
        const score    = parseFloat(r.score || r.degree || 0);
        const maxScore = parseFloat(r.maxScore || r.total || r.outOf || 100);
        const pct      = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        totalScore += pct;
        totalScoreCount++;
        if (pct > highestScore) {
          highestScore     = pct;
          highestScoreName = r.studentName || r.name || r.studentCode || "مجهول";
        }
      }
    });
  });

  const avgScore = totalScoreCount > 0 ? Math.round(totalScore / totalScoreCount) : 0;

  // ── النشاط اليومي ───────────────────────
  const activityData = activitySnap.val() || {};
  const activityCount = Object.keys(activityData).length;

  // ── تنبيهات الأمان ───────────────────────
  const securityData  = securitySnap.val() || {};
  const securityCount = Object.keys(securityData).length;

  // ── سجلات المراجعة ───────────────────────
  const auditData  = auditSnap.val() || {};
  const auditCount = Object.keys(auditData).length;

  // ══════════════════════════════════════════
  // 📝 تجميع رسالة التقرير
  // ══════════════════════════════════════════
  const dateStr = now.toLocaleDateString("ar-EG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "Africa/Cairo",
  });
  const timeStr = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo",
  });

  let msg = "";
  msg += `📊 *تقرير منصة الخطة اليومي*\n`;
  msg += `🗓 ${dateStr}\n`;
  msg += `🕒 تم الإرسال: ${timeStr}\n`;
  msg += `${"─".repeat(30)}\n\n`;

  // الطلاب
  msg += `👥 *الطلاب*\n`;
  msg += `• إجمالي الطلاب المسجلين: *${totalStudents.toLocaleString("ar-EG")}* طالب\n`;
  msg += `• طلاب جدد اليوم: *${newTodayStudents}*\n`;
  if (newStudentNames.length > 0) {
    const namesPreview = newStudentNames.slice(0, 5).join("، ");
    msg += `  ↳ ${namesPreview}${newStudentNames.length > 5 ? ` و${newStudentNames.length - 5} آخرين` : ""}\n`;
  }
  msg += "\n";

  // الامتحانات
  msg += `📝 *الامتحانات اليوم*\n`;
  msg += `• عدد حلول الامتحانات: *${totalExamsToday}*\n`;
  if (totalScoreCount > 0) {
    msg += `• متوسط الدرجات: *${avgScore}%*\n`;
    msg += `• أعلى درجة: *${highestScore}%* ← ${highestScoreName} 🏆\n`;
  } else {
    msg += `• لا توجد امتحانات اليوم\n`;
  }
  msg += "\n";

  // النشاط
  msg += `⚡ *النشاط العام*\n`;
  msg += `• أحداث النشاط اليوم: *${activityCount}*\n`;
  msg += `• سجلات المراجعة: *${auditCount}*\n`;
  msg += "\n";

  // الأمان
  if (securityCount > 0) {
    msg += `⚠️ *تنبيهات أمنية اليوم: ${securityCount}*\n`;
    msg += `↳ يرجى مراجعة لوحة الأمان\n\n`;
  } else {
    msg += `🛡️ *الأمان: لا توجد تهديدات اليوم* ✅\n\n`;
  }

  msg += `${"─".repeat(30)}\n`;
  msg += `🚀 منصة الخطة | ELKHETA PRO 2027`;

  return msg;
}

// ══════════════════════════════════════════════
// 📤 إرسال رسالة على Telegram
// ══════════════════════════════════════════════
async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id:    TELEGRAM_CHAT_ID,
    text:       text,
    parse_mode: "Markdown",
  };

  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API Error: ${JSON.stringify(data)}`);
  }
  return data;
}

// ══════════════════════════════════════════════
// 🛠 دوال مساعدة
// ══════════════════════════════════════════════

/** بداية اليوم بتوقيت القاهرة بالمللي ثانية */
function getStartOfDayEgypt(date) {
  const egypt = new Date(
    date.toLocaleString("en-US", { timeZone: "Africa/Cairo" })
  );
  egypt.setHours(0, 0, 0, 0);
  return egypt.getTime();
}

/** استخراج قائمة الطلاب بغض النظر عن شكل التخزين في Firebase */
function extractStudents(data) {
  if (!data || typeof data !== "object") return [];

  // لو فيه byCode أو byUid
  if (data.byCode || data.byUid) {
    const fromCode = data.byCode ? Object.values(data.byCode) : [];
    const fromUid  = data.byUid  ? Object.values(data.byUid)  : [];
    // دمج وإزالة التكرار عبر studentCode
    const map = new Map();
    [...fromCode, ...fromUid].forEach((s) => {
      if (s && s.studentCode) map.set(s.studentCode, s);
      else if (s) map.set(Math.random(), s);
    });
    return Array.from(map.values());
  }

  // مباشر
  return Object.values(data).filter((v) => v && typeof v === "object");
}
