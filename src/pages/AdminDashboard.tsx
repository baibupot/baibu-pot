
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  BookOpen, 
  Briefcase, 
  MessageSquare, 
  Settings,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  Mail,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';

interface User {
  email: string;
  role: string;
  name?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin');
      return;
    }
    setUser(JSON.parse(adminUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  // Mock veriler
  const mockNews = [
    { id: 1, title: 'Yeni Etkinlik Duyurusu', category: 'duyuru', published: true, date: '2024-01-15' },
    { id: 2, title: 'Staj Fırsatları', category: 'genel', published: false, date: '2024-01-14' },
    { id: 3, title: 'Dergi Yeni Sayısı', category: 'dergi', published: true, date: '2024-01-13' }
  ];

  const mockEvents = [
    { id: 1, title: 'Psikoloji Semineri', date: '2024-02-15', status: 'upcoming', type: 'seminer' },
    { id: 2, title: 'Sosyal Etkinlik', date: '2024-02-20', status: 'upcoming', type: 'sosyal' },
    { id: 3, title: 'Mezun Buluşması', date: '2024-01-10', status: 'completed', type: 'sosyal' }
  ];

  const mockMessages = [
    { id: 1, name: 'Ahmet Yılmaz', subject: 'Etkinlik Hakkında', status: 'unread', date: '2024-01-15' },
    { id: 2, name: 'Ayşe Demir', subject: 'Üyelik Başvurusu', status: 'read', date: '2024-01-14' },
    { id: 3, name: 'Mehmet Özkan', subject: 'Staj Konusu', status: 'replied', date: '2024-01-13' }
  ];

  const mockPendingUsers = [
    { id: 1, name: 'Zeynep Kaya', email: 'zeynep@baibu.edu.tr', role: 'iletisim_ekip', date: '2024-01-15' },
    { id: 2, name: 'Can Öztürk', email: 'can@baibu.edu.tr', role: 'etkinlik_ekip', date: '2024-01-14' }
  ];

  const getRolePermissions = (role: string) => {
    const permissions = {
      baskan: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'team', 'documents', 'internships', 'messages', 'users'],
      baskan_yardimcisi: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'team', 'documents', 'internships', 'messages', 'users'],
      teknik_koordinator: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'team', 'documents', 'internships', 'users'],
      teknik_ekip: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'documents', 'internships'],
      etkinlik_koordinator: ['events', 'sponsors'],
      etkinlik_ekip: ['events', 'sponsors'],
      iletisim_koordinator: ['news', 'magazine', 'surveys', 'sponsors', 'documents', 'internships', 'messages'],
      iletisim_ekip: ['news', 'magazine', 'surveys', 'sponsors', 'documents', 'internships'],
      dergi_koordinator: ['magazine', 'sponsors'],
      dergi_ekip: ['magazine', 'sponsors']
    };
    return permissions[role as keyof typeof permissions] || [];
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return getRolePermissions(user.role).includes(permission);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      baskan: 'Başkan',
      baskan_yardimcisi: 'Başkan Yardımcısı',
      teknik_koordinator: 'Teknik İşler Koordinatörü',
      teknik_ekip: 'Teknik İşler Ekip Üyesi',
      etkinlik_koordinator: 'Etkinlik Koordinatörü',
      etkinlik_ekip: 'Etkinlik Ekip Üyesi',
      iletisim_koordinator: 'İletişim Koordinatörü',
      iletisim_ekip: 'İletişim Ekip Üyesi',
      dergi_koordinator: 'Dergi Koordinatörü',
      dergi_ekip: 'Dergi Ekip Üyesi'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <LayoutDashboard className="h-8 w-8 text-cyan-500 mr-3" />
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Admin Paneli
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Genel
              </TabsTrigger>
              {hasPermission('news') && (
                <TabsTrigger value="news">
                  <FileText className="h-4 w-4 mr-2" />
                  Haberler
                </TabsTrigger>
              )}
              {hasPermission('events') && (
                <TabsTrigger value="events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Etkinlikler
                </TabsTrigger>
              )}
              {hasPermission('magazine') && (
                <TabsTrigger value="magazine">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Dergi
                </TabsTrigger>
              )}
              {hasPermission('messages') && (
                <TabsTrigger value="messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mesajlar
                </TabsTrigger>
              )}
              {hasPermission('users') && (
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  Kullanıcılar
                </TabsTrigger>
              )}
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Haberler</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+2 bu ay</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aktif Etkinlikler</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">+1 bu hafta</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dergi Sayıları</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Son sayı: Ocak 2024</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bekleyen Mesajlar</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">2 okunmamış</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Son Haberler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockNews.slice(0, 3).map(news => (
                        <div key={news.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <p className="font-medium">{news.title}</p>
                            <p className="text-sm text-muted-foreground">{news.date}</p>
                          </div>
                          <Badge variant={news.published ? "default" : "secondary"}>
                            {news.published ? "Yayında" : "Taslak"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Yaklaşan Etkinlikler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockEvents.filter(event => event.status === 'upcoming').map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* News Tab */}
            {hasPermission('news') && (
              <TabsContent value="news" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Haberler ve Duyurular</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Haber
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {mockNews.map(news => (
                        <div key={news.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{news.title}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">{news.category}</Badge>
                              <span className="text-sm text-muted-foreground">{news.date}</span>
                              <Badge variant={news.published ? "default" : "secondary"}>
                                {news.published ? "Yayında" : "Taslak"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Events Tab */}
            {hasPermission('events') && (
              <TabsContent value="events" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Etkinlikler</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Etkinlik
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {mockEvents.map(event => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">{event.type}</Badge>
                              <span className="text-sm text-muted-foreground">{event.date}</span>
                              <Badge variant={event.status === 'upcoming' ? "default" : "secondary"}>
                                {event.status === 'upcoming' ? "Yaklaşan" : "Tamamlandı"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Messages Tab */}
            {hasPermission('messages') && (
              <TabsContent value="messages" className="space-y-6">
                <h2 className="text-2xl font-bold">Gelen Mesajlar</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {mockMessages.map(message => (
                        <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium">{message.name}</h3>
                              {message.status === 'unread' && (
                                <Badge variant="destructive">Okunmamış</Badge>
                              )}
                              {message.status === 'read' && (
                                <Badge variant="secondary">Okundu</Badge>
                              )}
                              {message.status === 'replied' && (
                                <Badge variant="default">Yanıtlandı</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{message.subject}</p>
                            <p className="text-sm text-muted-foreground">{message.date}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Yanıtla
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Users Tab */}
            {hasPermission('users') && (
              <TabsContent value="users" className="space-y-6">
                <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Onay Bekleyen Kayıtlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockPendingUsers.map(pendingUser => (
                        <div key={pendingUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{pendingUser.name}</h3>
                            <p className="text-sm text-muted-foreground">{pendingUser.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">{getRoleLabel(pendingUser.role)}</Badge>
                              <span className="text-sm text-muted-foreground">{pendingUser.date}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="default" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Onayla
                            </Button>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reddet
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
