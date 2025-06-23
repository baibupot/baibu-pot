# BAİBÜ PÖT - Psikoloji Öğrencileri Topluluğu Web Sitesi

## 📖 Proje Hakkında

Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu (BAİBÜ PÖT) resmi web sitesidir. Bu platform, topluluğumuzun etkinliklerini, dergilerimizi, haberlerimizi ve daha fazlasını paylaşmak için oluşturulmuştur.

### 🎯 Ana Özellikler

- **📅 Etkinlikler:** Yaklaşan etkinlikler, atölyeler ve seminerler
- **📖 Flipbook Dergi Okuyucu:** "Psikolojiİbu" dergisinin tüm sayılarını sayfa çevirme efektleri ile okuma
- **📰 Haberler/Duyurular:** Güncel duyurular ve haberler
- **👥 Ekipler:** Topluluk ekiplerimiz ve çalışma alanları
- **📚 Akademik Belgeler:** Psikoloji alanında faydalı akademik kaynaklar
- **📞 İletişim:** Bizimle iletişime geçin

### 🗂️ GitHub Storage Sistemi

Bu proje **GitHub'ı ücretsiz file storage (bucket) olarak kullanır**. Tüm PDF dergileri, resimler ve dosyalar GitHub repository'sinde depolanır ve global CDN üzerinden hızlıca sunulur.

**Avantajları:**
- ✅ **%100 Ücretsiz** - GitHub'ın unlimited public storage
- ✅ **Global CDN** - Microsoft'un dünya çapındaki sunucuları
- ✅ **Version Control** - Dosya geçmişi ve yedekleme
- ✅ **CORS Problemi Yok** - Raw URL'ler direkt erişilebilir
- ✅ **Admin Panel Entegrasyonu** - Web arayüzü ile dosya yükleme

**📁 Storage Klasör Yapısı:**
```
baibu-pot-storage/
├── dergiler/           # PDF dergileri
│   ├── 2024/
│   │   ├── sayi-001/
│   │   │   ├── dergi-001.pdf
│   │   │   └── kapak-001.jpg
│   │   └── sayi-002/
│   └── 2025/
├── urunler/           # Ürün resimleri
├── etkinlikler/       # Etkinlik görselleri
├── sponsorlar/        # Sponsor logoları
└── dekontlar/         # Admin dekontları (gizli)
```

---

## 🚀 Hızlı Kurulum (Yeni Başlayanlar İçin)

### 📋 Gereksinimler

