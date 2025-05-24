
-- Seed data for BAİBÜ PÖT website

-- Insert sample sponsors
INSERT INTO public.sponsors (name, sponsor_type, active, sort_order) VALUES
('Ana Sponsor 1', 'ana', true, 1),
('Ana Sponsor 2', 'ana', true, 2),
('Destekçi Kurum 1', 'destekci', true, 3),
('Destekçi Kurum 2', 'destekci', true, 4),
('Medya Partneri 1', 'medya', true, 5),
('Akademik Partner 1', 'akademik', true, 6);

-- Insert sample team structure
INSERT INTO public.team_members (name, role, team, active, sort_order) VALUES
('Topluluk Başkanı', 'Başkan', 'yonetim', true, 1),
('Başkan Yardımcısı', 'Başkan Yardımcısı', 'yonetim', true, 2),
('Teknik İşler Koordinatörü', 'Koordinatör', 'teknik', true, 1),
('Etkinlik Koordinatörü', 'Koordinatör', 'etkinlik', true, 1),
('İletişim Koordinatörü', 'Koordinatör', 'iletisim', true, 1),
('Dergi Koordinatörü', 'Koordinatör', 'dergi', true, 1);

-- Insert sample news
INSERT INTO public.news (title, excerpt, content, category, published, slug) VALUES
('Psikoloji Günleri 2024 Başlıyor', 'Bu yıl 15-17 Mart tarihleri arasında düzenlenecek Psikoloji Günleri etkinlik programı açıklandı.', 'Detaylı içerik burada olacak...', 'etkinlik', true, 'psikoloji-gunleri-2024'),
('Yeni Dergi Sayımız Yayında', 'Psikolojiİbu dergisinin 12. sayısı "Travma ve İyileşme" temasıyla okuyucularla buluştu.', 'Detaylı içerik burada olacak...', 'dergi', true, 'yeni-dergi-sayimiz-12'),
('Staj Başvuruları Başladı', '2024 yaz dönemi staj başvuruları için yeni fırsatlar ve rehber bilgileri paylaşıldı.', 'Detaylı içerik burada olacak...', 'duyuru', true, 'staj-basvurulari-2024');

-- Insert sample events
INSERT INTO public.events (title, description, event_date, location, event_type, slug) VALUES
('Mindfulness ve Stres Yönetimi Atölyesi', 'Günlük yaşamda stres yönetimi teknikleri üzerine interaktif bir atölye.', '2024-03-25 14:00:00+03', 'Psikoloji Bölümü Konferans Salonu', 'atolye', 'mindfulness-atolyesi'),
('Psikoloji Kariyer Günleri', 'Psikoloji alanında kariyer fırsatları ve uzman konuşmacılarla buluşma.', '2024-04-02 09:00:00+03', 'Rektörlük Konferans Salonu', 'konferans', 'kariyer-gunleri-2024'),
('Kitap Kulübü Buluşması', 'Aylık kitap tartışması ve sosyal etkileşim etkinliği.', '2024-04-10 18:30:00+03', 'Kütüphane Toplantı Salonu', 'sosyal', 'kitap-kulubu-nisan');

-- Insert sample magazine issues
INSERT INTO public.magazine_issues (issue_number, title, theme, description, publication_date, published, slug) VALUES
(12, 'Psikolojiİbu - Sayı 12', 'Travma ve İyileşme', 'Post-travmatik stres bozukluğu ve iyileşme süreçleri üzerine özel dosya.', '2024-03-01', true, 'sayi-12-travma-iyilesme'),
(11, 'Psikolojiİbu - Sayı 11', 'Pozitif Psikoloji', 'Mutluluk, iyi oluş ve pozitif psikoloji yaklaşımları.', '2024-01-01', true, 'sayi-11-pozitif-psikoloji');

-- Insert sample surveys
INSERT INTO public.surveys (title, description, survey_link, start_date, end_date, active) VALUES
('Topluluk Memnuniyet Anketi', 'Topluluk faaliyetleri hakkında görüşlerinizi almak için düzenlenen anket.', 'https://forms.google.com/survey1', '2024-03-01', '2024-04-01', true),
('Etkinlik Önerileri Anketi', 'Gelecek dönem düzenlemek istediğiniz etkinlik türleri hakkında anket.', 'https://forms.google.com/survey2', '2024-03-15', '2024-04-15', true);
