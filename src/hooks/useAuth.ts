
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// 🔒 Enhanced Auth Hook with Email & Role Validation
export const useAuth = () => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error);
        return null;
      }
      return user;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

// 🔍 Comprehensive Auth Status Check
export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return { 
          user: null, 
          isAuthenticated: false,
          emailConfirmed: false,
          hasApprovedRole: false,
          canAccessAdmin: false
        };
      }

      // Email confirmation kontrolü
      const emailConfirmed = !!user.email_confirmed_at;

      // Role approval kontrolü
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, is_approved')
        .eq('user_id', user.id)
        .eq('is_approved', true);

      const hasApprovedRole = roleData && roleData.length > 0;
      const canAccessAdmin = emailConfirmed && hasApprovedRole;

      return {
        user,
        isAuthenticated: true,
        emailConfirmed,
        hasApprovedRole,
        canAccessAdmin,
        approvedRoles: roleData?.map(r => r.role) || []
      };
    },
    retry: 1,
    staleTime: 0, // Her zaman fresh data al
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
};

export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching roles for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_approved', true);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      console.log('User roles found:', data);
      return data?.map(r => r.role) || [];
    },
    enabled: !!userId,
  });
};

export const useIsAdmin = (userId?: string) => {
  const { data: roles = [] } = useUserRoles(userId);
  const isAdmin = roles.includes('baskan') || roles.includes('baskan_yardimcisi') || roles.includes('teknik_koordinator');
  
  console.log('Is admin check:', { userId, roles, isAdmin });
  
  return isAdmin;
};
