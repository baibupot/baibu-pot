import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Calendar, Users, BookOpen, Briefcase, MessageSquare, LogOut, Shield, Package, Building2, ClipboardList, GraduationCap, Menu, X, ChevronDown, Lock, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AdminDashboardProvider, useAdminContext } from '@/contexts/AdminDashboardContext';
import { OverviewPage, UsersPage, NewsPage, EventsPage, MagazinePage, SurveysPage, SponsorsPage, ProductsPage, TeamPage, DocumentsPage, InternshipsPage, MessagesPage } from '@/pages/admin';
import ThemeToggle from '@/components/admin/ThemeToggle';
import { cn } from '@/lib/utils';
import { logUserLogout } from '@/utils/activityLogger';
import { supabase } from '@/integrations/supabase/client';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';
import ChangeEmailModal from '@/components/ui/ChangeEmailModal';
import { toast } from 'sonner';

const NavLink: React.FC<{
  activeTab: string;
  tabName: string;
  onClick: (tab: string) => void;
  icon: React.ReactNode;
  label: string;
}> = ({ activeTab, tabName, onClick, icon, label }) => (
  <button
    onClick={() => onClick(tabName)}
    className={cn(
      "w-full flex items-center text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-200",
      activeTab === tabName 
        ? "bg-blue-600 text-white shadow-lg" 
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
    )}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const AdminDashboardContent: React.FC = () => {
  const { user, hasPermission, logout: originalLogout, isLoading, getRoleLabel } = useAdminContext();
  
  // Çıkış fonksiyonunu sarmalayarak log ekleme
  const handleLogout = async () => {
    try {
      // Kullanıcı adını users tablosundan al
      const { data: userProfile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user?.id)
        .single();
      
      const userName = userProfile?.name || user?.email?.split('@')[0] || 'Bilinmeyen Kullanıcı';
      const userRole = user?.userRoles?.[0] || 'Kullanıcı';
      await logUserLogout(userName, userRole);
    } catch (error) {
      console.error('Çıkış logu kaydedilemedi:', error);
    }
    
    await originalLogout();
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  
  // 🔒 Auto-logout timer (45 dakika)
  const AUTO_LOGOUT_TIME = 45 * 60 * 1000; // 45 dakika
  const [timeRemaining, setTimeRemaining] = useState(AUTO_LOGOUT_TIME);
  const [warningShown, setWarningShown] = useState(false);

  // URL'den tab parametresini oku
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'users', 'news', 'events', 'magazine', 'surveys', 'sponsors', 'products', 'team', 'documents', 'internships', 'messages'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Dropdown dışına tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Custom event'i dinle
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab && ['overview', 'users', 'news', 'events', 'magazine', 'surveys', 'sponsors', 'products', 'team', 'documents', 'internships', 'messages'].includes(tab)) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('tabChange', handleTabChange as EventListener);
    
    return () => {
      window.removeEventListener('tabChange', handleTabChange as EventListener);
    };
  }, []);

  // 🔒 Auto-logout timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const startTimer = () => {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1000;
          
          // 5 dakika kala uyarı göster
          if (newTime <= 5 * 60 * 1000 && !warningShown) {
            setWarningShown(true);
            toast.warning('⏰ Oturumunuz 5 dakika içinde sonlanacak. Aktif kalmak için herhangi bir işlem yapın.');
          }
          
          // Süre doldu, çıkış yap
          if (newTime <= 0) {
            toast.error('🔒 Güvenlik nedeniyle oturumunuz sonlandı.');
            handleLogout();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    };

    const resetTimer = () => {
      clearInterval(timer);
      setTimeRemaining(AUTO_LOGOUT_TIME);
      setWarningShown(false);
      startTimer();
    };

    // İlk timer'ı başlat
    startTimer();

    // Kullanıcı aktivitesini dinle
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Cleanup
    return () => {
      clearInterval(timer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [warningShown, AUTO_LOGOUT_TIME]);

  const navItems = [
    { name: 'overview', label: 'Genel', icon: <LayoutDashboard className="h-5 w-5" />, permission: true },
    { name: 'users', label: 'Roller', icon: <Shield className="h-5 w-5" />, permission: hasPermission('users') },
    { name: 'news', label: 'Haberler', icon: <FileText className="h-5 w-5" />, permission: hasPermission('news') },
    { name: 'events', label: 'Etkinlikler', icon: <Calendar className="h-5 w-5" />, permission: hasPermission('events') },
    { name: 'magazine', label: 'Dergi', icon: <BookOpen className="h-5 w-5" />, permission: hasPermission('magazine') },
    { name: 'surveys', label: 'Anketler', icon: <ClipboardList className="h-5 w-5" />, permission: hasPermission('surveys') },
    { name: 'sponsors', label: 'Sponsorlar', icon: <Building2 className="h-5 w-5" />, permission: hasPermission('sponsors') },
    { name: 'products', label: 'Ürünler', icon: <Package className="h-5 w-5" />, permission: hasPermission('products') },
    { name: 'team', label: 'Ekipler', icon: <Users className="h-5 w-5" />, permission: hasPermission('team') },
    { name: 'documents', label: 'Belgeler', icon: <GraduationCap className="h-5 w-5" />, permission: hasPermission('documents') },
    { name: 'internships', label: 'Staj', icon: <Briefcase className="h-5 w-5" />, permission: hasPermission('internships') },
    { name: 'messages', label: 'Mesajlar', icon: <MessageSquare className="h-5 w-5" />, permission: hasPermission('messages') },
  ];
  
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    
    // URL'yi güncelle
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabName);
    window.history.pushState({}, '', url.toString());
    
    if(window.innerWidth < 768) { // md breakpoint
        setSidebarOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bu sayfaya erişim için giriş yapmanız gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage />;
      case 'users': return hasPermission('users') ? <UsersPage /> : null;
      case 'news': return hasPermission('news') ? <NewsPage /> : null;
      case 'events': return hasPermission('events') ? <EventsPage /> : null;
      case 'magazine': return hasPermission('magazine') ? <MagazinePage /> : null;
      case 'surveys': return hasPermission('surveys') ? <SurveysPage /> : null;
      case 'sponsors': return hasPermission('sponsors') ? <SponsorsPage /> : null;
      case 'products': return hasPermission('products') ? <ProductsPage /> : null;
      case 'team': return hasPermission('team') ? <TeamPage /> : null;
      case 'documents': return hasPermission('documents') ? <DocumentsPage /> : null;
      case 'internships': return hasPermission('internships') ? <InternshipsPage /> : null;
      case 'messages': return hasPermission('messages') ? <MessagesPage /> : null;
      default: return <OverviewPage />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-lg z-30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 h-16 border-b dark:border-gray-700">
              <div className="flex items-center">
                <LayoutDashboard className="h-8 w-8 text-cyan-500" />
                <span className="ml-3 text-lg font-bold text-gray-800 dark:text-white">Admin Paneli</span>
              </div>
              <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6 text-gray-500"/>
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.filter(item => item.permission).map(item => (
                <NavLink 
                    key={item.name}
                    activeTab={activeTab}
                    tabName={item.name}
                    onClick={handleTabClick}
                    icon={item.icon}
                    label={item.label}
                />
              ))}
            </nav>
            <div className="px-4 py-4 border-t dark:border-gray-700">
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış
                </Button>
            </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md md:shadow-none border-b dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6 text-gray-500"/>
            </button>
            <div className="hidden md:block"></div> {/* Spacer */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="relative user-dropdown-container">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {getRoleLabel(user.userRoles || [])}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-slate-500 transition-transform",
                    showUserDropdown && "rotate-180"
                  )} />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {getRoleLabel(user.userRoles || [])}
                      </p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowChangePasswordModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Lock className="h-4 w-4" />
                        Şifre Değiştir
                      </button>
                      <button
                        onClick={() => {
                          setShowChangeEmailModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Email Değiştir
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Change Email Modal */}
      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
      />
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <ThemeProvider>
      <AdminDashboardProvider>
        <AdminDashboardContent />
      </AdminDashboardProvider>
    </ThemeProvider>
  );
};

export default AdminDashboard;
