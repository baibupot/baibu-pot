# 📧 BAİBÜ Psikoloji Kulübü - Email Template'leri

Bu klasörde BAİBÜ Psikoloji Kulübü admin paneli için özel tasarlanmış, profesyonel email template'leri bulunmaktadır.

## 📁 Template Dosyaları

| Template | Dosya | Açıklama | Kullanım |
|----------|-------|----------|----------|
| **Hesap Onayı** | `confirm-signup.html` | Yeni kayıt olan kullanıcıların email adreslerini onaylaması için | ✅ Aktif (Supabase otomatik) |
| **Şifre Sıfırlama** | `reset-password.html` | Şifre sıfırlama talepleri için güvenlik odaklı template | ✅ Aktif (PasswordResetModal) |

## 🎨 Tasarım Özellikleri

- **Responsive Design**: Mobil ve masaüstü uyumlu
- **Modern Gradient**: Her template'in kendine özel renk paleti
- **Kulüp Kimliği**: BAİBÜ Psikoloji Kulübü branding'i
- **Emoji İkonlar**: Görsel çekicilik için ikon kullanımı
- **Güvenlik Vurgusu**: Güvenlik önerilerini içeren bilgi kutuları
- **Türkçe İçerik**: Tam Türkçe metin ve açıklamalar

## ⚙️ Supabase'de Kurulum

### 1. Supabase Dashboard'a Giriş
1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. Projenizi seçin
3. Sol menüden **Authentication** → **Email Templates**'e gidin

### 2. Template'leri Yükleme

Her template için aşağıdaki adımları izleyin:

#### 📋 Confirm Signup (Hesap Onayı)
```html
Template Type: Confirm signup
Subject: Hesabınızı Onaylayın - BAİBÜ Psikoloji Kulübü
Body: (confirm-signup.html içeriğini kopyalayın)
```

#### 🔑 Reset Password (Şifre Sıfırlama)
```html
Template Type: Reset Password
Subject: Şifre Sıfırlama - BAİBÜ Psikoloji Kulübü
Body: (reset-password.html içeriğini kopyalayın)
```

### 3. Template Değişkenleri

Supabase otomatik olarak aşağıdaki değişkenleri template'lere enjekte eder:

| Değişken | Açıklama |
|----------|----------|
| `{{ .ConfirmationURL }}` | Onay/işlem linki |
| `{{ .Email }}` | Kullanıcı email adresi |
| `{{ .Name }}` | Kullanıcı adı |
| `{{ .SiteURL }}` | Site ana URL'si |
| `{{ .Token }}` | Güvenlik token'i |

### 4. Site URL Ayarları

**Authentication** → **URL Configuration** bölümünde:

```
Site URL: https://yourdomain.com
Redirect URLs: 
- https://yourdomain.com/admin/login
- https://yourdomain.com/admin/reset-password
```

### 5. SMTP Ayarları (Opsiyonel)

Daha profesyonel görünüm için kendi SMTP sunucunuzu kullanabilirsiniz:

**Settings** → **API** → **SMTP Settings**:
```
SMTP Host: mail.yourdomain.com
SMTP Port: 587
SMTP User: noreply@yourdomain.com
SMTP Pass: your-password
From Address: noreply@yourdomain.com
From Name: BAİBÜ Psikoloji Kulübü
```

## 🎯 Özelleştirme

### Logo Değiştirme
Template'lerdeki emoji logoları (��, 🔒) yerine gerçek logo kullanmak isterseniz:

```html
<!-- Eski -->
<div class="logo">🧠</div>

<!-- Yeni -->
<div class="logo">
    <img src="https://yourdomain.com/logo.webp" alt="Logo" style="width: 60px; height: 60px;">
</div>
```

### Renk Teması Değiştirme
Her template'in kendine özel gradient renkleri vardır. Bunları kulüp renklerinize uygun değiştirebilirsiniz:

```css
/* Mevcut gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Özel renk */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Metin Güncelleme
Template'lerdeki metinleri kulübünüze özel güncelleyebilirsiniz:

- Kulüp adı ve üniversite bilgileri
- İletişim detayları
- Güvenlik uyarıları
- Yardım mesajları

## 🔧 Test Etme

Template'leri test etmek için:

1. Supabase Dashboard'da **Authentication** → **Users**'a gidin
2. Test email adresi ile kullanıcı oluşturun
3. Şifre sıfırlama işlemini test edin
4. Gönderilen email'leri kontrol edin

## 📱 Mobil Uyumluluk

Tüm template'ler responsive tasarıma sahiptir:
- **Masaüstü**: Tam genişlik, detaylı layout
- **Tablet**: Orta boyut, uyarlanmış margin'lar
- **Mobil**: Tek kolon, büyük butonlar

## 🛠️ Sorun Giderme

### Email Gelmiyorsa:
1. Spam klasörünü kontrol edin
2. SMTP ayarlarını doğrulayın
3. Supabase email limitlerini kontrol edin
4. DNS kayıtlarını (SPF, DKIM) kontrol edin

### Template Görünmüyorsa:
1. HTML sintaksını kontrol edin
2. Supabase'de kaydetme işlemini doğrulayın
3. Browser cache'ini temizleyin

### Link Çalışmıyorsa:
1. Site URL ayarlarını kontrol edin
2. Redirect URL'leri doğrulayın
3. Route tanımlarını kontrol edin (`/admin/login`, `/admin/reset-password`)

## 💡 İpuçları

1. **A/B Testing**: Farklı konu satırları deneyin
2. **Kişiselleştirme**: Kullanıcı adını daha çok kullanın
3. **Call-to-Action**: Buton metinlerini net tutun
4. **Güvenlik**: Güvenlik uyarılarını vurgulayın
5. **Branding**: Kulüp kimliğinizi güçlendirin

---

**📞 Destek**: Bu template'lerle ilgili sorularınız için admin@psikoljiklub.com adresine yazabilirsiniz.

**🔄 Güncelleme**: Template'ler düzenli olarak güncellenmektedir. Yeni sürümler için GitHub repository'yi takip edin. 