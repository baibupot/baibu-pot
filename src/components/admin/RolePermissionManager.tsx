import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Shield, 
  Users, 
  Check, 
  X, 
  Crown,
  Save,
  RefreshCw 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RolePermissionManagerProps {
  currentUserRoles: string[];
  onClose: () => void;
}

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
  { key: 'iletisim_koordinator', label: 'İletişim Koordinatörü', color: 'bg-green-100 text-green-800', icon: Users },
  { key: 'teknik_koordinator', label: 'Teknik Koordinatör', color: 'bg-yellow-100 text-yellow-800', icon: Settings },
  { key: 'etkinlik_koordinator', label: 'Etkinlik Koordinatörü', color: 'bg-orange-100 text-orange-800', icon: Users },
  { key: 'dergi_koordinator', label: 'Dergi Koordinatörü', color: 'bg-pink-100 text-pink-800', icon: Users },
  { key: 'mali_koordinator', label: 'Mali Koordinatör', color: 'bg-indigo-100 text-indigo-800', icon: Users },
  { key: 'iletisim_ekip', label: 'İletişim Ekip', color: 'bg-green-50 text-green-600', icon: Users },
  { key: 'teknik_ekip', label: 'Teknik Ekip', color: 'bg-yellow-50 text-yellow-600', icon: Users },
  { key: 'etkinlik_ekip', label: 'Etkinlik Ekip', color: 'bg-orange-50 text-orange-600', icon: Users },
  { key: 'dergi_ekip', label: 'Dergi Ekip', color: 'bg-pink-50 text-pink-600', icon: Users },
  { key: 'mali_ekip', label: 'Mali Ekip', color: 'bg-indigo-50 text-indigo-600', icon: Users }
];

const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({ 
  currentUserRoles, 
  onClose 
}) => {
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sadece başkan ve başkan yardımcısı erişebilir
  const canManagePermissions = currentUserRoles.some(role => 
    ['baskan', 'baskan_yardimcisi'].includes(role)
  );

  useEffect(() => {
    if (canManagePermissions) {
      loadRolePermissions();
    }
  }, [canManagePermissions]);

  const loadRolePermissions = async () => {
    try {
      setLoading(true);
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
      alert('❌ Permissions yüklenemedi: ' + (error as any)?.message);
    } finally {
      setLoading(false);
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
      alert('✅ Permissions başarıyla güncellendi!');
      
      // Ana dashboard'ı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Permission kaydetme hatası:', error);
      alert('❌ Permissions kaydedilemedi: ' + (error as any)?.message);
    } finally {
      setSaving(false);
    }
  };

  if (!canManagePermissions) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <X className="h-5 w-5" />
            Erişim Reddedildi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Bu özelliğe sadece Başkan ve Başkan Yardımcısı erişebilir.
          </p>
          <Button onClick={onClose} variant="outline">
            Geri Dön
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Permissions yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button onClick={onClose} variant="outline">
          Geri Dön
        </Button>
        
        <div className="flex gap-2">
          <Button 
            onClick={loadRolePermissions} 
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          
          <Button 
            onClick={savePermissions}
            disabled={!hasChanges || saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
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
    </div>
  );
};

export default RolePermissionManager; 