# 📖 MasalMatik

**TR** | [EN](#masalmatik-en)

Yapay zeka destekli, çocuklara özel kişiselleştirilmiş masal oluşturma platformu.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [API Referansı](#api-referansı)
- [Mail Sistemi](#mail-sistemi)

---

## Özellikler

- 🎨 **Kişiselleştirilmiş Masallar** — Karakter, mekan, yaş grubu ve süre seçerek özgün masallar oluştur
- 🌍 **İki Dil Desteği** — Türkçe ve İngilizce masal üretimi
- 📚 **Kitap Deneyimi** — Sayfa çevirme animasyonu ve ses efektleriyle interaktif okuma
- 🌐 **Topluluk** — Masalları paylaş, keşfet ve beğen
- 📊 **Dashboard** — Kişisel istatistikler ve grafikler
- 🔔 **Mail Bildirimleri** — Hoş geldin, şifre sıfırlama, beğeni bildirimleri
- 🌙 **Koyu / Açık Tema** — Tam sistem teması desteği

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React 18, React Router v6, Framer Motion, Recharts, Howler.js |
| **Backend** | Node.js, Express.js |
| **Veritabanı** | MongoDB (Mongoose) |
| **AI** | Amazon Bedrock — `eu.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| **Mail** | Nodemailer (Gmail SMTP) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Stil** | CSS Variables, Tailwind CSS (utilities) |

---

## Proje Yapısı

```
StoryGenie/
├── client/                      # React uygulaması (CRA)
│   └── src/
│       ├── components/          # Navbar, BookViewer, StarField, ...
│       ├── context/             # AuthContext, LangContext, ThemeContext
│       ├── pages/               # Her route için ayrı sayfa
│       │   ├── LandingPage      # Misafir ana sayfası
│       │   ├── CreateStory      # Masal oluşturma formu
│       │   ├── StoryView        # Oluşturulan masalı görüntüleme
│       │   ├── StoryReader      # Kayıtlı masalı okuma (kitap arayüzü)
│       │   ├── Explore          # Topluluk masalları
│       │   ├── MyStories        # Kullanıcının kendi masalları
│       │   ├── Dashboard        # İstatistik paneli
│       │   ├── Settings         # Profil, şifre, bildirim tercihleri
│       │   ├── ForgotPassword   # Şifremi unuttum
│       │   └── ResetPassword    # Şifre sıfırlama (token ile)
│       └── services/api.js      # Axios instance
│
└── server/                      # Express API
    ├── routes/
    │   ├── auth.js              # Kayıt, giriş, profil, şifre
    │   ├── stories.js           # Masal CRUD, beğeni, puanlama
    │   ├── ai.js                # Bedrock API entegrasyonu
    │   └── users.js             # Bildirim tercihleri
    ├── models/
    │   ├── User.js              # Kullanıcı şeması
    │   └── Story.js             # Masal şeması
    ├── middleware/auth.js        # JWT protect middleware
    ├── services/mailService.js   # Nodemailer mail fonksiyonları
    └── templates/emails/        # HTML mail şablonları
        ├── welcome.html
        ├── password-reset.html
        ├── password-changed.html
        └── story-liked.html
```

---

## Kurulum

### Gereksinimler

- Node.js ≥ 18
- MongoDB (Atlas veya yerel)
- AWS hesabı (Amazon Bedrock erişimi, `eu-central-1` bölgesi)
- Gmail hesabı (App Password ile SMTP)

### 1. Repoyu Klonla

```bash
git clone <repo-url>
cd StoryGenie
```

### 2. Ortam Değişkenlerini Ayarla

```bash
cp .env.example server/.env
# server/.env dosyasını düzenle (aşağıdaki tabloya bak)
```

### 3. Sunucu Bağımlılıklarını Kur

```bash
cd server
npm install
```

### 4. İstemci Bağımlılıklarını Kur

```bash
cd ../client
npm install
```

### 5. Geliştirme Sunucularını Başlat

İki ayrı terminal:

```bash
# Terminal 1 — Backend (port 5001)
cd server && npm run dev

# Terminal 2 — Frontend (port 3000)
cd client && npm start
```

Uygulama: `http://localhost:3000`

---

## Ortam Değişkenleri

`server/.env` dosyasında aşağıdaki değişkenleri tanımla:

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `PORT` | Sunucu portu | `5001` |
| `CLIENT_URL` | Frontend adresi | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB bağlantı dizisi | `mongodb+srv://...` |
| `JWT_SECRET` | JWT imzalama anahtarı | Rastgele uzun string |
| `SMTP_HOST` | SMTP sunucusu | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP portu | `587` |
| `SMTP_USER` | Gmail adresi | `ornek@gmail.com` |
| `SMTP_PASS` | Gmail App Password | 16 haneli uygulama şifresi |
| `MAIL_FROM` | Gönderen adı ve adresi | `"MasalMatik <ornek@gmail.com>"` |
| `APP_URL` | Uygulama genel adresi | `http://localhost:3000` |
| `AWS_REGION` | Bedrock bölgesi | `eu-central-1` |
| `AWS_ACCESS_KEY_ID` | AWS erişim anahtarı | — |
| `AWS_SECRET_ACCESS_KEY` | AWS gizli anahtar | — |

> **Gmail App Password:** Google Hesabı → Güvenlik → 2 Adımlı Doğrulama → Uygulama Şifreleri

---

## API Referansı

### Auth — `/api/auth`

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/register` | Yeni kullanıcı kaydı | — |
| POST | `/login` | Giriş yap | — |
| GET | `/me` | Oturumdaki kullanıcı | ✓ |
| PUT | `/profile` | Profil güncelle | ✓ |
| PUT | `/change-password` | Şifre değiştir | ✓ |
| POST | `/forgot-password` | Sıfırlama maili gönder | — |
| POST | `/reset-password/:token` | Yeni şifre belirle | — |
| PUT | `/avatar` | Emoji avatar güncelle | ✓ |
| POST | `/avatar-upload` | Fotoğraf yükle | ✓ |
| DELETE | `/account` | Hesabı sil | ✓ |
| POST | `/logout` | Çıkış yap | ✓ |

### Masallar — `/api/stories`

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| GET | `/my` | Kullanıcının masalları | ✓ |
| GET | `/explore` | Herkese açık masallar | — |
| GET | `/dashboard` | İstatistik verileri | ✓ |
| GET | `/today` | Bugünün masalı | ✓ |
| GET | `/:id` | Tek masal | — |
| POST | `/` | Yeni masal kaydet | ✓ |
| PATCH | `/:id/publish` | Paylaşım durumu değiştir | ✓ |
| PATCH | `/:id/rating` | Kişisel puan ver | ✓ |
| POST | `/:id/like` | Beğen | ✓ |
| POST | `/:id/community-rating` | Topluluk puanı ver | ✓ |
| DELETE | `/:id` | Masalı sil | ✓ |

### AI — `/api/ai`

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/generate` | Amazon Bedrock ile masal üret | ✓ |

### Kullanıcı Tercihleri — `/api/users`

| Metot | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| GET | `/preferences` | Bildirim tercihlerini getir | ✓ |
| PUT | `/preferences` | Bildirim tercihlerini güncelle | ✓ |

---

## Mail Sistemi

`server/services/mailService.js` üzerinden merkezi olarak yönetilir.

| Fonksiyon | Tetikleyici | Tercihten bağımsız mı? |
|-----------|-------------|------------------------|
| `sendWelcomeMail` | Kayıt başarılı | Evet (1 kez) |
| `sendPasswordResetMail` | Şifremi unuttum formu | Evet (güvenlik) |
| `sendPasswordChangedMail` | Şifre değiştirildi | Evet (güvenlik) |
| `sendStoryLikedMail` | Hikaye beğenildi | Hayır (`notifyOnLike`) |

### SMTP Bağlantısını Test Et

```bash
cd server
node -e "
require('dotenv').config();
const { sendTestMail } = require('./services/mailService');
sendTestMail('senin@gmail.com').then(ok => console.log(ok ? '✅ Başarılı' : '❌ Hata'));
"
```

---

---

# MasalMatik (EN)

AI-powered personalized story platform for children.

## Features

- 🎨 **Personalized Stories** — Choose characters, settings, age group and duration
- 🌍 **Bilingual** — Turkish and English story generation
- 📚 **Book Experience** — Page-flip animations and sound effects
- 🌐 **Community** — Share, discover and like stories
- 📊 **Dashboard** — Personal stats and charts
- 🔔 **Email Notifications** — Welcome, password reset, like alerts
- 🌙 **Dark / Light Theme** — Full theme support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Framer Motion, Recharts, Howler.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **AI** | Amazon Bedrock — `eu.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| **Mail** | Nodemailer (Gmail SMTP) |
| **Auth** | JWT, bcryptjs |
| **Styling** | CSS Variables, Tailwind CSS (utilities) |

## Setup

### Prerequisites

- Node.js ≥ 18
- MongoDB (Atlas or local)
- AWS account (Amazon Bedrock access, `eu-central-1` region)
- Gmail account (with App Password for SMTP)

### Installation

```bash
# Clone repo
git clone <repo-url>
cd StoryGenie

# Copy and fill env file
cp .env.example server/.env

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### Run

```bash
# Terminal 1 — Backend (port 5001)
cd server && npm run dev

# Terminal 2 — Frontend (port 3000)
cd client && npm start
```

App runs at `http://localhost:3000`

## Environment Variables

See the Turkish section above for the full variable table — same variables apply.

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords

## Mail System

Centrally managed via `server/services/mailService.js`.

| Function | Trigger | Respects user prefs? |
|----------|---------|----------------------|
| `sendWelcomeMail` | Successful registration | No (sent once) |
| `sendPasswordResetMail` | Forgot password form | No (security) |
| `sendPasswordChangedMail` | Password changed | No (security) |
| `sendStoryLikedMail` | Story liked | Yes (`notifyOnLike`) |
