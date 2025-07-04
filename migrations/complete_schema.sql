-- ====================================================================
-- BAİBÜ PSİKOLOJİ KULÜBÜ - VERİTABANI ŞEMASI
-- ====================================================================
-- Production Migration - Temiz ve Okunaklı Versiyon
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- ====================================================================
-- 1. ŞEMA HAZIRLIĞI
-- ====================================================================

-- Mevcut tabloları temizle ve yeniden oluştur
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- 2. KULLANICI VE ROL YÖNETİMİ
-- ====================================================================

-- Kullanıcılar tablosu (auth.users ile senkronize)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı rolleri (çoklu rol desteği)
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN (
        'baskan', 'baskan_yardimcisi', 
        'teknik_koordinator', 'teknik_ekip', 
        'etkinlik_koordinator', 'etkinlik_ekip', 
        'iletisim_koordinator', 'iletisim_ekip', 
        'dergi_koordinator', 'dergi_ekip',
        'mali_koordinator', 'mali_ekip'
    )),
    is_approved BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 🎯 Dinamik Rol Yetkileri (Başkan Kontrolü)
CREATE TABLE public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN (
        'baskan', 'baskan_yardimcisi', 
        'teknik_koordinator', 'teknik_ekip', 
        'etkinlik_koordinator', 'etkinlik_ekip', 
        'iletisim_koordinator', 'iletisim_ekip', 
        'dergi_koordinator', 'dergi_ekip',
        'mali_koordinator', 'mali_ekip'
    )),
    permission TEXT NOT NULL CHECK (permission IN (
        'overview', 'users', 'news', 'events', 'magazine', 
        'surveys', 'sponsors', 'products', 'team', 
        'documents', 'internships', 'messages'
    )),
    granted_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission)
);

-- ====================================================================
-- 3. İÇERİK YÖNETİMİ
-- ====================================================================

-- Sponsorlar (Diğer tablolardan önce tanımlanmalı)
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

-- Haberler
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

-- Etkinlikler
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    event_type TEXT NOT NULL DEFAULT 'seminer' CHECK (event_type IN ('atolye', 'konferans', 'sosyal', 'egitim', 'seminer')),
    max_participants INTEGER,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'TL',
    registration_required BOOLEAN DEFAULT false,
    registration_link TEXT,
    registration_enabled BOOLEAN DEFAULT true, -- 🎛️ Kayıt kontrolü
    registration_closed_reason TEXT, -- 🎛️ Kapanma sebebi
    featured_image TEXT,
    gallery_images TEXT[],
    has_custom_form BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Etkinlik Sponsorları (İlişki Tablosu)
CREATE TABLE public.event_sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE CASCADE,
    sponsor_type TEXT NOT NULL DEFAULT 'destekci' CHECK (sponsor_type IN ('ana', 'destekci', 'medya', 'yerel')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Etkinlik Önerileri
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
-- 4. DERGİ SİSTEMİ
-- ====================================================================

-- Dergi Sayıları
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

-- Dergi Katkıda Bulunanları
CREATE TABLE public.magazine_contributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('editor', 'author', 'illustrator', 'designer', 'translator')),
    bio TEXT,
    profile_image TEXT,
    social_links JSONB,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dergi Sponsorları (İlişki Tablosu)
CREATE TABLE public.magazine_sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE CASCADE,
    sponsorship_type TEXT NOT NULL DEFAULT 'sponsor',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dergi Okuma İstatistikleri
CREATE TABLE public.magazine_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    reader_ip TEXT,
    reader_location TEXT,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser_info TEXT,
    reading_duration INTEGER,
    pages_read INTEGER DEFAULT 0,
    completed_reading BOOLEAN DEFAULT false,
    referrer_url TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sayfa Bazında Okuma Takibi
