
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getEventCalendarColor, type EventType } from '@/constants/eventConstants';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location?: string;
  event_type: string;
  max_participants?: number;
  registration_required: boolean;
  featured_image?: string;
  status: string;
  slug: string;
}

interface EventCalendarProps {
  events: Event[];
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the week (Monday = 1, Sunday = 0)
  const firstDayOfWeek = monthStart.getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert Sunday (0) to 6

  // Add empty cells for days before month start
  const calendarDays = [
    ...Array(adjustedFirstDay).fill(null),
    ...monthDays
  ];

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), date)
    );
  };

  // Event calendar colors artık constants'tan geliyor

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-First Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col space-y-4">
          {/* Title and Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {format(currentMonth, 'MMMM yyyy', { locale: tr })}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-9 w-9 p-0 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-9 w-9 p-0 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile View Mode Toggle */}
          <div className="flex sm:hidden">
            <div className="inline-flex rounded-lg border bg-white/50 dark:bg-slate-700/50 p-1 w-full">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="flex-1 text-xs"
              >
                📅 Aylık
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="flex-1 text-xs"
              >
                📊 Haftalık
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className={`grid ${viewMode === 'month' || window.innerWidth >= 1024 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-6`}>
        {/* Calendar Grid */}
        <div className={viewMode === 'month' || window.innerWidth >= 1024 ? 'lg:col-span-2' : 'col-span-1'}>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Etkinlik Takvimi</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Mobile: Show only if month view or desktop */}
              {(viewMode === 'month' || window.innerWidth >= 640) && (
                <div className="grid grid-cols-7 gap-1">
                  {/* Week day headers */}
                  {weekDays.map(day => (
                    <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-1 sm:p-2 h-12 sm:h-20" />;
                    }
                    
                    const dayEvents = getEventsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isCurrentDay = isToday(day);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`
                          p-1 sm:p-2 h-12 sm:h-20 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-200 rounded-md
                          ${isSelected ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 scale-105' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                          ${!isCurrentMonth ? 'opacity-40' : ''}
                          ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''}
                        `}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={`text-xs sm:text-sm font-medium ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-0.5 mt-0.5 sm:mt-1">
                          {dayEvents.slice(0, window.innerWidth < 640 ? 1 : 2).map(event => (
                            <div
                              key={event.id}
                              className={`w-full h-0.5 sm:h-1 rounded ${getEventCalendarColor(event.event_type as EventType)}`}
                              title={event.title}
                            />
                          ))}
                          {dayEvents.length > (window.innerWidth < 640 ? 1 : 2) && (
                            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                              +{dayEvents.length - (window.innerWidth < 640 ? 1 : 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mobile: Week/List View for Mobile */}
              {viewMode === 'week' && window.innerWidth < 640 && (
                <div className="space-y-2">
                  {events
                    .filter(event => {
                      const eventDate = new Date(event.event_date);
                      return eventDate.getMonth() === currentMonth.getMonth() && 
                             eventDate.getFullYear() === currentMonth.getFullYear();
                    })
                    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                    .map(event => (
                      <div 
                        key={event.id} 
                        className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm"
                        onClick={() => setSelectedDate(new Date(event.event_date))}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
                            {event.title}
                          </h4>
                          <Badge className={`${getEventCalendarColor(event.event_type as EventType)} text-white text-xs ml-2 flex-shrink-0`}>
                            {event.event_type}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          📅 {format(new Date(event.event_date), 'dd MMM, HH:mm', { locale: tr })}
                          {event.location && ` • 📍 ${event.location}`}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events - Desktop Sidebar / Mobile Bottom */}
        {(viewMode === 'month' || window.innerWidth >= 1024) && (
          <div className="order-2 lg:order-1">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  {selectedDate 
                    ? format(selectedDate, 'dd MMMM yyyy', { locale: tr })
                    : '📅 Bir tarih seçin'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div key={event.id} className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {event.title}
                          </h4>
                          <Badge className={`${getEventCalendarColor(event.event_type as EventType)} text-white text-xs ml-2 flex-shrink-0`}>
                            {event.event_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          🕐 {format(new Date(event.event_date), 'HH:mm', { locale: tr })}
                          {event.location && (
                            <span className="block mt-1">📍 {event.location}</span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs h-8 font-medium" asChild>
                          <Link to={`/etkinlikler/${event.slug}`}>
                            👁️ Detayları Gör
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Bu tarihte etkinlik bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Etkinlik detaylarını görmek için
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      📱 Takvimden bir tarih seçin
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
