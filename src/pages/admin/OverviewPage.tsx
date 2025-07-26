import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageContainer, StatsCard } from "@/components/admin/shared";
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  Bell,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Heart,
  Star,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalNews: number;
  totalMessages: number;
  pendingApprovals: number;
  thisMonthGrowth: {
    users: number;
    events: number;
    news: number;
  };
}

interface RecentActivity {
  id: string;
  user: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityTitle: string;
  description?: string;
  date: string;
  time: string;
  color: string;
  icon: any;
}

interface ActivityStats {
  topUsers: Array<{ name: string; count: number }>;
  topActions: Array<[string, number]>;
  dailyActivity: Array<{ date: string; count: number }>;
}

const OverviewPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalNews: 0,
    totalMessages: 0,
    pendingApprovals: 0,
    thisMonthGrowth: { users: 0, events: 0, news: 0 }
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [isActivitiesExpanded, setIsActivitiesExpanded] = useState(false);
  const [activityLimit, setActivityLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  // Responsive spacing and layout utilities
  const spacing = {
    container: "p-4 lg:p-6",
    section: "mb-6 lg:mb-8",
    grid: "gap-4 lg:gap-6",
    card: "p-4 lg:p-6"
  };

  const responsive = {
    grid: {
      stats: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      quick: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
      main: "grid-cols-1 lg:grid-cols-3"
    },
    text: {
      title: "text-xl lg:text-2xl",
      subtitle: "text-lg lg:text-xl",
      small: "text-sm lg:text-base"
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak tüm verileri çek
      const [usersRes, eventsRes, newsRes, messagesRes] = await Promise.all([
        supabase.from('users').select('id, created_at'),
        supabase.from('events').select('id, created_at'),
        supabase.from('news').select('id, created_at'),
        supabase.from('contact_messages').select('id, status')
      ]);

      // Bu ay için tarih hesaplama
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // İstatistikleri hesapla
      const users = usersRes.data || [];
      const events = eventsRes.data || [];
      const news = newsRes.data || [];
      const messages = messagesRes.data || [];

      const thisMonthUsers = users.filter(u => new Date(u.created_at) >= thisMonth).length;
      const lastMonthUsers = users.filter(u => 
        new Date(u.created_at) >= lastMonth && new Date(u.created_at) < thisMonth
      ).length;

      const thisMonthEvents = events.filter(e => new Date(e.created_at) >= thisMonth).length;
      const lastMonthEvents = events.filter(e => 
        new Date(e.created_at) >= lastMonth && new Date(e.created_at) < thisMonth
      ).length;

      const thisMonthNews = news.filter(n => new Date(n.created_at) >= thisMonth).length;
      const lastMonthNews = news.filter(n => 
        new Date(n.created_at) >= lastMonth && new Date(n.created_at) < thisMonth
      ).length;

      setStats({
        totalUsers: users.length,
        totalEvents: events.length,
        totalNews: news.length,
        totalMessages: messages.length,
        pendingApprovals: messages.filter(m => m.status === 'unread').length,
        thisMonthGrowth: {
          users: thisMonthUsers - lastMonthUsers,
          events: thisMonthEvents - lastMonthEvents,
          news: thisMonthNews - lastMonthNews
        }
      });

    } catch (error) {
      console.error('Dashboard verisi alınırken hata:', error);
      toast({
        title: "Hata",
        description: "Dashboard verileri yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Aktivite logları alınırken hata:', error);
        return;
      }

      const formattedActivities: RecentActivity[] = (activities || []).map((activity: any) => {
        const date = new Date(activity.created_at);
        
        const actionColors: { [key: string]: string } = {
          create: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
          update: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
          delete: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
          publish: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
          approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
          login: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
          logout: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        };

        const actionIcons: { [key: string]: any } = {
          create: Star,
          update: Activity,
          delete: AlertCircle,
          publish: Eye,
          approve: Heart,
          login: Users,
          logout: Users
        };

        const actionNames: { [key: string]: string } = {
          create: 'Oluşturdu',
          update: 'Güncelledi',
          delete: 'Sildi',
          publish: 'Yayınladı',
          approve: 'Onayladı',
          login: 'Giriş yaptı',
          logout: 'Çıkış yaptı'
        };

        return {
          id: activity.id,
          user: activity.user_name || 'Bilinmeyen Kullanıcı',
          userRole: activity.user_role,
          action: actionNames[activity.action_type] || activity.action_type,
          entityType: activity.entity_type,
          entityTitle: activity.entity_title || 'Başlıksız',
          description: activity.description,
          date: date.toLocaleDateString('tr-TR'),
          time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          color: actionColors[activity.action_type] || 'bg-gray-100 text-gray-700',
          icon: actionIcons[activity.action_type] || Activity
        };
      });

      setRecentActivity(formattedActivities);

      // Aktivite istatistikleri hesapla
      if (formattedActivities.length > 0) {
        const userCounts = formattedActivities.reduce((acc: any, activity) => {
          acc[activity.user] = (acc[activity.user] || 0) + 1;
          return acc;
        }, {});

        const actionCounts = formattedActivities.reduce((acc: any, activity) => {
          acc[activity.action] = (acc[activity.action] || 0) + 1;
          return acc;
        }, {});

        setActivityStats({
          topUsers: Object.entries(userCounts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5)
            .map(([name, count]: any) => ({ name, count })),
          topActions: Object.entries(actionCounts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5),
          dailyActivity: [] // Bu hesaplama için daha karmaşık kod gerekli
        });
      }

    } catch (error) {
      console.error('Aktivite verileri alınırken hata:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın! ☀️";
    if (hour < 18) return "İyi günler! 🌤️";
    return "İyi akşamlar! 🌙";
  };

  const quickAccessCards = [
    { title: "Kullanıcılar", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900", tabName: "users" },
    { title: "Etkinlikler", icon: Calendar, color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900", tabName: "events" },
    { title: "Haberler", icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900", tabName: "news" },
    { title: "Mesajlar", icon: MessageSquare, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900", tabName: "messages" },
    { title: "Dergiler", icon: FileText, color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900", tabName: "magazine" },
    { title: "Anketler", icon: BarChart3, color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900", tabName: "surveys" }
  ];

  const handleQuickAccessClick = (tabName: string) => {
    // Bu fonksiyon parent component'ten gelecek prop ile değiştirilecek
    console.log(`Navigating to ${tabName}`);
  };

  if (loading) {
    return (
      <AdminPageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Dashboard yükleniyor...</p>
          </div>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <div className={cn(spacing.container)}>
        {/* Welcome Section */}
        <div className={cn(spacing.section)}>
          <h1 className={cn(responsive.text.title, "font-bold mb-2")}>
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground">BAİBÜ Psikoloji Kulübü Yönetim Paneline hoş geldiniz.</p>
        </div>

        {/* Quick Access Cards */}
        <div className={cn(spacing.section)}>
          <h2 className={cn(responsive.text.subtitle, "font-semibold mb-4")}>
            Hızlı Erişim
          </h2>
          <div className={cn("grid", responsive.grid.quick, spacing.grid)}>
            {quickAccessCards.map((card) => (
              <Card 
                key={card.title} 
                className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                onClick={() => handleQuickAccessClick(card.tabName)}
              >
                <CardHeader className={cn(spacing.card, "pb-2")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", card.bgColor)}>
                      <card.icon className={cn("h-5 w-5", card.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {card.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={cn(spacing.card, "pt-0")}>
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                    Yönet
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className={cn(spacing.section)}>
          <h2 className={cn(responsive.text.subtitle, "font-semibold mb-4")}>
            İstatistikler
          </h2>
          <div className={cn("grid", responsive.grid.stats, spacing.grid)}>
            <StatsCard
              title="Toplam Kullanıcı"
              value={stats.totalUsers}
              change={stats.thisMonthGrowth.users}
              changeType={stats.thisMonthGrowth.users >= 0 ? "increase" : "decrease"}
              icon={Users}
            />
            <StatsCard
              title="Aktif Etkinlik"
              value={stats.totalEvents}
              change={stats.thisMonthGrowth.events}
              changeType={stats.thisMonthGrowth.events >= 0 ? "increase" : "decrease"}
              icon={Calendar}
            />
            <StatsCard
              title="Yayınlanan Haber"
              value={stats.totalNews}
              change={stats.thisMonthGrowth.news}
              changeType={stats.thisMonthGrowth.news >= 0 ? "increase" : "decrease"}
              icon={FileText}
            />
            <StatsCard
              title="Bekleyen Mesaj"
              value={stats.pendingApprovals}
              change={0}
              changeType="neutral"
              icon={Bell}
            />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className={cn(spacing.section)}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Son Aktiviteler
                  <Badge variant="secondary" className="ml-2">
                    {recentActivity.length}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isActivitiesExpanded && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Göster:</span>
                      <select
                        value={activityLimit}
                        onChange={(e) => setActivityLimit(Number(e.target.value))}
                        className="border rounded px-2 py-1 text-xs"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsActivitiesExpanded(!isActivitiesExpanded)}
                  >
                    {isActivitiesExpanded ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Daralt
                        <ChevronUp className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Genişlet
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentActivity.slice(0, isActivitiesExpanded ? activityLimit : 5).map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className={cn("p-2 rounded-lg", activity.color)}>
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

          {/* Analytics Section - Expanded View */}
          {isActivitiesExpanded && activityStats && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    En Aktif Kullanıcılar (Son 50 Aktivite)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityStats.topUsers.map((user, index) => (
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
                    {activityStats.topActions.map(([action, count], index) => {
                      const actionColors: { [key: string]: string } = {
                        'Oluşturdu': 'text-green-600',
                        'Güncelledi': 'text-blue-600', 
                        'Sildi': 'text-red-600',
                        'Yayınladı': 'text-purple-600',
                        'Onayladı': 'text-emerald-600',
                        'Giriş yaptı': 'text-indigo-600',
                        'Çıkış yaptı': 'text-gray-600'
                      };

                      return (
                        <div key={action} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-medium", actionColors[action] || 'text-gray-600')}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{action}</span>
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
      </div>
    </AdminPageContainer>
  );
};

export { OverviewPage };