CREATE TABLE public.magazine_page_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    magazine_read_id UUID REFERENCES public.magazine_reads(id) ON DELETE CASCADE,
    magazine_issue_id UUID REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    time_spent INTEGER DEFAULT 0,
    scroll_percentage INTEGER DEFAULT 0,
    zoom_level DECIMAL(4,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Makale Başvuruları
CREATE TABLE public.article_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('arastirma', 'derleme', 'vaka_sunumu', 'kitap_inceleme', 'roportaj')),
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_affiliation TEXT,
    co_authors TEXT[],
    keywords TEXT[],
    word_count INTEGER,
    file_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'published')),
    reviewer_comments TEXT,
    target_issue INTEGER,
    submission_date DATE DEFAULT CURRENT_DATE,
    review_deadline DATE,
    decision_date DATE,
    assigned_reviewer UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 5. GENEL İÇERİK
-- ====================================================================

-- Dönemler (örn: "2025-2026 Dönemi")
CREATE TABLE public.periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.periods IS 'Yönetim kadrolarının görev yaptığı dönemleri (örn: 2024-2025) yönetir. En son eklenen dönem aktif dönem olarak kabul edilir.';

-- Ekipler (örn: "Yönetim Kurulu", "Etkinlik Ekibi")
CREATE TABLE public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_board BOOLEAN DEFAULT false, -- Yönetim Kurulu'nu ayırt etmek için
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period_id, name)
);
COMMENT ON TABLE public.teams IS 'Her döneme ait ekipleri (Yönetim Kurulu, İletişim, Etkinlik vb.) tanımlar.';
COMMENT ON COLUMN public.teams.is_board IS 'Bu ekibin "Yönetim Kurulu" olup olmadığını belirtir. Ekipler sayfasında ayrı gösterilir.';

-- Ekip Üyeleri (Yeniden Yapılandırıldı)
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Sisteme kayıtlı kullanıcıyla eşleştirme (opsiyonel)
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    profile_image TEXT,
    social_links JSONB, -- { "email": "...", "linkedin": "..." }
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.team_members IS 'Ekiplere atanan üyeleri ve bilgilerini içerir.';
COMMENT ON COLUMN public.team_members.social_links IS 'Üyenin sosyal medya (email, linkedin, twitter vb.) linklerini JSON formatında tutar.';

-- Akademik Belgeler
CREATE TABLE public.academic_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'ders_programlari', 'staj_belgeleri', 'sinav_programlari', 
        'ogretim_planlari', 'ders_kataloglari', 'basvuru_formlari', 
        'resmi_belgeler', 'rehber_dokumanlari', 'diger'
    )),
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

-- Stajlar
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

-- Anketler
CREATE TABLE public.surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    survey_link TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    has_custom_form BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ürünler
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('kirtasiye', 'giyim', 'aksesuar', 'diger')),
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'TL',
    images TEXT[],
    features TEXT[],
    available BOOLEAN DEFAULT true,
    stock_status TEXT DEFAULT 'available' CHECK (stock_status IN ('available', 'limited', 'out_of_stock')),
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Özel Tasarım Talepleri
CREATE TABLE public.product_design_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    design_title TEXT NOT NULL,
    design_description TEXT NOT NULL,
    product_category TEXT NOT NULL CHECK (product_category IN ('kirtasiye', 'giyim', 'aksesuar', 'diger')),
    target_price_min DECIMAL(10,2),
    target_price_max DECIMAL(10,2),
    currency TEXT DEFAULT 'TL',
    quantity_needed INTEGER,
    usage_purpose TEXT,
    design_preferences TEXT,
    color_preferences TEXT[],
    size_preferences TEXT[],
    inspiration_images TEXT[],
    special_requirements TEXT,
    deadline_date DATE,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    contact_student_number TEXT,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'in_design', 'approved', 'rejected', 'completed')),
    priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    estimated_cost DECIMAL(10,2),
    estimated_time_days INTEGER,
    reviewer_id UUID REFERENCES public.users(id),
    reviewer_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    design_files TEXT[],
    prototype_images TEXT[],
    final_product_images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 6. FORM VE İLETİŞİM
-- ====================================================================

-- İletişim Mesajları
CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yorumlar
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

