
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

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

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'atolye': 'bg-blue-500',
      'konferans': 'bg-purple-500',
      'sosyal': 'bg-green-500',
      'egitim': 'bg-orange-500',
      'seminer': 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(currentMonth, 'MMMM yyyy', { locale: tr })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-20" />;
                }
                
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      p-2 h-20 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors
                      ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                      ${!isCurrentMonth ? 'opacity-50' : ''}
                      ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-950' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`w-full h-1 rounded ${getEventTypeColor(event.event_type)}`}
                          title={event.title}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          +{dayEvents.length - 2} daha
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Events */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? format(selectedDate, 'dd MMMM yyyy', { locale: tr })
                : 'Bir tarih seçin'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white">
                        {event.title}
                      </h4>
                      <Badge className={`${getEventTypeColor(event.event_type)} text-white text-xs`}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {format(new Date(event.event_date), 'HH:mm', { locale: tr })}
                      {event.location && ` • ${event.location}`}
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2 text-xs" asChild>
                      <Link to={`/etkinlikler/${event.slug}`}>
                        Detaylar
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                Bu tarihte etkinlik bulunmuyor.
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                Etkinlikleri görmek için takvimden bir tarih seçin.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventCalendar;
