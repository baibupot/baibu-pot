-- ====================================================================
-- BAİBÜ PSİKOLOJİ KULÜBÜ - KAPSAMLI VERİTABANI ŞEMASI
-- ====================================================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Tüm migration dosyalarını tek dosyada birleştirdik

-- ====================================================================
-- 1. ŞEMA TEMİZLİĞİ VE HAZIRLIK
-- ====================================================================

-- Mevcut tabloları temizle
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- 2. TEMEL TABLOLAR
-- ====================================================================

-- Users tablosu (auth.users ile senkronize)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles tablosu
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN (
        'baskan', 
        'baskan_yardimcisi', 
        'teknik_koordinator', 
        'teknik_ekip', 
        'etkinlik_koordinator', 
        'etkinlik_ekip', 
        'iletisim_koordinator', 
        'iletisim_ekip', 
        'dergi_koordinator', 
        'dergi_ekip',
        'mali_koordinator',
        'mali_ekip'
    )),
    is_approved BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- News tablosu
CREATE TABLE public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'genel' CHECK (category IN ('etkinlik', 'dergi', 'duyuru', 'genel')),
    featured_image TEXT,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT true,
    author_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events tablosu
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    latitude DECIMAL(10, 8), -- Harita için enlem
    longitude DECIMAL(11, 8), -- Harita için boylam
    event_type TEXT NOT NULL DEFAULT 'seminer' CHECK (event_type IN ('atolye', 'konferans', 'sosyal', 'egitim', 'seminer')),
    max_participants INTEGER,
    price DECIMAL(10,2), -- Etkinlik ücreti
    currency TEXT DEFAULT 'TL', -- Para birimi
    registration_required BOOLEAN DEFAULT false,
    registration_link TEXT,
    featured_image TEXT,
    gallery_images TEXT[],
    has_custom_form BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine issues tablosu
CREATE TABLE public.magazine_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    theme TEXT,
    description TEXT,
    cover_image TEXT,
    pdf_file TEXT,
    publication_date DATE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors tablosu
CREATE TABLE public.sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    description TEXT,
    sponsor_type TEXT NOT NULL DEFAULT 'destekci' CHECK (sponsor_type IN ('ana', 'destekci', 'medya', 'akademik')),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members tablosu
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT NOT NULL CHECK (team IN ('yonetim', 'teknik', 'etkinlik', 'iletisim', 'dergi')),
    bio TEXT,
    profile_image TEXT,
    linkedin_url TEXT,
    email TEXT,
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic documents tablosu
CREATE TABLE public.academic_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('ders_notlari', 'arastirma', 'tez', 'makale', 'sunum', 'diger')),
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    tags TEXT[],
    author TEXT,
    upload_date DATE DEFAULT CURRENT_DATE,
    downloads INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internships tablosu
CREATE TABLE public.internships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    application_deadline DATE,
    contact_info TEXT,
    application_link TEXT,
    internship_type TEXT CHECK (internship_type IN ('zorunlu', 'gönüllü', 'yaz', 'donem')),
    duration_months INTEGER,
    salary_info TEXT,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys tablosu
CREATE TABLE public.surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    survey_link TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    has_custom_form BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages tablosu
CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments tablosu
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('news', 'event', 'magazine')),
    entity_id UUID NOT NULL,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form fields tablosu (dinamik form builder için)
CREATE TABLE public.form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id TEXT NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('event_registration', 'survey')),
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'number', 'tel', 'textarea', 'select', 'radio', 'checkbox', 'file', 'date')),
    field_name TEXT NOT NULL,
    field_label TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    options TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form responses tablosu
CREATE TABLE public.form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id TEXT NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('event_registration', 'survey')),
    user_name TEXT,
    user_email TEXT,
    response_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products tablosu (Ürünler: kalem, çanta, bardak vb.)
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('kirtasiye', 'giyim', 'aksesuar', 'diger')),
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'TL',
    images TEXT[], -- Ürün resimleri URL array
    features TEXT[], -- Ürün özellikleri
    available BOOLEAN DEFAULT true,
    stock_status TEXT DEFAULT 'available' CHECK (stock_status IN ('available', 'limited', 'out_of_stock')),
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 2.1. DERGİ İSTATİSTİKLERİ VE KATKIDA BULUNANLAR TABLOLARI
-- ====================================================================