-- Form Alanları
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

-- Form Yanıtları
CREATE TABLE public.form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id TEXT NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('event_registration', 'survey')),
    user_name TEXT,
    user_email TEXT,
    response_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 7. TRİGGER FONKSİYONLARI
-- ====================================================================

-- Auth.users ile otomatik senkronizasyon
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
-- 8. GÜVEN FONKSİYONLARI
-- ====================================================================

    -- İndirme sayısını güvenli şekilde artıran fonksiyon
    CREATE OR REPLACE FUNCTION public.increment_document_downloads(document_id UUID)
    RETURNS INTEGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
    new_download_count INTEGER;
    BEGIN
    -- Atomic increment işlemi
    UPDATE public.academic_documents 
    SET downloads = COALESCE(downloads, 0) + 1,
        updated_at = NOW()
    WHERE id = document_id
    RETURNING downloads INTO new_download_count;
    
    -- Eğer belge bulunamadıysa hata döndür
    IF new_download_count IS NULL THEN
        RAISE EXCEPTION 'Belge bulunamadı: %', document_id;
    END IF;
    
    RETURN new_download_count;
    END;
    $$;

-- ====================================================================
-- 9. TRİGGERLAR
-- ====================================================================

-- Auth user otomatik ekleme
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at otomatik güncellemeler
CREATE TRIGGER handle_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_user_roles BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_role_permissions BEFORE UPDATE ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_news BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_events BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_magazine_issues BEFORE UPDATE ON public.magazine_issues FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_sponsors BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_periods BEFORE UPDATE ON public.periods FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_teams BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_team_members BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_academic_documents BEFORE UPDATE ON public.academic_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_internships BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_surveys BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_comments BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_magazine_contributors BEFORE UPDATE ON public.magazine_contributors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_article_submissions BEFORE UPDATE ON public.article_submissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_event_suggestions BEFORE UPDATE ON public.event_suggestions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_product_design_requests BEFORE UPDATE ON public.product_design_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 9. GÜVENLİK POLİTİKALARI (RLS)
-- ====================================================================

-- RLS'i tüm tablolar için etkinleştir
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.product_design_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_suggestions ENABLE ROW LEVEL SECURITY;

-- Kullanıcı politikaları
CREATE POLICY "users_select_policy" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_policy" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT WITH CHECK (true);

-- Rol politikaları
CREATE POLICY "user_roles_select_policy" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "user_roles_all_policy" ON public.user_roles FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "role_permissions_select_policy" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "role_permissions_all_policy" ON public.role_permissions FOR ALL USING (auth.uid() IS NOT NULL);

-- Genel içerik politikaları (herkes okuyabilir, admin yazabilir)
CREATE POLICY "news_select_policy" ON public.news FOR SELECT USING (true);
CREATE POLICY "news_all_policy" ON public.news FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "events_select_policy" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_all_policy" ON public.events FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "magazine_issues_select_policy" ON public.magazine_issues FOR SELECT USING (true);
CREATE POLICY "magazine_issues_all_policy" ON public.magazine_issues FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "sponsors_select_policy" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "sponsors_all_policy" ON public.sponsors FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "periods_select_policy" ON public.periods FOR SELECT USING (true);
CREATE POLICY "periods_all_policy" ON public.periods FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "teams_select_policy" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_all_policy" ON public.teams FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "team_members_select_policy" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_members_all_policy" ON public.team_members FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "academic_documents_select_policy" ON public.academic_documents FOR SELECT USING (true);
CREATE POLICY "academic_documents_all_policy" ON public.academic_documents FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "internships_select_policy" ON public.internships FOR SELECT USING (true);
CREATE POLICY "internships_all_policy" ON public.internships FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "surveys_select_policy" ON public.surveys FOR SELECT USING (true);
CREATE POLICY "surveys_all_policy" ON public.surveys FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "products_select_policy" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_all_policy" ON public.products FOR ALL USING (auth.uid() IS NOT NULL);

