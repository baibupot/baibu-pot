
import { useState, useEffect } from 'react';

export const useMagazineReads = (magazineId: string) => {
  const [readCount, setReadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!magazineId || magazineId === 'unknown') {
      setLoading(false);
      return;
    }

    // localStorage'dan okunma sayısını al
    const storageKey = `magazine_reads_${magazineId}`;
    const savedCount = localStorage.getItem(storageKey);
    if (savedCount) {
      setReadCount(parseInt(savedCount, 10));
    }
    
    setLoading(false);
  }, [magazineId]);

  const incrementReadCount = () => {
    if (!magazineId || magazineId === 'unknown') return;
    
    const newCount = readCount + 1;
    setReadCount(newCount);
    
    // localStorage'a kaydet
    const storageKey = `magazine_reads_${magazineId}`;
    localStorage.setItem(storageKey, newCount.toString());
  };

  return { readCount, loading, incrementReadCount };
};

export const useAllMagazineReads = () => {
  const [reads, setReads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage'dan tüm dergi okuma verilerini topla
    const getAllReadsFromStorage = () => {
      const allReads: any[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('magazine_reads_')) {
          const magazineId = key.replace('magazine_reads_', '');
          const readCount = parseInt(localStorage.getItem(key) || '0', 10);
          
          if (readCount > 0) {
            allReads.push({
              id: magazineId,
              title: `Dergi ${magazineId}`,
              read_count: readCount,
              updated_at: new Date().toISOString()
            });
          }
        }
      }
      
      // Okunma sayısına göre sırala
      allReads.sort((a, b) => b.read_count - a.read_count);
      setReads(allReads);
      setLoading(false);
    };

    getAllReadsFromStorage();
  }, []);

  return { reads, loading };
};
