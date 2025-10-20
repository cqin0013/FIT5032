/**
 * FIT5032 A3 - Cloud Functions (Gen2 + Express)
 * - countBooks (GET /)           : Firestore 统计
 * - sendMail  (POST /)           : SMTP 邮件（可用 Gmail/企业邮）
 * - web (Express)                : 公共 API + 群发邮件
 *
 * 环境变量（推荐 .env 或 Functions Config）：
 *  SENDGRID_API_KEY?  （可选，用于 bulk 邮件）
 *  MAIL_FROM?         （可选，bulk 发件地址）
 *  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS（用于 sendMail）
 *  MAIL_TO_DEFAULT?   （sendMail 的默认收件人）
 *  SUBJECT_PREFIX?    （sendMail 的标题前缀）
 */

const { onRequest } = require("firebase-functions/v2/https"); // Gen2
const functions = require("firebase-functions");               // v1 包装 Express
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

// --- Firebase init (顺序要在 firestore() 之前) ---
admin.initializeApp();
const db = admin.firestore();

// --- Common helpers ---
function cfg(path, fallback = undefined) {
  // 优先取 process.env；其次尝试 functions.config()
  const envKey = path.toUpperCase().replace(/\./g, "_");
  if (process.env[envKey] != null) return process.env[envKey];

  try {
    const c = functions.config ? functions.config() : {};
    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), c) ?? fallback;
  } catch {
    return fallback;
  }
}

/* =========================================================================
 * 1) Gen2 HTTP: /countBooks
 * ========================================================================= */
exports.countBooks = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "GET") return res.status(405).send("Method Not Allowed");
    const snap = await db.collection("books").get();
    return res.status(200).json({ count: snap.size });
  } catch (err) {
    console.error("Error counting books:", err);
    return res.status(500).send("Error counting books");
  }
});

/* =========================================================================
 * 2) Gen2 HTTP: /sendMail  (SMTP via nodemailer)
 * ========================================================================= */
const SMTP_HOST = cfg("smtp.host", "smtp.gmail.com");
const SMTP_PORT = Number(cfg("smtp.port", 587));
const SMTP_USER = cfg("smtp.user");
const SMTP_PASS = cfg("smtp.pass");
const MAIL_TO_DEFAULT = cfg("mail.to", "");
const SUBJECT_PREFIX = cfg("mail.subject_prefix", "[Feedback]");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465=SSL, 587=STARTTLS
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  tls: { rejectUnauthorized: false }
});

exports.sendMail = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error("SMTP not configured", { host: SMTP_HOST, user: SMTP_USER, hasPass: !!SMTP_PASS });
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
        ? attachments.map(a => ({
            filename: a.filename,
            content: Buffer.from(a.content, "base64")
          }))
        : undefined
    };

    await transporter.sendMail(mail);
    return res.status(200).send("OK");
  } catch (e) {
    console.error("[sendMail] error:", e?.stack || e?.message || e);
    return res.status(500).send(e?.message || "Failed to send");
  }
});

/* =========================================================================
 * 3) Express app (v1 wrapper) - Public APIs + Bulk email
 * ========================================================================= */
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Public APIs
app.get("/api/resources", async (_req, res) => {
  const snap = await db.collection("books").orderBy("createdAt", "desc").limit(50).get();
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json(rows);
});

app.get("/api/resources/count", async (_req, res) => {
  try {
    const agg = await db.collection("books").count().get();
    res.json({ count: agg.data().count || 0 });
  } catch {
    // 旧项目 SDK 不支持 count() 时降级
    const snap = await db.collection("books").get();
    res.json({ count: snap.size });
  }
});

// Bulk email (SendGrid)
const SGK = process.env.SENDGRID_API_KEY || "";
if (SGK) sgMail.setApiKey(SGK);

app.post("/sendBulkEmail", async (req, res) => {
  try {
    const { recipients = [], subject = "", body = "" } = req.body || {};
    if (!Array.isArray(recipients) || !recipients.length) return res.status(400).send("No recipients");
    if (!SGK) return res.status(500).send("Missing SENDGRID_API_KEY");

    const msg = {
      to: recipients,
      from: process.env.MAIL_FROM || "no-reply@youth-mh.example",
      subject,
      text: body,
      html: `<pre>${String(body).replace(/[<>&]/g, x => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[x]) )}</pre>`
    };
    await sgMail.sendMultiple(msg);
    res.json({ ok: true, sent: recipients.length });
  } catch (err) {
    console.error("[sendBulkEmail] error:", err?.response?.body || err);
    res.status(500).send("Failed to send");
  }
});

// v1 wrapper for Express app (保持和前端示例一致的 /web 基地址)
exports.web = functions.https.onRequest(app);
