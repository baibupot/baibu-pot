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
    
    // 404 hatası normal, dosya yok demektir
    if (response.status === 404) {
      return { exists: false };
    }
    
    // Diğer hatalar için sadece debug modunda yazdır
    if (process.env.NODE_ENV === 'development') {
      console.warn(`GitHub API error for ${filePath}: ${response.status} ${response.statusText}`);
    }
    return { exists: false };
  } catch (error) {
    // Network hatalarını sessizce handle et
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

    // Dosyanın var olup olmadığını kontrol et (sessizce)
    let fileInfo: { exists: boolean; sha?: string } = { exists: false };
    try {
      fileInfo = await getFileInfo(config, filePath);
    } catch (error) {
      // Dosya bilgisi alınamazsa yeni dosya olarak kabul et
      fileInfo = { exists: false };
    }

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
  maxSize: number = 10 * 1024 * 1024 // 10MB default (inspiration images can be larger)
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

// ====================================================================
// AKADEMİK BELGELER (ACADEMIC DOCUMENTS) FONKSİYONLARI 📚
// ====================================================================

/**
 * Akademik belgeler için dosya yolu oluşturucu
 */
export const createAcademicDocumentPaths = (
  category: string, 
  documentTitle: string, 
  documentId?: string
) => {
  const year = new Date().getFullYear();
  const semester = new Date().getMonth() >= 8 ? 'guz' : 'bahar'; // Eylül+ = Güz, diğer = Bahar
  
  // Dosya adını safe hale getir - Türkçe karakter desteği
  const safeTitle = documentTitle
    .toLowerCase()
    // Türkçe karakterleri İngilizce karşılıklarıyla değiştir
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    // Diğer özel karakterleri kaldır
    .replace(/[^\w\s-]/g, '')
    // Boşlukları tire ile değiştir
    .replace(/\s+/g, '-')
    // Çoklu tireleri tek tire yap
    .replace(/-+/g, '-')
    // Başta ve sonda tire varsa kaldır
    .replace(/^-+|-+$/g, '')
    // Maksimum 50 karakter
    .substring(0, 50)
    .replace(/-+$/, ''); // Son tire varsa kaldır
  
  // Kategori bazında klasör organizasyonu
  const categoryFolders: Record<string, string> = {
    'ders_programlari': 'ders-programlari',
    'staj_belgeleri': 'staj-belgeleri', 
    'sinav_programlari': 'sinav-programlari',
    'ogretim_planlari': 'ogretim-planlari',
    'ders_kataloglari': 'ders-kataloglari',
    'basvuru_formlari': 'basvuru-formlari',
    'resmi_belgeler': 'resmi-belgeler',
    'rehber_dokumanlari': 'rehber-dokumanlari',
    'diger': 'diger'
  };

  const categoryFolder = categoryFolders[category] || 'diger';
  const timestamp = documentId ? documentId.substring(0, 8) : Date.now().toString().substring(-8);
  
  return {
    documentPath: `belgeler/${year}/${semester}/${categoryFolder}/${safeTitle}-${timestamp}.pdf`,
    thumbnailPath: `belgeler/${year}/${semester}/${categoryFolder}/thumbs/${safeTitle}-${timestamp}-thumb.jpg`,
    folder: `belgeler/${year}/${semester}/${categoryFolder}/`,
    category: categoryFolder,
    year,
    semester
  };
};

/**
 * Akademik belgeyi GitHub'a yükle
 */
export const uploadAcademicDocumentToGitHub = async (
  config: GitHubStorageConfig,
  file: File,
  category: string,
  documentTitle: string,
  documentId?: string
): Promise<GitHubUploadResult> => {
  try {
    const paths = createAcademicDocumentPaths(category, documentTitle, documentId);
    
    // Dosya boyutu kontrolü (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `Dosya boyutu çok büyük. Maksimum ${maxSize / 1024 / 1024}MB olmalı.`
      };
    }

    // Dosya tipini kontrol et
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Desteklenmeyen dosya formatı. PDF, Word, Excel, PowerPoint, resim veya metin dosyası yükleyiniz.'
      };
    }

    // Dosya uzantısına göre path belirle
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const finalPath = paths.documentPath.replace('.pdf', `.${fileExtension}`);
    
    const result = await uploadFileObjectToGitHub(
      config,
      file,
      finalPath,
      `Add academic document: ${documentTitle} (${category})`
    );

    return result;

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Academic document upload failed'
    };
  }
};

/**
 * Akademik belgeyi GitHub'dan sil
 */