-- Magazine contributors tablosu (editör, yazar, illüstratör)
CREATE TABLE public.magazine_contributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('editor', 'author', 'illustrator', 'designer', 'translator')),
    bio TEXT,
    profile_image TEXT,
    social_links JSONB, -- {linkedin: "", twitter: "", instagram: ""}
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine sponsors tablosu (dergi sayısına özel sponsorlar)
CREATE TABLE public.magazine_sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    sponsor_name TEXT NOT NULL, -- Sponsor ismini kendimiz gireceğiz
    sponsorship_type TEXT NOT NULL DEFAULT 'sponsor', -- Serbest text (Ana Sponsor, Destekçi, vs.)
    logo_url TEXT, -- GitHub'a yüklenecek logo URL'i  
    website_url TEXT, -- Web sitesi veya sosyal medya adresi
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine reads tablosu (SADECE ADMİN İÇİN - dergi okuma istatistikleri)
CREATE TABLE public.magazine_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    reader_ip TEXT, -- IP tabanlı takip (anonim)
    reader_location TEXT, -- Ülke/şehir bilgisi (opsiyonel)
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser_info TEXT,
    reading_duration INTEGER, -- Saniye cinsinden okuma süresi
    pages_read INTEGER DEFAULT 0, -- Kaç sayfa okundu
    completed_reading BOOLEAN DEFAULT false, -- Sonuna kadar okundu mu
    referrer_url TEXT, -- Nereden geldi
    session_id TEXT, -- Aynı oturumda birden fazla okuma kontrolü için
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine page reads tablosu (SADECE ADMİN İÇİN - sayfa bazında okuma takibi)
CREATE TABLE public.magazine_page_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_read_id UUID REFERENCES public.magazine_reads(id) ON DELETE CASCADE,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    time_spent INTEGER DEFAULT 0, -- Saniye cinsinden sayfada geçirilen süre
    scroll_percentage INTEGER DEFAULT 0, -- Sayfanın yüzde kaçı görüldü
    zoom_level DECIMAL(4,2) DEFAULT 1.0, -- Yakınlaştırma seviyesi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article submissions tablosu (dergi için makale başvuruları)
CREATE TABLE public.article_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'arastirma', 'derleme', 'vaka_sunumu', 'kitap_inceleme', 'roportaj'
    )),
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_affiliation TEXT, -- Kurum/üniversite
    co_authors TEXT[], -- Ortak yazarlar
    keywords TEXT[], -- Anahtar kelimeler
    word_count INTEGER,
    file_url TEXT, -- Makale dosyası
    cover_letter TEXT, -- Kapak mektubu
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'published'
    )),
    reviewer_comments TEXT,
    target_issue INTEGER, -- Hangi sayı için gönderildi
    submission_date DATE DEFAULT CURRENT_DATE,
    review_deadline DATE,
    decision_date DATE,
    assigned_reviewer UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event sponsors tablosu (etkinlik-sponsor ilişkisi)
CREATE TABLE public.event_sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    sponsor_name TEXT NOT NULL,
    sponsor_logo TEXT, -- GitHub'dan logo URL'i
    sponsor_website TEXT, -- Sponsor web sitesi
    sponsor_type TEXT NOT NULL DEFAULT 'destekci' CHECK (sponsor_type IN ('ana', 'destekci', 'medya', 'yerel')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event suggestions tablosu (kullanıcı etkinlik önerileri)
CREATE TABLE public.event_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    suggested_date TIMESTAMP WITH TIME ZONE,
    suggested_location TEXT,
    event_type TEXT NOT NULL DEFAULT 'seminer' CHECK (event_type IN ('atolye', 'konferans', 'sosyal', 'egitim', 'seminer')),
    estimated_participants INTEGER,
    estimated_budget DECIMAL(10,2),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'implemented')),
    reviewer_id UUID REFERENCES public.users(id),
    reviewer_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. TRİGGER FONKSİYONLARI
-- ====================================================================

-- Auth.users ile sync için
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ====================================================================
-- 4. TRİGGERLAR
-- ====================================================================

-- Auth user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger'ları
CREATE TRIGGER handle_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_user_roles BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_news BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_events BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_magazine_issues BEFORE UPDATE ON public.magazine_issues FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_sponsors BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_team_members BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_academic_documents BEFORE UPDATE ON public.academic_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_internships BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_surveys BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_comments BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_magazine_contributors BEFORE UPDATE ON public.magazine_contributors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_article_submissions BEFORE UPDATE ON public.article_submissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_event_suggestions BEFORE UPDATE ON public.event_suggestions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 5. RLS POLİTİKALARI - GÜVENLİ VE ESNEk
-- ====================================================================

-- RLS'i etkinleştir
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_page_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_suggestions ENABLE ROW LEVEL SECURITY;

-- *** ESNEk VE GÜVENLİ POLİTİKALAR ***

