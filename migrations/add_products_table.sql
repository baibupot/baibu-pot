-- ====================================================================
-- ÜRÜNLER SAYFASI VE MALİ İŞLER ROLLERİ EKLEMESİ
-- ====================================================================
-- Bu dosyayı complete_schema.sql'den SONRA çalıştırın

-- ====================================================================
-- 1. ÜRÜNLER TABLOSU EKLEMESİ
-- ====================================================================

-- Products tablosu
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

-- Products tablosu için RLS etkinleştir
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products politikaları
CREATE POLICY "products_select_policy" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_all_policy" ON public.products FOR ALL USING (auth.uid() IS NOT NULL);

-- Updated_at trigger ekle
CREATE TRIGGER handle_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 2. MALİ İŞLER ROLLERİNİ EKLEMESİ
-- ====================================================================

-- User roles tablosundaki CHECK constraint'i güncelleyelim
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Yeni constraint'i mali işler rolleri ile birlikte ekleyelim
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN (
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
));

-- ====================================================================
-- 3. ÖRNEK ÜRÜN VERİLERİ
-- ====================================================================

-- Örnek ürünler
INSERT INTO public.products (name, description, category, price, currency, features, available, stock_status, sort_order) VALUES
('BAİBÜ PÖT Kalem', 'Psikoloji öğrencileri topluluğu logolu özel tasarım tükenmez kalem', 'kirtasiye', 15.00, 'TL', ARRAY['Ergonomik tutma', 'Kaliteli mürekkep', 'Logo baskılı'], true, 'available', 1),
('BAİBÜ PÖT T-Shirt', 'Topluluk logolu pamuklu t-shirt', 'giyim', 85.00, 'TL', ARRAY['%100 pamuk', 'Unisex kesim', 'Kaliteli baskı'], true, 'available', 2),
('BAİBÜ PÖT Çanta', 'Günlük kullanım için bez çanta', 'aksesuar', 45.00, 'TL', ARRAY['Dayanıklı kumaş', 'Geniş iç hacim', 'Topluluk logosu'], true, 'limited', 3),
('BAİBÜ PÖT Bardak', 'Termal içecek bardağı', 'aksesuar', 35.00, 'TL', ARRAY['Termal özellik', 'BPA içermez', 'Kapak dahil'], true, 'available', 4),
('BAİBÜ PÖT Defter', 'A5 boyutunda çizgili defter', 'kirtasiye', 25.00, 'TL', ARRAY['120 sayfa', 'Kaliteli kağıt', 'Sert kapak'], true, 'available', 5);

-- ====================================================================
-- 4. YETKİLERİ GÜNCELLE
-- ====================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- 5. KURULUM TAMAMLANDI!
-- ====================================================================

SELECT 'Ürünler tablosu ve mali işler rolleri başarıyla eklendi!' as message; 