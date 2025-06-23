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