Bilgisayarınızda şunların yüklü olması gerekir:

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- [Git](https://git-scm.com/)
- Bir kod editörü ([VSCode](https://code.visualstudio.com/) önerilir)

### 🔧 1. Adım: Projeyi İndirin

```bash
# Projeyi klonlayın
git clone https://github.com/your-username/baibu-pot.git

# Proje klasörüne girin  
cd baibu-pot

# Bağımlılıkları yükleyin
npm install
```

### 🔑 2. Adım: Environment Variables (.env)

Proje klasöründe `.env` dosyası oluşturun:

```bash
# .env dosyası oluşturun
cp .env.example .env
```

`.env` dosyasını açın ve doldurun:

```env
# Supabase Database
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub Storage (File Bucket)
VITE_GITHUB_OWNER=github_username
VITE_GITHUB_REPO=storage_repo_name
VITE_GITHUB_TOKEN=github_personal_access_token
VITE_GITHUB_BRANCH=main
```

### 🗄️ 3. Adım: Supabase Database Kurulumu

#### 3.1. Supabase Hesabı Oluşturun
1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" → GitHub ile giriş yapın
3. "New Project" → Proje adı girin (örn: `baibu-pot`)

#### 3.2. Database Schema'sını Yükleyin
1. Supabase Dashboard → "SQL Editor"
2. `migrations/complete_schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'e yapıştırın ve "Run" tıklayın

#### 3.3. Environment Variables'ları Alın
1. Supabase Dashboard → "Settings" → "API"
2. `URL` ve `anon public` anahtarını `.env` dosyasına ekleyin

### 📁 4. Adım: GitHub Storage Kurulumu

#### 4.1. Storage Repository Oluşturun
1. GitHub'da yeni repository: `baibu-pot-storage` (public olmalı)
2. Repository'yi boş bırakın (README eklemeyin)

#### 4.2. Personal Access Token Oluşturun
1. GitHub → Settings → Developer settings → Personal access tokens
2. "Generate new token (classic)"
3. Scope: `public_repo` seçin
4. Token'ı `.env` dosyasına ekleyin

#### 4.3. Test Edin
```bash
# Geliştirme sunucusunu başlatın
npm run dev

# Admin paneline gidin: http://localhost:5173/admin/login
# GitHub storage testini yapın
```

### ✅ 5. Adım: Çalıştırın

```bash
# Geliştirme sunucusunu başlatın
npm run dev
```

Site `http://localhost:5173` adresinde açılacaktır.

---

## 🔧 Detaylı Kurulum Rehberi

### 📊 Database Tabloları

Proje şu ana tabloları kullanır:

- `magazine_issues` - Dergi sayıları
- `news` - Haberler ve duyurular  
- `events` - Etkinlikler
- `team_members` - Ekip üyeleri
- `academic_documents` - Akademik belgeler
- `products` - Ürünler
- `surveys` - Anketler
- `sponsors` - Sponsorlar

### 🎨 Admin Paneli

Admin paneline erişim: `/admin/login`

**Admin Özellikleri:**
- 📄 Dergi yükleme (GitHub Storage entegrasyonu)
- 📰 Haber/duyuru yönetimi
- 📅 Etkinlik yönetimi
- 👥 Ekip üyesi yönetimi
- 📊 İstatistikler

### 🚀 Production Deployment

#### Netlify Deployment
1. GitHub repository'yi Netlify'a bağlayın
2. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
3. Environment variables'ları Netlify'da ekleyin

#### Vercel Deployment
1. Vercel'e GitHub repository'yi import edin
2. Environment variables'ları Vercel dashboard'da ekleyin

---

## 🛠️ Kullanılan Teknolojiler

### Frontend
- ⚛️ **React 18.3.1** + TypeScript
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** - Styling
- 🧱 **shadcn/ui** - UI Components
- 📖 **react-pageflip** - Flipbook okuyucu

### Backend & Storage
- 🗄️ **Supabase** - PostgreSQL database
- 📁 **GitHub Storage** - File bucket
- 🔐 **Row Level Security** - Güvenlik

### PDF Processing
- 📄 **PDF.js** - PDF sayfa işleme
- 🚀 **Lazy Loading** - Performans optimizasyonu
- 💾 **Cache System** - Hızlı yeniden yükleme

---

## 🐛 Sorun Giderme

### ❌ Yaygın Hatalar

**1. "PDF yüklenmiyor" Hatası**
```bash
# GitHub token'ı kontrol edin
# Repository public olduğundan emin olun
# Raw URL formatını kontrol edin
```

**2. "Database connection failed"**
```bash
# Supabase URL ve anon key'i kontrol edin
# RLS policies aktif olduğundan emin olun
```

**3. "Build Error"**
```bash
# Node.js versiyonunu kontrol edin (v18+)
npm clean-install
npm run build
```

### 🔍 Debug Logging

Geliştirme sırasında console'da detaylı loglar görürsünüz:

```
🔥 PDF işleme başlıyor (Lazy Loading)
📄 PDF toplam sayfa sayısı: 25  
🚀 Sadece kapak sayfası yükleniyor...
✨ Kapak sayfası hazır!
```

---

## 📚 Önemli Dosyalar

```
src/
├── components/
│   ├── FlipbookReader.tsx      # PDF okuyucu
│   └── admin/
│       └── MagazineModal.tsx   # Dergi yükleme
├── pages/
│   ├── DergiDetay.tsx         # Dergi okuma sayfası
│   └── AdminDashboard.tsx     # Admin paneli
├── utils/
│   ├── githubStorageHelper.ts # GitHub storage API
│   └── pdfProcessor.ts        # PDF.js lazy loading
└── integrations/
    └── supabase/
        └── client.ts          # Database bağlantısı
```

---

## 🚀 Gelecek Planları

- 🔄 **Tüm file upload'ları GitHub Storage'a taşıma**
- 📊 **Gelişmiş analytics ve reporting**
- 📱 **Mobile app (React Native)**
- 🔍 **Search functionality**
- 🌙 **Dark mode support**

---

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

---

## 📞 İletişim & Destek

**Topluluk:**
- 📱 **Instagram:** [@baibu_pot](https://www.instagram.com/baibu_pot)
- ✉️ **E-posta:** psikoloji.topluluk@baibu.edu.tr
- 🌐 **Web:** [baibu-pot.netlify.app](https://baibu-pot.netlify.app)

**Teknik Destek:**
- 🐛 **Bug Report:** GitHub Issues
- 💡 **Feature Request:** GitHub Discussions
- 📖 **Documentation:** [GITHUB_STORAGE_SETUP.md](GITHUB_STORAGE_SETUP.md)

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

**⭐ Beğendiyseniz star vermeyi unutmayın!**
