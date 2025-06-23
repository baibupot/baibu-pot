/**
 * 🔄 PDF Processor - PDF.js ile GitHub Raw PDF'lerini sayfa sayfa resme çevirir
 */

import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker'ını Vite için yapılandır
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface PdfProcessResult {
  success: boolean;
  pages: string[];
  error?: string;
  totalPages?: number;
}

/**
 * Progress callback tipi
 */
type ProgressCallback = (progress: number) => void;

/**
 * PDF dökümanını cache'le (tekrar yüklememek için)
 */
let cachedPdfDocument: any = null;
let cachedPdfUrl: string = '';

/**
 * 🆕 PDF'i sayfa sayfa ayırıp GitHub'a yükleme sistemi
 * Admin panelinde kullanılacak - her sayfayı ayrı JPG olarak yükler
 */
export interface PageUploadResult {
  success: boolean;
  totalPages: number;
  uploadedPages: string[]; // GitHub URL'leri
  error?: string;
  metadata: {
    issueNumber: number;
    title: string;
    totalPages: number;
    pageUrls: string[];
    uploadDate: string;
  };
}

export const processPdfToGitHubPages = async (
  pdfFile: File,
  issueNumber: number,
  title: string,
  githubConfig: any,
  uploadToGitHub: (config: any, file: File, path: string) => Promise<{success: boolean, rawUrl?: string, error?: string}>,
  onProgress?: (progress: number, status: string) => void
): Promise<PageUploadResult> => {
  try {
    onProgress?.(5, 'PDF dosyası okunuyor...');
    
    // PDF'i yükle
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    
    onProgress?.(10, `${totalPages} sayfa tespit edildi, işleme başlanıyor...`);
    
    const uploadedPages: string[] = [];
    const pageUrls: string[] = [];
    
    // Her sayfayı işle ve yükle
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        onProgress?.(
          10 + (pageNum / totalPages) * 80, 
          `Sayfa ${pageNum}/${totalPages} işleniyor...`
        );
        
        // Sayfayı render et
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Yüksek kalite
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context oluşturulamadı');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Canvas'ı blob'a çevir
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', 0.90); // Yüksek kalite JPEG
        });
        
        // File objesi oluştur
        const fileName = `page-${pageNum.toString().padStart(3, '0')}.jpg`;
        const pageFile = new File([blob], fileName, { type: 'image/jpeg' });
        
        // GitHub'a yükle
        const targetPath = `magazines/issue-${issueNumber}/pages/${fileName}`;
        const uploadResult = await uploadToGitHub(githubConfig, pageFile, targetPath);
        
        if (uploadResult.success && uploadResult.rawUrl) {
          uploadedPages.push(uploadResult.rawUrl);
          pageUrls.push(uploadResult.rawUrl);
          console.log(`✅ Sayfa ${pageNum} yüklendi: ${uploadResult.rawUrl}`);
        } else {
          throw new Error(`Sayfa ${pageNum} yüklenemedi: ${uploadResult.error}`);
        }
        
        // Memory temizliği
        page.cleanup();
        canvas.remove();
        
      } catch (pageError) {
        console.error(`❌ Sayfa ${pageNum} işlenirken hata:`, pageError);
        throw new Error(`Sayfa ${pageNum} işlenemedi: ${pageError}`);
      }
    }
    
    // Metadata.json oluştur ve yükle
    onProgress?.(95, 'Metadata dosyası oluşturuluyor...');
    
    const metadata = {
      issueNumber,
      title,
      totalPages,
      pageUrls,
      uploadDate: new Date().toISOString(),
      format: 'page-by-page',
      version: '1.0'
    };
    
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { 
      type: 'application/json' 
    });
    const metadataFile = new File([metadataBlob], 'metadata.json', { 
      type: 'application/json' 
    });
    
    const metadataPath = `magazines/issue-${issueNumber}/metadata.json`;
    const metadataUpload = await uploadToGitHub(githubConfig, metadataFile, metadataPath);
    
    if (!metadataUpload.success) {
      console.warn('Metadata yüklenemedi:', metadataUpload.error);
    }
    
    // PDF cleanup
    pdf.destroy();
    
    onProgress?.(100, `✅ ${totalPages} sayfa başarıyla yüklendi!`);
    
    return {
      success: true,
      totalPages,
      uploadedPages,
      metadata
    };
    
  } catch (error) {
    console.error('❌ PDF sayfa ayırma hatası:', error);
    return {
      success: false,
      totalPages: 0,
      uploadedPages: [],
      error: error instanceof Error ? error.message : 'PDF işleme başarısız',
      metadata: {
        issueNumber,
        title,
        totalPages: 0,
        pageUrls: [],
        uploadDate: new Date().toISOString()
      }
    };
  }
};

/**
 * 🆕 Sayfa sayfa yüklenmiş dergiden sayfaları okuma
 * Frontend'de kullanılacak
 */
