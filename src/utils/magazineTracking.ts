import { supabase } from '@/integrations/supabase/client';

// Cihaz tipini algıla
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return /ipad|tablet/i.test(userAgent) ? 'tablet' : 'mobile';
  }
  return 'desktop';
};

// Tarayıcı bilgisini al
const getBrowserInfo = (): string => {
  return navigator.userAgent;
};

// Kullanıcı IP'sini almaya çalış (basit versiyon)
const getUserLocation = async (): Promise<string | null> => {
  try {
    // Gerçek projede IP geolocation servisi kullanabilirsiniz
    return 'Turkey'; // Şimdilik sabit
  } catch {
    return null;
  }
};

// Session ID oluştur
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Dergi okuma istatistiği kaydet
export const trackMagazineRead = async (
  magazineIssueId: string,
  readingDuration?: number,
  pagesRead?: number,
  completedReading?: boolean
) => {
  try {
    const sessionId = generateSessionId();
    const location = await getUserLocation();
    
    const readData = {
      magazine_issue_id: magazineIssueId,
      reader_ip: null, // Privacy için şimdilik null
      reader_location: location,
      device_type: getDeviceType(),
      browser_info: getBrowserInfo(),
      reading_duration: readingDuration || null,
      pages_read: pagesRead || 0,
      completed_reading: completedReading || false,
      referrer_url: document.referrer || null,
      session_id: sessionId,
    };

    console.log('📊 Dergi okuma verisi gönderiliyor:', readData);

    const { data, error } = await supabase
      .from('magazine_reads')
      .insert([readData])
      .select()
      .single();

    if (error) {
      console.error('❌ Dergi istatistiği kaydedilemedi:', error);
      return false;
    }

    console.log('✅ Dergi istatistiği başarıyla kaydedildi:', data);
    return true;
  } catch (error) {
    console.error('❌ Dergi tracking hatası:', error);
    return false;
  }
};

// Sayfa bazında okuma takibi (opsiyonel - gelişmiş kullanım için)
export const trackPageRead = async (
  magazineReadId: string,
  magazineIssueId: string,
  pageNumber: number,
  timeSpent: number,
  scrollPercentage: number = 0,
  zoomLevel: number = 1.0
) => {
  try {
    const pageReadData = {
      magazine_read_id: magazineReadId,
      magazine_issue_id: magazineIssueId,
      page_number: pageNumber,
      time_spent: timeSpent,
      scroll_percentage: scrollPercentage,
      zoom_level: zoomLevel,
    };

    const { error } = await supabase
      .from('magazine_page_reads')
      .insert([pageReadData]);

    if (error) {
      console.error('Sayfa okuma istatistiği kaydedilemedi:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Sayfa tracking hatası:', error);
    return false;
  }
};

// Basit sayfa tracking - magazine_read_id olmadan
export const trackSimplePageRead = async (
  magazineIssueId: string,
  pageNumber: number,
  timeSpent: number
) => {
  try {
    const pageReadData = {
      magazine_read_id: null, // Null olarak bırak, basit tracking için
      magazine_issue_id: magazineIssueId,
      page_number: pageNumber,
      time_spent: timeSpent,
      scroll_percentage: 0,
      zoom_level: 1.0,
    };

    console.log(`📄 Sayfa ${pageNumber} için okuma verisi gönderiliyor:`, {magazineIssueId, timeSpent});

    const { data, error } = await supabase
      .from('magazine_page_reads')
      .insert([pageReadData])
      .select()
      .single();

    if (error) {
      console.error(`❌ Sayfa ${pageNumber} istatistiği kaydedilemedi:`, error);
      return false;
    }

    console.log(`✅ Sayfa ${pageNumber} istatistiği başarıyla kaydedildi:`, data);
    return true;
  } catch (error) {
    console.error('❌ Sayfa tracking hatası:', error);
    return false;
  }
};

// Dergi okuma başlangıcı - basit kullanım
export const startMagazineReading = (magazineIssueId: string) => {
  const startTime = Date.now();
  
  // Sayfa kapatılırken otomatik kaydet
  const handleBeforeUnload = () => {
    const readingDuration = Date.now() - startTime;
    // Sync olarak göndermek için navigator.sendBeacon kullanabilirsiniz
    trackMagazineRead(magazineIssueId, readingDuration, 1, false);
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Cleanup function return et
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    const readingDuration = Date.now() - startTime;
    trackMagazineRead(magazineIssueId, readingDuration, 1, true);
  };
};

// Demo data oluşturucu (test için)
export const generateDemoMagazineReads = async (magazineIssueId: string, count: number = 10) => {
  const devices = ['mobile', 'desktop', 'tablet'];
  const locations = ['Turkey', 'Germany', 'USA', 'France', 'UK'];
  
  for (let i = 0; i < count; i++) {
    const demoData = {
      magazine_issue_id: magazineIssueId,
      reader_ip: null,
      reader_location: locations[Math.floor(Math.random() * locations.length)],
      device_type: devices[Math.floor(Math.random() * devices.length)],
      browser_info: 'Demo Browser',
      reading_duration: Math.floor(Math.random() * 1800) + 120, // 2-32 dakika arası
      pages_read: Math.floor(Math.random() * 20) + 1,
      completed_reading: Math.random() > 0.3, // %70 tamamlama oranı
      referrer_url: Math.random() > 0.5 ? 'https://ibu.edu.tr/' : null,
      session_id: `demo_session_${i}_${Date.now()}`,
    };

    await supabase.from('magazine_reads').insert([demoData]);
    
    // Rate limiting için küçük delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ ${count} adet demo dergi okuma verisi oluşturuldu!`);
}; 