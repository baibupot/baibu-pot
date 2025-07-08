import React, { useState, useEffect, useMemo } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTeamMember, useUpdateTeamMember } from '@/hooks/useSupabaseData';
import { uploadFileObjectToGitHub } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];

// Bu roller UserRoleManagement'teki ile aynı olmalı
const ROLES = [
    { key: 'akademik_danisman', label: 'Akademik Danışman' },
    { key: 'baskan', label: 'Başkan' },
    { key: 'baskan_yardimcisi', label: 'Başkan Yardımcısı' },
    { key: 'iletisim_koordinator', label: 'İletişim Koordinatörü' },
    { key: 'teknik_koordinator', label: 'Teknik Koordinatör' },
    { key: 'etkinlik_koordinator', label: 'Etkinlik Koordinatörü' },
    { key: 'dergi_koordinator', label: 'Dergi Koordinatörü' },
    { key: 'mali_koordinator', label: 'Mali İşler Koordinatörü' },
    { key: 'iletisim_ekip', label: 'İletişim Ekip Üyesi' },
    { key: 'teknik_ekip', label: 'Teknik Ekip Üyesi' },
    { key: 'etkinlik_ekip', label: 'Etkinlik Ekip Üyesi' },
    { key: 'dergi_ekip', label: 'Dergi Ekip Üyesi' },
    { key: 'mali_ekip', label: 'Mali İşler Ekip Üyesi' }
];

// Rolleri ilgili ekip isimlerine haritalayan mantık
const getTeamNamesForRole = (role: string): string[] => {
    if (role.includes('_koordinator')) {
        const teamName = role.replace('_koordinator', ' Ekibi');
        // 'iletisim ekibi' -> 'İletişim Ekibi'
        const capitalizedTeamName = teamName.charAt(0).toUpperCase() + teamName.slice(1);
        return ['Yönetim Kurulu', capitalizedTeamName];
    }
    if (role.includes('_ekip')) {
        const teamName = role.replace('_ekip', ' Ekibi');
        const capitalizedTeamName = teamName.charAt(0).toUpperCase() + teamName.slice(1);
        return [capitalizedTeamName];
    }
    if (role === 'baskan' || role === 'baskan_yardimcisi' || role === 'akademik_danisman') {
        return ['Yönetim Kurulu'];
    }
    return [];
};

const validatePeriod = (p: string): string | null => {
    const regex = /^(\d{4})-(\d{4})$/;
    const match = p.match(regex);
    if (!match) {
        return "Format 'YYYY-YYYY' olmalı (örn: 2025-2026).";
    }
    const startYear = parseInt(match[1], 10);
    const endYear = parseInt(match[2], 10);

    if (endYear !== startYear + 1) {
        return "Yıllar arasında 1 yıl fark olmalıdır.";
    }

    if (startYear < 2000 || startYear > 2060) {
        return "Yıl 2000 ile 2060 arasında olmalıdır.";
    }

    return null;
}

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TeamMemberRow | null;
}

