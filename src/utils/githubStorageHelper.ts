/**
 * 🚀 GitHub Storage Helper - Bedava ve güvenilir dosya depolama
 * Google Drive yerine GitHub'ı storage olarak kullanır
 */

export interface GitHubUploadResult {
  success: boolean;
  rawUrl?: string;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

export interface GitHubDeleteResult {
  success: boolean;
  deletedFiles?: string[];
  error?: string;
}

export interface GitHubStorageConfig {
  owner: string;        // GitHub kullanıcı adı
  repo: string;         // Repository adı
  token: string;        // GitHub Personal Access Token
  branch?: string;      // Varsayılan: main
}

/**
 * ArrayBuffer'ı güvenli şekilde base64'e çevirme (büyük dosyalar için)
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const chunks: string[] = [];
  const uint8Array = new Uint8Array(buffer);
  const chunkSize = 8192; // 8KB chunks
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
  }
  
  return btoa(chunks.join(''));
};

/**
 * Dosyanın GitHub'da var olup olmadığını kontrol et ve SHA'sını al
 */
const getFileInfo = async (
  config: GitHubStorageConfig,
  filePath: string
): Promise<{ exists: boolean; sha?: string }> => {
  try {
    const { owner, repo, token, branch = 'main' } = config;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { exists: true, sha: data.sha };
    }
    
    return { exists: false };
  } catch {
    return { exists: false };
  }
};

/**
 * Tek dosyayı GitHub'dan sil
 */
