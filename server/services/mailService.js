const nodemailer = require('nodemailer');
const fs         = require('fs');
const path       = require('path');

// ── Nodemailer transporter (Gmail SMTP) ──
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false, // 587 için false (STARTTLS), 465 için true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Şablon dosyasını oku ve placeholder'ları doldur ──
function fillTemplate(templateName, vars = {}) {
  const filePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
  let html = fs.readFileSync(filePath, 'utf8');
  Object.entries(vars).forEach(([key, val]) => {
    html = html.replaceAll(`{{${key}}}`, val ?? '');
  });
  return html;
}

// ── Hoş geldin maili ──
async function sendWelcomeMail(user) {
  try {
    const html = fillTemplate('welcome', {
      username: user.username,
      appUrl:   process.env.APP_URL,
    });
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      user.email,
      subject: `🌟 MasalMatik macerasına hoş geldin, ${user.username}!`,
      html,
      text: `Merhaba ${user.username}! MasalMatik'e hoş geldin. Hemen hikaye oluşturmaya başla: ${process.env.APP_URL}/create`,
    });
  } catch (err) {
    console.error('[MailService] Hoş geldin maili gönderilemedi:', err.message);
  }
}

// ── Şifre sıfırlama maili ──
async function sendPasswordResetMail(email, username, token) {
  try {
    const resetLink = `${process.env.APP_URL}/reset-password/${token}`;
    const html = fillTemplate('password-reset', { username, resetLink });
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email,
      subject: '🔐 MasalMatik şifre sıfırlama isteği',
      html,
      text: `Merhaba ${username}! Şifreni sıfırlamak için bu linke tıkla (1 saat geçerli): ${resetLink}`,
    });
  } catch (err) {
    console.error('[MailService] Şifre sıfırlama maili gönderilemedi:', err.message);
  }
}

// ── Şifre değiştirildi bildirim maili (güvenlik — her zaman gönderilir) ──
async function sendPasswordChangedMail(email, username) {
  try {
    const changedAt = new Date().toLocaleString('tr-TR', {
      timeZone:    'Europe/Istanbul',
      day:         '2-digit',
      month:       'long',
      year:        'numeric',
      hour:        '2-digit',
      minute:      '2-digit',
    });
    const html = fillTemplate('password-changed', { username, changedAt, appUrl: process.env.APP_URL });
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email,
      subject: '✅ MasalMatik şifreniz değiştirildi',
      html,
      text: `Merhaba ${username}! ${changedAt} tarihinde MasalMatik şifreniz değiştirildi. Bu işlemi sen yapmadıysan lütfen bize ulaş.`,
    });
  } catch (err) {
    console.error('[MailService] Şifre değişti maili gönderilemedi:', err.message);
  }
}

// ── Beğeni bildirim maili ──
async function sendStoryLikedMail({ ownerEmail, ownerUsername, storyTitle, storyId, likerName }) {
  try {
    const storyUrl = `${process.env.APP_URL}/story/${storyId}`;
    const html = fillTemplate('story-liked', {
      ownerUsername,
      likerName,
      storyTitle,
      storyUrl,
      appUrl: process.env.APP_URL,
    });
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      ownerEmail,
      subject: `💖 "${storyTitle}" hikayene yeni bir beğeni geldi!`,
      html,
      text: `Merhaba ${ownerUsername}! ${likerName} adlı kullanıcı "${storyTitle}" masalını beğendi. Görüntüle: ${storyUrl}`,
    });
  } catch (err) {
    console.error('[MailService] Beğeni bildirim maili gönderilemedi:', err.message);
  }
}

// ── Şifre değişikliği onay maili (güvenlik — her zaman gönderilir) ──
async function sendConfirmPasswordChangeMail(email, username, token) {
  try {
    const confirmLink = `${process.env.APP_URL}/confirm-password-change/${token}`;
    const html = fillTemplate('confirm-password-change', { username, confirmLink, appUrl: process.env.APP_URL });
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email,
      subject: '🔐 MasalMatik şifre değişikliği onayı',
      html,
      text: `Merhaba ${username}! Şifre değişikliğini onaylamak için bu linke tıkla (1 saat geçerli): ${confirmLink}`,
    });
  } catch (err) {
    console.error('[MailService] Şifre değişikliği onay maili gönderilemedi:', err.message);
  }
}

// ── Hesap silindi veda maili (her zaman gönderilir) ──
async function sendAccountDeletedMail(email, username, storyAction) {
  try {
    const storyMessage = storyAction === 'anonymize'
      ? 'Paylaştığın masallar platformda anonim olarak yaşamaya devam edecek. Adınla bağlantısı kalıcı olarak kesildi.'
      : 'Tüm masalların ve hesap verilerin kalıcı olarak silindi.';

    const html = fillTemplate('account-deleted', {
      username,
      storyMessage,
      appUrl: process.env.APP_URL,
    });
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email,
      subject: `👋 Tekrar bekleriz, ${username} — MasalMatik`,
      html,
      text: `Merhaba ${username}! MasalMatik hesabın silindi. ${storyMessage} Tekrar katılmak için: ${process.env.APP_URL}/register`,
    });
  } catch (err) {
    console.error('[MailService] Hesap silme maili gönderilemedi:', err.message);
  }
}

// ── Test maili (geliştirme ortamında kullanılır) ──
async function sendTestMail(toEmail) {
  try {
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      toEmail,
      subject: '🧪 MasalMatik Mail Testi',
      html:    '<h2>Mail servisi çalışıyor! ✅</h2><p>MasalMatik SMTP bağlantısı başarılı.</p>',
      text:    'Mail servisi çalışıyor! MasalMatik SMTP bağlantısı başarılı.',
    });
    console.log('[MailService] Test maili gönderildi:', toEmail);
    return true;
  } catch (err) {
    console.error('[MailService] Test maili gönderilemedi:', err.message);
    return false;
  }
}

module.exports = {
  sendWelcomeMail,
  sendPasswordResetMail,
  sendPasswordChangedMail,
  sendConfirmPasswordChangeMail,
  sendStoryLikedMail,
  sendAccountDeletedMail,
  sendTestMail,
};
