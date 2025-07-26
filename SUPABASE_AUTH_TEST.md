# 🔐 Supabase Auth İşlemleri Test Rehberi

## 📧 E-posta Değiştirme
- **Modal**: `ChangeEmailModal.tsx`
- **Metod**: `supabase.auth.updateUser({ email: newEmail }, { emailRedirectTo: ... })`
- **Redirect URL**: `${window.location.origin}/admin/login`
- **Status**: ✅ Düzeltildi

## 🔑 Şifre Unutma
- **Modal**: `PasswordResetModal.tsx`
- **Metod**: `supabase.auth.resetPasswordForEmail(email, { redirectTo: ... })`
- **Redirect URL**: `${window.location.origin}/admin/reset-password`
- **Status**: ✅ Doğru çalışıyor

## 🛡️ Şifre Değiştirme (Giriş Yapmış Kullanıcı)
- **Modal**: `ChangePasswordModal.tsx`
- **Metod**: `supabase.auth.updateUser({ password: newPassword })`
- **Redirect**: Yok (Modal içinde işlem)
- **Status**: ✅ Doğru çalışıyor

## 🔄 Şifre Sıfırlama (Reset Token ile)
- **Sayfa**: `AdminLogin.tsx` (resetMode=true)
- **Metod**: `supabase.auth.updateUser({ password: newPassword })`
- **Redirect**: Local navigation
- **Status**: ✅ Doğru çalışıyor

## 🚨 Supabase Dashboard Gereksinimleri

### URL Configuration
```
Site URL: http://localhost:8080 (development)
Site URL: https://yourdomain.com (production)

Redirect URLs:
- http://localhost:8080/admin/login
- http://localhost:8080/admin/reset-password
- https://yourdomain.com/admin/login
- https://yourdomain.com/admin/reset-password
```

### Email Templates
Tüm template'ler `{{ .ConfirmationURL }}` kullanıyor - otomatik oluşturuluyor.

## 🧪 Test Senaryoları

### 1. E-posta Değiştirme Testi
1. Admin paneline giriş yap
2. Profil/Ayarlar kısmından e-posta değiştir
3. Yeni e-posta adresine gelen linke tıkla
4. `http://localhost:8080/admin/login` adresine yönlenmeli
5. Başarı mesajı görmeli

### 2. Şifre Unutma Testi
1. Login sayfasında "Şifremi Unuttum" linke tıkla
2. E-posta adresini gir
3. Gelen e-postadaki linke tıkla
4. `http://localhost:8080/admin/reset-password` adresine yönlenmeli
5. Yeni şifre belirlemeli

### 3. Şifre Değiştirme Testi (Giriş Yapmış)
1. Dashboard'da şifre değiştir modalını aç
2. Mevcut ve yeni şifreyi gir
3. İşlem tamamlandıktan sonra otomatik çıkış yapılmalı
4. Login sayfasına yönlenmeli

## 🔧 Hata Giderme

### "requested path is invalid" Hatası
- Supabase Site URL'i kontrol et
- Redirect URLs listesini kontrol et
- Email template'lerde {{ .ConfirmationURL }} doğru kullanılıyor mu kontrol et

### E-posta Gelmiyor
- Spam klasörünü kontrol et
- SMTP ayarlarını kontrol et
- Supabase email limitlerini kontrol et

### Yanlış URL'ye Yönlendirme
- Site URL'in doğru domain'i içerdiğinden emin ol
- Development için `localhost:8080` kullan
- Production için gerçek domain kullan
