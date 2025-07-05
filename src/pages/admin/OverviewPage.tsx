import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, BookOpen, MessageSquare, Users, Shield } from 'lucide-react';
import { AdminPageContainer, StatsCard } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useNews, useEvents, useMagazineIssues, useContactMessages, useUsers, useUserRoles } from '@/hooks/useSupabaseData';
import { layout } from '@/shared/design-system';

export const OverviewPage: React.FC = () => {
  const { hasPermission } = useAdminContext();
  const { data: news } = useNews(false);
  const { data: events } = useEvents();
  const { data: magazines } = useMagazineIssues(false);
  const { data: contactMessages } = useContactMessages();
  const { data: users } = useUsers();
  const { data: userRoles } = useUserRoles();

  const getPendingCount = (category: string) => {
    switch (category) {
      case 'news':
        return news?.filter(item => !item.published).length || 0;
      case 'magazines':
        return magazines?.filter(item => !item.published).length || 0;
      case 'users':
        return userRoles?.filter(role => !role.is_approved).length || 0;
      case 'contact':
        return contactMessages?.filter(msg => msg.status === 'unread').length || 0;
      default:
        return 0;
    }
  };

  const statsData = [
    {
      title: 'Toplam Haberler',
      value: news?.length || 0,
      subtitle: `${news?.filter(n => n.published).length || 0} yayında`,
      icon: FileText,
      variant: 'primary' as const,
      emoji: '📰'
    },
    {
      title: 'Toplam Etkinlikler', 
      value: events?.length || 0,
      subtitle: `${events?.filter(e => e.status === 'upcoming').length || 0} yaklaşan`,
      icon: Calendar,
      variant: 'success' as const,
      emoji: '📅'
    },
    {
      title: 'Dergi Sayıları',
      value: magazines?.length || 0,
      subtitle: `${magazines?.filter(m => m.published).length || 0} yayında`,
      icon: BookOpen,
      variant: 'warning' as const,
      emoji: '📖'
    },
    {
      title: 'Mesajlar',
      value: contactMessages?.length || 0,
      subtitle: `${contactMessages?.filter(m => m.status === 'unread').length || 0} okunmamış`,
      icon: MessageSquare,
      variant: 'purple' as const,
      emoji: '💬'
    },
    {
      title: 'Toplam Kullanıcı',
      value: users?.length || 0,
      subtitle: 'Kayıtlı kullanıcı',
      icon: Users,
      variant: 'cyan' as const,
      emoji: '👥'
    },
    {
      title: 'Bekleyen Roller',
      value: getPendingCount('users'),
      subtitle: `${getPendingCount('users')} beklemede`,
      icon: Shield,
      variant: 'orange' as const,
      emoji: '⏳'
    }
  ];

  return (
    <AdminPageContainer>
      {/* Overview Stats Grid */}
      <div className={layout.grid.stats}>
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            emoji={stat.emoji}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Haberler</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {news?.filter(n => n.published).length || 0} yayında
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Etkinlikler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {events?.filter(e => e.status === 'upcoming').length || 0} yaklaşan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dergi Sayıları</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{magazines?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {magazines?.filter(m => m.published).length || 0} yayında
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesajlar</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactMessages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {contactMessages?.filter(m => m.status === 'unread').length || 0} okunmamış
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminPageContainer>
  );
}; 