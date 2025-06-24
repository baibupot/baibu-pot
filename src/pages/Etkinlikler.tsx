import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, List, Search, Filter, MapPin, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import EventCalendar from '@/components/events/EventCalendar';
import EventSuggestionModal from '@/components/EventSuggestionModal';
import { useEvents } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { 
  getEventTypeLabel, 
  getEventStatusLabel,
  EVENTS_PER_PAGE,
  EVENTS_PER_PAGE_OPTIONS,
  EVENT_TYPES,
  EVENT_STATUSES,
  type EventType,
  type EventStatus 
} from '@/constants/eventConstants';

const Etkinlikler = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(EVENTS_PER_PAGE);
  const [isEventSuggestionModalOpen, setIsEventSuggestionModalOpen] = useState(false);
  
  const { data: events = [], isLoading, error } = useEvents();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [events, searchTerm, statusFilter, typeFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = viewMode === 'list' 
    ? filteredEvents.slice(startIndex, endIndex)
    : filteredEvents; // Calendar view shows all events

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, itemsPerPage]);

  // Etkinlik önerme fonksiyonu
  const handleEventSuggestion = async (suggestionData: any) => {
    try {
      const { error } = await supabase
        .from('event_suggestions')
        .insert([suggestionData]);

      if (error) throw error;
      
      toast.success('🎉 Etkinlik öneriniz başarıyla gönderildi! Yakında değerlendirilecek.');
    } catch (error) {
      console.error('Error submitting event suggestion:', error);
      throw error;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingPage 
          title="Etkinlikler Yükleniyor"
          message="Topluluk etkinliklerimizi hazırlıyoruz..."
          icon={Calendar}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <ErrorState 
          title="Etkinlikler Yüklenemedi"
          message="Etkinlik takvimini yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="gradient">
      {/* Hero Section - Mobile Optimized */}
      <PageHero
        title="Etkinlik Takvimimiz"
        description="Topluluğumuzun düzenlediği tüm etkinlikleri keşfedin. Atölyeler, konferanslar, sosyal etkinlikler ve daha fazlası için takipte kalın."
        icon={Calendar}
        gradient="purple"
      >
        {events.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-white/25 dark:bg-slate-800/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20 dark:border-slate-700/20">
              <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {events.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">Toplam Etkinlik</div>
            </div>
            <div className="bg-white/25 dark:bg-slate-800/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20 dark:border-slate-700/20">
              <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {events.filter(e => e.status === 'upcoming').length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">Yaklaşan</div>
            </div>
            <div className="bg-white/25 dark:bg-slate-800/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20 dark:border-slate-700/20">
              <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {events.filter(e => e.status === 'ongoing').length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">Devam Eden</div>
            </div>
            <div className="bg-white/25 dark:bg-slate-800/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20 dark:border-slate-700/20">
              <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {new Set(events.map(e => e.event_type)).size}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">Farklı Tür</div>
            </div>
          </div>
        )}
      </PageHero>

      {/* Controls - Mobile First */}
      <section className="py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* View Mode Toggle - Mobile Friendly */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-xl border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-1 shadow-lg w-full max-w-sm sm:w-auto">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 text-sm font-medium"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Liste Görünümü</span>
                <span className="sm:hidden">Liste</span>
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 text-sm font-medium"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Takvim Görünümü</span>
                <span className="sm:hidden">Takvim</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters - Mobile Optimized */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
            {/* Mobile: Search First */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="🔍 Etkinlik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base bg-white/90 dark:bg-slate-700/90 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                />
              </div>
              
              {/* Mobile: Stacked Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 bg-white/90 dark:bg-slate-700/90 border-2 border-transparent rounded-xl text-base">
                    <SelectValue placeholder="📊 Durum Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌐 Tüm Durumlar</SelectItem>
                    {Object.entries(EVENT_STATUSES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-12 bg-white/90 dark:bg-slate-700/90 border-2 border-transparent rounded-xl text-base">
                    <SelectValue placeholder="🎯 Tür Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌈 Tüm Türler</SelectItem>
                    {Object.entries(EVENT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  className="h-12 flex items-center justify-center gap-2 bg-white/90 dark:bg-slate-700/90 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl font-medium" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  <Filter className="h-5 w-5" />
                  <span className="hidden sm:inline">Filtreleri Temizle</span>
                  <span className="sm:hidden">Temizle</span>
                </Button>
              </div>

              {/* Active Filters Display - Mobile Friendly */}
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Aktif filtreler:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                      🔍 "{searchTerm}"
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                      📊 {EVENT_STATUSES[statusFilter as keyof typeof EVENT_STATUSES]}
                    </span>
                  )}
                  {typeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
                      🎯 {EVENT_TYPES[typeFilter as keyof typeof EVENT_TYPES]}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content - Mobile Optimized */}
      <section className="pb-8 sm:pb-12">
        {viewMode === 'list' ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Events Per Page Selector - Mobile Friendly */}
            {filteredEvents.length > 0 && (
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                        {filteredEvents.length} etkinlik bulundu
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {currentPage}/{totalPages} sayfa • Toplam {events.length} etkinlik
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">📄 Sayfa başına:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                      <SelectTrigger className="w-full sm:w-24 h-10 bg-white/90 dark:bg-slate-700/90 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENTS_PER_PAGE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Events List - Mobile Optimized Grid */}
            <div className="space-y-4 sm:space-y-6">
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="transform transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 duration-600"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <EventCard event={event} />
                  </div>
                ))
              ) : (
                <div className="min-h-[60vh] flex items-center justify-center">
                  <EmptyState
                    icon={Calendar}
                    title="🔍 Etkinlik Bulunamadı"
                    description="Aradığınız kriterlere uygun etkinlik bulunmuyor. Lütfen farklı filtreler deneyin veya arama teriminizi değiştirin."
                    variant="search"
                    actionLabel="🧹 Filtreleri Temizle"
                    onAction={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Pagination - Mobile Optimized */}
            {totalPages > 1 && (
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/20">
                <div className="flex flex-col gap-4">
                  {/* Mobile: Current Page Info */}
                  <div className="text-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      📄 Sayfa {currentPage} / {totalPages}
                    </span>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 h-11 px-4 bg-white/90 dark:bg-slate-700/90 border-2 rounded-xl font-medium disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Önceki</span>
                    </Button>
                    
                    {/* Page Numbers - Mobile Simplified */}
                    <div className="flex items-center gap-1 px-2">
                      {/* Mobile: Show only current and adjacent pages */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-xl font-semibold ${
                                page === currentPage 
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                                  : 'bg-white/90 dark:bg-slate-700/90 border-2'
                              }`}
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span 
                              key={page} 
                              className="px-2 text-slate-400 dark:text-slate-500 text-lg"
                            >
                              ⋯
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 h-11 px-4 bg-white/90 dark:bg-slate-700/90 border-2 rounded-xl font-medium disabled:opacity-50"
                    >
                      <span className="hidden sm:inline">Sonraki</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Jump - Desktop Only */}
                  {totalPages > 5 && (
                    <div className="hidden sm:flex justify-center items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Hızlı git:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="text-xs h-8 px-3"
                      >
                        🏠 İlk Sayfa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="text-xs h-8 px-3"
                      >
                        🏁 Son Sayfa
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
            <EventCalendar events={filteredEvents} />
          </div>
        )}
      </section>

      {/* Call to Action - Mobile Optimized */}
      {events.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 sm:p-8 text-center border border-blue-200/30 dark:border-blue-700/30 shadow-lg backdrop-blur-sm">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <div className="text-4xl sm:text-5xl mb-4">💡</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Etkinlik Önerisi Var mı?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Aklınızda harika bir etkinlik fikri mi var? 🚀<br className="sm:hidden" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Bizimle paylaşın, birlikte gerçekleştirelim!</span>
              </p>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  onClick={() => setIsEventSuggestionModalOpen(true)}
                  className="group h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Users className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  🎯 Etkinlik Öner
                </Button>
              </div>
              <div className="pt-2">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  📧 Önerilerinizi bize iletebilir, topluluk olarak değerlendirebiliriz
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Event Suggestion Modal */}
      <EventSuggestionModal
        isOpen={isEventSuggestionModalOpen}
        onClose={() => setIsEventSuggestionModalOpen(false)}
        onSubmit={handleEventSuggestion}
      />
    </PageContainer>
  );
};

export default Etkinlikler;