-- Users politikaları
CREATE POLICY "users_select_policy" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_policy" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT WITH CHECK (true);

-- User roles politikaları
CREATE POLICY "user_roles_select_policy" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "user_roles_all_policy" ON public.user_roles FOR ALL USING (auth.uid() IS NOT NULL);

-- News politikaları
CREATE POLICY "news_select_policy" ON public.news FOR SELECT USING (true);
CREATE POLICY "news_all_policy" ON public.news FOR ALL USING (auth.uid() IS NOT NULL);

-- Events politikaları
CREATE POLICY "events_select_policy" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_all_policy" ON public.events FOR ALL USING (auth.uid() IS NOT NULL);

-- Magazine issues politikaları
CREATE POLICY "magazine_issues_select_policy" ON public.magazine_issues FOR SELECT USING (true);
CREATE POLICY "magazine_issues_all_policy" ON public.magazine_issues FOR ALL USING (auth.uid() IS NOT NULL);

-- Sponsors politikaları
CREATE POLICY "sponsors_select_policy" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "sponsors_all_policy" ON public.sponsors FOR ALL USING (auth.uid() IS NOT NULL);

-- Team members politikaları
CREATE POLICY "team_members_select_policy" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_members_all_policy" ON public.team_members FOR ALL USING (auth.uid() IS NOT NULL);

-- Academic documents politikaları
CREATE POLICY "academic_documents_select_policy" ON public.academic_documents FOR SELECT USING (true);
CREATE POLICY "academic_documents_all_policy" ON public.academic_documents FOR ALL USING (auth.uid() IS NOT NULL);

-- Internships politikaları
CREATE POLICY "internships_select_policy" ON public.internships FOR SELECT USING (true);
CREATE POLICY "internships_all_policy" ON public.internships FOR ALL USING (auth.uid() IS NOT NULL);

-- Surveys politikaları
CREATE POLICY "surveys_select_policy" ON public.surveys FOR SELECT USING (true);
CREATE POLICY "surveys_all_policy" ON public.surveys FOR ALL USING (auth.uid() IS NOT NULL);

-- Contact messages politikaları
CREATE POLICY "contact_messages_insert_policy" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select_policy" ON public.contact_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "contact_messages_all_policy" ON public.contact_messages FOR ALL USING (auth.uid() IS NOT NULL);

-- Comments politikaları
CREATE POLICY "comments_select_approved_policy" ON public.comments FOR SELECT USING (approved = true);
CREATE POLICY "comments_insert_policy" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_all_policy" ON public.comments FOR ALL USING (auth.uid() IS NOT NULL);

-- Form fields ve responses politikaları
CREATE POLICY "form_fields_select_policy" ON public.form_fields FOR SELECT USING (true);
CREATE POLICY "form_fields_all_policy" ON public.form_fields FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "form_responses_insert_policy" ON public.form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "form_responses_select_policy" ON public.form_responses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "form_responses_all_policy" ON public.form_responses FOR ALL USING (auth.uid() IS NOT NULL);

-- Products politikaları
CREATE POLICY "products_select_policy" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_all_policy" ON public.products FOR ALL USING (auth.uid() IS NOT NULL);

-- Magazine contributors politikaları
CREATE POLICY "magazine_contributors_select_policy" ON public.magazine_contributors FOR SELECT USING (true);
CREATE POLICY "magazine_contributors_all_policy" ON public.magazine_contributors FOR ALL USING (auth.uid() IS NOT NULL);

-- Magazine sponsors politikaları
CREATE POLICY "magazine_sponsors_select_policy" ON public.magazine_sponsors FOR SELECT USING (true);
CREATE POLICY "magazine_sponsors_all_policy" ON public.magazine_sponsors FOR ALL USING (auth.uid() IS NOT NULL);

-- Magazine reads politikaları (SADECE ADMİN ERİŞİMİ)
CREATE POLICY "magazine_reads_insert_anonymous" ON public.magazine_reads FOR INSERT WITH CHECK (true);
CREATE POLICY "magazine_reads_select_admin_only" ON public.magazine_reads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "magazine_reads_all_admin_only" ON public.magazine_reads FOR ALL USING (auth.uid() IS NOT NULL);

-- Magazine page reads politikaları (SADECE ADMİN ERİŞİMİ)
CREATE POLICY "magazine_page_reads_insert_anonymous" ON public.magazine_page_reads FOR INSERT WITH CHECK (true);
CREATE POLICY "magazine_page_reads_select_admin_only" ON public.magazine_page_reads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "magazine_page_reads_all_admin_only" ON public.magazine_page_reads FOR ALL USING (auth.uid() IS NOT NULL);

