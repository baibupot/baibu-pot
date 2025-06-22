# 🗄️ Veritabanı Kurulumu

Bu klasörde BAİBÜ PÖT web sitesi için gerekli veritabanı şeması bulunmaktadır.

## 📋 Kurulum Adımları

### 1. Supabase Projesi Hazırlama
1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. Yeni proje oluşturun veya mevcut projenizi seçin
3. **SQL Editor** sekmesine gidin

### 2. Şema Kurulumu
1. `complete_schema.sql` dosyasının içeriğini kopyalayın
2. Supabase SQL Editor'e yapıştırın
3. **RUN** butonuna tıklayın
4. ✅ Başarılı mesajı: `"Schema kurulumu tamamlandı! Toplam tablo sayısı: XX"`

### 3. Admin Kullanıcı Oluşturma
1. Supabase Dashboard'da **Authentication** > **Users** sekmesine gidin
2. **Add user** ile admin kullanıcınızı oluşturun
3. Kullanıcının **User UID**'sini kopyalayın
4. SQL Editor'e geri dönün ve aşağıdaki komutu çalıştırın:

```sql
INSERT INTO public.user_roles (user_id, role, is_approved) 
VALUES ('BURAYA_USER_ID_YAPIŞTIRIN', 'baskan', true);
```

### 4. Bağlantı Bilgilerini Alma
1. **Settings** > **API** sekmesine gidin
2. Aşağıdaki bilgileri projenizde güncelleyin:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## 🔍 Kurulum Doğrulama

Kurulumun başarılı olduğunu doğrulamak için:

```sql
-- Tablolar oluştu mu?
SELECT count(*) as tablo_sayisi 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Admin kullanıcı eklendi mi?
SELECT * FROM debug_user_auth();

-- Test verileri eklendi mi?
SELECT count(*) as haber_sayisi FROM public.news;
```

## 📊 Tablo Listesi

Kurulum sonrası aşağıdaki tablolar oluşturulacak:

- ✅ `users` - Kullanıcı profilleri
- ✅ `user_roles` - Rol yönetimi  
- ✅ `news` - Haberler/duyurular
- ✅ `events` - Etkinlikler
- ✅ `magazine_issues` - Dergi sayıları
- ✅ `internships` - Staj ilanları
- ✅ `academic_documents` - Akademik belgeler
- ✅ `surveys` - Anketler
- ✅ `sponsors` - Sponsorlar
- ✅ `team_members` - Ekip üyeleri
- ✅ `contact_messages` - İletişim mesajları
- ✅ `comments` - Yorumlar
- ✅ `form_fields` - Dinamik form alanları
- ✅ `form_responses` - Form yanıtları

## 🔐 Güvenlik Özellikleri

- ✅ Row Level Security (RLS) aktif
- ✅ Rol bazlı erişim kontrolü
- ✅ Auth.users ile otomatik senkronizasyon
- ✅ CRUD işlem yetkilendirmeleri

## 🚨 Sorun Giderme

### Hata: "permission denied for schema public"
**Çözüm:** Supabase projesinde yeterli yetkiye sahip olduğunuzdan emin olun.

### Hata: "relation already exists"
**Çözüm:** Schema zaten varsa, dosyadaki `DROP SCHEMA IF EXISTS public CASCADE;` komutu çalışacaktır.

### Admin paneline erişemiyorum
**Çözüm:** User ID'sinin doğru olduğunu ve `user_roles` tablosunda `baskan` rolünün eklendiğini kontrol edin.

## 💡 İpuçları

1. **Test verileri:** Kurulum test verileri ile gelir, production'da bunları silebilirsiniz
2. **Debug fonksiyonu:** `SELECT * FROM debug_user_auth();` ile yetkileri kontrol edebilirsiniz
3. **Backup:** Kurulumdan önce mevcut veritabanınızın backup'ını alın

## 📞 Destek

Sorun yaşarsanız:
1. Supabase loglarını kontrol edin
2. SQL hatalarını debug fonksiyonu ile test edin
3. GitHub Issues'dan destek alın 