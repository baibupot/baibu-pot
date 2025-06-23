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
    
    // PDF dokümağını cache'den al veya yükle
    let pdf = cachedPdfDocument;
    if (!pdf || cachedPdfUrl !== pdfUrl) {
      console.log('📥 PDF dökümanı yükleniyor...');
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      pdf = await loadingTask.promise;
      cachedPdfDocument = pdf;
      cachedPdfUrl = pdfUrl;
      console.log(`📄 PDF cache'lendi: ${pdf.numPages} sayfa`);
    }
    
    const totalPages = pdf.numPages;
    const actualEndPage = Math.min(endPage, totalPages);
    const pagesToProcess = actualEndPage - startPage + 1;
    
    const pages: string[] = [];
    
    // Belirtilen sayfa aralığını işle
    for (let pageNum = startPage; pageNum <= actualEndPage; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context oluşturulamadı');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        pages.push(imageDataUrl);
        
        page.cleanup();
        
        const progress = Math.round(((pageNum - startPage + 1) / pagesToProcess) * 100);
        onProgress?.(progress);
        
        console.log(`✅ Sayfa ${pageNum} işlendi (${pageNum - startPage + 1}/${pagesToProcess})`);
        
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
 * PDF'in sayfa sayısını öğren (hızlı kontrol)
 */
export const getPdfPageCount = async (pdfUrl: string): Promise<number> => {
  try {
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    pdf.destroy();
    
    return pageCount;
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