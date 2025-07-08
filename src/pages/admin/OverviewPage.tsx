import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Calendar, BookOpen, MessageSquare, Users, Shield, 
  Package, Building2, ClipboardList, GraduationCap, Briefcase,
  Clock, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { AdminPageContainer, StatsCard } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useNews, useEvents, useMagazineIssues, useContactMessages, useUsers, useUserRoles, useProducts, useSponsors, useSurveys, useAcademicDocuments, useInternships, useActivityLogs } from '@/hooks/useSupabaseData';
import { layout, spacing, colors, responsive } from '@/shared/design-system';
import { cn } from '@/lib/utils';

export const OverviewPage: React.FC = () => {
  const { hasPermission, user } = useAdminContext();
  const [isActivitiesExpanded, setIsActivitiesExpanded] = useState(false);
  
  // Permission'a göre veri çekme - sadece gerekli permission'ı olan kullanıcılar veri çeksin
  const { data: news } = hasPermission('news') ? useNews(false) : { data: null };
  const { data: events } = hasPermission('events') ? useEvents() : { data: null };
  const { data: magazines } = hasPermission('magazine') ? useMagazineIssues(false) : { data: null };
  const { data: contactMessages } = hasPermission('messages') ? useContactMessages() : { data: null };
  const { data: users } = hasPermission('users') ? useUsers() : { data: null };
  const { data: userRoles } = hasPermission('users') ? useUserRoles() : { data: null };
  const { data: products } = hasPermission('products') ? useProducts() : { data: null };
  const { data: sponsors } = hasPermission('sponsors') ? useSponsors() : { data: null };
  const { data: surveys } = hasPermission('surveys') ? useSurveys() : { data: null };
  const { data: documents } = hasPermission('documents') ? useAcademicDocuments() : { data: null };
  const { data: internships } = hasPermission('internships') ? useInternships() : { data: null };
  const { data: activityLogs } = hasPermission('activity_logs') ? useActivityLogs(50) : { data: null }; // Sadece izinli kullanıcılar

  // Kişiselleştirilmiş karşılama mesajı
  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
    const userName = user?.name || user?.email?.split('@')[0] || 'Değerli Kullanıcı';
    return `${timeGreeting}, ${userName}! 👋`;
  };

  // Hızlı erişim kartlarına tıklama fonksiyonu
  const handleQuickAccessClick = (tabName: string) => {
    // URL'yi güncelle
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', tabName);
    window.history.pushState({}, '', currentUrl.toString());
    
    // Custom event ile tab değişimini bildir
    const event = new CustomEvent('tabChange', { detail: { tab: tabName } });
    window.dispatchEvent(event);
  };

  // Son aktiviteler - Aktivite loglarından
  const getRecentActivity = () => {
    if (!activityLogs?.length) return [];
    
    return activityLogs.slice(0, 20).map(log => { // İlk 20'yi göster
      // Entity type'a göre icon ve renk belirleme
      const getEntityIcon = (entityType: string) => {
        switch (entityType) {
          case 'news': return FileText;
          case 'events': return Calendar;
          case 'magazine': return BookOpen;
          case 'sponsors': return Building2;
          case 'users': return Users;
          case 'team': return Users;
          case 'documents': return FileText;
          case 'internships': return GraduationCap;
          case 'surveys': return ClipboardList;
          case 'products': return Package;
          case 'messages': return MessageSquare;
          case 'comments': return MessageSquare;
          default: return Clock;
        }
      };

      const getActionColor = (actionType: string) => {
        switch (actionType) {
          case 'create': return 'text-green-600';
          case 'update': return 'text-blue-600';
          case 'delete': return 'text-red-600';
          case 'publish': return 'text-purple-600';
          case 'unpublish': return 'text-orange-600';
          case 'approve': return 'text-emerald-600';
          case 'reject': return 'text-red-600';
          case 'login': return 'text-indigo-600';
          case 'logout': return 'text-gray-600';
          default: return 'text-gray-600';
        }
      };

      const getActionText = (actionType: string) => {
        switch (actionType) {
          case 'create': return 'oluşturdu';
          case 'update': return 'güncelledi';
          case 'delete': return 'sildi';
          case 'publish': return 'yayınladı';
          case 'unpublish': return 'yayından kaldırdı';
          case 'approve': return 'onayladı';
          case 'reject': return 'reddetti';
          case 'login': return 'giriş yaptı';
          case 'logout': return 'çıkış yaptı';
          default: return actionType;
        }
      };

      const getEntityTypeText = (entityType: string) => {
        switch (entityType) {
          case 'news': return 'haber';
          case 'events': return 'etkinlik';
          case 'magazine': return 'dergi';
          case 'sponsors': return 'sponsor';
          case 'users': return 'kullanıcı';
          case 'team': return 'ekip';
          case 'documents': return 'belge';
          case 'internships': return 'staj';
          case 'surveys': return 'anket';
          case 'products': return 'ürün';
          case 'messages': return 'mesaj';
          case 'comments': return 'yorum';
          default: return entityType;
        }
      };

      const Icon = getEntityIcon(log.entity_type);
      const color = getActionColor(log.action_type);
      const actionText = getActionText(log.action_type);
      const entityTypeText = getEntityTypeText(log.entity_type);
      
      return {
        id: log.id,
        user: log.user_name,
        userRole: log.user_role,
        action: actionText,
        entityType: entityTypeText,
        entityTitle: log.entity_title || 'Bilinmeyen',
        description: log.description,
        date: new Date(log.created_at || '').toLocaleDateString('tr-TR'),
        time: new Date(log.created_at || '').toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        icon: Icon,
        color: color,
        fullDate: log.created_at
      };
    });
  };

  // Hızlı erişim kartları
  const getQuickAccessCards = () => {
    const cards = [];
    
    if (hasPermission('news')) {
      cards.push({
        title: 'Haberler',
        count: news?.length || 0,
        pending: news?.filter(n => !n.published).length || 0,
      icon: FileText,
        color: colors.primary.text,
        bgColor: colors.primary['50'],
        tabName: 'news'
      });
    }

    if (hasPermission('events')) {
      cards.push({
        title: 'Etkinlikler',
        count: events?.length || 0,
        pending: events?.filter(e => e.status === 'draft').length || 0,
      icon: Calendar,
        color: colors.success.text,
        bgColor: colors.success['50'],
        tabName: 'events'
      });
    }

    if (hasPermission('messages')) {
      cards.push({
      title: 'Mesajlar',
        count: contactMessages?.length || 0,
        pending: contactMessages?.filter(m => m.status === 'unread').length || 0,
      icon: MessageSquare,
        color: colors.warning.text,
        bgColor: colors.warning['50'],
        tabName: 'messages'
      });
    }

    if (hasPermission('users')) {
      // Onaylı kullanıcı sayısı - unique user_id'leri say
      const approvedUserIds = new Set(
        userRoles?.filter(r => r.is_approved).map(r => r.user_id) || []
      );
      const pendingRoleCount = userRoles?.filter(r => !r.is_approved).length || 0;
      
      cards.push({
        title: 'Kullanıcılar',
        count: approvedUserIds.size, // Onaylı kullanıcı sayısı
        pending: pendingRoleCount, // Bekleyen rol sayısı
        icon: Users,
        color: colors.danger.text,
        bgColor: colors.danger['50'],
        tabName: 'users'
      });
    }

    return cards;
  };

  const quickAccessCards = getQuickAccessCards();
  const recentActivity = getRecentActivity();

  return (
    <AdminPageContainer>
      {/* Karşılama Bölümü */}
      <div className={cn(spacing.margin.large)}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className={cn(responsive.text.title, "font-bold mb-2")}>
            {getGreeting()}
          </h1>
          <p className="text-blue-100">
            Admin panelinize hoş geldiniz. Bugün neler yapmak istiyorsunuz?
          </p>
        </div>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className={cn(spacing.margin.large)}>
        <h2 className={cn(responsive.text.subtitle, "font-semibold mb-4")}>
          Hızlı Erişim
        </h2>
        <div className={layout.grid.cards}>
          {quickAccessCards.map((card, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleQuickAccessClick(card.tabName)}
            >
              <CardHeader className={cn(spacing.padding.cardSmall, "pb-2")}>
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", card.bgColor)}>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <Badge variant={card.pending > 0 ? "destructive" : "secondary"} className="text-xs">
                    {card.pending} beklemede
                  </Badge>
                </div>
          </CardHeader>
              <CardContent className={cn(spacing.padding.cardSmall, "pt-0")}>
                <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {card.count}
                </p>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Toplam kayıt</span>
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
          </CardContent>
        </Card>
          ))}
        </div>
      </div>

      {/* İstatistik Kartları - Sadece permission'ı olan kullanıcılar için */}
      <div className={cn(spacing.margin.large)}>
        <h2 className={cn(responsive.text.subtitle, "font-semibold mb-4")}>
          Genel İstatistikler
        </h2>
        <div className={layout.grid.stats}>
          {hasPermission('news') && (
            <StatsCard
              title="Haberler"
              value={news?.length || 0}
              subtitle={`${news?.filter(n => n.published).length || 0} yayında`}
              icon={FileText}
              emoji="📰"
              variant="primary"
            />
          )}
          
          {hasPermission('events') && (
            <StatsCard
              title="Etkinlikler"
              value={events?.length || 0}
              subtitle={`${events?.filter(e => e.status === 'upcoming').length || 0} yaklaşan`}
              icon={Calendar}
              emoji="📅"
              variant="success"
            />
          )}
          
          {hasPermission('magazine') && (
            <StatsCard
              title="Dergi"
              value={magazines?.length || 0}
              subtitle={`${magazines?.filter(m => m.published).length || 0} yayında`}
              icon={BookOpen}
              emoji="📖"
              variant="warning"
            />
          )}
          
          {hasPermission('messages') && (
            <StatsCard
              title="Mesajlar"
              value={contactMessages?.length || 0}
              subtitle={`${contactMessages?.filter(m => m.status === 'unread').length || 0} okunmamış`}
              icon={MessageSquare}
              emoji="💬"
              variant="purple"
            />
          )}
          
          {hasPermission('users') && (
            <StatsCard
              title="Kullanıcılar"
              value={new Set(userRoles?.filter(r => r.is_approved).map(r => r.user_id) || []).size}
              subtitle={`${userRoles?.filter(r => !r.is_approved).length || 0} rol beklemede`}
              icon={Users}
              emoji="👥"
              variant="cyan"
            />
          )}
          
          {hasPermission('products') && (
            <StatsCard
              title="Ürünler"
              value={products?.length || 0}
              subtitle={`${products?.filter(p => p.available).length || 0} aktif`}
              icon={Package}
              emoji="📦"
              variant="orange"
            />
          )}
          
          {hasPermission('sponsors') && (
            <StatsCard
              title="Sponsorlar"
              value={sponsors?.length || 0}
              subtitle={`${sponsors?.filter(s => s.active).length || 0} aktif`}
              icon={Building2}
              emoji="🏢"
              variant="indigo"
            />
          )}
          
          {hasPermission('surveys') && (
            <StatsCard
              title="Anketler"
              value={surveys?.length || 0}
              subtitle={`${surveys?.filter(s => s.active).length || 0} aktif`}
              icon={ClipboardList}
              emoji="📋"
              variant="pink"
            />
          )}
          
          {hasPermission('documents') && (
            <StatsCard
              title="Belgeler"
              value={documents?.length || 0}
              subtitle="Akademik belgeler"
              icon={GraduationCap}
              emoji="🎓"
              variant="emerald"
            />
          )}
          
          {hasPermission('internships') && (
            <StatsCard
              title="Stajlar"
              value={internships?.length || 0}
              subtitle={`${internships?.filter(i => i.active).length || 0} aktif`}
              icon={Briefcase}
              emoji="💼"
              variant="violet"
            />
          )}
        </div>
      </div>

      {/* Son Aktiviteler - Açılır Kapanır */}
      {recentActivity.length > 0 && (
        <div className={cn(spacing.margin.large)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn(responsive.text.subtitle, "font-semibold")}>
              Son Aktiviteler
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActivitiesExpanded(!isActivitiesExpanded)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {isActivitiesExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Gizle
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Göster
                </>
              )}
            </Button>
          </div>
          
          {isActivitiesExpanded && (
        <Card>
              <CardContent className={cn(spacing.padding.cardLarge)}>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-700", activity.color)}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {activity.user}
                          </p>
                          {activity.userRole && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {activity.userRole}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <span className="font-medium">{activity.action}</span> {activity.entityType}:{' '}
                          <span className="font-semibold">{activity.entityTitle}</span>
                        </p>
                        {activity.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{activity.date}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          </CardContent>
        </Card>
          )}
      </div>
      )}


    </AdminPageContainer>
  );
}; 