-- İletişim politikaları
CREATE POLICY "contact_messages_insert_policy" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select_policy" ON public.contact_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "contact_messages_all_policy" ON public.contact_messages FOR ALL USING (auth.uid() IS NOT NULL);

-- Yorum politikaları
CREATE POLICY "comments_select_approved_policy" ON public.comments FOR SELECT USING (approved = true);
CREATE POLICY "comments_insert_policy" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_all_policy" ON public.comments FOR ALL USING (auth.uid() IS NOT NULL);

-- Form politikaları
CREATE POLICY "form_fields_select_policy" ON public.form_fields FOR SELECT USING (true);
CREATE POLICY "form_fields_all_policy" ON public.form_fields FOR ALL USING (auth.uid() IS NOT NULL);

-- 🎯 Form Responses: Anonim INSERT + Admin diğer işlemler
CREATE POLICY "form_responses_insert_policy" ON public.form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "form_responses_select_policy" ON public.form_responses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "form_responses_update_policy" ON public.form_responses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "form_responses_delete_policy" ON public.form_responses FOR DELETE USING (auth.uid() IS NOT NULL);

-- Dergi ilişkili politikalar
CREATE POLICY "magazine_contributors_select_policy" ON public.magazine_contributors FOR SELECT USING (true);
CREATE POLICY "magazine_contributors_all_policy" ON public.magazine_contributors FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "magazine_sponsors_select_policy" ON public.magazine_sponsors FOR SELECT USING (true);
CREATE POLICY "magazine_sponsors_all_policy" ON public.magazine_sponsors FOR ALL USING (auth.uid() IS NOT NULL);

-- İstatistik politikaları (anonim ekleyebilir, admin görebilir)
CREATE POLICY "magazine_reads_insert_anonymous" ON public.magazine_reads FOR INSERT WITH CHECK (true);
CREATE POLICY "magazine_reads_select_admin_only" ON public.magazine_reads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "magazine_reads_all_admin_only" ON public.magazine_reads FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "magazine_page_reads_insert_anonymous" ON public.magazine_page_reads FOR INSERT WITH CHECK (true);
CREATE POLICY "magazine_page_reads_select_admin_only" ON public.magazine_page_reads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "magazine_page_reads_all_admin_only" ON public.magazine_page_reads FOR ALL USING (auth.uid() IS NOT NULL);

-- Makale ve öneri politikaları
CREATE POLICY "article_submissions_insert_policy" ON public.article_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "article_submissions_select_own" ON public.article_submissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "article_submissions_all_policy" ON public.article_submissions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "event_sponsors_select_policy" ON public.event_sponsors FOR SELECT USING (true);
CREATE POLICY "event_sponsors_all_policy" ON public.event_sponsors FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "event_suggestions_insert_policy" ON public.event_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "event_suggestions_select_admin_policy" ON public.event_suggestions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "event_suggestions_update_admin_policy" ON public.event_suggestions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "event_suggestions_delete_admin_policy" ON public.event_suggestions FOR DELETE USING (auth.uid() IS NOT NULL);

-- Product Design Requests Policies
CREATE POLICY "product_design_requests_insert_policy" ON public.product_design_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "product_design_requests_select_admin_policy" ON public.product_design_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "product_design_requests_update_admin_policy" ON public.product_design_requests FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "product_design_requests_delete_admin_policy" ON public.product_design_requests FOR DELETE USING (auth.uid() IS NOT NULL);

-- ====================================================================
-- 10. YETKİLERİ AYARLA
-- ====================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- 11. VARSAYILAN ROL YETKİLERİ
-- ====================================================================

-- Süper Admin Rolleri
INSERT INTO public.role_permissions (role, permission) VALUES
-- Başkan - Tam yetki
('baskan', 'overview'), ('baskan', 'users'), ('baskan', 'news'), ('baskan', 'events'), 
('baskan', 'magazine'), ('baskan', 'surveys'), ('baskan', 'sponsors'), ('baskan', 'products'), 
('baskan', 'team'), ('baskan', 'documents'), ('baskan', 'internships'), ('baskan', 'messages'),

