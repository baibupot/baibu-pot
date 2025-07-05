import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name?: string;
  userRoles?: string[];
}

interface AdminDashboardContextType {
  user: User | null;
  permissions: string[];
  rolePermissions: Record<string, string[]>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  getRoleDisplayName: (role: string) => string;
  getRoleLabel: (roles: string[]) => string;
  refreshData: () => void;
  logout: () => Promise<void>;
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

interface AdminDashboardProviderProps {
  children: ReactNode;
}

export const AdminDashboardProvider: React.FC<AdminDashboardProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Role display names
  const getRoleDisplayName = (role: string) => {
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
      dergi_ekip: 'Dergi Ekip Üyesi',
      mali_koordinator: 'Mali İşler Koordinatörü',
      mali_ekip: 'Mali İşler Ekip Üyesi'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getRoleLabel = (roles: string[]) => {
    return roles.map(role => getRoleDisplayName(role)).join(', ');
  };

  // Load role permissions from database
  const loadRolePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, permission');
      
      if (error) throw error;
      
      const permissionsByRole: Record<string, string[]> = {};
      data?.forEach(({ role, permission }) => {
        if (!permissionsByRole[role]) {
          permissionsByRole[role] = [];
        }
        permissionsByRole[role].push(permission);
      });
      
      setRolePermissions(permissionsByRole);
      console.log('✅ Role permissions yüklendi:', permissionsByRole);
    } catch (error) {
      console.error('❌ Role permissions yüklenemedi:', error);
      // Fallback permissions
      setRolePermissions({
        baskan: ['overview', 'users', 'news', 'events', 'magazine', 'surveys', 'sponsors', 'products', 'team', 'documents', 'internships', 'messages'],
        baskan_yardimcisi: ['overview', 'users', 'news', 'events', 'magazine', 'surveys', 'sponsors', 'products', 'team', 'documents', 'internships', 'messages']
      });
    }
  };

  // Check user authentication and permissions
  const checkUser = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/admin');
        return;
      }

      // Get user profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Get user roles
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .eq('is_approved', true);

      // Check role approval
      if (!userRoleData || userRoleData.length === 0) {
        toast.error('⏳ Hesabınız henüz yönetici tarafından onaylanmamış. Erişim reddedildi.');
        await supabase.auth.signOut();
        navigate('/admin');
        return;
      }

      const userData: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: userProfile?.name || authUser.user_metadata?.name || 'Bilinmeyen Kullanıcı',
        userRoles: userRoleData?.map(r => r.role) || []
      };

      setUser(userData);
      
      const roleNames = userRoleData.map(r => getRoleDisplayName(r.role)).join(', ');
      console.log(`✅ Admin panel erişimi onaylandı: ${roleNames}`);
      
    } catch (error) {
      console.error('❌ User check failed:', error);
      toast.error('Kullanıcı doğrulaması başarısız');
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  // Get permissions for current user
  const getRolePermissions = (roles: string[]) => {
    const allPermissions = new Set<string>();
    roles.forEach(role => {
      const userRolePermissions = rolePermissions[role] || [];
      userRolePermissions.forEach(perm => allPermissions.add(perm));
    });
    return Array.from(allPermissions);
  };

  const permissions = user ? getRolePermissions(user.userRoles || []) : [];

  const hasPermission = (permission: string) => {
    if (!user || !user.userRoles) return false;
    return permissions.includes(permission);
  };

  // Refresh data function
  const refreshData = () => {
    window.location.reload();
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      await loadRolePermissions();
      await checkUser();
    };
    
    initialize();
  }, []);

  const contextValue: AdminDashboardContextType = {
    user,
    permissions,
    rolePermissions,
    isLoading,
    hasPermission,
    getRoleDisplayName,
    getRoleLabel,
    refreshData,
    logout
  };

  return (
    <AdminDashboardContext.Provider value={contextValue}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminDashboardProvider');
  }
  return context;
}; 