export const deleteFileFromGitHub = async (
  config: GitHubStorageConfig,
  filePath: string,
  commitMessage: string = 'Delete file via admin panel'
): Promise<GitHubDeleteResult> => {
  try {
    const { owner, repo, token, branch = 'main' } = config;
    
    // Önce dosya bilgisini al (SHA gerekli)
    const fileInfo = await getFileInfo(config, filePath);
    
    if (!fileInfo.exists || !fileInfo.sha) {
      return {
        success: true, // Dosya zaten yok, başarılı sayılır
        deletedFiles: []
      };
    }

    // GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: commitMessage,
        sha: fileInfo.sha,
        branch: branch
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `GitHub API error: ${response.status}`);
    }

    return {
      success: true,
      deletedFiles: [filePath]
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

/**
 * Dergi ile ilgili tüm dosyaları GitHub'dan sil (PDF + kapak resmi)
 */
export const deleteMagazineFilesFromGitHub = async (
  config: GitHubStorageConfig,
  issueNumber: number,
  customPaths?: { pdfPath?: string; coverPath?: string }
): Promise<GitHubDeleteResult> => {
  try {
    const paths = customPaths || createMagazinePaths(issueNumber);
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    // PDF dosyasını sil
    if (customPaths?.pdfPath || paths.pdfPath) {
      const pdfPath = customPaths?.pdfPath || paths.pdfPath;
      const pdfResult = await deleteFileFromGitHub(
        config, 
        pdfPath, 
        `Delete magazine ${issueNumber} PDF`
      );
      
      if (pdfResult.success && pdfResult.deletedFiles) {
        deletedFiles.push(...pdfResult.deletedFiles);
      } else if (pdfResult.error) {
        errors.push(`PDF: ${pdfResult.error}`);
      }
    }

    // Kapak resmini sil
    if (customPaths?.coverPath || paths.coverPath) {
      const coverPath = customPaths?.coverPath || paths.coverPath;
      const coverResult = await deleteFileFromGitHub(
        config, 
        coverPath, 
        `Delete magazine ${issueNumber} cover`
      );
      
      if (coverResult.success && coverResult.deletedFiles) {
        deletedFiles.push(...coverResult.deletedFiles);
      } else if (coverResult.error) {
        errors.push(`Cover: ${coverResult.error}`);
      }
    }

    return {
      success: errors.length === 0,
      deletedFiles,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk delete failed'
    };
  }
};

/**
 * URL'den GitHub file path çıkarma
 */
export const extractGitHubPath = (githubRawUrl: string): string | null => {
  try {
    // https://raw.githubusercontent.com/owner/repo/branch/path/to/file.pdf
    const match = githubRawUrl.match(/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/[^\/]+\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

/**
 * Dergi URL'lerinden dosya silme (mevcut PDF/kapak URL'leri için)
 */
export const deleteMagazineFilesByUrls = async (
  config: GitHubStorageConfig,
  pdfUrl?: string,
  coverUrl?: string,
  issueNumber?: number
): Promise<GitHubDeleteResult> => {
  try {
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    // PDF URL'sinden path çıkar ve sil
    if (pdfUrl && pdfUrl.includes('raw.githubusercontent.com')) {
      const pdfPath = extractGitHubPath(pdfUrl);
      if (pdfPath) {
        const pdfResult = await deleteFileFromGitHub(
          config, 
          pdfPath, 
          `Delete magazine ${issueNumber || 'unknown'} PDF`
        );
        
        if (pdfResult.success && pdfResult.deletedFiles) {
          deletedFiles.push(...pdfResult.deletedFiles);
        } else if (pdfResult.error) {
          errors.push(`PDF: ${pdfResult.error}`);
        }
      }
    }

    // Cover URL'sinden path çıkar ve sil
    if (coverUrl && coverUrl.includes('raw.githubusercontent.com')) {
      const coverPath = extractGitHubPath(coverUrl);
      if (coverPath) {
        const coverResult = await deleteFileFromGitHub(
          config, 
          coverPath, 
          `Delete magazine ${issueNumber || 'unknown'} cover`
        );
        
        if (coverResult.success && coverResult.deletedFiles) {
          deletedFiles.push(...coverResult.deletedFiles);
        } else if (coverResult.error) {
          errors.push(`Cover: ${coverResult.error}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      deletedFiles,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'URL-based delete failed'
    };
  }
};

/**
 * GitHub API ile dosya yükleme
 */
export const uploadFileToGitHub = async (
  config: GitHubStorageConfig,
  filePath: string,
  fileContent: string | ArrayBuffer,
  commitMessage: string = 'Upload file via admin panel'
): Promise<GitHubUploadResult> => {
  try {
    const { owner, repo, token, branch = 'main' } = config;
    
    // Base64 encode (string veya binary data için)
    let base64Content: string;
    if (typeof fileContent === 'string') {
      base64Content = btoa(unescape(encodeURIComponent(fileContent)));
    } else {
      // ArrayBuffer'ı güvenli şekilde base64'e çevir
      base64Content = arrayBufferToBase64(fileContent);
    }

    // Dosyanın var olup olmadığını kontrol et
    const fileInfo = await getFileInfo(config, filePath);

    // GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // Request body oluştur
    const requestBody: any = {
      message: commitMessage,
      content: base64Content,
      branch: branch
    };

    // Eğer dosya varsa SHA ekle (güncelleme için)
    if (fileInfo.exists && fileInfo.sha) {
      requestBody.sha = fileInfo.sha;
    }

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `GitHub API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Raw URL oluştur (direkt erişim için)
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const downloadUrl = result.content?.download_url;

    return {
      success: true,
      rawUrl,
      downloadUrl,
      fileName: filePath.split('/').pop()
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Dosyayı File object'ten GitHub'a yükle
 */
export const uploadFileObjectToGitHub = async (
  config: GitHubStorageConfig,
  file: File,
  targetPath: string,
  commitMessage?: string
): Promise<GitHubUploadResult> => {
  try {
    // File'ı ArrayBuffer'a çevir
    const arrayBuffer = await file.arrayBuffer();
    
    // File extension'a göre commit message oluştur
    const message = commitMessage || `Upload ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    
    return await uploadFileToGitHub(config, targetPath, arrayBuffer, message);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File processing failed'
    };
  }
};

/**
 * Dergi dosyalarını organize etmek için path oluşturucu
 */
export const createMagazinePaths = (issueNumber: number) => {
  const year = new Date().getFullYear();
  const paddedIssue = String(issueNumber).padStart(3, '0');
  
  return {
    pdfPath: `dergiler/${year}/sayi-${paddedIssue}/dergi-${paddedIssue}.pdf`,
    coverPath: `dergiler/${year}/sayi-${paddedIssue}/kapak-${paddedIssue}.jpg`,
    folder: `dergiler/${year}/sayi-${paddedIssue}/`
  };
};

/**
 * GitHub Raw URL'den flipbook sayfaları oluştur
 * PDF'i sayfa sayfa resme çevirmek için external service kullanır
 */
export const generateFlipbookPagesFromGitHub = (pdfRawUrl: string, maxPages: number = 20): string[] => {
  const pages: string[] = [];
  
  // PDF'i sayfa sayfa resme çeviren servisler
  const converters = [
    // 1. PDF.co API (free tier)
    (url: string, page: number) => `https://api.pdf.co/v1/pdf/convert/to/jpg?url=${encodeURIComponent(url)}&pages=${page}`,
    
    // 2. CloudConvert API (free tier) 
    (url: string, page: number) => `https://api.cloudconvert.com/v2/convert/pdf/jpg?input=${encodeURIComponent(url)}&page=${page}`,
    
    // 3. Basit thumbnail placeholder (fallback)
    (url: string, page: number) => `/placeholder.svg`
  ];
  
  // Şimdilik placeholder kullan, sonra real API entegre ederiz
  for (let i = 1; i <= maxPages; i++) {
    pages.push(`/placeholder.svg`);
  }
  
  return pages;
};

/**
 * GitHub repository'nin var olup olmadığını kontrol et
 */
export const checkGitHubRepo = async (config: GitHubStorageConfig): Promise<boolean> => {
  try {
    const { owner, repo, token } = config;
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Test fonksiyonu - GitHub API erişimini test eder
 */
export const testGitHubAccess = async (config: GitHubStorageConfig): Promise<string> => {
  try {
    const repoExists = await checkGitHubRepo(config);
    if (!repoExists) {
      return '❌ Repository bulunamadı veya erişim yok';
    }
    
    // Test dosyası yükle
    const testResult = await uploadFileToGitHub(
      config,
      'test/connection-test.txt',
      `GitHub Storage Test - ${new Date().toISOString()}`,
      'Test connection'
    );
    
    if (testResult.success) {
      return `✅ GitHub Storage bağlantısı başarılı!\n🔗 Test URL: ${testResult.rawUrl}`;
    } else {
      return `❌ Upload testi başarısız: ${testResult.error}`;
    }
  } catch (error) {
    return `❌ Test hatası: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

/**
 * Etkinlik dosyalarını organize etmek için path oluşturucu
 */
export const createEventPaths = (eventId: string, eventSlug: string) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  return {
    featuredImagePath: `etkinlikler/${year}/${month}/${eventSlug}/featured-image.jpg`,
    galleryFolder: `etkinlikler/${year}/${eventSlug}/galeri/`,
    documentsFolder: `etkinlikler/${year}/${eventSlug}/belgeler/`,
    folder: `etkinlikler/${year}/${eventSlug}/`
  };
};

/**
 * Etkinlik galeri resimlerini GitHub'a yükle
 */
export const uploadEventGalleryImages = async (
  config: GitHubStorageConfig,
  eventSlug: string,
  images: File[]
): Promise<{
  success: boolean;
  uploadedUrls: string[];
  failedUploads: { file: string; error: string }[];
}> => {
  const paths = createEventPaths('', eventSlug);
  const uploadedUrls: string[] = [];
  const failedUploads: { file: string; error: string }[] = [];

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const fileName = `galeri-${i + 1}-${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `${paths.galleryFolder}${fileName}`;

    try {
      const result = await uploadFileObjectToGitHub(
        config,
        file,
        filePath,
        `Add gallery image ${i + 1} for event ${eventSlug}`
      );

      if (result.success && result.rawUrl) {
        uploadedUrls.push(result.rawUrl);
      } else {
        failedUploads.push({
          file: file.name,
          error: result.error || 'Unknown error'
        });
      }
    } catch (error) {
      failedUploads.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }

  return {
    success: failedUploads.length === 0,
    uploadedUrls,
    failedUploads
  };
};

/**
 * Etkinlik öne çıkan görselini GitHub'a yükle
 */
export const uploadEventFeaturedImage = async (
  config: GitHubStorageConfig,
  eventSlug: string,
  imageFile: File
): Promise<GitHubUploadResult> => {
  const paths = createEventPaths('', eventSlug);
  const fileExtension = imageFile.name.split('.').pop();
  const filePath = `etkinlikler/${new Date().getFullYear()}/${eventSlug}/featured-image.${fileExtension}`;

  return await uploadFileObjectToGitHub(
    config,
    imageFile,
    filePath,
    `Update featured image for event ${eventSlug}`
  );
};

/**
 * Etkinlik belgelerini GitHub'a yükle (PDF, DOC vs.)
 */
export const uploadEventDocuments = async (
  config: GitHubStorageConfig,
  eventSlug: string,
  documents: File[]
): Promise<{
  success: boolean;
  uploadedDocuments: { name: string; url: string; size: number }[];
  failedUploads: { file: string; error: string }[];
}> => {
  const paths = createEventPaths('', eventSlug);
  const uploadedDocuments: { name: string; url: string; size: number }[] = [];
  const failedUploads: { file: string; error: string }[] = [];

  for (const file of documents) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${paths.documentsFolder}${fileName}`;

    try {
      const result = await uploadFileObjectToGitHub(
        config,
        file,
        filePath,
        `Add document ${file.name} for event ${eventSlug}`
      );

      if (result.success && result.rawUrl) {
        uploadedDocuments.push({
          name: file.name,
          url: result.rawUrl,
          size: file.size
        });
      } else {
        failedUploads.push({
          file: file.name,
          error: result.error || 'Unknown error'
        });
      }
    } catch (error) {
      failedUploads.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }

  return {
    success: failedUploads.length === 0,
    uploadedDocuments,
    failedUploads
  };
};

/**
 * Etkinlik ile ilgili tüm dosyaları GitHub'dan sil
 */
export const deleteEventFilesFromGitHub = async (
  config: GitHubStorageConfig,
  eventSlug: string,
  specificFiles?: {
    featuredImage?: string;
    galleryImages?: string[];
    documents?: string[];
  }
): Promise<GitHubDeleteResult> => {
  const deletedFiles: string[] = [];
  const errors: string[] = [];

  try {
    // Öne çıkan görseli sil
    if (specificFiles?.featuredImage) {
      const featuredPath = extractGitHubPath(specificFiles.featuredImage);
      if (featuredPath) {
        const result = await deleteFileFromGitHub(
          config,
          featuredPath,
          `Delete featured image for event ${eventSlug}`
        );
        if (result.success && result.deletedFiles) {
          deletedFiles.push(...result.deletedFiles);
        } else if (result.error) {
          errors.push(`Featured image: ${result.error}`);
        }
      }
    }

    // Galeri resimlerini sil
    if (specificFiles?.galleryImages) {
      for (const imageUrl of specificFiles.galleryImages) {
        const imagePath = extractGitHubPath(imageUrl);
        if (imagePath) {
          const result = await deleteFileFromGitHub(
            config,
            imagePath,
            `Delete gallery image for event ${eventSlug}`
          );
          if (result.success && result.deletedFiles) {
            deletedFiles.push(...result.deletedFiles);
          } else if (result.error) {
            errors.push(`Gallery image: ${result.error}`);
          }
        }
      }
    }

    // Belgeleri sil
    if (specificFiles?.documents) {
      for (const docUrl of specificFiles.documents) {
        const docPath = extractGitHubPath(docUrl);
        if (docPath) {
          const result = await deleteFileFromGitHub(
            config,
            docPath,
            `Delete document for event ${eventSlug}`
          );
          if (result.success && result.deletedFiles) {
            deletedFiles.push(...result.deletedFiles);
          } else if (result.error) {
            errors.push(`Document: ${result.error}`);
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      deletedFiles,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Event files delete failed'
    };
  }
};

// ====================================================================
// ÜRÜN (PRODUCT) FONKSİYONLARI - YENİ ÖZELLİK 🛍️
// ====================================================================

/**
 * Ürün dosyalarını organize etmek için path oluşturucu
 */
export const createProductPaths = (productId: string, productName: string) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // URL-safe product name oluştur
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  return {
    imageFolder: `urunler/${year}/${month}/${safeName}/`,
    mainImagePath: `urunler/${year}/${month}/${safeName}/ana-resim.jpg`,
    galleryFolder: `urunler/${year}/${month}/${safeName}/galeri/`,
    folder: `urunler/${year}/${month}/${safeName}/`
  };
};

/**
 * Ürün ana resmini GitHub'a yükle
 */
export const uploadProductMainImage = async (
  config: GitHubStorageConfig,
  productId: string,
  productName: string,
  imageFile: File
): Promise<GitHubUploadResult> => {
  const paths = createProductPaths(productId, productName);
  const fileExtension = imageFile.name.split('.').pop() || 'jpg';
  const filePath = `${paths.imageFolder}ana-resim.${fileExtension}`;

  return await uploadFileObjectToGitHub(
    config,
    imageFile,
    filePath,
    `Upload main image for product ${productName}`
  );
};

/**
 * Ürün galeri resimlerini GitHub'a yükle
 */
export const uploadProductImages = async (
  config: GitHubStorageConfig,
  productId: string,
  productName: string,
  images: File[]
): Promise<{
  success: boolean;
  uploadedUrls: string[];
  failedUploads: { file: string; error: string }[];
}> => {
  const paths = createProductPaths(productId, productName);
  const uploadedUrls: string[] = [];
  const failedUploads: { file: string; error: string }[] = [];

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `resim-${i + 1}-${Date.now()}.${fileExtension}`;
    const filePath = `${paths.galleryFolder}${fileName}`;

    try {
      const result = await uploadFileObjectToGitHub(
        config,
        file,
        filePath,
        `Add product image ${i + 1} for ${productName}`
      );

      if (result.success && result.rawUrl) {
        uploadedUrls.push(result.rawUrl);
      } else {
        failedUploads.push({
          file: file.name,
          error: result.error || 'Unknown error'
        });
      }
    } catch (error) {
      failedUploads.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }

  return {
    success: failedUploads.length === 0,
    uploadedUrls,
    failedUploads
  };
};

/**
 * Ürün resimlerini GitHub'dan sil
 */
export const deleteProductImagesFromGitHub = async (
  config: GitHubStorageConfig,
  imageUrls: string[],
  productName?: string
): Promise<GitHubDeleteResult> => {
  const deletedFiles: string[] = [];
  const errors: string[] = [];

  try {
    for (const imageUrl of imageUrls) {
      if (imageUrl && imageUrl.includes('raw.githubusercontent.com')) {
        const imagePath = extractGitHubPath(imageUrl);
        if (imagePath) {
          const result = await deleteFileFromGitHub(
            config,
            imagePath,
            `Delete product image for ${productName || 'product'}`
          );
          
          if (result.success && result.deletedFiles) {
            deletedFiles.push(...result.deletedFiles);
          } else if (result.error) {
            errors.push(`Image delete: ${result.error}`);
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      deletedFiles,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Product images delete failed'
    };
  }
};

/**
 * Ürün ile ilgili tüm dosyaları GitHub'dan sil
 */
export const deleteAllProductFilesFromGitHub = async (
  config: GitHubStorageConfig,
  productId: string,
  productName: string,
  existingImages?: string[]
): Promise<GitHubDeleteResult> => {
  try {
    // Eğer mevcut resim URL'leri verilmişse onları sil
    if (existingImages && existingImages.length > 0) {
      return await deleteProductImagesFromGitHub(config, existingImages, productName);
    }

    // Yoksa klasör bazında silme işlemi yapılabilir (gelecekte)
    return {
      success: true,
      deletedFiles: [],
      error: undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Product files delete failed'
    };
  }
};

/**
 * Ürün kategorisine göre resim optimizasyonu
 */
export const optimizeProductImage = async (
  imageFile: File,
  category: 'kirtasiye' | 'giyim' | 'aksesuar' | 'diger',
  maxSize: number = 1024 * 1024 // 1MB default
): Promise<File> => {
  // Kategori bazında optimizasyon ayarları
  const categorySettings = {
    kirtasiye: { quality: 0.8, maxWidth: 800, maxHeight: 600 },
    giyim: { quality: 0.9, maxWidth: 1200, maxHeight: 1200 },
    aksesuar: { quality: 0.85, maxWidth: 1000, maxHeight: 1000 },
    diger: { quality: 0.8, maxWidth: 800, maxHeight: 600 }
  };

  const settings = categorySettings[category];
  
  // Dosya boyutu kontrolü
  if (imageFile.size <= maxSize) {
    return imageFile; // Zaten uygun boyutta
  }

  // TODO: Gelecekte canvas ile resim optimizasyonu eklenebilir
  // Şimdilik orijinal dosyayı döndür
  return imageFile;
};

// ====================================================================
// TASARIM TALEPLERİ (PRODUCT DESIGN REQUESTS) FONKSİYONLARI 🎨
// ====================================================================

/**
 * Tasarım talebi dosyalarını organize etmek için path oluşturucu
 */
export const createDesignRequestPaths = (requestId: string, designTitle: string) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sanitizedTitle = designTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return {
    inspirationFolder: `tasarim-talepleri/${year}/${month}/${sanitizedTitle}-${requestId}/ilham-gorselleri/`,
    attachmentsFolder: `tasarim-talepleri/${year}/${month}/${sanitizedTitle}-${requestId}/ek-dosyalar/`,
    mainFolder: `tasarim-talepleri/${year}/${month}/${sanitizedTitle}-${requestId}/`
  };
};

/**
 * Tasarım talebi ilham görsellerini GitHub'a yükle
 */
export const uploadDesignRequestInspirationImages = async (
  config: GitHubStorageConfig,
  requestId: string,
  designTitle: string,
  images: File[]
): Promise<{
  success: boolean;
  uploadedUrls: string[];
  failedUploads: { file: string; error: string }[];
}> => {
  const paths = createDesignRequestPaths(requestId, designTitle);
  const uploadedUrls: string[] = [];
  const failedUploads: { file: string; error: string }[] = [];

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    
    // Güvenli dosya adı oluştur
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = `ilham-${i + 1}-${Date.now()}.${fileExtension}`;
    const filePath = `${paths.inspirationFolder}${safeFileName}`;

    try {
      // Resim optimizasyonu (sadece resim dosyaları için)
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        fileToUpload = await optimizeDesignRequestImage(file);
      }

      const result = await uploadFileObjectToGitHub(
        config,
        fileToUpload,
        filePath,
        `Add inspiration image ${i + 1} for design request: ${designTitle}`
      );

      if (result.success && result.rawUrl) {
        uploadedUrls.push(result.rawUrl);
      } else {
        failedUploads.push({
          file: file.name,
          error: result.error || 'Unknown upload error'
        });
      }
    } catch (error) {
      failedUploads.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Processing error'
      });
    }
  }

  return {
    success: failedUploads.length === 0,
    uploadedUrls,
    failedUploads
  };
};

/**
 * Tasarım talebi resimlerini optimize et
 */
export const optimizeDesignRequestImage = async (
  imageFile: File,
  maxSize: number = 2 * 1024 * 1024 // 2MB default (inspiration images can be larger)
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // İlham görselleri için daha geniş boyut limitleri
      const maxWidth = 1500;
      const maxHeight = 1500;
      
      let { width, height } = img;
      
      // Boyut kontrolü
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Resmi çiz
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Canvas'ı blob'a çevir
      canvas.toBlob((blob) => {
        if (blob && blob.size <= maxSize) {
          const optimizedFile = new File([blob], imageFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(optimizedFile);
        } else {
          // Kaliteyi düşür
          canvas.toBlob((smallerBlob) => {
            if (smallerBlob) {
              const optimizedFile = new File([smallerBlob], imageFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              resolve(imageFile);
            }
          }, 'image/jpeg', 0.7);
        }
      }, 'image/jpeg', 0.85);
    };
    
    img.onerror = () => resolve(imageFile);
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Tasarım talebi dosyalarını GitHub'dan sil (admin silme işlemi için)
 */
export const deleteDesignRequestFilesFromGitHub = async (
  config: GitHubStorageConfig,
  requestId: string,
  designTitle: string,
  inspirationImageUrls?: string[]
): Promise<GitHubDeleteResult> => {
  try {
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    // İlham görsellerini sil
    if (inspirationImageUrls && inspirationImageUrls.length > 0) {
      for (const imageUrl of inspirationImageUrls) {
        if (imageUrl && imageUrl.includes('raw.githubusercontent.com')) {
          const imagePath = extractGitHubPath(imageUrl);
          if (imagePath) {
            const deleteResult = await deleteFileFromGitHub(
              config,
              imagePath,
              `Delete inspiration image for design request: ${designTitle}`
            );

            if (deleteResult.success && deleteResult.deletedFiles) {
              deletedFiles.push(...deleteResult.deletedFiles);
            } else if (deleteResult.error) {
              errors.push(`Image: ${deleteResult.error}`);
            }
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      deletedFiles,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Design request delete failed'
    };
  }
};

/**
 * Tasarım talebi için tüm GitHub dosyalarını sil (klasör temizliği)
 */
export const deleteAllDesignRequestFilesFromGitHub = async (
  config: GitHubStorageConfig,
  requestId: string,
  designTitle: string,
  existingInspirationImages?: string[]
): Promise<GitHubDeleteResult> => {
  try {
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    // Mevcut inspiration images'ları URL'lerden sil
    if (existingInspirationImages && existingInspirationImages.length > 0) {
      const deleteResult = await deleteDesignRequestFilesFromGitHub(
        config,
        requestId,
        designTitle,
        existingInspirationImages
      );

      if (deleteResult.success && deleteResult.deletedFiles) {
        deletedFiles.push(...deleteResult.deletedFiles);
      } else if (deleteResult.error) {
        errors.push(deleteResult.error);
      }
    }

    // TODO: Klasör silme işlemi (GitHub API ile klasör silme biraz karmaşık)
    // Şimdilik dosya bazlı silme yapıyoruz

    return {
      success: errors.length === 0,
      deletedFiles,
      error: errors.length > 0 ? errors.join(', ') : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Complete design request delete failed'
    };
  }
}; 