export const deleteAcademicDocumentFromGitHub = async (
  config: GitHubStorageConfig,
  documentUrl: string,
  documentTitle?: string
): Promise<GitHubDeleteResult> => {
  try {
    if (!documentUrl.includes('raw.githubusercontent.com')) {
      return {
        success: true, // GitHub dosyası değilse silme işlemi gerekmiyor
        deletedFiles: []
      };
    }

    const filePath = extractGitHubPath(documentUrl);
    if (!filePath) {
      return {
        success: false,
        error: 'Geçersiz GitHub URL'
      };
    }

    const result = await deleteFileFromGitHub(
      config,
      filePath,
      `Delete academic document: ${documentTitle || 'Unknown'}`
    );

    return result;

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Academic document delete failed'
    };
  }
};

/**
 * Kategori bazında akademik belgeleri organize et
 */
export const organizeAcademicDocumentsByCategory = (documents: any[]) => {
  const categories = {
    'ders_programlari': [],
    'staj_belgeleri': [], 
    'sinav_programlari': [],
    'ogretim_planlari': [],
    'ders_kataloglari': [],
    'basvuru_formlari': [],
    'resmi_belgeler': [],
    'rehber_dokumanlari': [],
    'diger': []
  } as Record<string, any[]>;

  documents.forEach(doc => {
    const category = doc.category || 'diger';
    if (categories[category]) {
      categories[category].push(doc);
    } else {
      categories['diger'].push(doc);
    }
  });

  return categories;
};

/**
 * Akademik belge istatistikleri oluştur
 */
export const generateAcademicDocumentStats = (documents: any[]) => {
  const totalDocs = documents.length;
  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloads || 0), 0);
  const categoryStats = organizeAcademicDocumentsByCategory(documents);
  
  const categoryCount = Object.entries(categoryStats).map(([category, docs]) => ({
    category,
    count: docs.length,
    downloads: docs.reduce((sum: number, doc: any) => sum + (doc.downloads || 0), 0)
  }));

  return {
    totalDocs,
    totalDownloads,
    categoryCount,
    averageDownloads: totalDocs > 0 ? Math.round(totalDownloads / totalDocs) : 0
  };
};

/**
 * Akademik belge için dosya tipini tespit et
 */
export const detectDocumentType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const typeMap: Record<string, string> = {
    'pdf': 'PDF',
    'doc': 'Word',
    'docx': 'Word',
    'xls': 'Excel',
    'xlsx': 'Excel',
    'ppt': 'PowerPoint',
    'pptx': 'PowerPoint',
    'txt': 'Metin',
    'jpg': 'Resim',
    'jpeg': 'Resim',
    'png': 'Resim'
  };

  return typeMap[extension] || 'Belge';
};

/**
 * Güvenli dosya indirme - HTTPS/HTTP uyumlu, güvenlik uyarısını önler
 */
export const downloadFileSafely = async (
  fileUrl: string, 
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Dosya adını güvenli hale getir
    const safeFileName = fileName
      // Türkçe karakterleri dönüştür
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      // Zararlı karakterleri temizle
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 100); // Maksimum 100 karakter

    // HTTPS kontrolü - Development vs Production stratejisi
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalDev = window.location.hostname.includes('192.168') || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

    // Eğer HTTPS değilse ve yerel development ise, direct download kullan
    if (!isHTTPS && isLocalDev) {
      console.log('🔧 Development ortamında direct download kullanılıyor (HTTPS uyarısı önleme)');
      
      // Progress simülasyonu
      if (onProgress) {
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          onProgress(progress);
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 100);
      }

      // Direct download - güvenlik uyarısı yok
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = safeFileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true };
    }

    // HTTPS ortamında veya production'da gelişmiş blob download
    console.log('🔒 HTTPS ortamında güvenli blob download kullanılıyor');
    
    // Fetch ile dosyayı çek
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Progress tracking için content-length al
    const contentLength = response.headers.get('content-length');
    const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Response body'yi stream olarak oku
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Dosya okuma hatası');
    }

    // Chunks'ları biriktir
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      // Progress callback
      if (onProgress && totalSize > 0) {
        onProgress((receivedLength / totalSize) * 100);
      }
    }

    // Tek bir Uint8Array'e birleştir
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    // Blob oluştur
    const blob = new Blob([chunksAll], { 
      type: response.headers.get('content-type') || 'application/octet-stream' 
    });

    // Download link oluştur ve tıkla
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = safeFileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Memory cleanup
    URL.revokeObjectURL(downloadUrl);

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'İndirme hatası'
    };
  }
};

/**
 * Dosya adını Türkçe karakterlerle normalize et
 */
export const normalizeFileName = (fileName: string): string => {
  return fileName
    // Türkçe karakterleri koru ama güvenli hale getir
    .replace(/[<>:"/\\|?*]/g, '_')  // Zararlı karakterleri _ ile değiştir
    .replace(/\s+/g, '_')          // Boşlukları _ ile değiştir
    .replace(/_+/g, '_')           // Çoklu _ karakterlerini tek _ yap
    .replace(/^_+|_+$/g, '')       // Başta ve sonda _ varsa kaldır
    .substring(0, 100);            // Maksimum 100 karakter
}; 