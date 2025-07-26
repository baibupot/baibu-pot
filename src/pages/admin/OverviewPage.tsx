import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Calendar, BookOpen, MessageSquare, Users, Shield, 
  Package, Building2, ClipboardList, GraduationCap, Briefcase,
  Clock, ChevronDown, ChevronUp, ArrowRight, Activity, 
  Filter, Search, RefreshCw, TrendingUp, BarChart3, 
  Eye, Download, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { AdminPageContainer, StatsCard } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useNews, useEvents, useMagazineIssues, useContactMessages, useUsers, useUserRoles, useProducts, useSponsors, useSurveys, useAcademicDocuments, useInternships, useActivityLogs } from '@/hooks/useSupabaseData';
import { layout, spacing, colors, responsive } from '@/shared/design-system';
import { cn } from '@/lib/utils';

export const OverviewPage: React.FC = () => {
  const { hasPermission, user } = useAdminContext();
  const [isActivitiesExpanded, setIsActivitiesExpanded] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityLimit, setActivityLimit] = useState(20);
  
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
    // Activity logs için genişletilmiş limit
  const { data: activityLogs, refetch: refetchActivities } = hasPermission('activity_logs') 
    ? useActivityLogs(100) // 100 aktiviteye çıkarıyoruz
    : { data: null, refetch: () => {} }; // Sadece izinli kullanıcılar

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

  // Son aktiviteler - Aktivite loglarından (filtrelenmiş)
  const getRecentActivity = () => {
    if (!activityLogs?.length) return [];
    
    let filteredLogs = activityLogs;

    // Aksiyon tipine göre filtrele
    if (activityFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.action_type === activityFilter);
    }

    // Arama terimine göre filtrele
    if (activitySearch.trim()) {
      const searchTerm = activitySearch.toLowerCase().trim();
      filteredLogs = filteredLogs.filter(log => 
        log.user_name.toLowerCase().includes(searchTerm) ||
        log.entity_title?.toLowerCase().includes(searchTerm) ||
        log.description?.toLowerCase().includes(searchTerm) ||
        log.entity_type.toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs.slice(0, activityLimit).map(log => {
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

  // Activity istatistikleri
  const getActivityStats = () => {
    if (!activityLogs?.length) return null;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const todayLogs = activityLogs.filter(log => 
      new Date(log.created_at).toDateString() === today.toDateString()
    );
    
    const yesterdayLogs = activityLogs.filter(log => 
      new Date(log.created_at).toDateString() === yesterday.toDateString()
    );
    
    const weekLogs = activityLogs.filter(log => 
      new Date(log.created_at) >= lastWeek
    );

    // En aktif kullanıcılar (son hafta)
    const userActivity = weekLogs.reduce((acc: any, log) => {
      acc[log.user_name] = (acc[log.user_name] || 0) + 1;
      return acc;
    }, {});

    const topUsers = Object.entries(userActivity)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // En çok kullanılan aksiyonlar
    const actionActivity = weekLogs.reduce((acc: any, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {});

    const topActions = Object.entries(actionActivity)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5);

    // En çok etkilenen entity'ler
    const entityActivity = weekLogs.reduce((acc: any, log) => {
      acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
      return acc;
    }, {});

    const topEntities = Object.entries(entityActivity)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 5);

    return {
      today: todayLogs.length,
      yesterday: yesterdayLogs.length,
      week: weekLogs.length,
      total: activityLogs.length,
      topUsers,
      topActions,
      topEntities,
      changeFromYesterday: todayLogs.length - yesterdayLogs.length
    };
  };

  const activityStats = getActivityStats();

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

      {/* Son Aktiviteler - Genişletilmiş Dashboard */}
      {hasPermission('activity_logs') && recentActivity.length > 0 && (
        <div className={cn(spacing.margin.large)}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Son Aktiviteler
                    {activityStats && (
                      <Badge variant="secondary">
                        {activityStats.total} toplam
                      </Badge>
                    )}
                  </CardTitle>
                  {activityStats && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Bugün {activityStats.today} aktivite 
                      {activityStats.changeFromYesterday !== 0 && (
                        <span className={cn(
                          "ml-2 font-medium",
                          activityStats.changeFromYesterday > 0 
                            ? "text-green-600" 
                            : "text-red-600"
                        )}>
                          ({activityStats.changeFromYesterday > 0 ? '+' : ''}{activityStats.changeFromYesterday})
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchActivities()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Yenile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsActivitiesExpanded(!isActivitiesExpanded)}
                    className="flex items-center gap-2"
                  >
                    {isActivitiesExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Gizle
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Detayları Göster
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Activity Stats Cards */}
              {activityStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{activityStats.today}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Bugün</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{activityStats.week}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Bu Hafta</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{activityStats.topUsers.length}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Aktif Kullanıcı</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{activityStats.topEntities.length}</div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Etkilenen Alan</div>
                  </div>
                </div>
              )}

              {/* Filters */}
              {isActivitiesExpanded && (
                <div className="flex flex-col sm:flex-row gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Kullanıcı, başlık veya açıklama ara..."
                        value={activitySearch}
                        onChange={(e) => setActivitySearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={activityFilter} onValueChange={setActivityFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Aksiyonlar</SelectItem>
                        <SelectItem value="create">Oluşturma</SelectItem>
                        <SelectItem value="update">Güncelleme</SelectItem>
                        <SelectItem value="delete">Silme</SelectItem>
                        <SelectItem value="publish">Yayınlama</SelectItem>
                        <SelectItem value="approve">Onaylama</SelectItem>
                        <SelectItem value="login">Giriş</SelectItem>
                        <SelectItem value="logout">Çıkış</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={activityLimit.toString()} onValueChange={(v) => setActivityLimit(parseInt(v))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Activity List */}
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentActivity.slice(0, isActivitiesExpanded ? activityLimit : 5).map((activity, index) => (
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

          {/* Analytics Section - Expanded View */}
          {isActivitiesExpanded && activityStats && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    En Aktif Kullanıcılar (Son 7 Gün)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityStats.topUsers.map((user: any, index) => (
                      <div key={user.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300">
                            {index + 1}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <Badge variant="secondary">{user.count} aktivite</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    En Çok Kullanılan Aksiyonlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityStats.topActions.map(([action, count]: any, index) => {
                      const actionNames: any = {
                        create: 'Oluşturma',
                        update: 'Güncelleme', 
                        delete: 'Silme',
                        publish: 'Yayınlama',
                        approve: 'Onaylama',
                        login: 'Giriş',
                        logout: 'Çıkış'
                      };
                      
                      const actionColors: any = {
                        create: 'text-green-600',
                        update: 'text-blue-600',
                        delete: 'text-red-600',
                        publish: 'text-purple-600',
                        approve: 'text-emerald-600',
                        login: 'text-indigo-600',
                        logout: 'text-gray-600'
                      };

                      return (
                        <div key={action} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-medium", actionColors[action] || 'text-gray-600')}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{actionNames[action] || action}</span>
                          </div>
                          <Badge variant="secondary">{count} kez</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </AdminPageContainer>
  );
};