-- Başkan Yardımcısı - Tam yetki  
('baskan_yardimcisi', 'overview'), ('baskan_yardimcisi', 'users'), ('baskan_yardimcisi', 'news'), 
('baskan_yardimcisi', 'events'), ('baskan_yardimcisi', 'magazine'), ('baskan_yardimcisi', 'surveys'), 
('baskan_yardimcisi', 'sponsors'), ('baskan_yardimcisi', 'products'), ('baskan_yardimcisi', 'team'), 
('baskan_yardimcisi', 'documents'), ('baskan_yardimcisi', 'internships'), ('baskan_yardimcisi', 'messages'),

-- İletişim Koordinatörü - Tam yetki
('iletisim_koordinator', 'overview'), ('iletisim_koordinator', 'users'), ('iletisim_koordinator', 'news'), 
('iletisim_koordinator', 'events'), ('iletisim_koordinator', 'magazine'), ('iletisim_koordinator', 'surveys'), 
('iletisim_koordinator', 'sponsors'), ('iletisim_koordinator', 'products'), ('iletisim_koordinator', 'team'), 
('iletisim_koordinator', 'documents'), ('iletisim_koordinator', 'internships'), ('iletisim_koordinator', 'messages'),

-- Teknik Koordinatör
('teknik_koordinator', 'overview'), ('teknik_koordinator', 'users'), ('teknik_koordinator', 'news'), 
('teknik_koordinator', 'events'), ('teknik_koordinator', 'magazine'), ('teknik_koordinator', 'surveys'), 
('teknik_koordinator', 'sponsors'), ('teknik_koordinator', 'products'), ('teknik_koordinator', 'team'), 
('teknik_koordinator', 'documents'), ('teknik_koordinator', 'internships'),

-- Etkinlik Koordinatörü
('etkinlik_koordinator', 'overview'), ('etkinlik_koordinator', 'events'), ('etkinlik_koordinator', 'sponsors'),

-- Dergi Koordinatörü
('dergi_koordinator', 'overview'), ('dergi_koordinator', 'magazine'), ('dergi_koordinator', 'sponsors'),

-- Mali Koordinatör
('mali_koordinator', 'overview'), ('mali_koordinator', 'products'), ('mali_koordinator', 'sponsors'),

-- Ekip Üyeleri
('iletisim_ekip', 'overview'), ('iletisim_ekip', 'news'), ('iletisim_ekip', 'magazine'), 
('iletisim_ekip', 'surveys'), ('iletisim_ekip', 'sponsors'), ('iletisim_ekip', 'documents'), ('iletisim_ekip', 'internships'),

('teknik_ekip', 'overview'), ('teknik_ekip', 'news'), ('teknik_ekip', 'events'), 
('teknik_ekip', 'magazine'), ('teknik_ekip', 'surveys'), ('teknik_ekip', 'sponsors'), 
('teknik_ekip', 'documents'), ('teknik_ekip', 'internships'), ('teknik_ekip', 'products'),

('etkinlik_ekip', 'overview'), ('etkinlik_ekip', 'events'), ('etkinlik_ekip', 'sponsors'),

('dergi_ekip', 'overview'), ('dergi_ekip', 'magazine'), ('dergi_ekip', 'sponsors'),

('mali_ekip', 'overview'), ('mali_ekip', 'products');

-- ====================================================================
-- 12. DEBUG FONKSİYONU
-- ====================================================================

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
-- 13. KURULUM TAMAMLANDI
-- ====================================================================

SELECT 'BAİBÜ Psikoloji Kulübü - Database kurulumu başarıyla tamamlandı! 🎉' as message;

-- Admin kullanıcı oluşturmak için:
-- 1. Supabase Auth'dan kullanıcı kaydı yapın
-- 2. Kullanıcı ID'sini alın
-- 3. Şu komutu çalıştırın:
-- INSERT INTO public.user_roles (user_id, role, is_approved) 
-- VALUES ('USER_ID_BURAYA', 'baskan', true); 