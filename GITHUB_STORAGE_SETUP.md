# 🚀 GitHub Storage Kurulum Rehberi

Bu dosya **BAİBÜ PÖT Website** için GitHub Storage sistemi kurulum talimatlarını içerir.

## 📋 Gereksinimler

1. **GitHub Hesabı** (ücretsiz)
2. **GitHub Repository** (public - bedava sınırsız)
3. **Personal Access Token** (GitHub API erişimi için)

## 🔧 Adım 1: GitHub Repository Oluşturma

1. GitHub'da yeni repository oluşturun: `baibu-pot-storage`
2. **Public** olarak ayarlayın (bedava sınırsız)
3. `README.md` ile initialize edin

## 🔑 Adım 2: Personal Access Token Oluşturma

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)** tıklayın
3. **Scopes** seçin:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
   - ✅ `write:repo_hook` (Write repository hooks)
4. Token'ı kopyalayın (bir daha gösterilmez!)

## 🌍 Adım 3: Environment Variables Ekleme

`.env` dosyanıza şu değişkenleri ekleyin:

```env
# GitHub Storage Configuration
VITE_GITHUB_OWNER=YOUR_GITHUB_USERNAME
VITE_GITHUB_REPO=baibu-pot-storage
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
VITE_GITHUB_BRANCH=main
```

### 📝 Örnek:
```env
VITE_GITHUB_OWNER=johndoe
VITE_GITHUB_REPO=baibu-pot-storage
VITE_GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstu
VITE_GITHUB_BRANCH=main
```

## 📁 Adım 4: Klasör Yapısı

GitHub repository'nize bu yapı otomatik oluşturulacak:

```
baibu-pot-storage/
├── dergiler/
│   ├── 2024/
│   │   ├── sayi-001/
│   │   │   ├── dergi-001.pdf
│   │   │   └── kapak-001.jpg
│   │   └── sayi-002/
│   │       ├── dergi-002.pdf
│   │       └── kapak-002.jpg
│   └── 2025/
├── urunler/
│   ├── urun-001.jpg
│   └── urun-002.jpg
├── etkinlikler/
│   ├── 2024/
│   └── 2025/
├── sponsorlar/
└── dekontlar/ (admin only)
```

## ✅ Adım 5: Test Etme

1. Admin panelinde **"GitHub Storage Aktif"** yazsın
2. **"Test"** butonuna tıklayın
3. **"✅ GitHub Storage bağlantısı başarılı!"** mesajını görün

## 📊 Avantajlar

- ✅ **%100 Bedava** - Sınırsız public storage
- ✅ **Güvenilir** - Microsoft'a ait
- ✅ **Hızlı CDN** - Dünya çapında erişim
- ✅ **Kolay Yedekleme** - Git versiyonlama
- ✅ **CORS Sorunu Yok** - Raw URL'ler direkt erişilebilir

## 🔒 Güvenlik

- **Token'ı kimseyle paylaşmayın!**
- Repository **public** olmalı (dosyalar herkes tarafından görülebilir)
- Hassas belgeler için ayrı **private repo** kullanın

## 🎯 Kullanım

Kurulum tamamlandığında:

1. **Admin Panel** → **Dergi Yönetimi** → **Yeni Sayı**
2. **"📁 PDF Seç & GitHub'a Yükle"** butonunu kullanın
3. Dosya otomatik yüklenip URL oluşturulur
4. **Flipbook Reader** GitHub URL'ini kullanır

## 🔧 Sorun Giderme

### "GitHub Storage Yapılandırılmamış" Hatası:
- `.env` dosyasındaki değişkenleri kontrol edin
- `npm run dev` ile uygulamayı yeniden başlatın

### "Repository bulunamadı" Hatası:
- GitHub username doğru mu?
- Repository adı doğru mu?
- Repository public mi?

### "Upload testi başarısız" Hatası:
- Personal Access Token doğru mu?
- Token'ın `repo` yetkisi var mı?
- Token'ın süresi dolmuş mu?

## 📞 Destek

Sorun yaşarsanız GitHub Issues bölümünde bildirin. 