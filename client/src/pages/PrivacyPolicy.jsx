import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import SimpleFooter from '../components/SimpleFooter';
import './PrivacyPolicy.css';

// Son güncelleme tarihi — değiştirirken burayı güncelle
const SON_GUNCELLEME = '18 Mayıs 2026';

const BOLUMLER = [
  {
    baslik: '1. Giriş',
    icerik: `MasalMatik olarak kullanıcılarımızın gizliliğini önemsiyoruz. Bu politika, hizmetimizi kullanırken hangi kişisel verileri topladığımızı, bu verileri nasıl kullandığımızı ve haklarınızı açıklamaktadır.

MasalMatik, ebeveynler, veliler ve eğitimcilerin çocuklar için kişiselleştirilmiş masallar oluşturmasına olanak tanıyan bir yapay zekâ destekli hikaye platformudur. Bu politika, masalmatik.com adresinden erişilen hizmetimiz için geçerlidir.`,
  },
  {
    baslik: '2. Topladığımız Bilgiler',
    icerik: `**Hesap Bilgileri**
Kayıt sırasında kullanıcı adı, e-posta adresi ve şifrenizi toplarız. Şifreler hiçbir zaman düz metin olarak saklanmaz; güvenli bir hash algoritmasıyla (bcrypt) şifrelenerek veritabanına kaydedilir.

**İçerik Bilgileri**
Oluşturduğunuz hikayeler, seçtiğiniz karakter isimleri (önceden belirlenmiş seçeneklerden), yaş aralığı, mekan ve dil tercihleri ve varsa özel hikaye yönlendirmeniz (maksimum 500 karakter) sistemimizde saklanır. Bu veriler size ait hikaye kitaplığınızı oluşturmak için kullanılır.

**Teknik Bilgiler**
Hizmetin işleyişini iyileştirmek amacıyla IP adresi, tarayıcı türü ve işletim sistemi bilgileri gibi standart teknik veriler toplanabilir. Bu veriler sizi kişisel olarak tanımlamak için kullanılmaz.

**Bildirim Tercihleri**
Hangi e-posta bildirimlerini almak istediğinizi ayarlar sayfasından yönetebilirsiniz. Bu tercihler veritabanımızda saklanır.`,
  },
  {
    baslik: '3. Bilgileri Nasıl Kullanıyoruz',
    icerik: `Topladığımız bilgileri yalnızca aşağıdaki amaçlar için kullanırız:

• **Hesap yönetimi:** Giriş, şifre değişikliği, hesap silme gibi işlemleri gerçekleştirmek.
• **Hizmet sunumu:** Hikaye oluşturma isteğinizi işlemek. Hikaye üretimi için içerik bilgileriniz Amazon Bedrock API'sine anonim olarak iletilir (bkz. Bölüm 4).
• **E-posta bildirimleri:** Şifre sıfırlama, güvenlik uyarıları ve tercih ettiğiniz bildirim türleri için mail gönderilir. Güvenlik e-postaları (şifre değişikliği vb.) bildirim tercihlerinizden bağımsız olarak her zaman gönderilir.
• **Güvenlik ve hata ayıklama:** Olası güvenlik ihlallerini tespit etmek ve hizmet kalitesini korumak.

Verilerinizi üçüncü taraflara satmaz, kiralamaz veya ticari amaçla paylaşmayız.`,
  },
  {
    baslik: '4. Üçüncü Taraf Hizmetler',
    icerik: `**Amazon Bedrock (Yapay Zekâ Hikaye Üretimi)**
Hikayeler Amazon Bedrock platformundaki yapay zekâ modeli aracılığıyla oluşturulmaktadır. Bedrock'a iletilen veri yalnızca hikayenin içeriğiyle ilgili parametrelerdir (karakter adı, yaş, mekan, dil). Hesap bilgileriniz (e-posta, kimlik) Bedrock'a asla iletilmez. Amazon'un gizlilik politikası için: https://aws.amazon.com/privacy/

**Gmail SMTP (E-posta Gönderimi)**
Bildirimleri ve güvenlik e-postalarını göndermek için Gmail SMTP altyapısı kullanılmaktadır. Google'ın gizlilik politikası için: https://policies.google.com/privacy

**MongoDB Atlas (Veritabanı)**
Kullanıcı ve hikaye verileri MongoDB Atlas bulut veritabanında saklanmaktadır. MongoDB'nin gizlilik politikası için: https://www.mongodb.com/legal/privacy-policy`,
  },
  {
    baslik: '5. Çocuk Gizliliği',
    icerik: `MasalMatik çocuklar için içerik üretir; ancak hesap sahipleri yetişkinlerdir (ebeveynler, veliler, eğitimciler). Platform, 13 yaşın altındaki kullanıcılardan doğrudan hesap oluşturma veya kişisel veri toplama işlemi yapmaz.

Hikaye oluşturma sırasında seçilen karakter isimleri, önceden belirlenmiş bir listeden seçilir ve hikayenin bir parçası olarak veritabanında saklanır. Kullanıcının girdiği özel yönlendirme metni (isteğe bağlı, maks. 500 karakter) da hikayeyle birlikte saklanır. Bu metinlerde çocuğun gerçek soyadı, okul adı, adres gibi hassas kişisel bilgileri paylaşmamanızı öneririz.

Çocuğunuzun bilgilerinin silinmesini istiyorsanız hesabınızı silerek tüm hikayelerinizi ve ilişkili verileri kalıcı olarak kaldırabilirsiniz.`,
  },
  {
    baslik: '6. Veri Saklama ve Silme',
    icerik: `**Hesap Verileri**
Hesabınız aktif olduğu sürece verileriniz sistemde saklanır.

**Hesap Silme**
Hesabınızı sildiğinizde, tüm kişisel bilgileriniz (kullanıcı adı, e-posta, şifre) kalıcı olarak silinir. Herkese açık hikayeleriniz için iki seçenek sunulur:
• **Hikayeleri sil:** Tüm hikayeler kalıcı olarak kaldırılır.
• **Anonim bırak:** Hikayeler platformda kalır, ancak sizinle bağlantısı tamamen kesilir ve adınız hiçbir şekilde görünmez.

**Güvenlik Günlükleri**
Güvenlik amacıyla tutulan sistem günlükleri en fazla 90 gün saklanır ve ardından silinir.`,
  },
  {
    baslik: '7. Kullanıcı Hakları',
    icerik: `Kişisel verileriniz üzerinde aşağıdaki haklara sahipsiniz:

• **Erişim hakkı:** Profil sayfasından hesap bilgilerinizi görüntüleyebilirsiniz.
• **Düzeltme hakkı:** Kullanıcı adı ve bildirim tercihlerinizi ayarlar sayfasından güncelleyebilirsiniz.
• **Silme hakkı:** Hesabınızı kalıcı olarak silebilirsiniz (Profil → Hesabı Yönet → Hesabımı Sil).
• **E-posta tercihlerini yönetme:** Hangi bildirimleri alacağınızı Profil sayfasından kontrol edebilirsiniz.

**KVKK (Kişisel Verilerin Korunması Kanunu)**
Türkiye'deki kullanıcılar için 6698 sayılı KVKK kapsamındaki haklarınız geçerlidir. Veri sorumlusu olarak gizlilik konularındaki başvurularınızı aşağıdaki iletişim adresine iletebilirsiniz.

**GDPR (Genel Veri Koruma Tüzüğü)**
Avrupa Birliği'ndeki kullanıcılar için GDPR kapsamındaki haklarınız (erişim, taşınabilirlik, itiraz, kısıtlama) geçerlidir. Taleplerini aşağıdaki iletişim adresiyle iletebilirsiniz.`,
  },
  {
    baslik: '8. Çerezler (Cookies)',
    icerik: `MasalMatik, oturum yönetimi için JWT (JSON Web Token) tabanlı kimlik doğrulama kullanmaktadır. Tarayıcı çerezleri yalnızca oturum devamlılığını sağlamak için kullanılır.

• **Oturum çerezi:** Giriş durumunuzu korumak için kullanılır.
• **Tema ve dil tercihleri:** Tarayıcınızda yerel depolama (localStorage) aracılığıyla saklanır.
• **Reklam çerezi kullanılmaz:** MasalMatik'te herhangi bir reklam ağı veya izleme çerezi bulunmamaktadır.`,
  },
  {
    baslik: '9. Değişiklikler',
    icerik: `Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler yapıldığında kayıtlı e-posta adresinize bildirim göndeririz. Politikanın güncel sürümü her zaman bu sayfada yayımlanır.

Hizmeti kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.`,
  },
  {
    baslik: '10. İletişim',
    icerik: `Gizlilik politikamız veya kişisel verilerinizle ilgili sorularınız için bizimle iletişime geçebilirsiniz:

📧 E-posta: selinayturksal@gmail.com

Mesajınıza "Gizlilik" konusunu eklemenizi öneririz. En geç 48 saat içinde yanıt veririz.`,
  },
];