const TeamMemberModal = ({ isOpen, onClose, initialData }: TeamMemberModalProps) => {
  const [periodName, setPeriodName] = useState('');
  const [periodError, setPeriodError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createTeamMember = useCreateTeamMember();
  const updateTeamMember = useUpdateTeamMember();

  const isEditMode = !!initialData;

  const socialLinks = useMemo(() => {
    const links: { [key: string]: string } = {};
    if (email) links.email = email;
    if (linkedin) links.linkedin = linkedin;
    return links;
  }, [email, linkedin]);

  useEffect(() => {
    if (isOpen) {
        if (isEditMode && initialData) {
            setName(initialData.name || '');
            setBio(initialData.bio || '');
            const links = initialData.social_links as { email?: string; linkedin?: string } | null;
            setEmail(links?.email || '');
            setLinkedin(links?.linkedin || '');
            setExistingImageUrl(initialData.profile_image || null);
            // Düzenleme modunda dönem ve rol değiştirilemez
            setPeriodName('');
            setSelectedRole(undefined);
        } else {
            setName('');
            setBio('');
            setEmail('');
            setLinkedin('');
            setPeriodName('');
            setSelectedRole(undefined);
            setProfileImage(null);
            setExistingImageUrl(null);
        }
        setPeriodError(null);
        setIsProcessing(false);
    }
  }, [initialData, isEditMode, isOpen]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
          toast.error('Dosya boyutu 10MB\'dan büyük olamaz.');
          return;
      }
      setProfileImage(file);
      setExistingImageUrl(URL.createObjectURL(file));
    }
  };

  const handlePeriodChange = (value: string) => {
      setPeriodName(value);
      setPeriodError(validatePeriod(value));
  }

  const handleCreateSubmit = async () => {
    if (periodError) {
        toast.error(periodError);
        return;
    }
    if (!periodName || !selectedRole) {
      toast.error('Lütfen bir dönem ve rol seçin.');
      return;
    }
    
    const toastId = toast.loading('İşlem başlatılıyor...');
    setIsProcessing(true);

    try {
        let periodId: string;
        const { data: existingPeriod } = await supabase.from('periods').select('id').eq('name', periodName).single();

        if (existingPeriod) {
            periodId = existingPeriod.id;
        } else {
            const { data: newPeriod, error: createError } = await supabase.from('periods').insert({ name: periodName }).select('id').single();
            if (createError || !newPeriod) throw createError || new Error("Dönem oluşturulamadı.");
            periodId = newPeriod.id;
            toast.info(`'${periodName}' dönemi otomatik olarak oluşturuldu.`);
        }

        toast.loading('Ekipler kontrol ediliyor...', { id: toastId });
        const requiredTeamNames = getTeamNamesForRole(selectedRole);
        if (requiredTeamNames.length === 0) throw new Error(`'${selectedRole}' rolü için geçerli bir ekip bulunamadı.`);

        const teamPromises = requiredTeamNames.map(async (teamName) => {
            const { data: existingTeam } = await supabase
                .from('teams')
                .select('id')
                .eq('period_id', periodId)
                .eq('name', teamName)
                .single();
            
            if (existingTeam) {
                return { id: existingTeam.id, name: teamName };
            } else {
                toast.info(`'${teamName}' ekibi oluşturuluyor...`);
                const { data: newTeam, error: createError } = await supabase
                    .from('teams')
                    .insert({
                        period_id: periodId,
                        name: teamName,
                        is_board: teamName === 'Yönetim Kurulu',
                        description: ''
                    })
                    .select('id, name')
                    .single();
                if (createError || !newTeam) throw createError || new Error(`'${teamName}' ekibi oluşturulamadı.`);
                return newTeam;
            }
        });

        const teams = await Promise.all(teamPromises);

        let imageUrl: string | undefined = undefined;
        if (profileImage) {
            toast.loading('Profil fotoğrafı yükleniyor...', { id: toastId });
            const config = getGitHubStorageConfig();
            if (!config) throw new Error('GitHub yapılandırması eksik.');
            const fileName = `ekip-uyeleri/${periodId}/${Date.now()}-${profileImage.name.replace(/\s+/g, '-')}`;
            const result = await uploadFileObjectToGitHub(config, profileImage, fileName);
            if (!result.success || !result.rawUrl) throw new Error(result.error || 'Fotoğraf yüklenemedi.');
            imageUrl = result.rawUrl;
        }
        
        toast.loading('Üye kayıtları oluşturuluyor...', { id: toastId });
        const memberPayload = { name, role: ROLES.find(r => r.key === selectedRole)?.label || selectedRole, bio: bio || undefined, profile_image: imageUrl, social_links: socialLinks };
        const createPromises = teams.map(team => createTeamMember.mutateAsync({ ...memberPayload, team_id: team.id }));
        await Promise.all(createPromises);

        toast.success('Ekip üyesi başarıyla ilgili ekiplere eklendi!', { id: toastId });
        onClose();
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.', { id: toastId });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleUpdateSubmit = async () => {
      if (!initialData) return;

      const toastId = toast.loading('Üye güncelleniyor...');
      setIsProcessing(true);

      try {
          let imageUrl = initialData.profile_image || undefined;
          if (profileImage) {
            const config = getGitHubStorageConfig();
            if (!config) throw new Error('GitHub yapılandırması eksik.');
            const fileName = `ekip-uyeleri/${initialData.team_id}/${Date.now()}-${profileImage.name.replace(/\s+/g, '-')}`;
            const result = await uploadFileObjectToGitHub(config, profileImage, fileName);
            if (!result.success || !result.rawUrl) throw new Error(result.error || 'Fotoğraf yüklenemedi.');
            imageUrl = result.rawUrl;
          }

          const updatePayload = { name, bio: bio || undefined, profile_image: imageUrl, social_links: socialLinks };
          await updateTeamMember.mutateAsync({ id: initialData.id, ...updatePayload });

          toast.success('Ekip üyesi başarıyla güncellendi!', { id: toastId });
          onClose();
      } catch(error) {
        toast.error(error instanceof Error ? error.message : 'Güncelleme sırasında bir hata oluştu.', { id: toastId });
      } finally {
        setIsProcessing(false);
      }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isEditMode) {
        handleUpdateSubmit();
    } else {
        handleCreateSubmit();
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={isEditMode ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi Ekle'}
      description={isEditMode 
          ? 'Üyenin kişisel bilgilerini güncelleyin.' 
          : 'Üyenin dönemini ve rolünü belirtin. Sistem, üyeyi doğru ekiplere otomatik olarak yerleştirecektir.'}
      icon={<User className="h-6 w-6 text-white" />}
      isSaving={isProcessing}
      saveLabel={isEditMode ? 'Değişiklikleri Kaydet' : 'Üyeyi Ekle'}
      isFormValid={isEditMode ? true : !periodError && !!periodName && !!selectedRole}
      size="3xl"
    >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1 space-y-4">
            <Label>Profil Fotoğrafı</Label>
            <div className="aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center relative bg-slate-50 dark:bg-slate-800">
              {existingImageUrl ? (
                <img src={existingImageUrl} alt="Profil" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center text-slate-500 p-4">
                  <ImageIcon className="mx-auto h-12 w-12" />
                  <p className="mt-2 text-sm">Fotoğraf seçin</p>
                </div>
              )}
            </div>
            <Input id="picture" type="file" onChange={handleImageChange} accept="image/jpeg, image/png, image/webp" className="file:text-sm file:font-medium"/>
            <p className="text-xs text-slate-500">PNG, JPG, WEBP (Maks 10MB).</p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
          <div>
                <Label htmlFor="period">Dönem *</Label>
            <Input
                    id="period" 
                    value={isEditMode ? 'Değiştirilemez' : periodName} 
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    placeholder="örn: 2025-2026"
              required
                    disabled={isEditMode}
            />
                {periodError && <p className="text-sm text-red-500 mt-1">{periodError}</p>}
          </div>
            <div>
                <Label htmlFor="role">Rol *</Label>
                <Select value={isEditMode ? initialData?.role : selectedRole} onValueChange={setSelectedRole} disabled={isEditMode}>
                    <SelectTrigger><SelectValue placeholder={isEditMode ? initialData?.role : "Rol seçin..."} /></SelectTrigger>
                <SelectContent>
                        {ROLES.map(r => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="bio">Biyografi</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Kısa biyografi..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@baibu.edu.tr" />
            </div>
            <div>
                <Label htmlFor="linkedin">LinkedIn Profili</Label>
                <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            </div>
          </div>
        </form>
    </AdminModal>
  );
};

export default TeamMemberModal;
