import React, { useState } from 'react';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import SimpleFooter from '../components/SimpleFooter';
import './ContactPage.css';

export default function ContactPage() {
  const { lang } = useLang();
  const tr = lang === 'tr';

  const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending]   = useState(false);
  const [msg, setMsg]           = useState({ text: '', ok: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMsg({ text: '', ok: true });
    try {
      await api.post('/contact', form);
      setMsg({
        text: tr
          ? 'Mesajınız iletildi! En kısa sürede yanıt vereceğiz.'
          : "Your message has been sent! We'll get back to you soon.",
        ok: true,
      });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || (tr ? 'Bir hata oluştu. Lütfen tekrar deneyin.' : 'Something went wrong. Please try again.'),
        ok: false,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-container container">

        <div className="cp-header">
          <h1 className="cp-title">📬 {tr ? 'Bize Ulaşın' : 'Contact Us'}</h1>
          <p className="cp-subtitle">
            {tr
              ? 'Sorularınız, önerileriniz veya geri bildirimleriniz için bize yazın.'
              : 'Write to us with your questions, suggestions or feedback.'}
          </p>
        </div>

        <div className="cp-grid">

          {/* Sol — İletişim bilgileri */}
          <div className="cp-info">
            <div className="cp-info-item">
              <span className="cp-icon">📧</span>
              <div>
                <div className="cp-info-label">{tr ? 'E-posta' : 'Email'}</div>
                <a href="mailto:selinayturksal@gmail.com" className="cp-info-val">
                  selinayturksal@gmail.com
                </a>
              </div>
            </div>
            <div className="cp-info-item">
              <span className="cp-icon">💬</span>
              <div>
                <div className="cp-info-label">{tr ? 'Geri Bildirim' : 'Feedback'}</div>
                <div className="cp-info-val">
                  {tr ? 'Görüş ve önerileriniz bizim için değerli.' : 'Your thoughts and suggestions matter to us.'}
                </div>
              </div>
            </div>
            <div className="cp-info-item">
              <span className="cp-icon">🕐</span>
              <div>
                <div className="cp-info-label">{tr ? 'Yanıt Süresi' : 'Response Time'}</div>
                <div className="cp-info-val">
                  {tr ? 'Genellikle 24-48 saat içinde yanıt veriyoruz.' : 'We usually respond within 24-48 hours.'}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ — Form */}
          <form className="cp-form" onSubmit={handleSubmit}>
            <div className="cp-row">
              <div className="cp-field">
                <label>{tr ? 'Ad Soyad' : 'Full Name'}</label>
                <input
                  type="text"
                  placeholder={tr ? 'Adınız Soyadınız' : 'Your Name'}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="cp-field">
                <label>{tr ? 'E-posta' : 'Email'}</label>
                <input
                  type="email"
                  placeholder={tr ? 'ornek@mail.com' : 'example@mail.com'}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="cp-field">
              <label>{tr ? 'Konu' : 'Subject'}</label>
              <input
                type="text"
                placeholder={tr ? 'Mesajınızın konusu' : 'Subject of your message'}
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                required
              />
            </div>
            <div className="cp-field">
              <label>{tr ? 'Mesajınız' : 'Your Message'}</label>
              <textarea
                rows={6}
                placeholder={tr ? 'Mesajınızı buraya yazın...' : 'Write your message here...'}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                required
              />
            </div>
            {msg.text && (
              <p className={`cp-msg ${msg.ok ? 'cp-msg--ok' : 'cp-msg--err'}`}>
                {msg.text}
              </p>
            )}
            <button type="submit" className="cp-submit" disabled={sending}>
              {sending
                ? (tr ? 'Gönderiliyor...' : 'Sending...')
                : (tr ? '📨 Gönder' : '📨 Send')}
            </button>
          </form>

        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
