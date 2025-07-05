import React from 'react';
import { Shield } from 'lucide-react';
import { AdminPageContainer, SectionHeader } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import UserRoleManagement from '@/components/admin/UserRoleManagement';

export const UsersPage: React.FC = () => {
  const { user, hasPermission } = useAdminContext();

  if (!hasPermission('users')) {
    return (
      <AdminPageContainer>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bu sayfayı görüntülemek için gerekli izniniz bulunmuyor.
          </p>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Rol Yönetimi"
        subtitle="Kullanıcı rollerini ve izinlerini yönetin"
        icon={<Shield className="h-6 w-6 text-white" />}
      />

      <UserRoleManagement currentUserRoles={user?.userRoles || []} />
    </AdminPageContainer>
  );
}; 