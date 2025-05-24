
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EventsSection = () => {
  const events = [
    {
      id: 1,
      title: "Mindfulness ve Stres Yönetimi Atölyesi",
      date: "25 Mart 2024",
      time: "14:00 - 16:00",
      location: "Psikoloji Bölümü Konferans Salonu",
      type: "Atölye",
      spots: "20 kişi"
    },
    {
      id: 2,
      title: "Psikoloji Kariyer Günleri",
      date: "2-3 Nisan 2024",
      time: "09:00 - 17:00",
      location: "Rektörlük Konferans Salonu",
      type: "Konferans",
      spots: "150 kişi"
    },
    {
      id: 3,
      title: "Kitap Kulübü Buluşması",
      date: "10 Nisan 2024",
      time: "18:30 - 20:00",
      location: "Kütüphane Toplantı Salonu",
      type: "Sosyal",
      spots: "15 kişi"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Atölye':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Konferans':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Sosyal':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Gelecek Etkinlik Takvimimiz
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Psikoloji alanında düzenlediğimiz atölyeler, konferanslar ve sosyal etkinliklere katılın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {events.map((event) => (
            <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getTypeColor(event.type)}>
                    {event.type}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {event.spots}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                  {event.title}
                </h3>
                
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <span className="font-medium w-16">Tarih:</span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">Saat:</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-16 mt-0.5">Yer:</span>
                    <span className="flex-1">{event.location}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pb-6">
                <Button size="sm" className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white">
                  Kayıt Ol
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/etkinlikler">
              Tüm Etkinlikler
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
