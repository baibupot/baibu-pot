# BAİBÜ PÖT - Psikoloji Öğrencileri Topluluğu Web Sitesi

## Proje Hakkında

Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu (BAİBÜ PÖT) resmi web sitesidir. Bu platform, topluluğumuzun etkinliklerini, dergilerimizi, haberlerimizi ve daha fazlasını paylaşmak için oluşturulmuştur.

## Özellikler

- **Etkinlikler:** Yaklaşan etkinlikler, atölyeler ve seminerler hakkında bilgi
- **Dergi:** Topluluğumuzun çıkardığı "Psikolojiİbu" dergisinin tüm sayılarına erişim
- **Haberler/Duyurular:** Güncel duyurular ve haberler
- **Ekipler:** Topluluk ekiplerimiz ve çalışma alanları
- **Akademik Belgeler:** Psikoloji alanında faydalı akademik kaynaklar
- **İletişim:** Bizimle iletişime geçin

## Geliştirme

Bu projeyi yerel ortamınızda çalıştırmak ve geliştirmek için:

Aşağıdaki adımları izleyin:

```sh
# 1. Adım: Projeyi klonlayın
git clone https://github.com/your-username/baibu-pot.git

# 2. Adım: Proje dizinine girin
cd baibu-pot

# 3. Adım: Gerekli bağımlılıkları yükleyin
npm install
# veya
bun install

# 4. Adım: Geliştirme sunucusunu başlatın
npm run dev
# veya
bun dev
```

Tarayıcınızda otomatik olarak `http://localhost:5173` adresinde açılacaktır.

## Kullanılan Teknolojiler

Bu proje aşağıdaki teknolojileri kullanmaktadır:

- **Frontend:** React + TypeScript
- **Build aracı:** Vite
- **CSS Framework:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Veritabanı:** Supabase (PostgreSQL)
- **Paket Yöneticisi:** Bun/npm

## Dağıtım (Deployment)

Bu proje Netlify kullanılarak dağıtılabilir. `netlify.toml` dosyası gerekli yapılandırmaları içermektedir.

```sh
# Dağıtım için projeyi derleyin
npm run build

# Netlify CLI ile dağıtım (isteğe bağlı)
netlify deploy
```

## İletişim

Topluluk hakkında daha fazla bilgi için veya herhangi bir soru için:

- **Instagram:** [@baibu_pot](https://www.instagram.com/baibu_pot)
- **E-posta:** psikoloji.topluluk@baibu.edu.tr
- **Web:** [baibu-pot.netlify.app](https://baibu-pot.netlify.app)

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