export default function PrivacyPolicy() {
  const { lang } = useLang();
  const tr = lang === 'tr';

  return (
    <div className="pp-page">
      <div className="pp-container">


        <div className="pp-header">
          <h1 className="pp-title">
            🔒 {tr ? 'Gizlilik Politikası' : 'Privacy Policy'}
          </h1>
          <p className="pp-date">
            {tr ? `Son güncelleme: ${SON_GUNCELLEME}` : `Last updated: ${SON_GUNCELLEME}`}
          </p>
          <p className="pp-intro">
            {tr
              ? 'MasalMatik olarak verilerinizin güvenliğini ve gizliliğini ciddiye alıyoruz. Bu sayfa, hangi verileri topladığımızı ve bunları nasıl kullandığımızı şeffaf biçimde açıklamaktadır.'
              : 'At MasalMatik, we take the security and privacy of your data seriously. This page transparently explains what data we collect and how we use it.'}
          </p>
        </div>

        <div className="pp-toc">
          <h3>{tr ? 'İçindekiler' : 'Table of Contents'}</h3>
          <ul>
            {BOLUMLER.map((b, i) => (
              <li key={i}>
                <a href={`#bolum-${i}`}>{b.baslik}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="pp-sections">
          {BOLUMLER.map((b, i) => (
            <section key={i} id={`bolum-${i}`} className="pp-section">
              <h2 className="pp-section-title">{b.baslik}</h2>
              <div className="pp-section-body">
                {b.icerik.split('\n\n').map((paragraf, j) => {
                  // **Başlık** satırlarını kalın yap
                  if (paragraf.startsWith('**') && paragraf.split('\n')[0].endsWith('**')) {
                    const [baslikSatiri, ...geri] = paragraf.split('\n');
                    const baslikMetni = baslikSatiri.replace(/\*\*/g, '');
                    return (
                      <div key={j} className="pp-subsection">
                        <h3 className="pp-subsection-title">{baslikMetni}</h3>
                        {geri.length > 0 && <p>{geri.join('\n')}</p>}
                      </div>
                    );
                  }
                  // Madde listesi (• ile başlayan)
                  if (paragraf.includes('\n•') || paragraf.startsWith('•')) {
                    const satirlar = paragraf.split('\n');
                    return (
                      <ul key={j} className="pp-list">
                        {satirlar.map((satir, k) => {
                          const temiz = satir.replace(/^•\s*/, '');
                          const parca = temiz.split(/\*\*(.*?)\*\*/);
                          return (
                            <li key={k}>
                              {parca.map((p, l) =>
                                l % 2 === 1 ? <strong key={l}>{p}</strong> : p
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }
                  return <p key={j}>{paragraf}</p>;
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="pp-footer">
          <Link to="/" className="pp-back-link">← {tr ? 'Ana Sayfaya Dön' : 'Back to Home'}</Link>
          <p className="pp-footer-note">
            {tr
              ? 'Bu politika Türkçe olarak hazırlanmıştır. Çeviri farklılıkları durumunda Türkçe metin esas alınır.'
              : 'This policy is prepared in Turkish. In case of translation discrepancies, the Turkish text shall prevail.'}
          </p>
        </div>

      </div>

      <SimpleFooter />
    </div>
  );
}
