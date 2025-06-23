import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Eye, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet,
  MapPin,
  TrendingUp,
  Users,
  Download,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReadingStats {
  totalReads: number;
  totalReadingTime: number;
  avgReadingTime: number;
  completedReads: number;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topLocations: Array<{
    location: string;
    count: number;
  }>;
  recentReads: Array<{
    id: string;
    magazine_title: string;
    reading_duration: number;
    device_type: string;
    created_at: string;
  }>;
}

interface MagazineReadsStatsProps {
  magazineId?: string;
  showAllStats?: boolean;
}

const MagazineReadsStats: React.FC<MagazineReadsStatsProps> = ({ 
  magazineId, 
  showAllStats = false 
}) => {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [magazineId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query builder
      let query = supabase
        .from('magazine_reads')
        .select(`
          *,
          magazine_issues!inner(title)
        `);

      // Belirli dergi için filtreleme
      if (magazineId && !showAllStats) {
        query = query.eq('magazine_issue_id', magazineId);
      }

      const { data: reads, error: readsError } = await query;

      if (readsError) throw readsError;

      if (!reads) {
        setStats(null);
        return;
      }

      // İstatistikleri hesapla
      const totalReads = reads.length;
      const totalReadingTime = reads.reduce((sum, read) => sum + (read.reading_duration || 0), 0);
      const avgReadingTime = totalReads > 0 ? Math.round(totalReadingTime / totalReads) : 0;
      const completedReads = reads.filter(read => read.completed_reading).length;

      // Cihaz istatistikleri
      const deviceStats = reads.reduce((acc, read) => {
        const device = read.device_type || 'desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, { mobile: 0, desktop: 0, tablet: 0 });

      // Konum istatistikleri
      const locationCounts = reads.reduce((acc, read) => {
        const location = read.reader_location || 'Bilinmiyor';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Son okumalar
      const recentReads = reads
        .map(read => ({
          id: read.id,
          magazine_title: read.magazine_issues?.title || 'Bilinmiyor',
          reading_duration: read.reading_duration || 0,
          device_type: read.device_type || 'desktop',
          created_at: read.created_at
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setStats({
        totalReads,
        totalReadingTime,
        avgReadingTime,
        completedReads,
        deviceStats,
        topLocations,
        recentReads
      });

    } catch (error: any) {
      console.error('Stats fetch error:', error);
      setError(error.message || 'İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}dk ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Okuma İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">İstatistikler yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Okuma İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            <p>{error}</p>
            <Button onClick={fetchStats} variant="outline" size="sm" className="mt-2">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalReads === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Okuma İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Henüz okuma verisi bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = stats.totalReads > 0 ? Math.round((stats.completedReads / stats.totalReads) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Okuma</p>
                <p className="text-2xl font-bold">{stats.totalReads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ortalama Süre</p>
                <p className="text-2xl font-bold">{formatDuration(stats.avgReadingTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Tamamlama</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Toplam Süre</p>
                <p className="text-2xl font-bold">{formatDuration(stats.totalReadingTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cihaz ve Konum İstatistikleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cihaz Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-5 h-5" />
              Cihaz Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.deviceStats).map(([device, count]) => {
                const percentage = stats.totalReads > 0 ? Math.round((count / stats.totalReads) * 100) : 0;
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device)}
                      <span className="capitalize">{device === 'mobile' ? 'Mobil' : device === 'tablet' ? 'Tablet' : 'Masaüstü'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count} ({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Lokasyonlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" />
              Popüler Lokasyonlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topLocations.slice(0, 5).map((location, index) => {
                const percentage = stats.totalReads > 0 ? Math.round((location.count / stats.totalReads) * 100) : 0;
                return (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="truncate">{location.location}</span>
                    </div>
                    <span className="text-sm font-medium">{location.count} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Son Okumalar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Son Okumalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentReads.slice(0, 8).map((read) => (
              <div key={read.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(read.device_type)}
                  <div>
                    <p className="font-medium truncate max-w-48">{read.magazine_title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(read.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {formatDuration(read.reading_duration)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MagazineReadsStats;
