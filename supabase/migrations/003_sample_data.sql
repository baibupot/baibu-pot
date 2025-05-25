
-- Sample data for BAİBÜ PÖT website

-- Insert sample users
INSERT INTO public.users (email, name, role, is_approved) VALUES
('ahmet@baibu.edu.tr', 'Ahmet Yılmaz', 'baskan', true),
('ayse@baibu.edu.tr', 'Ayşe Demir', 'baskan_yardimcisi', true),
('mehmet@baibu.edu.tr', 'Mehmet Kaya', 'teknik_koordinator', true),
('fatma@baibu.edu.tr', 'Fatma Öz', 'teknik_ekip', true),
('ali@baibu.edu.tr', 'Ali Çelik', 'etkinlik_koordinator', true),
('zeynep@baibu.edu.tr', 'Zeynep Aydın', 'etkinlik_ekip', true),
('emre@baibu.edu.tr', 'Emre Yıldız', 'iletisim_koordinator', true),
('selin@baibu.edu.tr', 'Selin Kara', 'iletisim_ekip', true),
('burak@baibu.edu.tr', 'Burak Şen', 'dergi_koordinator', true),
('deniz@baibu.edu.tr', 'Deniz Güneş', 'dergi_ekip', true);

-- Insert sample news
INSERT INTO public.news (title, excerpt, content, category, slug, published, author_id) VALUES
('Yeni Eğitim Dönemi Başlıyor', 'Psikoloji bölümü yeni dönem hazırlıklarını tamamladı.', 'Detaylı içerik burada olacak...', 'duyuru', 'yeni-egitim-donemi-basliyor', true, (SELECT id FROM public.users WHERE email = 'ahmet@baibu.edu.tr')),
('Mindfulness Atölyesi Düzenlendi', 'Başarılı bir mindfulness atölyesi gerçekleştirildi.', 'Detaylı içerik burada olacak...', 'etkinlik', 'mindfulness-atolyesi-duzenlendi', true, (SELECT id FROM public.users WHERE email = 'emre@baibu.edu.tr')),
('Dergi Yeni Sayısı Yayınlandı', 'Psikolojiİbu dergisinin 12. sayısı yayınlandı.', 'Detaylı içerik burada olacak...', 'dergi', 'dergi-yeni-sayisi-yayinlandi', true, (SELECT id FROM public.users WHERE email = 'burak@baibu.edu.tr'));

-- Insert sample events
INSERT INTO public.events (title, description, event_date, end_date, location, event_type, max_participants, registration_required, status, slug, created_by) VALUES
('Mindfulness ve Stres Yönetimi Atölyesi', 'Günlük yaşamda stres yönetimi teknikleri üzerine interaktif bir atölye.', '2024-03-25 14:00:00+03:00', '2024-03-25 16:00:00+03:00', 'Psikoloji Bölümü Konferans Salonu', 'atolye', 30, true, 'upcoming', 'mindfulness-atolyesi', (SELECT id FROM public.users WHERE email = 'ali@baibu.edu.tr')),
('Psikoloji Kariyer Günleri', 'Psikoloji alanında kariyer fırsatları ve uzman konuşmacılarla buluşma.', '2024-04-02 09:00:00+03:00', '2024-04-02 17:00:00+03:00', 'Rektörlük Konferans Salonu', 'konferans', 100, true, 'upcoming', 'kariyer-gunleri-2024', (SELECT id FROM public.users WHERE email = 'ali@baibu.edu.tr')),
('Kitap Kulübü Buluşması', 'Aylık kitap tartışması ve sosyal etkileşim etkinliği.', '2024-04-10 18:30:00+03:00', '2024-04-10 20:00:00+03:00', 'Kütüphane Toplantı Salonu', 'sosyal', 20, false, 'upcoming', 'kitap-kulubu-nisan', (SELECT id FROM public.users WHERE email = 'zeynep@baibu.edu.tr'));

-- Insert sample magazine issues
INSERT INTO public.magazine_issues (issue_number, title, description, publication_date, slug, published, created_by) VALUES
(12, 'Psikolojiİbu Sayı 12', 'Güncel psikoloji araştırmaları ve makaleler içeren sayımız.', '2024-01-01', 'psikolojibu-sayi-12', true, (SELECT id FROM public.users WHERE email = 'burak@baibu.edu.tr')),
(11, 'Psikolojiİbu Sayı 11', 'Özel tema: Pozitif Psikoloji üzerine makaleler.', '2023-12-01', 'psikolojibu-sayi-11', true, (SELECT id FROM public.users WHERE email = 'burak@baibu.edu.tr'));

-- Insert sample sponsors
INSERT INTO public.sponsors (name, description, sponsor_type, active) VALUES
('TechCorp Yazılım', 'Teknoloji alanında öncü şirket olarak, gençlerin eğitimine destek veriyoruz.', 'ana', true),
('Psikoloji Merkezi', 'Psikoloji hizmetleri alanında uzman kadromuzla topluma hizmet ediyoruz.', 'destekci', true),
('Kitap Dünyası', 'Akademik yayınlar ve kitaplar konusunda öğrencilere destek sağlıyoruz.', 'medya', true),
('Eğitim Platformu', 'Online eğitim çözümleri ile öğrencilerin gelişimine katkı sağlıyoruz.', 'akademik', true);

