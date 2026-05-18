const express   = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const router = express.Router();

// ── Nodemailer transporter (mailService ile aynı config) ──
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /api/contact — İletişim formu gönderimi
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Ad Soyad zorunludur.').isLength({ max: 100 }),
    body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.').normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Konu zorunludur.').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Mesaj zorunludur.').isLength({ min: 10, max: 2000 }),
  ],
  async (req, res) => {
    const hatalar = validationResult(req);
    if (!hatalar.isEmpty()) {
      return res.status(400).json({ error: hatalar.array()[0].msg });
    }

    const { name, email, subject, message } = req.body;
    // Hedef adres: önce .env'den SUPPORT_EMAIL, yoksa MAIL_FROM
    const hedefMail = process.env.SUPPORT_EMAIL || process.env.MAIL_FROM;

    try {
      await transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      hedefMail,
        replyTo: email,
        subject: `[MasalMatik İletişim] ${subject}`,
        html: `
          <h2 style="color:#5b21b6;">Yeni İletişim Formu Mesajı</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;width:120px">Ad Soyad:</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">E-posta:</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold">Konu:</td><td style="padding:8px">${subject}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Mesaj:</td><td style="padding:8px;white-space:pre-wrap">${message}</td></tr>
          </table>
          <p style="color:#888;font-size:0.85rem;margin-top:24px">Gönderildiği tarih: ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}</p>
        `,
        text: `Ad: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\n${message}`,
      });
      res.json({ ok: true });
    } catch (err) {
      console.error('[Contact] İletişim formu maili gönderilemedi:', err.message);
      res.status(500).json({ error: 'Mail gönderilemedi. Lütfen daha sonra tekrar deneyin.' });
    }
  }
);

module.exports = router;