-- Article submissions politikaları
CREATE POLICY "article_submissions_insert_policy" ON public.article_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "article_submissions_select_own" ON public.article_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "article_submissions_all_policy" ON public.article_submissions FOR ALL USING (auth.uid() IS NOT NULL);

-- Event sponsors politikaları
CREATE POLICY "event_sponsors_select_policy" ON public.event_sponsors FOR SELECT USING (true);
CREATE POLICY "event_sponsors_all_policy" ON public.event_sponsors FOR ALL USING (auth.uid() IS NOT NULL);

-- Event suggestions politikaları (anonim kullanıcılar da öneri gönderebilir)
CREATE POLICY "event_suggestions_insert_policy" ON public.event_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "event_suggestions_select_admin_policy" ON public.event_suggestions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "event_suggestions_update_admin_policy" ON public.event_suggestions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "event_suggestions_delete_admin_policy" ON public.event_suggestions FOR DELETE USING (auth.uid() IS NOT NULL);

-- ====================================================================
-- 6. YETKİLERİ AYARLA
-- ====================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- 7. ÖRNEK TEST VERİLERİ
-- ====================================================================

-- Örnek haberler
INSERT INTO public.news (title, excerpt, content, category, slug, published) VALUES
('Psikoloji Günleri 2024 Başlıyor', 'Bu yıl 15-17 Mart tarihleri arasında düzenlenecek Psikoloji Günleri etkinlik programı açıklandı.', 'Detaylı içerik burada yer alacak...', 'etkinlik', 'psikoloji-gunleri-2024', true),
('Yeni Dergi Sayımız Yayında', 'Psikolojiİbu dergisinin 12. sayısı "Travma ve İyileşme" temasıyla okuyucularla buluştu.', 'Detaylı içerik burada yer alacak...', 'dergi', 'yeni-dergi-sayimiz', true),
('Staj Başvuruları Başladı', '2024 yaz dönemi staj başvuruları için yeni fırsatlar ve rehber bilgileri paylaşıldı.', 'Detaylı içerik burada yer alacak...', 'duyuru', 'staj-basvurulari', true);

-- Örnek etkinlikler
INSERT INTO public.events (title, description, event_date, location, event_type, max_participants, registration_required, slug, status) VALUES
('Mindfulness ve Stres Yönetimi Atölyesi', 'Günlük yaşamda stres yönetimi teknikleri üzerine interaktif bir atölye', '2024-04-25 14:00:00+03', 'Psikoloji Bölümü Konferans Salonu', 'atolye', 20, true, 'mindfulness-atolyesi', 'upcoming'),
('Psikoloji Kariyer Günleri', 'Psikoloji alanında kariyer fırsatları ve yol haritası', '2024-05-02 09:00:00+03', 'Rektörlük Konferans Salonu', 'konferans', 150, true, 'kariyer-gunleri', 'upcoming'),
('Kitap Kulübü Buluşması', 'Aylık kitap tartışması ve paylaşım etkinliği', '2024-04-10 18:30:00+03', 'Kütüphane Toplantı Salonu', 'sosyal', 15, false, 'kitap-kulubu', 'upcoming');

-- Örnek dergi sayısı
INSERT INTO public.magazine_issues (issue_number, title, theme, description, publication_date, slug, published) VALUES
(12, 'Travma ve İyileşme', 'Post-travmatik Stres Bozukluğu', 'Travma ve iyileşme süreçleri üzerine akademik çalışmalar ve klinik yaklaşımlar', '2024-03-01', 'sayi-12-travma', true);

-- Örnek sponsor
INSERT INTO public.sponsors (name, website, sponsor_type, active, sort_order) VALUES
('Bolu Abant İzzet Baysal Üniversitesi', 'https://baibu.edu.tr', 'akademik', true, 1);

-- Örnek ürünler
INSERT INTO public.products (name, description, category, price, currency, features, available, stock_status, sort_order) VALUES
('BAİBÜ PÖT Kalem', 'Psikoloji öğrencileri topluluğu logolu özel tasarım tükenmez kalem', 'kirtasiye', 15.00, 'TL', ARRAY['Ergonomik tutma', 'Kaliteli mürekkep', 'Logo baskılı'], true, 'available', 1),
('BAİBÜ PÖT T-Shirt', 'Topluluk logolu pamuklu t-shirt', 'giyim', 85.00, 'TL', ARRAY['%100 pamuk', 'Unisex kesim', 'Kaliteli baskı'], true, 'available', 2),
('BAİBÜ PÖT Çanta', 'Günlük kullanım için bez çanta', 'aksesuar', 45.00, 'TL', ARRAY['Dayanıklı kumaş', 'Geniş iç hacim', 'Topluluk logosu'], true, 'limited', 3),
('BAİBÜ PÖT Bardak', 'Termal içecek bardağı', 'aksesuar', 35.00, 'TL', ARRAY['Termal özellik', 'BPA içermez', 'Kapak dahil'], true, 'available', 4),
('BAİBÜ PÖT Defter', 'A5 boyutunda çizgili defter', 'kirtasiye', 25.00, 'TL', ARRAY['120 sayfa', 'Kaliteli kağıt', 'Sert kapak'], true, 'available', 5);

