import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePeriods, useTeams, useCreateTeamMember, useUpdateTeamMember } from '@/hooks/useSupabaseData';
import { uploadFileObjectToGitHub } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';
import { toast } from 'sonner';
import { Loader2, UploadCloud, User, Image as ImageIcon } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type TeamMemberInsert = Tables['team_members']['Insert'];
type TeamMemberRow = Tables['team_members']['Row'] & {
  teams: {
    period_id: string;
  } | null;
};

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TeamMemberRow;
}

const TeamMemberModal = ({ isOpen, onClose, initialData }: TeamMemberModalProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(initialData?.teams?.period_id);
  const [teamId, setTeamId] = useState<string | undefined>(initialData?.team_id);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: periods, isLoading: isLoadingPeriods } = usePeriods();
  const { data: teams, isLoading: isLoadingTeams } = useTeams(selectedPeriod);

  const createTeamMember = useCreateTeamMember();
  const updateTeamMember = useUpdateTeamMember();

  const socialLinks = useMemo(() => {
    const links: { [key: string]: string } = {};
    if (email) links.email = email;
    if (linkedin) links.linkedin = linkedin;
    return links;
  }, [email, linkedin]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setRole(initialData.role || '');
      setTeamId(initialData.team_id || undefined);
      setBio(initialData.bio || '');
      setExistingImageUrl(initialData.profile_image || null);
      
      const links = initialData.social_links as { email?: string; linkedin?: string } | null;
      setEmail(links?.email || '');
      setLinkedin(links?.linkedin || '');

      // initialData'dan period_id'yi de almamız gerekiyor, bu yüzden hook'u ve tipi güncelledik.
      if (initialData.teams?.period_id) {
        setSelectedPeriod(initialData.teams.period_id);
      }

    } else {
      // Reset form for new entry
      setName('');
      setRole('');
      setTeamId(undefined);
      setBio('');
      setEmail('');
      setLinkedin('');
      setProfileImage(null);
      setExistingImageUrl(null);
      setSelectedPeriod(undefined);
    }
  }, [initialData, isOpen]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setExistingImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      toast.error('Lütfen bir ekip seçin.');
      return;
    }
    setIsUploading(true);

    let imageUrl = initialData?.profile_image || undefined;

    try {
      if (profileImage) {
        const config = getGitHubStorageConfig();
        if (!config) {
          toast.error('GitHub Storage yapılandırması bulunamadı. Lütfen ayarları kontrol edin.');
          setIsUploading(false);
          return;
        }

        const toastId = toast.loading('Profil fotoğrafı yükleniyor...');
        const fileName = `ekip-uyeleri/${selectedPeriod}/${teamId}/${Date.now()}-${profileImage.name.replace(/\s+/g, '-')}`;
        
        const result = await uploadFileObjectToGitHub(config, profileImage, fileName);
        
        if (result.success && result.rawUrl) {
          imageUrl = result.rawUrl;
          toast.success('Fotoğraf başarıyla yüklendi!', { id: toastId });
        } else {
          throw new Error(result.error || 'Fotoğraf yüklenemedi.');
        }
      }

      const memberData = {
        name,
        role,
        team_id: teamId,
        bio: bio || undefined,
        profile_image: imageUrl,
        social_links: socialLinks,
      };

      if (initialData?.id) {
        await updateTeamMember.mutateAsync({ id: initialData.id, ...memberData });
        toast.success('Ekip üyesi başarıyla güncellendi.');
      } else {
        await createTeamMember.mutateAsync(memberData as TeamMemberInsert);
        toast.success('Ekip üyesi başarıyla eklendi.');
      }
    onClose();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Ekip Üyesi Düzenle' : 'Yeni Ekip Üyesi Ekle'}
          </DialogTitle>
          <DialogDescription>
            Ekip üyesinin bilgilerini girin ve bir döneme/ekibe atayın.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Left Column: Image Upload */}
          <div className="md:col-span-1 space-y-4">
            <Label>Profil Fotoğrafı</Label>
            <div className="aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center relative">
              {existingImageUrl ? (
                <img src={existingImageUrl} alt="Profil" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center text-slate-500">
                  <ImageIcon className="mx-auto h-12 w-12" />
                  <p className="mt-2 text-sm">Fotoğraf seçin</p>
                </div>
              )}
          </div>
            <Input id="picture" type="file" onChange={handleImageChange} accept="image/jpeg, image/png, image/webp" className="file:text-sm file:font-medium"/>
            <p className="text-xs text-slate-500">PNG, JPG, WEBP (Maks 2MB).</p>
          </div>

          {/* Right Column: Form Fields */}
          <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="period">Dönem</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={isLoadingPeriods}>
                  <SelectTrigger><SelectValue placeholder="Dönem seçin..." /></SelectTrigger>
                <SelectContent>
                    {periods?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="team">Ekip</Label>
                <Select value={teamId} onValueChange={setTeamId} disabled={!selectedPeriod || isLoadingTeams}>
                  <SelectTrigger><SelectValue placeholder="Ekip seçin..." /></SelectTrigger>
                  <SelectContent>
                    {teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="role">Rol/Pozisyon</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Koordinatör, Üye vb." required />
            </div>
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              İptal
            </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isUploading || !teamId}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Kaydediliyor...' : (initialData ? 'Güncelle' : 'Kaydet')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberModal;