-- Insert sample team members
INSERT INTO public.team_members (name, role, team, bio, email, active) VALUES
('Ahmet Yılmaz', 'Başkan', 'yonetim', 'Psikoloji 4. sınıf öğrencisi. Topluluk liderliği ve etkinlik organizasyonu konularında deneyimli.', 'ahmet@baibu.edu.tr', true),
('Ayşe Demir', 'Başkan Yardımcısı', 'yonetim', 'Psikoloji 3. sınıf öğrencisi. Akademik etkinlikler ve öğrenci ilişkileri koordinatörü.', 'ayse@baibu.edu.tr', true),
('Mehmet Kaya', 'Teknik İşler Koordinatörü', 'teknik', 'Psikoloji 3. sınıf öğrencisi. Web geliştirme ve dijital medya konularında uzman.', 'mehmet@baibu.edu.tr', true),
('Fatma Öz', 'Teknik İşler Ekip Üyesi', 'teknik', 'Psikoloji 2. sınıf öğrencisi. Grafik tasarım ve sosyal medya yönetimi.', 'fatma@baibu.edu.tr', true),
('Ali Çelik', 'Etkinlik Koordinatörü', 'etkinlik', 'Psikoloji 4. sınıf öğrencisi. Etkinlik yönetimi ve sponsorluk ilişkileri uzmanı.', 'ali@baibu.edu.tr', true),
('Zeynep Aydın', 'Etkinlik Ekip Üyesi', 'etkinlik', 'Psikoloji 2. sınıf öğrencisi. Etkinlik planlama ve katılımcı koordinasyonu.', 'zeynep@baibu.edu.tr', true),
('Emre Yıldız', 'İletişim Koordinatörü', 'iletisim', 'Psikoloji 3. sınıf öğrencisi. Basın ilişkileri ve kurumsal iletişim uzmanı.', 'emre@baibu.edu.tr', true),
('Selin Kara', 'İletişim Ekip Üyesi', 'iletisim', 'Psikoloji 1. sınıf öğrencisi. İçerik yazımı ve sosyal medya yönetimi.', 'selin@baibu.edu.tr', true),
('Burak Şen', 'Dergi Koordinatörü', 'dergi', 'Psikoloji 4. sınıf öğrencisi. Akademik yazım ve editörlük deneyimi.', 'burak@baibu.edu.tr', true),
('Deniz Güneş', 'Dergi Ekip Üyesi', 'dergi', 'Psikoloji 2. sınıf öğrencisi. Araştırma ve makale yazımı konularında ilgili.', 'deniz@baibu.edu.tr', true);

-- Insert sample academic documents
INSERT INTO public.academic_documents (title, description, category, file_url, file_type, author, created_by) VALUES
('Psikoloji Araştırma Yöntemleri', 'Araştırma metodolojisi üzerine kapsamlı rehber', 'arastirma', '/docs/arastirma-yontemleri.pdf', 'PDF', 'Dr. Mehmet Özkan', (SELECT id FROM public.users WHERE email = 'mehmet@baibu.edu.tr')),
('SPSS Kullanım Kılavuzu', 'İstatistik analizi için SPSS programı kullanım rehberi', 'ders_notlari', '/docs/spss-kilavuzu.pdf', 'PDF', 'Dr. Ayşe Kaya', (SELECT id FROM public.users WHERE email = 'mehmet@baibu.edu.tr'));

-- Insert sample internships
INSERT INTO public.internships (company_name, position, location, description, application_deadline, internship_type, active, created_by) VALUES
('Devlet Hastanesi', 'Hastane Psikoloji Stajı', 'Bolu', 'Hastane ortamında psikoloji stajı fırsatı', '2024-02-15', 'zorunlu', true, (SELECT id FROM public.users WHERE email = 'emre@baibu.edu.tr')),
('Özel Klinik', 'Klinik Staj Fırsatı', 'Ankara', 'Özel klinik ortamında staj deneyimi', '2024-01-30', 'gönüllü', true, (SELECT id FROM public.users WHERE email = 'emre@baibu.edu.tr'));

-- Insert sample surveys
INSERT INTO public.surveys (title, description, survey_link, start_date, end_date, active, created_by) VALUES
('Öğrenci Memnuniyet Anketi 2024', 'Topluluk faaliyetleri ve etkinliklerimiz hakkındaki görüşlerinizi almak istiyoruz.', 'https://forms.google.com/survey1', '2024-03-01', '2024-04-01', true, (SELECT id FROM public.users WHERE email = 'emre@baibu.edu.tr')),
('Dergi İçerik Tercihleri', 'Hangi konularda daha fazla makale okumak istiyorsunuz?', 'https://forms.google.com/survey2', '2024-02-15', '2024-03-15', false, (SELECT id FROM public.users WHERE email = 'burak@baibu.edu.tr'));

-- Insert sample contact messages
INSERT INTO public.contact_messages (name, email, subject, message, status) VALUES
('Ahmet Yılmaz', 'ahmet.yilmaz@example.com', 'Etkinlik Hakkında', 'Merhaba, gelecek etkinlik hakkında bilgi almak istiyorum.', 'unread'),
('Ayşe Demir', 'ayse.demir@example.com', 'Üyelik Başvurusu', 'Topluluk üyeliği için başvuru yapmak istiyorum.', 'read');
