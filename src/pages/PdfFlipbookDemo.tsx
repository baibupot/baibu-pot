import React, { useEffect, useState } from 'react';
import FlipbookReader from '@/components/FlipbookReader';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

const PDF_TO_USE = '/ornek.pdf'; // public klasörüne koyduğun PDF

const PdfFlipbookDemo = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      const pdf: PDFDocumentProxy = await getDocument(PDF_TO_USE).promise;
      const pageImages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
        pageImages.push(canvas.toDataURL());
      }
      setPages(pageImages);
      setLoading(false);
    };
    loadPdf();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg">Yükleniyor...</div>;
  if (!pages.length) return <div>PDF sayfaları yüklenemedi.</div>;

  return (
    <FlipbookReader
      pages={pages}
      title="PDF Flipbook Demo"
      onClose={() => window.location.reload()}
    />
  );
};

export default PdfFlipbookDemo; 