-- Örnek dergi katkıda bulunanları
INSERT INTO public.magazine_contributors (magazine_issue_id, name, role, bio, sort_order) VALUES
((SELECT id FROM public.magazine_issues WHERE issue_number = 12), 'Dr. Ayşe Demir', 'editor', 'Klinik Psikoloji Uzmanı, BAİBÜ Öğretim Üyesi', 1),
((SELECT id FROM public.magazine_issues WHERE issue_number = 12), 'Mehmet Yılmaz', 'author', 'Psikoloji 4. sınıf öğrencisi', 2),
((SELECT id FROM public.magazine_issues WHERE issue_number = 12), 'Zeynep Kaya', 'illustrator', 'Grafik Tasarım Uzmanı', 3);

-- Örnek makale başvurusu
INSERT INTO public.article_submissions (title, abstract, category, author_name, author_email, author_affiliation, keywords, status, target_issue) VALUES
('Üniversite Öğrencilerinde Stres ve Başa Çıkma Yöntemleri', 'Bu çalışma üniversite öğrencilerinin stres düzeyleri ve başa çıkma stratejileri arasındaki ilişkiyi incelemektedir.', 'arastirma', 'Fatma Özkan', 'fatma.ozkan@email.com', 'BAİBÜ Psikoloji Bölümü', ARRAY['stres', 'başa çıkma', 'üniversite öğrencileri'], 'submitted', 13);

-- ====================================================================
-- 8. DEBUG FONKSİYONU
-- ====================================================================

-- Kullanıcı yetki kontrolü için debug fonksiyonu
CREATE OR REPLACE FUNCTION debug_user_auth()
RETURNS TABLE(
  current_user_id uuid,
  current_user_email text,
  has_roles boolean,
  user_roles text[]
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()),
    ARRAY(SELECT role FROM public.user_roles WHERE user_id = auth.uid() AND is_approved = true)
$$;

-- ====================================================================
-- 9. KURULUM TAMAMLANDI!
-- ====================================================================

-- Bu dosyayı çalıştırdıktan sonra yapılacaklar:
-- 1. Supabase Authentication'dan bir kullanıcı oluşturun
-- 2. O kullanıcının ID'sini alın
-- 3. Aşağıdaki komutu çalıştırarak admin yapın:
-- 
-- INSERT INTO public.user_roles (user_id, role, is_approved) 
-- VALUES ('YOUR_ACTUAL_USER_ID_HERE', 'baskan', true);
--
-- 4. Artık tüm CRUD işlemleri çalışacak!

-- Son kontrol: Tablo sayısını göster
SELECT 'Schema kurulumu tamamlandı! Toplam tablo sayısı: ' || count(*) || ' (Dergi istatistikleri dahil)' as message
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- ====================================================================
-- 10. YENİ ÖZELLIKLER HAKKINDA
-- ====================================================================

-- ✅ Yeni eklenen dergi sistemi tabloları:
-- 1. magazine_contributors: Editör, yazar, illüstratör bilgileri
-- 2. magazine_sponsors: Dergi sayısına özel sponsor sistemi
-- 3. magazine_reads: Dergi okuma istatistikleri (SADECE ADMİN)
-- 4. magazine_page_reads: Sayfa bazında okuma takibi (SADECE ADMİN)
-- 5. article_submissions: Makale gönderim ve değerlendirme sistemi

-- 📊 İstatistik özellikleri:
-- - IP tabanlı anonim takip
-- - Cihaz tipi, tarayıcı, konum bilgisi
-- - Okuma süresi ve sayfa sayısı
-- - Tamamlama oranları
-- - Sayfa bazında detaylı analiz

-- 🔒 Güvenlik:
-- - İstatistik tabloları sadece giriş yapmış kullanıcılar tarafından görülebilir
-- - Normal okuyucular istatistikleri göremez
-- - Admin panelinde detaylı raporlar sunulacak 