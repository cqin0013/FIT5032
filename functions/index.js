// functions/index.js
/**
 * FIT5032 A3 - Cloud Functions (2nd Gen)
 * - countBooks: GET / 统计 Firestore books 数量
 * - sendMail  : POST  发送邮件（Gmail/SendGrid SMTP）
 */
const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions"); // 用来读 functions.config()
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

admin.initializeApp();

/* -------------------------- countBooks (GET) -------------------------- */
exports.countBooks = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "GET") return res.status(405).send("Method Not Allowed");
      const snap = await admin.firestore().collection("books").get();
      return res.status(200).json({ count: snap.size });
    } catch (err) {
      console.error("Error counting books:", err);
      return res.status(500).send("Error counting books");
    }
  });
});

/* --------------------------- sendMail (POST) -------------------------- */
// 优先取 process.env（.env/.env.prod），否则回退 functions.config()
// 确保不会得到 undefined，避免 nodemailer 退回 localhost
function cfg(path, fallback = undefined) {
  const envKey = path.toUpperCase().replace(/\./g, "_"); // smtp.host -> SMTP_HOST
  if (process.env[envKey]) return process.env[envKey];
  try {
    const c = functions.config?.() || {};
    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), c) ?? fallback;
  } catch { return fallback; }
}

const SMTP_HOST = cfg("smtp.host", "smtp.gmail.com");
const SMTP_PORT = Number(cfg("smtp.port", 587)); // Gmail 推荐 587 STARTTLS
const SMTP_USER = cfg("smtp.user");
const SMTP_PASS = cfg("smtp.pass");
const MAIL_TO_DEFAULT = cfg("mail.to", "");
const SUBJECT_PREFIX = cfg("mail.subject_prefix", "[Feedback]");

// 打印关键配置（不打印密码），确认不是 localhost
console.log("[sendMail] resolved SMTP config:", {
  host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, hasPass: !!SMTP_PASS,
});

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,      // 465 走 SSL，587 走 STARTTLS
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  tls: { rejectUnauthorized: false }, // 避免某些环境证书链问题
});

exports.sendMail = onRequest((req, res) => {
  cors(req, res, async () => {
    // 处理预检
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).send("");
    }
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error("SMTP missing", { host: SMTP_HOST, user: SMTP_USER, hasPass: !!SMTP_PASS });
        return res.status(500).send("SMTP not configured");
      }

      const { to, subject, text, html, attachments } = req.body || {};
      if (!subject || !(text || html)) return res.status(400).send("Missing subject/text");

      const mail = {
        from: SMTP_USER,
        to: (to && String(to).trim()) || MAIL_TO_DEFAULT,
        subject: `${SUBJECT_PREFIX ? SUBJECT_PREFIX + " " : ""}${subject}`,
        text: text || undefined,
        html: html || undefined,
        attachments: Array.isArray(attachments)
          ? attachments.map(a => ({ filename: a.filename, content: Buffer.from(a.content, "base64") }))
          : undefined,
      };

      console.log("[sendMail] sending via", SMTP_HOST, "to", mail.to);
      await transporter.sendMail(mail);
      console.log("[sendMail] OK");
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(200).send("OK");
    } catch (e) {
      console.error("[sendMail] error:", e && (e.stack || e.message || e));
      return res.status(500).send(e?.message || "Failed to send");
    }
  });
});
