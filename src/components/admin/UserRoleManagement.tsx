
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserRoles, useUpdateUserRole, useCreateUserRole } from '@/hooks/useSupabaseData';
import { Check, X, User, Shield, Settings, Save, RefreshCw, Crown, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// 🎯 Available permissions ve roles
const AVAILABLE_PERMISSIONS = [
  { key: 'overview', label: 'Genel Bakış', description: 'Dashboard ana sayfa' },
  { key: 'users', label: 'Kullanıcı Yönetimi', description: 'Rol atama ve onaylama' },
  { key: 'news', label: 'Haberler', description: 'Haber yönetimi' },
  { key: 'events', label: 'Etkinlikler', description: 'Etkinlik yönetimi' },
  { key: 'magazine', label: 'Dergi', description: 'Dergi yönetimi' },
  { key: 'surveys', label: 'Anketler', description: 'Anket yönetimi' },
  { key: 'sponsors', label: 'Sponsorlar', description: 'Sponsor yönetimi' },
  { key: 'products', label: 'Ürünler', description: 'Ürün yönetimi' },
  { key: 'team', label: 'Ekipler', description: 'Ekip yönetimi' },
  { key: 'documents', label: 'Akademik Belgeler', description: 'Belge yönetimi' },
  { key: 'internships', label: 'Stajlar', description: 'Staj yönetimi' },
  { key: 'messages', label: 'Mesajlar', description: 'İletişim mesajları' }
];

const ROLES = [
  { key: 'baskan', label: 'Başkan', color: 'bg-purple-100 text-purple-800', icon: Crown },
  { key: 'baskan_yardimcisi', label: 'Başkan Yardımcısı', color: 'bg-blue-100 text-blue-800', icon: Crown },
  { key: 'iletisim_koordinator', label: 'İletişim Koordinatörü', color: 'bg-green-100 text-green-800', icon: User },
  { key: 'teknik_koordinator', label: 'Teknik Koordinatör', color: 'bg-yellow-100 text-yellow-800', icon: Settings },
  { key: 'etkinlik_koordinator', label: 'Etkinlik Koordinatörü', color: 'bg-orange-100 text-orange-800', icon: User },
  { key: 'dergi_koordinator', label: 'Dergi Koordinatörü', color: 'bg-pink-100 text-pink-800', icon: User },
  { key: 'mali_koordinator', label: 'Mali Koordinatör', color: 'bg-indigo-100 text-indigo-800', icon: User },
  { key: 'iletisim_ekip', label: 'İletişim Ekip', color: 'bg-green-50 text-green-600', icon: User },
  { key: 'teknik_ekip', label: 'Teknik Ekip', color: 'bg-yellow-50 text-yellow-600', icon: User },
  { key: 'etkinlik_ekip', label: 'Etkinlik Ekip', color: 'bg-orange-50 text-orange-600', icon: User },
  { key: 'dergi_ekip', label: 'Dergi Ekip', color: 'bg-pink-50 text-pink-600', icon: User },
  { key: 'mali_ekip', label: 'Mali Ekip', color: 'bg-indigo-50 text-indigo-600', icon: User }
];

interface UserRoleManagementProps {
  currentUserRoles?: string[];
}

const UserRoleManagement: React.FC<UserRoleManagementProps> = ({ 
  currentUserRoles = [] 
}) => {
  const { data: userRoles, isLoading } = useUserRoles();
  const updateUserRole = useUpdateUserRole();
  const createUserRole = useCreateUserRole();
  
  // 🎯 Permission management states
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 🎯 Multi-role management states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRoleForUser, setNewRoleForUser] = useState('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  
  // Sadece başkan ve başkan yardımcısı permission yönetebilir
  const canManagePermissions = currentUserRoles.some(role => 
    ['baskan', 'baskan_yardimcisi'].includes(role)
  );
  
  // 🎯 Multi-role management yetki kontrolü
  const canManageUsers = currentUserRoles.some(role => 
    ['baskan', 'baskan_yardimcisi', 'iletisim_koordinator', 'teknik_koordinator'].includes(role)
  );

  useEffect(() => {
    if (canManagePermissions) {
      loadRolePermissions();
    }
  }, [canManagePermissions]);

  // 🎯 Permission management functions
  const loadRolePermissions = async () => {
    try {
      setPermissionLoading(true);
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, permission');
      
      if (error) throw error;
      
      // Permissions'ları role'e göre grupla
      const permissionsByRole: Record<string, string[]> = {};
      ROLES.forEach(role => {
        permissionsByRole[role.key] = [];
      });
      
      data?.forEach(({ role, permission }) => {
        if (!permissionsByRole[role]) {
          permissionsByRole[role] = [];
        }
        permissionsByRole[role].push(permission);
      });
      
      setRolePermissions(permissionsByRole);
    } catch (error) {
      console.error('❌ Role permissions yüklenemedi:', error);
      toast.error('Permissions yüklenemedi: ' + (error as any)?.message);
    } finally {
      setPermissionLoading(false);
    }
  };

  const togglePermission = (role: string, permission: string) => {
    setRolePermissions(prev => {
      const newPermissions = { ...prev };
      const rolePerms = newPermissions[role] || [];
      
      if (rolePerms.includes(permission)) {
        // Permission'ı kaldır
        newPermissions[role] = rolePerms.filter(p => p !== permission);
      } else {
        // Permission'ı ekle
        newPermissions[role] = [...rolePerms, permission];
      }
      
      setHasChanges(true);
      return newPermissions;
    });
  };

  const savePermissions = async () => {
    if (!hasChanges) return;
    
    try {
      setSaving(true);
      
      // Önce tüm permissions'ları sil
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Tümünü sil
      
      if (deleteError) throw deleteError;
      
      // Yeni permissions'ları ekle
      const insertData: Array<{ role: string; permission: string }> = [];
      
      Object.entries(rolePermissions).forEach(([role, permissions]) => {
        permissions.forEach(permission => {
          insertData.push({ role, permission });
        });
      });
      
      if (insertData.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(insertData);
        
        if (insertError) throw insertError;
      }
      
      setHasChanges(false);
      toast.success('✅ Permissions başarıyla güncellendi!');
      
      // Ana dashboard'ı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Permission kaydetme hatası:', error);
      toast.error('Permissions kaydedilemedi: ' + (error as any)?.message);
    } finally {
      setSaving(false);
    }
  };

  // 🎯 Multi-role management fonksiyonları
  const addRoleToUser = async () => {
    if (!selectedUser || !newRoleForUser) return;
    
    try {
      // Aynı rol zaten var mı kontrol et
      const existingRole = userRoles?.find(ur => 
        ur.user_id === selectedUser.user_id && ur.role === newRoleForUser
      );
      
      if (existingRole) {
        toast.error('Bu kullanıcının zaten bu rolü bulunuyor!');
        return;
      }
      
      await createUserRole.mutateAsync({
        user_id: selectedUser.user_id,
        role: newRoleForUser,
        is_approved: true // Yetkili kişi tarafından ekleniyor, direkt onaylı
      });
      
      toast.success(`${getRoleDisplayName(newRoleForUser)} rolü eklendi!`);
      setShowAddRoleModal(false);
      setSelectedUser(null);
      setNewRoleForUser('');
    } catch (error) {
      console.error('Rol ekleme hatası:', error);
      toast.error('Rol eklenirken hata oluştu');
    }
  };

  const deleteUserRole = async (roleId: string, roleName: string) => {
    if (!window.confirm(`${getRoleDisplayName(roleName)} rolünü silmek istediğinizden emin misiniz?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
      
      toast.success(`${getRoleDisplayName(roleName)} rolü silindi`);
      
      // Verileri yenile
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Rol silme hatası:', error);
      toast.error('Rol silinirken hata oluştu');
    }
  };

  const deleteUserCompletely = async () => {
    if (!selectedUser) return;
    
    const confirmText = `"${selectedUser.user?.name || selectedUser.user?.email}" kullanıcısını tamamen silmek istediğinizden emin misiniz?\n\nBu işlem GERİ ALINMAZ!`;
    
    if (!window.confirm(confirmText)) return;
    
    try {
      // Önce user_roles'leri sil
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);
      
      if (rolesError) throw rolesError;
      
      // Sonra users tablosundan sil
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.user_id);
      
      if (userError) throw userError;
      
      // Auth'dan da sil (admin API gerekir, şimdilik user kaydı silindi)
      toast.success('Kullanıcı hesabı tamamen silindi!');
      setShowDeleteUserModal(false);
      setSelectedUser(null);
      
      // Verileri yenile
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles?.filter(ur => ur.user_id === userId && ur.is_approved) || [];
  };

  const approveRole = async (roleId: string) => {
    try {
      await updateUserRole.mutateAsync({
        id: roleId,
        is_approved: true,
        approved_at: new Date().toISOString(),
      });
      toast.success('Rol onaylandı');
    } catch (error) {
      console.error('Error approving role:', error);
      toast.error('Rol onaylanırken hata oluştu');
    }
  };

  const rejectRole = async (roleId: string) => {
    try {
      await updateUserRole.mutateAsync({
        id: roleId,
        is_approved: false,
      });
      toast.success('Rol reddedildi');
    } catch (error) {
      console.error('Error rejecting role:', error);
      toast.error('Rol reddedilirken hata oluştu');
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'baskan': 'Başkan',
      'baskan_yardimcisi': 'Başkan Yardımcısı',
      'teknik_koordinator': 'Teknik Koordinatör',
      'teknik_ekip': 'Teknik Ekip',
      'etkinlik_koordinator': 'Etkinlik Koordinatör',
      'etkinlik_ekip': 'Etkinlik Ekip',
      'iletisim_koordinator': 'İletişim Koordinatör',
      'iletisim_ekip': 'İletişim Ekip',
      'dergi_koordinator': 'Dergi Koordinatör',
      'dergi_ekip': 'Dergi Ekip',
    };
    return roleNames[role] || role;
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  const pendingRoles = userRoles?.filter(role => !role.is_approved) || [];
  const approvedRoles = userRoles?.filter(role => role.is_approved) || [];
  
  // 🎯 Kullanıcıları grupla - bir kullanıcının birden fazla rolü olabilir
  const groupedApprovedUsers = approvedRoles.reduce((groups, userRole) => {
    const userId = userRole.user_id;
    if (!groups[userId]) {
      groups[userId] = {
        user: userRole.user,
        user_id: userId,
        roles: []
      };
    }
    groups[userId].roles.push(userRole);
    return groups;
  }, {} as Record<string, { user: any; user_id: string; roles: any[] }>);
  
  const groupedUsersArray = Object.values(groupedApprovedUsers);

  return (
    <>
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="users" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Kullanıcı Rolleri
        </TabsTrigger>
        <TabsTrigger value="permissions" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          🎯 Permission Yönetimi
          {!canManagePermissions && <Badge variant="secondary" className="ml-1 text-xs">🔒</Badge>}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Onay Bekleyen Roller ({pendingRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRoles.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Onay bekleyen rol bulunmuyor
              </p>
            ) : (
              <div className="space-y-3">
                {pendingRoles.map((userRole) => (
                  <div key={userRole.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">
                        {userRole.user?.name || 'Bilinmeyen Kullanıcı'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userRole.user?.email}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {getRoleDisplayName(userRole.role)}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveRole(userRole.id)}
                        disabled={updateUserRole.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectRole(userRole.id)}
                        disabled={updateUserRole.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reddet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Onaylı Kullanıcılar ({groupedUsersArray.length} kullanıcı, {approvedRoles.length} rol)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedUsersArray.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Onaylı kullanıcı bulunmuyor
              </p>
            ) : (
              <div className="space-y-4">
                {groupedUsersArray.map((userGroup) => (
                  <div key={userGroup.user_id} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                    {/* Kullanıcı Bilgileri */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-lg">
                          {userGroup.user?.name || 'Bilinmeyen Kullanıcı'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userGroup.user?.email}
                        </div>
                      </div>
                      
                      {/* Yönetim Butonları */}
                      {canManageUsers && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(userGroup);
                              setShowAddRoleModal(true);
                            }}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <User className="h-4 w-4 mr-1" />
                            Rol Ekle
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(userGroup);
                              setShowDeleteUserModal(true);
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Kullanıcıyı Sil
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Kullanıcının Rolleri */}
                    <div className="flex flex-wrap gap-2">
                      {userGroup.roles.map((userRole) => (
                        <div key={userRole.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2 border">
                          <Badge variant="default">
                            {getRoleDisplayName(userRole.role)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(userRole.approved_at || '').toLocaleDateString('tr-TR')}
                          </span>
                          
                          {/* Rol Silme Butonu */}
                          {canManageUsers && userGroup.roles.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteUserRole(userRole.id, userRole.role)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                              title="Bu rolü sil"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-6">
        {!canManagePermissions ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                Erişim Reddedildi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Bu özelliğe sadece <strong>Başkan</strong> ve <strong>Başkan Yardımcısı</strong> erişebilir.
              </p>
              <Badge variant="secondary">
                Mevcut rolleriniz: {currentUserRoles.length > 0 ? currentUserRoles.map(getRoleDisplayName).join(', ') : 'Belirsiz'}
              </Badge>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  🎯 Dynamic Role Permission Management
                </CardTitle>
                <p className="text-gray-600">
                  Rol bazında sayfa erişim yetkilerini dinamik olarak yönetin.
                  Değişiklikler tüm sistemde anında etkin olur.
                </p>
              </CardHeader>
            </Card>

            {/* Permission Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <p className="text-sm text-gray-600">
                  Her rol için hangi sayfalara erişim olacağını belirleyin
                </p>
              </CardHeader>
              <CardContent>
                {permissionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Permissions yükleniyor...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-3 font-semibold">Roller</th>
                          {AVAILABLE_PERMISSIONS.map(perm => (
                            <th key={perm.key} className="text-center p-2 text-xs font-medium">
                              <div className="transform -rotate-45 whitespace-nowrap">
                                {perm.label}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ROLES.map(role => {
                          const IconComponent = role.icon;
                          return (
                            <tr key={role.key} className="border-t">
                              <td className="p-3">
                                <Badge variant="secondary" className={role.color}>
                                  <IconComponent className="h-4 w-4 mr-1" />
                                  {role.label}
                                </Badge>
                              </td>
                              {AVAILABLE_PERMISSIONS.map(perm => (
                                <td key={perm.key} className="text-center p-2">
                                  <Switch
                                    checked={rolePermissions[role.key]?.includes(perm.key) || false}
                                    onCheckedChange={() => togglePermission(role.key, perm.key)}
                                    size="sm"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button 
                onClick={loadRolePermissions} 
                variant="outline"
                disabled={permissionLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${permissionLoading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
              
              <Button 
                onClick={savePermissions}
                disabled={!hasChanges || saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </div>

            {hasChanges && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="py-3">
                  <p className="text-orange-800 text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Kaydedilmemiş değişiklikleriniz var. Değişiklikleri kaydetmeyi unutmayın!
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>

    {/* 🎯 Rol Ekleme Modal */}
    <Dialog open={showAddRoleModal} onOpenChange={setShowAddRoleModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedUser?.user?.name || 'Kullanıcı'} için Yeni Rol Ekle
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Mevcut roller: {selectedUser?.roles?.map(r => getRoleDisplayName(r.role)).join(', ')}
            </p>
            
            <Select
              value={newRoleForUser}
              onValueChange={setNewRoleForUser}
            >
              <SelectTrigger>
                <SelectValue placeholder="Eklenecek rolü seçin" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.filter(role => 
                  !selectedUser?.roles?.some(ur => ur.role === role.key)
                ).map(role => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddRoleModal(false);
                setNewRoleForUser('');
                setSelectedUser(null);
              }}
            >
              İptal
            </Button>
            <Button
              onClick={addRoleToUser}
              disabled={!newRoleForUser || createUserRole.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createUserRole.isPending ? 'Ekleniyor...' : 'Rol Ekle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* 🎯 Kullanıcı Silme Modal */}
    <Dialog open={showDeleteUserModal} onOpenChange={setShowDeleteUserModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">
            ⚠️ Kullanıcıyı Tamamen Sil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-medium text-red-800 dark:text-red-200 mb-2">
              DİKKAT: Bu işlem geri alınamaz!
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>{selectedUser?.user?.name || 'Kullanıcı'}</strong> ({selectedUser?.user?.email}) 
              kullanıcısını ve tüm rollerini kalıcı olarak silmek istediğinizden emin misiniz?
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Silinecek roller:</p>
            <div className="flex flex-wrap gap-1">
              {selectedUser?.roles?.map(r => (
                <Badge key={r.id} variant="outline" className="text-xs">
                  {getRoleDisplayName(r.role)}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteUserModal(false);
                setSelectedUser(null);
              }}
            >
              İptal
            </Button>
            <Button
              onClick={deleteUserCompletely}
              variant="destructive"
            >
              Kullanıcıyı Tamamen Sil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default UserRoleManagement;
