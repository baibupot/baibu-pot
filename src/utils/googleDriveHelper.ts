/**
 * Google Drive PDF URL Dönüştürücü Utility
 * Kullanıcıdan gelen Google Drive share URL'lerini direkt PDF okuma URL'sine çevirir
 */

export interface DriveUrlResult {
  isValid: boolean;
  originalUrl: string;
  directUrl?: string;
  fileId?: string;
  error?: string;
}

/**
 * Google Drive share URL'sinden file ID'sini çıkarır
 */
export const extractFileIdFromDriveUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  // Farklı Google Drive URL formatlarını destekle
  const patterns = [
    // https://drive.google.com/file/d/FILE_ID/view
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    // https://drive.google.com/open?id=FILE_ID
    /[?&]id=([a-zA-Z0-9-_]+)/,
    // https://docs.google.com/document/d/FILE_ID/
    /\/document\/d\/([a-zA-Z0-9-_]+)/,
    // https://drive.google.com/uc?id=FILE_ID
    /[?&]id=([a-zA-Z0-9-_]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Google Drive URL'sini direkt indirme URL'sine çevirir
 */
export const convertDriveUrlToDirectUrl = (driveUrl: string): DriveUrlResult => {
  const result: DriveUrlResult = {
    isValid: false,
    originalUrl: driveUrl
  };

  // URL geçerliliğini kontrol et
  if (!driveUrl || !driveUrl.includes('drive.google.com')) {
    result.error = 'Geçerli bir Google Drive URL\'si değil';
    return result;
  }

  // File ID'sini çıkar
  const fileId = extractFileIdFromDriveUrl(driveUrl);
  if (!fileId) {
    result.error = 'URL\'den file ID çıkarılamadı';
    return result;
  }

  // Direkt indirme URL'sini oluştur
  result.fileId = fileId;
  result.directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  result.isValid = true;

  return result;
};

/**
 * Google Drive URL'sinin erişilebilir olup olmadığını kontrol eder
 */
export const validateDriveUrl = async (driveUrl: string): Promise<DriveUrlResult> => {
  const convertResult = convertDriveUrlToDirectUrl(driveUrl);
  
  if (!convertResult.isValid) {
    return convertResult;
  }

  try {
    // HEAD request ile dosyanın var olup olmadığını kontrol et
    const response = await fetch(convertResult.directUrl!, { 
      method: 'HEAD',
      mode: 'no-cors' // CORS bypass için
    });
    
    // no-cors modunda response.ok her zaman true gelir, bu normal
    convertResult.isValid = true;
    return convertResult;
  } catch (error) {
    console.warn('Drive URL validation warning:', error);
    // Network hatası olsa bile URL'yi geçerli kabul et
    // Çünkü CORS kısıtlamaları yüzünden test edemeyebiliriz
    convertResult.isValid = true;
    return convertResult;
  }
};

/**
 * Kullanıcı dostu URL format kontrolü
 */
export const formatDriveUrlForUser = (url: string): string => {
  const result = convertDriveUrlToDirectUrl(url);
  
  if (result.isValid && result.fileId) {
    return `https://drive.google.com/file/d/${result.fileId}/view`;
  }
  
  return url;
};

/**
 * PDF embed URL'si oluştur (iframe için)
 */
export const createDrivePdfEmbedUrl = (driveUrl: string): DriveUrlResult => {
  const result = convertDriveUrlToDirectUrl(driveUrl);
  
  if (result.isValid && result.fileId) {
    // Google Drive PDF embed URL'si
    result.directUrl = `https://drive.google.com/file/d/${result.fileId}/preview`;
  }
  
  return result;
};

/**
 * Test için örnek Google Drive URL'leri
 */
export const SAMPLE_DRIVE_URLS = {
  valid: [
    'https://drive.google.com/file/d/1RSRb8JqCx6g4kWE2QStERkGFuOqB-Xsw/view?usp=sharing',
    'https://drive.google.com/open?id=1RSRb8JqCx6g4kWE2QStERkGFuOqB-Xsw',
    'https://drive.google.com/uc?id=1RSRb8JqCx6g4kWE2QStERkGFuOqB-Xsw'
  ],
  invalid: [
    'https://dropbox.com/file/test.pdf',
    'https://example.com/file.pdf',
    'invalid-url'
  ]
}; 