export const loadMagazinePageUrls = async (
  issueNumber: number,
  githubConfig?: { owner: string; repo: string; branch: string }
): Promise<string[]> => {
  try {
    // GitHub config yoksa default değerler kullan
    const owner = githubConfig?.owner || 'Nadirmermer';
    const repo = githubConfig?.repo || 'baibu-pot-storage';
    const branch = githubConfig?.branch || 'main';
    
    const metadataUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/magazines/issue-${issueNumber}/metadata.json`;
    
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`Metadata yüklenemedi: ${response.status}`);
    }
    
    const metadata = await response.json();
    return metadata.pageUrls || [];
    
  } catch (error) {
    console.error('❌ Sayfa URL\'leri yüklenemedi:', error);
    return [];
  }
};

/**
 * PDF'den belirli sayfa aralığını işle (Lazy Loading)
 */
export const processGitHubPdfPages = async (
  pdfUrl: string,
  startPage: number,
  endPage: number,
  onProgress?: ProgressCallback
): Promise<PdfProcessResult> => {
  try {
    console.log(`🔄 PDF sayfa aralığı işleniyor: ${startPage}-${endPage}`);
    
    // PDF dokümağını cache'den al veya yükle - RANGE REQUESTS İLE
    let pdf = cachedPdfDocument;
    if (!pdf || cachedPdfUrl !== pdfUrl) {
      console.log('📥 PDF dökümanı yükleniyor (Range Requests ile)...');
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        // ✅ RANGE REQUESTS - sadece gerekli kısmı indir
        disableRange: false, // Range request'leri etkinleştir
        disableStream: false, // Streaming'i etkinleştir  
        rangeChunkSize: 1024 * 512, // 512KB chunk'lar (daha küçük)
        disableAutoFetch: true, // Otomatik tüm PDF indirme - KAPALI
        // ✅ Sadece gerekli sayfalar için byte range'leri indirir
      });
      
      pdf = await loadingTask.promise;
      cachedPdfDocument = pdf;
      cachedPdfUrl = pdfUrl;
      console.log(`📄 PDF cache'lendi (streaming): ${pdf.numPages} sayfa`);
    }
    
    const totalPages = pdf.numPages;
    const actualEndPage = Math.min(endPage, totalPages);
    const pagesToProcess = actualEndPage - startPage + 1;
    
    const pages: string[] = [];
    
    // Belirtilen sayfa aralığını işle - MEMORY OPTİMİZE
    for (let pageNum = startPage; pageNum <= actualEndPage; pageNum++) {
      try {
        console.log(`🔄 Sayfa ${pageNum} için range request yapılıyor...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 }); // Scale biraz düşürüldü
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context oluşturulamadı');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Daha iyi compression (dosya boyutu küçültür)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        pages.push(imageDataUrl);
        
        // ✅ AGGRESSIVE CLEANUP - memory'yi hemen temizle
        page.cleanup();
        canvas.remove(); // Canvas'ı DOM'dan temizle
        
        const progress = Math.round(((pageNum - startPage + 1) / pagesToProcess) * 100);
        onProgress?.(progress);
        
        console.log(`✅ Sayfa ${pageNum} işlendi ve memory temizlendi (${pageNum - startPage + 1}/${pagesToProcess})`);
        
      } catch (pageError) {
        console.error(`❌ Sayfa ${pageNum} işlenirken hata:`, pageError);
        pages.push('/placeholder.svg');
      }
    }
    
    return {
      success: true,
      pages,
      totalPages
    };
    
  } catch (error) {
    console.error('❌ PDF sayfa aralığı işleme hatası:', error);
    return {
      success: false,
      pages: [],
      error: error instanceof Error ? error.message : 'PDF sayfa aralığı işlenemedi'
    };
  }
};

/**
 * PDF'in sayfa sayısını öğren (CACHE SİSTEMİ İLE - tek indirme)
 */
export const getPdfPageCount = async (pdfUrl: string): Promise<number> => {
  try {
    // Mevcut cache'i kontrol et
    let pdf = cachedPdfDocument;
    if (!pdf || cachedPdfUrl !== pdfUrl) {
      console.log('📥 PDF sayfa sayısı için PDF yükleniyor (minimal range)...');
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        // ✅ MINIMAL RANGE REQUEST - sadece header ve ilk sayfa
        disableRange: false,
        disableStream: false,
        rangeChunkSize: 1024 * 256, // 256KB chunk (daha da küçük)
        disableAutoFetch: true, // Otomatik full download YOK
        // İlk request'te sadece PDF header'ı ve sayfa sayısını öğrenir
      });
      
      pdf = await loadingTask.promise;
      // ✅ Cache'le - destroy etme!
      cachedPdfDocument = pdf;
      cachedPdfUrl = pdfUrl;
      console.log(`📄 PDF cache'lendi (minimal range): ${pdf.numPages} sayfa`);
    }
    
    return pdf.numPages;
  } catch (error) {
    console.error('❌ PDF sayfa sayısı alınırken hata:', error);
    return 0;
  }
};

/**
 * PDF cache'ini temizle
 */
export const clearPdfCache = () => {
  if (cachedPdfDocument) {
    cachedPdfDocument.destroy();
    cachedPdfDocument = null;
    cachedPdfUrl = '';
    console.log('🗑️ PDF cache temizlendi');
  }
}; 