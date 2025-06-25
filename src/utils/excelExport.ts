
import * as XLSX from 'xlsx';

// 🔒 Güvenli dosya adı oluştur
const createSafeFilename = (filename: string): string => {
  return filename
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_') // Birden fazla _ yi tek _ yap
    .replace(/^_|_$/g, ''); // Başındaki ve sonundaki _ yi temizle
};

export const exportToExcel = (data: any[], filename: string) => {
  // Gerçek Excel (.xlsx) formatında export
  if (!data || data.length === 0) {
    alert('Dışa aktarılacak veri yok');
    return;
  }

  try {
    // Worksheet oluştur
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Kolon genişliklerini ayarla (Türkçe karakterler için)
    const colWidths = Object.keys(data[0]).map(key => {
      const maxLength = Math.max(
        key.length, // Header uzunluğu
        ...data.map(row => String(row[key] || '').length) // Data uzunlukları
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Max 50 karakter genişlik
    });
    worksheet['!cols'] = colWidths;
    
    // Workbook oluştur
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Yanıtları');
    
    // Güvenli dosya adı oluştur
    const safeFilename = createSafeFilename(filename);
    
    // Excel dosyası olarak indir - güvenli yöntem
    XLSX.writeFile(workbook, `${safeFilename}.xlsx`, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'binary'
    });
    
    console.log(`✅ Excel dosyası indirildi: ${safeFilename}.xlsx`);
  } catch (error) {
    console.error('❌ Excel export hatası:', error);
    
    // Fallback: CSV formatında export
    exportToCSV(data, filename);
  }
};

// Fallback CSV export function
const exportToCSV = (data: any[], filename: string) => {
  // Güvenli dosya adı oluştur
  const safeFilename = createSafeFilename(filename);
    
  const headers = Object.keys(data[0]);
  
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${safeFilename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // URL'yi temizle
  setTimeout(() => URL.revokeObjectURL(url), 100);
  
  console.log(`✅ CSV dosyası indirildi (fallback): ${safeFilename}.csv`);
};

export const formatFormResponsesForExcel = (responses: any[], formFields: any[] = []) => {
  return responses.map((response, index) => {
    // 📧 E-posta birleştirme - farklı kaynaklardan gelen e-postaları birleştir
    const emailSources = [
      response.user_email,
      response.response_data?.email,
      response.response_data?.e_posta,
      response.response_data?.e_mail,
      response.response_data?.eposta
    ].filter(Boolean); // Boş olmayan değerleri al
    
    const consolidatedEmail = emailSources[0] || ''; // İlk bulduğunu kullan
    
    // 👤 Ad-Soyad birleştirme - farklı kaynaklardan gelen isimleri birleştir
    const nameSources = [
      response.user_name,
      response.response_data?.ad_soyad,
      response.response_data?.adsoyad,
      response.response_data?.isim,
      response.response_data?.name
    ].filter(Boolean); // Boş olmayan değerleri al
    
    const consolidatedName = nameSources[0] || 'Anonim'; // İlk bulduğunu kullan
    
    // 📁 Dosya alanlarını topla
    const fileFields = formFields.filter(field => field.field_type === 'file') || [];
    const attachedFiles = fileFields.map(field => {
      const fileName = response.response_data[field.field_name];
      return fileName ? `${field.field_label}: ${fileName}` : null;
    }).filter(Boolean);
    
    const formattedResponse: any = {
      'Sıra No': index + 1,
      'Kayıt Tarihi': new Date(response.submitted_at).toLocaleDateString('tr-TR'),
      'Kayıt Saati': new Date(response.submitted_at).toLocaleTimeString('tr-TR'),
      'Ad Soyad': consolidatedName,
      'E-posta': consolidatedEmail
    };
    
    // Response data'daki her alanı ekle (Türkçe başlıklar ile)
    if (response.response_data) {
      Object.keys(response.response_data).forEach(key => {
        // Dosya alanlarını atla (_file suffix'li)
        if (key.endsWith('_file')) return;
        
        // E-posta alanlarını atla (zaten birleştirdik)
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('email') || lowerKey.includes('e_posta') || lowerKey.includes('eposta') || lowerKey.includes('e_mail')) {
          return;
        }
        
        // Ad-Soyad alanlarını atla (zaten birleştirdik)
        if (lowerKey.includes('ad_soyad') || lowerKey.includes('adsoyad') || lowerKey.includes('isim') || lowerKey.includes('name')) {
          return;
        }
        
        // Dosya adı alanlarını özel olarak işle
        const isFileNameField = fileFields.some(field => field.field_name === key);
        if (isFileNameField) {
          const field = fileFields.find(f => f.field_name === key);
          const displayKey = field ? field.field_label : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          formattedResponse[`📎 ${displayKey}`] = response.response_data[key] || '-';
          return;
        }
        
        // Alan adını daha okunabilir yap
        let displayKey = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        const value = response.response_data[key];
        
        // Array'leri string'e çevir
        if (Array.isArray(value)) {
          formattedResponse[displayKey] = value.join(', ');
        } else {
          formattedResponse[displayKey] = value || '';
        }
      });
    }
    
    // 📁 Dosya özetini ekle
    if (attachedFiles.length > 0) {
      formattedResponse['📁 Yüklenen Dosyalar'] = attachedFiles.join(' | ');
    }
    
    return formattedResponse;
  });
};
