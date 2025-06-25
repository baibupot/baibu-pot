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
  LogOut,
  Edit,
  Trash2,
  Plus,
  Building2,
  ClipboardList,
  GraduationCap,
  Eye,
  Shield,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import NewsModal from '@/components/admin/NewsModal';
import EventModal from '@/components/admin/EventModal';
import MagazineModal from '@/components/admin/MagazineModal';
import SponsorModal from '@/components/admin/SponsorModal';
import SurveyModal from '@/components/admin/SurveyModal';
import TeamMemberModal from '@/components/admin/TeamMemberModal';
import ProductModal from '@/components/admin/ProductModal';
import ProductDesignRequestDetailModal from '@/components/admin/ProductDesignRequestDetailModal';
import UserRoleManagement from '@/components/admin/UserRoleManagement';
import ThemeToggle from '@/components/admin/ThemeToggle';
import FormResponsesModal from '@/components/admin/FormResponsesModal';
import { EVENT_TYPES, EVENT_STATUSES } from '@/constants/eventConstants';

import { useNews, useEvents, useMagazineIssues, useSurveys, useSponsors, useTeamMembers, useAcademicDocuments, useInternships, useContactMessages, useUpdateContactMessage, useDeleteContactMessage, useUsers, useUserRoles, useMagazineAnalytics, useMagazineContributors, useArticleSubmissions, useEventSuggestions, useUpdateEventSuggestion, useProducts, useProductDesignRequests, useUpdateProductDesignRequest } from '@/hooks/useSupabaseData';
import { deleteMagazineFilesByUrls, deleteAllProductFilesFromGitHub } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig, isGitHubStorageConfigured } from '@/integrations/github/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface User {
  id: string;
  email: string;
  name?: string;
  userRoles?: string[]; // Changed from single role to array of roles
}

// Toast bildirimleri sonner ile yönetiliyor

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  
  // Modal states
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [magazineModalOpen, setMagazineModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [teamMemberModalOpen, setTeamMemberModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Article modal states - YENİ
  const [articleDetailModalOpen, setArticleDetailModalOpen] = useState(false);
  const [articleDeleteModalOpen, setArticleDeleteModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  
  // Message modal states - YENİ
  const [messageDetailModalOpen, setMessageDetailModalOpen] = useState(false);
  const [messageDeleteModalOpen, setMessageDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  // Form Responses modal states - YENİ
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Product Design Request modal states - YENİ
  const [designRequestDetailModalOpen, setDesignRequestDetailModalOpen] = useState(false);
  const [selectedDesignRequest, setSelectedDesignRequest] = useState<any>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: string; action: string } | null>(null);

  // Data hooks
  const { data: users } = useUsers();
  const { data: userRoles } = useUserRoles();
  const { data: news } = useNews(false);
  const { data: events } = useEvents();
  const { data: magazines } = useMagazineIssues(false);
  const { data: surveys } = useSurveys();
  const { data: internships } = useInternships(false);
  const { data: documents } = useAcademicDocuments();
  const { data: contactMessages } = useContactMessages();
  const { data: sponsors } = useSponsors(false);
  const { data: teamMembers } = useTeamMembers(false);
  const { data: products } = useProducts(false);
  
  // Dergi istatistikleri için yeni hook'lar
  const { data: magazineReads } = useMagazineAnalytics();
  const { data: allContributors } = useMagazineContributors();
  const { data: articleSubmissions } = useArticleSubmissions();
  const { data: eventSuggestions } = useEventSuggestions();
  const updateEventSuggestion = useUpdateEventSuggestion();
  
  // Product Design Requests hooks
  const { data: productDesignRequests } = useProductDesignRequests();
  const updateProductDesignRequest = useUpdateProductDesignRequest();
  
  // Contact message mutations
  const updateContactMessage = useUpdateContactMessage();
  const deleteContactMessage = useDeleteContactMessage();

  // Gerçek dergi istatistikleri hesaplama
  const calculateMagazineStats = () => {
    if (!magazineReads) return { thisMonth: 0, total: 0, avgDuration: 0, deviceStats: { mobile: 0, desktop: 0, tablet: 0 } };
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Bu ay okunan sayısı
    const thisMonthReads = magazineReads.filter(read => 
      new Date(read.created_at) >= thisMonth
    ).length;
    
    // Toplam okuma sayısı
    const totalReads = magazineReads.length;
    
    // Ortalama okuma süresi (dakika)
    const avgDuration = magazineReads.length > 0 
      ? Math.round(magazineReads.reduce((sum, read) => sum + (read.reading_duration || 0), 0) / magazineReads.length / 60)
      : 0;
    
    // Cihaz istatistikleri
    const deviceCounts = magazineReads.reduce((acc, read) => {
      const device = read.device_type?.toLowerCase() || 'desktop';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const deviceStats = {
      mobile: Math.round(((deviceCounts.mobile || 0) / totalReads) * 100) || 0,
      desktop: Math.round(((deviceCounts.desktop || 0) / totalReads) * 100) || 0,
      tablet: Math.round(((deviceCounts.tablet || 0) / totalReads) * 100) || 0
    };
    
    return { thisMonth: thisMonthReads, total: totalReads, avgDuration, deviceStats };
  };

  const magazineStats = calculateMagazineStats();
  const totalContributors = allContributors?.length || 0;

  // Her dergi için okuma sayısını hesapla
  const getMagazineReadStats = (magazineId: string) => {
    if (!magazineReads) return { reads: 0, avgDuration: 0 };
    
    const magazineSpecificReads = magazineReads.filter(read => read.magazine_issue_id === magazineId);
    const reads = magazineSpecificReads.length;
    const avgDuration = reads > 0 
      ? Math.round(magazineSpecificReads.reduce((sum, read) => sum + (read.reading_duration || 0), 0) / reads / 60)
      : 0;
    
    return { reads, avgDuration };
  };

  useEffect(() => {
    checkUser();
    loadRolePermissions();
  }, []);

  // 🎯 Database'den role permissions yükle
  const loadRolePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, permission');
      
      if (error) throw error;
      
      // Permissions'ları role'e göre grupla
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
      // Fallback olarak eski hardcoded permissions'ları kullan
      setRolePermissions({
        baskan: ['overview', 'users', 'news', 'events', 'magazine', 'surveys', 'sponsors', 'products', 'team', 'documents', 'internships', 'messages'],
        baskan_yardimcisi: ['overview', 'users', 'news', 'events', 'magazine', 'surveys', 'sponsors', 'products', 'team', 'documents', 'internships', 'messages']
      });
    }
  };

  // 🔒 Enhanced Security Check with Email & Role Validation
  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/admin');
      return;
    }

    // 🎯 E-posta onay kontrolü kaldırıldı - sadece başkan onayı yeterli

    // Get user profile and roles
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .eq('is_approved', true);

    // Role approval kontrolü
    if (!userRoleData || userRoleData.length === 0) {
      toast.error('⏳ Hesabınız henüz yönetici tarafından onaylanmamış. Erişim reddedildi.');
      await supabase.auth.signOut();
      navigate('/admin');
      return;
    }

    if (userProfile) {
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: userProfile.name || authUser.user_metadata?.name,
        userRoles: userRoleData?.map(r => r.role) || []
      });
      
      // Success message
      const roleNames = userRoleData.map(r => getRoleDisplayName(r.role)).join(', ');
      console.log(`✅ Admin panel erişimi onaylandı: ${roleNames}`);
    } else {
      // If no profile found but roles exist, create minimal user
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || 'Bilinmeyen Kullanıcı',
        userRoles: userRoleData?.map(r => r.role) || []
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const getRolePermissions = (roles: string[]) => {
    // 🎯 Database'den yüklenen permissions'ları kullan
    const allPermissions = new Set<string>();
    roles.forEach(role => {
      const userRolePermissions = rolePermissions[role] || [];
      userRolePermissions.forEach(perm => allPermissions.add(perm));
    });
    
    return Array.from(allPermissions);
  };

  const hasPermission = (permission: string) => {
    if (!user || !user.userRoles) return false;
    return getRolePermissions(user.userRoles).includes(permission);
  };

  // 🏷️ Role Display Utility
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
    return roles.map(role => roleLabels[role as keyof typeof roleLabels] || role).join(', ');
  };

  const handleSaveNews = async (newsData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Haber güncellendi');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([{ ...newsData, author_id: user?.id }]);
        if (error) throw error;
        toast.success('Haber eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving news:', error);
    }
  };

  const handleSaveEvent = async (eventData: any) => {
    let savedEventId: string | null = null;
    let isNewEvent = !editingItem;
    
    try {
      const { sponsors, ...eventDataWithoutSponsors } = eventData;
      
      if (editingItem) {
        // Etkinlik güncelleme
        const { error } = await supabase
          .from('events')
          .update(eventDataWithoutSponsors)
          .eq('id', editingItem.id);
        if (error) throw error;
        savedEventId = editingItem.id;
        
        // Mevcut sponsorları sil
        const { error: sponsorDeleteError } = await supabase
          .from('event_sponsors')
          .delete()
          .eq('event_id', savedEventId);
        if (sponsorDeleteError) throw sponsorDeleteError;
          
        toast.success('Etkinlik güncellendi');
      } else {
        // Yeni etkinlik ekleme
        const { data, error } = await supabase
          .from('events')
          .insert([{ ...eventDataWithoutSponsors, created_by: user?.id }])
          .select()
          .single();
        if (error) throw error;
        savedEventId = data.id;
        toast.success('Etkinlik eklendi');
      }
      
      // Sponsorları kaydet
      if (sponsors && sponsors.length > 0 && savedEventId) {
        try {
        const sponsorInserts = sponsors.map((sponsor: any) => ({
          event_id: savedEventId,
          sponsor_name: sponsor.sponsor_name,
          sponsor_logo: sponsor.sponsor_logo,
          sponsor_website: sponsor.sponsor_website,
          sponsor_type: sponsor.sponsor_type,
          sort_order: sponsor.sort_order
        }));
        
        const { error: sponsorError } = await supabase
          .from('event_sponsors')
          .insert(sponsorInserts);
          
          if (sponsorError) throw sponsorError;
          
          if (sponsors.length > 0) {
          toast.success(`${sponsors.length} sponsor başarıyla kaydedildi`);
          }
        } catch (sponsorError) {
          console.error('🚨 Sponsor kaydetme hatası:', sponsorError);
          
          // Rollback: Yeni eklenen etkinliği sil
          if (isNewEvent && savedEventId) {
            console.log('🔄 Rolling back: Etkinlik siliniyor...');
            await supabase
              .from('events')
              .delete()
              .eq('id', savedEventId);
            
            toast.error('❌ Sponsorlar kaydedilemedi, etkinlik silindi. Lütfen tekrar deneyin.');
            return;
          } else {
            toast.error('⚠️ Etkinlik kaydedildi ancak sponsorlar kaydedilemedi');
          }
        }
      }
      
      setEditingItem(null);
      
      // Sayfayı yenile ki veriler güncellensin
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('🚨 Etkinlik kaydetme hatası:', error);
      
      // Rollback: Yeni eklenen etkinliği sil
      if (isNewEvent && savedEventId) {
        console.log('🔄 Rolling back: Etkinlik siliniyor...');
        try {
          await supabase
            .from('events')
            .delete()
            .eq('id', savedEventId);
          toast.error('❌ Bir hata oluştu, değişiklikler geri alındı');
        } catch (rollbackError) {
          console.error('🚨 Rollback hatası:', rollbackError);
          toast.error('❌ Kritik hata: Manuel temizlik gerekli');
        }
      } else {
        toast.error('❌ Bir hata oluştu');
      }
    }
  };

  const handleSaveMagazine = async (magazineData: any) => {
    console.log('🔍 AdminDashboard - Received magazineData:', magazineData);
    console.log('🔍 Type of issue_number:', typeof magazineData.issue_number);
    console.log('🔍 issue_number value:', magazineData.issue_number);
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('magazine_issues')
          .update(magazineData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Dergi güncellendi');
      } else {
        // Temiz veri oluştur
        const cleanInsertData = {
          title: magazineData.title,
          description: magazineData.description,
          issue_number: Number(magazineData.issue_number), // Kesinlikle number olsun
          publication_date: magazineData.publication_date,
          cover_image: magazineData.cover_image,
          pdf_file: magazineData.pdf_file,
          slug: magazineData.slug,
          published: Boolean(magazineData.published),
          created_by: user?.id || null
        };
        
        console.log('🔍 Final clean data for insert:', cleanInsertData);
        
        // Aynı sayı numarası var mı kontrol et
        const { data: existingMagazine } = await supabase
          .from('magazine_issues')
          .select('id')
          .eq('issue_number', cleanInsertData.issue_number)
          .single();
        
        if (existingMagazine) {
          // Mevcut kaydı güncelle
          const { error } = await supabase
            .from('magazine_issues')
            .update(cleanInsertData)
            .eq('issue_number', cleanInsertData.issue_number);
          if (error) throw error;
          toast.success(`Sayı ${cleanInsertData.issue_number} güncellendi!`);
        } else {
          // Yeni kayıt ekle
          const { error } = await supabase
            .from('magazine_issues')
            .insert([cleanInsertData]);
          if (error) throw error;
          toast.success('Dergi eklendi');
        }
      }
      setEditingItem(null);
      setMagazineModalOpen(false);
      
      // Veriyi yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast.error('Bir hata oluştu: ' + (error as any)?.message);
      console.error('Error saving magazine:', error);
      throw error; // MagazineModal'da error handling için
    }
  };

  const handleSaveSponsor = async (sponsorData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Sponsor güncellendi');
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert([sponsorData]);
        if (error) throw error;
        toast.success('Sponsor eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving sponsor:', error);
    }
  };

  const handleSaveSurvey = async (surveyData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Anket güncellendi');
      } else {
        const { error } = await supabase
          .from('surveys')
          .insert([{ ...surveyData, created_by: user?.id }]);
        if (error) throw error;
        toast.success('Anket eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving survey:', error);
    }
  };

  const handleSaveTeamMember = async (teamMemberData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('team_members')
          .update(teamMemberData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Ekip üyesi güncellendi');
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert([teamMemberData]);
        if (error) throw error;
        toast.success('Ekip üyesi eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving team member:', error);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Ürün güncellendi');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...productData, created_by: user?.id }]);
        if (error) throw error;
        toast.success('Ürün eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving product:', error);
    }
  };

  // Type-safe item types
  type EditableItem = 
    | Tables['news']['Row']
    | Tables['events']['Row'] 
    | Tables['magazine_issues']['Row']
    | Tables['sponsors']['Row']
    | Tables['surveys']['Row']
    | Tables['team_members']['Row']
    | Tables['products']['Row'];

  const openEditModal = (item: EditableItem, type: 'news' | 'event' | 'magazine' | 'sponsor' | 'survey' | 'team' | 'product') => {
    setEditingItem(item);
    if (type === 'news') setNewsModalOpen(true);
    else if (type === 'event') setEventModalOpen(true);
    else if (type === 'magazine') setMagazineModalOpen(true);
    else if (type === 'sponsor') setSponsorModalOpen(true);
    else if (type === 'survey') setSurveyModalOpen(true);
    else if (type === 'team') setTeamMemberModalOpen(true);
    else if (type === 'product') setProductModalOpen(true);
  };

  const handleDelete = async (
    id: string, 
    tableName: 'news' | 'events' | 'magazine_issues' | 'sponsors' | 'surveys' | 'team_members' | 'products'
  ) => {
    if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      // Dergi silme durumunda GitHub'dan da dosyaları sil
      if (tableName === 'magazine_issues') {
        // Önce dergi bilgisini al
        const { data: magazine } = await supabase
          .from('magazine_issues')
          .select('*')
          .eq('id', id)
          .single();

        if (magazine) {
          toast.info(`Dergi "${magazine.title}" siliniyor...`);
          
          // GitHub'dan dosyaları sil (arka planda)
          if (isGitHubStorageConfigured()) {
            const githubConfig = getGitHubStorageConfig();
            
            try {
              const deleteResult = await deleteMagazineFilesByUrls(
                githubConfig,
                magazine.pdf_file || undefined,
                magazine.cover_image || undefined,
                magazine.issue_number
              );
              
              if (deleteResult.success && deleteResult.deletedFiles && deleteResult.deletedFiles.length > 0) {
                toast.success(`GitHub'dan ${deleteResult.deletedFiles.length} dosya silindi`);
              } else if (deleteResult.error) {
                toast.error(`GitHub silme hatası: ${deleteResult.error}`);
              }
            } catch (githubError) {
              toast.error(`GitHub bağlantı hatası: ${githubError}`);
            }
          } else {
            toast.info('GitHub Storage yapılandırılmamış - sadece veritabanından siliniyor');
          }
        }
      }

      // Veritabanından sil
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      toast.success(tableName === 'magazine_issues' ? 'Dergi tamamen silindi!' : 'Öğe silindi');
      
      // Sayfayı yenile - veri cache'ini temizle
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast.error('Silme işlemi başarısız');
      console.error('Error deleting:', error);
    }
  };

  // Article handlers - YENİ
  const handleViewArticleDetail = (article: Tables['article_submissions']['Row']) => {
    setSelectedArticle(article);
    setArticleDetailModalOpen(true);
  };

  const handleDeleteArticle = (article: Tables['article_submissions']['Row']) => {
    setSelectedArticle(article);
    setArticleDeleteModalOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      const { error } = await supabase
        .from('article_submissions')
        .delete()
        .eq('id', selectedArticle.id);
      
      if (error) throw error;
      
      toast.success('Makale başarıyla silindi');
      setArticleDeleteModalOpen(false);
      setSelectedArticle(null);
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error('Makale silinirken hata: ' + errorMessage);
    }
  };

  // Message handlers - YENİ
  const handleViewMessageDetail = (message: any) => {
    setSelectedMessage(message);
    setMessageDetailModalOpen(true);
  };

  const handleDeleteMessage = (message: any) => {
    setSelectedMessage(message);
    setMessageDeleteModalOpen(true);
  };

  const confirmDeleteMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      await deleteContactMessage.mutateAsync(selectedMessage.id);
      toast.success('✅ Mesaj başarıyla silindi');
      setMessageDeleteModalOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error('❌ Mesaj silinirken hata: ' + errorMessage);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateContactMessage.mutateAsync({ 
        id: messageId, 
        status: 'read' 
      });
      toast.success('✅ Mesaj okundu olarak işaretlendi');
    } catch (error) {
      toast.error('❌ Mesaj güncellenirken hata oluştu');
    }
  };

  const handleMarkAsReplied = async (messageId: string) => {
    try {
      await updateContactMessage.mutateAsync({ 
        id: messageId, 
        status: 'replied' 
      });
      toast.success('✅ Mesaj yanıtlandı olarak işaretlendi');
    } catch (error) {
      toast.error('❌ Mesaj güncellenirken hata oluştu');
    }
  };

  // Product Design Request handlers
  const handleViewDesignRequestDetail = (request: any) => {
    setSelectedDesignRequest(request);
    setDesignRequestDetailModalOpen(true);
  };

  const handleStatusChangeConfirmation = (id: string, newStatus: string, action: string) => {
    setPendingStatusChange({ id, status: newStatus, action });
    setConfirmationModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    
    try {
      await updateProductDesignRequest.mutateAsync({ 
        id: pendingStatusChange.id, 
        status: pendingStatusChange.status,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user?.id 
      });
      
      toast.success(`✅ Talep durumu başarıyla güncellendi: ${pendingStatusChange.action}`);
    } catch (error) {
      console.error('Error updating design request:', error);
      toast.error('❌ Durum güncellenirken bir hata oluştu');
    } finally {
      setConfirmationModalOpen(false);
      setPendingStatusChange(null);
    }
  };

  const cancelStatusChange = () => {
    setConfirmationModalOpen(false);
    setPendingStatusChange(null);
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  const getPendingCount = (category: string) => {
    switch (category) {
      case 'news':
        return news?.filter(item => !item.published).length || 0;
      case 'magazines':
        return magazines?.filter(item => !item.published).length || 0;
      case 'users':
        return userRoles?.filter(role => !role.is_approved).length || 0;
      case 'contact':
        return contactMessages?.filter(msg => msg.status === 'unread').length || 0;
      default:
        return 0;
    }
  };

  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: users?.length || 0,
      change: '+2',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Bekleyen Roller',
      value: getPendingCount('users'),
      change: `${getPendingCount('users')} beklemede`,
      icon: Shield,
      color: 'text-amber-600'
    },
    {
      title: 'Toplam Haberler',
      value: news?.length || 0,
      change: '+2',
      icon: FileText,
      color: 'text-cyan-600'
    },
    {
      title: 'Toplam Etkinlikler',
      value: events?.length || 0,
      change: '+2',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Toplam Dergi Sayıları',
      value: magazines?.length || 0,
      change: '+2',
      icon: BookOpen,
      color: 'text-yellow-600'
    },
    {
      title: 'Toplam Anketler',
      value: surveys?.length || 0,
      change: '+2',
      icon: ClipboardList,
      color: 'text-purple-600'
    },
    {
      title: 'Toplam Sponsorlar',
      value: sponsors?.length || 0,
      change: '+2',
      icon: Building2,
      color: 'text-pink-600'
    },
    {
      title: 'Toplam Ekipler',
      value: teamMembers?.length || 0,
      change: '+2',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Toplam Belgeler',
      value: documents?.length || 0,
      change: '+2',
      icon: GraduationCap,
      color: 'text-green-600'
    },
    {
      title: 'Toplam Staj İlanları',
      value: internships?.length || 0,
      change: '+2',
      icon: Briefcase,
      color: 'text-yellow-600'
    },
    {
      title: 'Toplam Mesajlar',
      value: contactMessages?.length || 0,
      change: '+2',
      icon: MessageSquare,
      color: 'text-blue-600'
    }
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
              <div className="flex items-center mb-4 sm:mb-0">
                <LayoutDashboard className="h-8 w-8 text-cyan-500 mr-3" />
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Admin Paneli
                </h1>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Theme Toggle */}
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
                
                {/* User Info */}
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getRoleLabel(user.userRoles || [])}
                  </p>
                </div>
                
                {/* Logout Button */}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Çıkış</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Responsive tab list */}
            <div className="overflow-x-auto">
              <TabsList className="grid w-max grid-flow-col gap-1 md:w-full md:grid-cols-6 lg:grid-cols-12">
                <TabsTrigger value="overview" className="text-xs whitespace-nowrap">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Genel
                </TabsTrigger>
                {hasPermission('users') && (
                  <TabsTrigger value="users" className="text-xs whitespace-nowrap">
                    <Shield className="h-4 w-4 mr-1" />
                    Roller
                  </TabsTrigger>
                )}
                {hasPermission('news') && (
                  <TabsTrigger value="news" className="text-xs whitespace-nowrap">
                    <FileText className="h-4 w-4 mr-1" />
                    Haberler
                  </TabsTrigger>
                )}
                {hasPermission('events') && (
                  <TabsTrigger value="events" className="text-xs whitespace-nowrap">
                    <Calendar className="h-4 w-4 mr-1" />
                    Etkinlikler
                  </TabsTrigger>
                )}

                {hasPermission('magazine') && (
                  <TabsTrigger value="magazine" className="text-xs whitespace-nowrap">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Dergi
                  </TabsTrigger>
                )}


                {hasPermission('surveys') && (
                  <TabsTrigger value="surveys" className="text-xs whitespace-nowrap">
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Anketler
                  </TabsTrigger>
                )}
                {hasPermission('sponsors') && (
                  <TabsTrigger value="sponsors" className="text-xs whitespace-nowrap">
                    <Building2 className="h-4 w-4 mr-1" />
                    Sponsorlar
                  </TabsTrigger>
                )}
                {hasPermission('products') && (
                  <TabsTrigger value="products" className="text-xs whitespace-nowrap">
                    <Package className="h-4 w-4 mr-1" />
                    Ürünler
                  </TabsTrigger>
                )}
                {hasPermission('team') && (
                  <TabsTrigger value="team" className="text-xs whitespace-nowrap">
                    <Users className="h-4 w-4 mr-1" />
                    Ekipler
                  </TabsTrigger>
                )}
                {hasPermission('documents') && (
                  <TabsTrigger value="documents" className="text-xs whitespace-nowrap">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Belgeler
                  </TabsTrigger>
                )}
                {hasPermission('internships') && (
                  <TabsTrigger value="internships" className="text-xs whitespace-nowrap">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Staj
                  </TabsTrigger>
                )}
                {hasPermission('messages') && (
                  <TabsTrigger value="messages" className="text-xs whitespace-nowrap">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Mesajlar
                  </TabsTrigger>
                )}

              </TabsList>
            </div>

            {/* Dashboard Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Haberler</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{news?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {news?.filter(n => n.published).length || 0} yayında
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Etkinlikler</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{events?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {events?.filter(e => e.status === 'upcoming').length || 0} yaklaşan
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dergi Sayıları</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{magazines?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {magazines?.filter(m => m.published).length || 0} yayında
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mesajlar</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contactMessages?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {contactMessages?.filter(m => m.status === 'unread').length || 0} okunmamış
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            {hasPermission('users') && (
              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Rol Yönetimi</h2>
                </div>
                <UserRoleManagement currentUserRoles={user?.userRoles || []} />
              </TabsContent>
            )}

            {/* News Tab */}
            {hasPermission('news') && (
              <TabsContent value="news" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Haberler ve Duyurular</h2>
                  <Button onClick={() => { setEditingItem(null); setNewsModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Haber
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {news?.map(newsItem => (
                        <div key={newsItem.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{newsItem.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{newsItem.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(newsItem.created_at).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={newsItem.published ? "default" : "secondary"}>
                                {newsItem.published ? "Yayında" : "Taslak"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(newsItem, 'news')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(newsItem.id, 'news')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!news || news?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz haber bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Events Tab - Enhanced with Suggestions */}
            {hasPermission('events') && (
              <TabsContent value="events" className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      📅 Etkinlik Yönetimi
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                      Etkinlikleri yönetin ve kullanıcı önerilerini değerlendirin
                    </p>
                  </div>
                  <Button 
                    onClick={() => { setEditingItem(null); setEventModalOpen(true); }}
                    className="w-full sm:w-auto h-12 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Etkinlik Oluştur
                  </Button>
                </div>

                {/* Sub Navigation Tabs */}
                <Tabs defaultValue="events-list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 gap-1 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl shadow-sm">
                    <TabsTrigger 
                      value="events-list" 
                      className="flex items-center justify-center gap-2 h-10 data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:border-blue-700 rounded-lg border-2 border-transparent transition-all duration-200"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Etkinlik Listesi</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="suggestions"
                      className="flex items-center justify-center gap-2 h-10 data-[state=active]:bg-purple-50 data-[state=active]:border-purple-200 data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:border-purple-700 rounded-lg border-2 border-transparent transition-all duration-200"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">Kullanıcı Önerileri</span>
                      {eventSuggestions?.filter(s => s.status === 'pending').length > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
                          {eventSuggestions.filter(s => s.status === 'pending').length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Events List Sub-Tab */}
                  <TabsContent value="events-list" className="space-y-6 mt-6">

                {/* Events Stats Cards - Mobile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300">📅 Toplam</div>
                    <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{events?.length || 0}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Etkinlik</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300">🔥 Yaklaşan</div>
                    <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {events?.filter(e => e.status === 'upcoming').length || 0}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Etkinlik</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 sm:p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-300">✅ Tamamlanan</div>
                    <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {events?.filter(e => e.status === 'completed').length || 0}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Etkinlik</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 sm:p-4 rounded-xl border border-orange-200 dark:border-orange-700">
                    <div className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-300">⏳ Bekleyen</div>
                    <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {events?.filter(e => e.status === 'draft').length || 0}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">Taslak</div>
                  </div>
                </div>

                {/* Events List - Mobile-First Cards */}
                <Card className="overflow-hidden">
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {events?.map(event => (
                        <div key={event.id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                          {/* Mobile-First Event Card Layout */}
                          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            {/* Event Info */}
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Title and Featured Image */}
                              <div className="flex items-start gap-3">
                                {event.featured_image && (
                                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <img 
                                      src={event.featured_image} 
                                      alt={event.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                                      }}
                                    />
                                  </div>
                                )}
                          <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {event.title}
                                  </h3>
                                  {event.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Event Meta Information - Enhanced */}
                              <div className="space-y-3">
                                {/* Primary Info Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Event Type */}
                                  <Badge variant="outline" className="text-xs font-medium">
                                    {EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES] || event.event_type}
                                  </Badge>
                                  
                                  {/* Event Date Range */}
                                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(event.event_date).toLocaleDateString('tr-TR')}</span>
                                    {event.end_date && event.end_date !== event.event_date && (
                                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        - {new Date(event.end_date).toLocaleDateString('tr-TR')}
                              </span>
                                    )}
                                  </div>

                                  {/* Status Badge */}
                                  <Badge 
                                    variant={event.status === 'upcoming' ? "default" : event.status === 'completed' ? "secondary" : "outline"}
                                    className="text-xs"
                                  >
                                    {event.status === 'upcoming' ? '🔥 Yaklaşan' : 
                                     event.status === 'completed' ? '✅ Tamamlandı' : 
                                     event.status === 'cancelled' ? '❌ İptal' : '📝 Taslak'}
                              </Badge>

                                  {/* Price */}
                                  {event.price && event.price > 0 ? (
                                    <Badge variant="outline" className="text-xs font-medium text-green-600 border-green-300">
                                      💰 {event.price} {event.currency}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs font-medium text-blue-600 border-blue-300">
                                      🆓 Ücretsiz
                                    </Badge>
                                  )}
                            </div>

                                {/* Secondary Info Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Location */}
                                  {event.location && (
                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                      <span>📍</span>
                                      <span className="line-clamp-1">{event.location}</span>
                          </div>
                                  )}

                                  {/* Participants */}
                                  {event.max_participants && (
                                    <Badge variant="outline" className="text-xs font-medium text-purple-600 border-purple-300">
                                      👥 Max {event.max_participants}
                                    </Badge>
                                  )}

                                  {/* Gallery Images */}
                                  {event.gallery_images && event.gallery_images.length > 0 && (
                                    <Badge variant="outline" className="text-xs font-medium text-cyan-600 border-cyan-300">
                                      📸 {event.gallery_images.length} Resim
                                    </Badge>
                                  )}

                                  {/* Registration Method */}
                                  {event.registration_required && (
                                    <Badge variant="outline" className="text-xs font-medium text-orange-600 border-orange-300">
                                      {event.registration_link ? '🔗 Harici Kayıt' : 
                                       event.has_custom_form ? '📝 Özel Form' : '📋 Kayıt Var'}
                                    </Badge>
                                  )}

                                  {/* Map Available */}
                                  {event.latitude && event.longitude && (
                                    <Badge variant="outline" className="text-xs font-medium text-emerald-600 border-emerald-300">
                                      🗺️ Harita Var
                                    </Badge>
                                  )}

                                  {/* Sponsor Count - We'll get this from a separate query */}
                                  <Badge variant="outline" className="text-xs font-medium text-pink-600 border-pink-300">
                                    🤝 Sponsorlar
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons - Mobile Stack */}
                            <div className="flex flex-row sm:flex-col gap-2 sm:flex-shrink-0">
                              {/* Kayıtları Gör Butonu - Sadece özel formu olan etkinlikler için */}
                              {event.has_custom_form && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setResponseModalOpen(true);
                                  }}
                                  className="flex-1 sm:flex-none h-9 text-xs sm:text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:border-green-600 dark:hover:text-green-400 transition-colors"
                                >
                                  <Users className="h-3 w-3 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">📊 Kayıtları Gör</span>
                                  <span className="sm:hidden">📊 Kayıtlar</span>
                            </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEditModal(event, 'event')}
                                className="flex-1 sm:flex-none h-9 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors"
                              >
                                <Edit className="h-3 w-3 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Düzenle</span>
                                <span className="sm:hidden">Düzenle</span>
                            </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDelete(event.id, 'events')}
                                className="flex-1 sm:flex-none h-9 text-xs sm:text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3 w-3 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Sil</span>
                                <span className="sm:hidden">Sil</span>
                            </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Empty State - Enhanced */}
                      {(!events || events?.length === 0) && (
                        <div className="text-center py-12 sm:py-16">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Henüz etkinlik bulunmuyor
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            İlk etkinliğinizi oluşturarak topluluğunuzu harekete geçirin
                          </p>
                          <Button 
                            onClick={() => { setEditingItem(null); setEventModalOpen(true); }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            İlk Etkinliği Oluştur
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

                  {/* Suggestions Sub-Tab */}
                  <TabsContent value="suggestions" className="space-y-6 mt-6">
                    {/* Etkinlik Önerileri Bölümü */}
                    <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Kullanıcı Etkinlik Önerileri
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Kullanıcılardan gelen etkinlik önerilerini değerlendirin ve onaylayın
                      </p>
                    </div>
                  </div>

                  {/* Suggestion Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs sm:text-sm font-medium">📥 Toplam</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {eventSuggestions?.length || 0}
                          </p>
                        </div>
                        <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-xs sm:text-sm font-medium">⏳ Bekleyen</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {eventSuggestions?.filter(s => s.status === 'pending').length || 0}
                          </p>
                        </div>
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-xs sm:text-sm font-medium">✅ Onaylanan</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {eventSuggestions?.filter(s => s.status === 'approved').length || 0}
                          </p>
                        </div>
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-xs sm:text-sm font-medium">❌ Reddedilen</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {eventSuggestions?.filter(s => s.status === 'rejected').length || 0}
                          </p>
                        </div>
                        <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-200" />
                      </div>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        📝 Öneri Listesi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {eventSuggestions?.map(suggestion => (
                          <div key={suggestion.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                                    {suggestion.title}
                                  </h5>
                                  <Badge 
                                    className={`${
                                      suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                      suggestion.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                    }`}
                                  >
                                    {suggestion.status === 'pending' ? '⏳ Beklemede' :
                                     suggestion.status === 'approved' ? '✅ Onaylandı' : '❌ Reddedildi'}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3 line-clamp-2">
                                  {suggestion.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <span>👤</span>
                                    {suggestion.contact_name || 'Anonim'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>📧</span>
                                    {suggestion.contact_email || 'E-posta yok'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>📅</span>
                                    {new Date(suggestion.created_at).toLocaleDateString('tr-TR')}
                                  </span>
                                  {suggestion.suggested_date && (
                                    <span className="flex items-center gap-1">
                                      <span>🗓️</span>
                                      Tercih: {new Date(suggestion.suggested_date).toLocaleDateString('tr-TR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              {suggestion.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateEventSuggestion.mutate({ id: suggestion.id, status: 'approved' })}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs"
                                  >
                                    ✅ Onayla
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateEventSuggestion.mutate({ id: suggestion.id, status: 'rejected' })}
                                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 px-3 py-1 h-8 text-xs"
                                  >
                                    ❌ Reddet
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Empty State */}
                        {(!eventSuggestions || eventSuggestions?.length === 0) && (
                          <div className="text-center py-12 sm:py-16">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              Henüz öneri bulunmuyor
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                              Kullanıcılar etkinlik önerilerini ana sayfadan gönderebilirler
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            )}

            {/* Magazine Tab */}
            {hasPermission('magazine') && (
              <TabsContent value="magazine" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Dergi Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setMagazineModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Sayı
                  </Button>
                </div>
                
                {/* Dergi İstatistikleri */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam Sayı</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{magazines?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {magazines?.filter(m => m.published).length || 0} yayında
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Bu Ay Okunan</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{magazineStats.thisMonth}</div>
                      <p className="text-xs text-muted-foreground">
                        Bu ay okuma sayısı
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam Okuma</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{magazineStats.total}</div>
                      <p className="text-xs text-muted-foreground">
                        Tüm zamanlar
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ortalama Süre</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{magazineStats.avgDuration}dk</div>
                      <p className="text-xs text-muted-foreground">
                        Okuma süresi
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Dergi Listesi */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {magazines?.map(magazine => (
                        <div key={magazine.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{magazine.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">Sayı {magazine.issue_number}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(magazine.publication_date).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={magazine.published ? "default" : "secondary"}>
                                {magazine.published ? "Yayında" : "Taslak"}
                              </Badge>
                              {/* Gerçek İstatistik Badges */}
                              {(() => {
                                const stats = getMagazineReadStats(magazine.id);
                                return (
                                  <>
                                    <Badge variant="outline" className="text-xs">
                                      👁️ {stats.reads} okuma
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      ⏱️ {stats.avgDuration}dk ortalama
                                    </Badge>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(magazine, 'magazine')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(magazine.id, 'magazine_issues')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!magazines || magazines?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz dergi sayısı bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Dergi Okuma İstatistikleri Detay */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Dergi Okuma İstatistikleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="font-semibold text-blue-800 dark:text-blue-300">📱 Mobil Okuyucular</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{magazineStats.deviceStats.mobile}%</div>
                          <div className="text-blue-600 dark:text-blue-400 text-xs">
                            {Math.round((magazineStats.total * magazineStats.deviceStats.mobile) / 100)} okuma
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="font-semibold text-green-800 dark:text-green-300">🖥️ Masaüstü Okuyucular</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{magazineStats.deviceStats.desktop}%</div>
                          <div className="text-green-600 dark:text-green-400 text-xs">
                            {Math.round((magazineStats.total * magazineStats.deviceStats.desktop) / 100)} okuma
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="font-semibold text-purple-800 dark:text-purple-300">📟 Tablet Okuyucular</div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{magazineStats.deviceStats.tablet}%</div>
                          <div className="text-purple-600 dark:text-purple-400 text-xs">
                            {Math.round((magazineStats.total * magazineStats.deviceStats.tablet) / 100)} okuma
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">En Popüler Dergiler (Bu Ay)</h4>
                        <div className="space-y-2">
                          {magazines?.slice(0, 3)
                            .map(magazine => ({
                              ...magazine,
                              stats: getMagazineReadStats(magazine.id)
                            }))
                            .sort((a, b) => b.stats.reads - a.stats.reads) // En çok okunanlar önce
                            .map((magazine, index) => (
                            <div key={magazine.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-primary text-lg">#{index + 1}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{magazine.title}</span>
                                <Badge variant="outline" className="text-xs">Sayı {magazine.issue_number}</Badge>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                👁️ {magazine.stats.reads} okuma
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* GELİŞMİŞ ANALYTICS - YENİ ÖZELLIK */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">📊 Gelişmiş Okuma Analitiği</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Konum Bazlı İstatistikler */}
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">🌍 En Çok Okuyan Ülkeler</h5>
                            <div className="space-y-1 text-sm">
                              {(() => {
                                const locations = magazineReads
                                  ?.filter(read => read.reader_location)
                                  .reduce((acc, read) => {
                                    const loc = read.reader_location || 'Bilinmiyor';
                                    acc[loc] = (acc[loc] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>) || {};
                                
                                return Object.entries(locations)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 3)
                                  .map(([location, count], index) => (
                                    <div key={location} className="flex justify-between">
                                      <span className="text-blue-700 dark:text-blue-300">#{index + 1} {location}</span>
                                      <span className="font-medium text-blue-800 dark:text-blue-200">{count} okuma</span>
                                    </div>
                                  ));
                              })()}
                              {magazineReads?.filter(read => read.reader_location).length === 0 && (
                                <div className="text-blue-600 dark:text-blue-400 text-xs">Henüz konum verisi yok</div>
                              )}
                            </div>
                          </div>

                          {/* Tarayıcı Dağılımı */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">🌐 Tarayıcı Tercihleri</h5>
                            <div className="space-y-1 text-sm">
                              {(() => {
                                const browsers = magazineReads
                                  ?.filter(read => read.browser_info)
                                  .reduce((acc, read) => {
                                    const browser = read.browser_info?.includes('Chrome') ? 'Chrome' :
                                                   read.browser_info?.includes('Firefox') ? 'Firefox' :
                                                   read.browser_info?.includes('Safari') ? 'Safari' :
                                                   read.browser_info?.includes('Edge') ? 'Edge' : 'Diğer';
                                    acc[browser] = (acc[browser] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>) || {};
                                
                                return Object.entries(browsers)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 3)
                                  .map(([browser, count]) => (
                                    <div key={browser} className="flex justify-between">
                                      <span className="text-green-700 dark:text-green-300">{browser}</span>
                                      <span className="font-medium text-green-800 dark:text-green-200">{count} okuma</span>
                                    </div>
                                  ));
                              })()}
                              {magazineReads?.filter(read => read.browser_info).length === 0 && (
                                <div className="text-green-600 dark:text-green-400 text-xs">Henüz tarayıcı verisi yok</div>
                              )}
                            </div>
                          </div>

                          {/* Trafik Kaynakları */}
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                            <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">🔗 Trafik Kaynakları</h5>
                            <div className="space-y-1 text-sm">
                              {(() => {
                                const referrers = magazineReads
                                  ?.filter(read => read.referrer_url)
                                  .reduce((acc, read) => {
                                    const ref = read.referrer_url?.includes('ibu.edu.tr') ? 'İBU Web Sitesi' :
                                               read.referrer_url?.includes('google') ? 'Google' :
                                               read.referrer_url?.includes('instagram') ? 'Instagram' :
                                               read.referrer_url?.includes('facebook') ? 'Facebook' : 'Diğer';
                                    acc[ref] = (acc[ref] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>) || {};
                                
                                return Object.entries(referrers)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 3)
                                  .map(([referrer, count]) => (
                                    <div key={referrer} className="flex justify-between">
                                      <span className="text-purple-700 dark:text-purple-300">{referrer}</span>
                                      <span className="font-medium text-purple-800 dark:text-purple-200">{count} okuma</span>
                                    </div>
                                  ));
                              })()}
                              {magazineReads?.filter(read => read.referrer_url).length === 0 && (
                                <div className="text-purple-600 dark:text-purple-400 text-xs">Henüz referans verisi yok</div>
                              )}
                            </div>
                          </div>

                          {/* Okuma Kalitesi */}
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                            <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2">📈 Okuma Kalitesi</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-orange-700 dark:text-orange-300">Tamamlama Oranı</span>
                                <span className="font-medium text-orange-800 dark:text-orange-200">
                                  {magazineReads?.length > 0 ? 
                                    Math.round((magazineReads.filter(read => read.completed_reading).length / magazineReads.length) * 100)
                                    : 0}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-orange-700 dark:text-orange-300">Ortalama Sayfa</span>
                                <span className="font-medium text-orange-800 dark:text-orange-200">
                                  {magazineReads?.length > 0 ? 
                                    Math.round(magazineReads.reduce((sum, read) => sum + (read.pages_read || 0), 0) / magazineReads.length)
                                    : 0} sayfa
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-orange-700 dark:text-orange-300">Aktif Session</span>
                                <span className="font-medium text-orange-800 dark:text-orange-200">
                                  {new Set(magazineReads?.map(read => read.session_id).filter(Boolean)).size} benzersiz
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Makale Başvuruları Bölümü - YENİ ÖZELLİK */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📝 Makale Başvuruları</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Başvuru İstatistikleri */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="font-semibold text-blue-800 dark:text-blue-300">📄 Toplam Başvuru</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{articleSubmissions?.length || 0}</div>
                          <div className="text-blue-600 dark:text-blue-400 text-xs">Tüm başvurular</div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="font-semibold text-yellow-800 dark:text-yellow-300">⏳ Bekleyen</div>
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {articleSubmissions?.length || 0}
                          </div>
                          <div className="text-yellow-600 dark:text-yellow-400 text-xs">İnceleme bekliyor</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="font-semibold text-green-800 dark:text-green-300">✅ Kabul Edilen</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            0
                          </div>
                          <div className="text-green-600 dark:text-green-400 text-xs">Yayın için onaylandı</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="font-semibold text-red-800 dark:text-red-300">❌ Reddedilen</div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            0
                          </div>
                          <div className="text-red-600 dark:text-red-400 text-xs">Yayına uygun değil</div>
                        </div>
                      </div>

                      {/* Son Başvurular */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">📄 Son Makale Başvuruları</h3>
                        <div className="space-y-3">
                          {articleSubmissions?.slice(0, 5).map((submission) => (
                            <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {submission.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {submission.author_name} • {submission.category} • Beklemede
                                </div>
                                <div className="text-xs text-gray-400">
                                  {submission.created_at && new Date(submission.created_at).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewArticleDetail(submission)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteArticle(submission)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          {(!articleSubmissions || articleSubmissions.length === 0) && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              📭 Henüz makale başvurusu yok
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Surveys Tab */}
            {hasPermission('surveys') && (
              <TabsContent value="surveys" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Anket Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setSurveyModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Anket
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {surveys?.map(survey => (
                        <div key={survey.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{survey.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date(survey.start_date).toLocaleDateString('tr-TR')} - {new Date(survey.end_date).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={survey.active ? "default" : "secondary"}>
                                {survey.active ? "Aktif" : "Pasif"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(survey, 'survey')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(survey.id, 'surveys')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!surveys || surveys?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz anket bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Sponsors Tab */}
            {hasPermission('sponsors') && (
              <TabsContent value="sponsors" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Sponsor Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setSponsorModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Sponsor
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {sponsors?.map(sponsor => (
                        <div key={sponsor.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{sponsor.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{sponsor.sponsor_type}</Badge>
                              <Badge variant={sponsor.active ? "default" : "secondary"}>
                                {sponsor.active ? "Aktif" : "Pasif"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(sponsor, 'sponsor')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(sponsor.id, 'sponsors')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!sponsors || sponsors?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz sponsor bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Team Tab */}
            {hasPermission('team') && (
              <TabsContent value="team" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Ekip Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setTeamMemberModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Üye
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {teamMembers?.map(member => (
                        <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{member.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{member.team}</Badge>
                              <span className="text-sm text-muted-foreground">{member.role}</span>
                              <Badge variant={member.active ? "default" : "secondary"}>
                                {member.active ? "Aktif" : "Pasif"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(member, 'team')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(member.id, 'team_members')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!teamMembers || teamMembers?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz ekip üyesi bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Documents Tab */}
            {hasPermission('documents') && (
              <TabsContent value="documents" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Akademik Belgeler</h2>
                  <Button onClick={() => toast.info('Belge ekleme modalı henüz hazır değil')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Belge
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {documents?.map(doc => (
                        <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{doc.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{doc.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {doc.downloads} indirme
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
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
                      {(!documents || documents?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz belge bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Internships Tab */}
            {hasPermission('internships') && (
              <TabsContent value="internships" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Staj İlanları</h2>
                  <Button onClick={() => toast.info('Staj ekleme modalı henüz hazır değil')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Staj İlanı
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {internships?.map(internship => (
                        <div key={internship.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{internship.position}</h3>
                            <p className="text-sm text-muted-foreground">{internship.company_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{internship.location}</Badge>
                              <Badge variant={internship.active ? "default" : "secondary"}>
                                {internship.active ? "Aktif" : "Pasif"}
                              </Badge>
                              {internship.application_deadline && (
                                <span className="text-sm text-muted-foreground">
                                  Son Başvuru: {new Date(internship.application_deadline).toLocaleDateString('tr-TR')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!internships || internships?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz staj ilanı bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Products Tab */}
            {hasPermission('products') && (
              <TabsContent value="products" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">🛍️ Ürün Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setProductModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Ürün
                  </Button>
                </div>

                {/* Product Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{products?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {products?.filter(p => p.available).length || 0} satışta
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Kırtasiye</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {products?.filter(p => p.category === 'kirtasiye').length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">ürün</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Giyim</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {products?.filter(p => p.category === 'giyim').length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">ürün</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Aksesuar</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {products?.filter(p => p.category === 'aksesuar').length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">ürün</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Products List */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {products?.map(product => (
                        <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4 hover:shadow-lg transition-shadow">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-4">
                              {/* Product Image */}
                              {product.images && product.images.length > 0 && (
                                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate text-lg">{product.name}</h3>
                                {product.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {product.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant="outline" className="capitalize">
                                    {product.category}
                                  </Badge>
                                  
                                  {product.price && product.price > 0 ? (
                                    <Badge variant="outline" className="text-green-600 border-green-300">
                                      💰 {product.price} {product.currency}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                                      🆓 Ücretsiz
                                    </Badge>
                                  )}
                                  
                                  <Badge variant={product.available ? "default" : "secondary"}>
                                    {product.available ? "Satışta" : "Stokta Yok"}
                                  </Badge>
                                  
                                  {product.features && product.features.length > 0 && (
                                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                                      ✨ {product.features.length} özellik
                                    </Badge>
                                  )}
                                  
                                  {product.images && product.images.length > 1 && (
                                    <Badge variant="outline" className="text-cyan-600 border-cyan-300">
                                      📸 {product.images.length} resim
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="text-xs text-muted-foreground mt-1">
                                  Oluşturulma: {new Date(product.created_at).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditModal(product, 'product')}
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(product.id, 'products')}
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {(!products || products?.length === 0) && (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Henüz ürün bulunmuyor
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            İlk ürününüzü ekleyerek başlayın
                          </p>
                          <Button 
                            onClick={() => { setEditingItem(null); setProductModalOpen(true); }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            İlk Ürünü Ekle
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Design Requests Bölümü */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Özel Tasarım Talepleri
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Kullanıcılardan gelen özel tasarım taleplerini değerlendirin ve onaylayın
                      </p>
                    </div>
                  </div>

                  {/* Design Request Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs sm:text-sm font-medium">📥 Toplam</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {productDesignRequests?.length || 0}
                          </p>
                        </div>
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-xs sm:text-sm font-medium">⏳ Bekleyen</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {productDesignRequests?.filter(r => r.status === 'pending').length || 0}
                          </p>
                        </div>
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-xs sm:text-sm font-medium">✅ Onaylanan</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {productDesignRequests?.filter(r => r.status === 'approved').length || 0}
                          </p>
                        </div>
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-xs sm:text-sm font-medium">❌ Reddedilen</p>
                          <p className="text-lg sm:text-2xl font-bold">
                            {productDesignRequests?.filter(r => r.status === 'rejected').length || 0}
                          </p>
                        </div>
                        <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-200" />
                      </div>
                    </div>
                  </div>

                  {/* Design Requests List */}
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        🎨 Tasarım Talep Listesi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {productDesignRequests?.map(request => (
                          <div key={request.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                                    {request.design_title}
                                  </h5>
                                  <Badge 
                                    className={`${
                                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                      request.status === 'approved' || request.status === 'in_design' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                    }`}
                                  >
                                    {request.status === 'pending' ? '⏳ Beklemede' :
                                     request.status === 'approved' ? '✅ Onaylandı' :
                                     request.status === 'in_design' ? '🎨 Tasarımda' :
                                     request.status === 'completed' ? '🎉 Tamamlandı' :
                                     '❌ Reddedildi'}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {request.product_category}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3 line-clamp-2">
                                  {request.design_description}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <span>👤</span>
                                    {request.contact_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>📧</span>
                                    {request.contact_email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>📅</span>
                                    {new Date(request.created_at).toLocaleDateString('tr-TR')}
                                  </span>
                                  {request.target_price_min && request.target_price_max && (
                                    <span className="flex items-center gap-1">
                                      <span>💰</span>
                                      {request.target_price_min}-{request.target_price_max} TL
                                    </span>
                                  )}
                                  {request.quantity_needed && (
                                    <span className="flex items-center gap-1">
                                      <span>📊</span>
                                      {request.quantity_needed} adet
                                    </span>
                                  )}
                                  {request.deadline_date && (
                                    <span className="flex items-center gap-1">
                                      <span>⏰</span>
                                      Son: {new Date(request.deadline_date).toLocaleDateString('tr-TR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-2">
                                {/* Detay Görme Butonu - Her zaman görünür */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDesignRequestDetail(request)}
                                  className="h-8 text-xs px-3 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                >
                                  👁️ Detay
                                </Button>

                                {/* Status-based Action Buttons */}
                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChangeConfirmation(request.id, 'approved', 'Onaylandı')}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs"
                                    >
                                      ✅ Onayla
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusChangeConfirmation(request.id, 'rejected', 'Reddedildi')}
                                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 px-3 py-1 h-8 text-xs"
                                    >
                                      ❌ Reddet
                                    </Button>
                                  </>
                                )}
                                
                                {request.status === 'approved' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChangeConfirmation(request.id, 'in_design', 'Tasarıma Başlandı')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8 text-xs"
                                    >
                                      🎨 Tasarıma Başla
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusChangeConfirmation(request.id, 'pending', 'Beklemede')}
                                      className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20 px-3 py-1 h-8 text-xs"
                                    >
                                      🔄 Geri Al
                                    </Button>
                                  </>
                                )}
                                
                                {request.status === 'in_design' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChangeConfirmation(request.id, 'completed', 'Tamamlandı')}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-xs"
                                    >
                                      🎉 Tamamlandı
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusChangeConfirmation(request.id, 'approved', 'Onaylandı')}
                                      className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20 px-3 py-1 h-8 text-xs"
                                    >
                                      🔄 Geri Al
                                    </Button>
                                  </>
                                )}
                                
                                {request.status === 'rejected' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChangeConfirmation(request.id, 'pending', 'Beklemede')}
                                    className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20 px-3 py-1 h-8 text-xs"
                                  >
                                    🔄 Yeniden Değerlendir
                                  </Button>
                                )}
                                
                                {request.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChangeConfirmation(request.id, 'in_design', 'Tasarımda')}
                                    className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20 px-3 py-1 h-8 text-xs"
                                  >
                                    🔄 Geri Al
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Empty State */}
                        {(!productDesignRequests || productDesignRequests?.length === 0) && (
                          <div className="text-center py-12 sm:py-16">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              Henüz tasarım talebi bulunmuyor
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                              Kullanıcılar ürünler sayfasından özel tasarım taleplerini gönderebilirler
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* Messages Tab */}
            {hasPermission('messages') && (
              <TabsContent value="messages" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">İletişim Mesajları</h2>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {contactMessages?.map(message => (
                        <div key={message.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{message.subject}</h3>
                            <p className="text-sm text-muted-foreground">{message.name} - {message.email}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {message.message}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant={message.status === 'unread' ? "default" : "secondary"}>
                                {message.status === 'unread' ? "Okunmadı" : "Okundu"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(message.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewMessageDetail(message)}
                              title="Mesajı Detaylı Görüntüle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {message.status === 'unread' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleMarkAsRead(message.id)}
                                title="Okundu Olarak İşaretle"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteMessage(message)}
                              title="Mesajı Sil"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!contactMessages || contactMessages?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz mesaj bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}


          </Tabs>
        </div>

        {/* Modals */}
        <NewsModal
          isOpen={newsModalOpen}
          onClose={() => { setNewsModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveNews}
          initialData={editingItem}
        />
        
        <EventModal
          isOpen={eventModalOpen}
          onClose={() => { setEventModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveEvent}
          initialData={editingItem}
        />
        
        <MagazineModal
          isOpen={magazineModalOpen}
          onClose={() => { setMagazineModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveMagazine}
          initialData={editingItem}
        />

        <SponsorModal
          isOpen={sponsorModalOpen}
          onClose={() => { setSponsorModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveSponsor}
          initialData={editingItem}
        />

        <SurveyModal
          isOpen={surveyModalOpen}
          onClose={() => { setSurveyModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveSurvey}
          initialData={editingItem}
        />

        <TeamMemberModal
          isOpen={teamMemberModalOpen}
          onClose={() => { setTeamMemberModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveTeamMember}
          initialData={editingItem}
        />

        <ProductModal
          isOpen={productModalOpen}
          onClose={() => { setProductModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveProduct}
          product={editingItem}
        />

        {/* Form Responses Modal */}
        {selectedEvent && (
          <FormResponsesModal
            isOpen={responseModalOpen}
            onClose={() => {
              setResponseModalOpen(false);
              setSelectedEvent(null);
            }}
            eventId={selectedEvent.slug || selectedEvent.id}
            eventTitle={selectedEvent.title}
          />
        )}
        
        {/* Article Modals - GELİŞMİŞ DETAY MODAL */}
        <Dialog open={articleDetailModalOpen} onOpenChange={setArticleDetailModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                📄 Makale Detayları - {selectedArticle?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedArticle && (
              <div className="space-y-6 mt-4">
                {/* Temel Bilgiler */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">📝 Temel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Başlık</label>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{selectedArticle.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Kategori</label>
                      <Badge variant="outline" className="text-blue-800 border-blue-300">{selectedArticle.category}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Durum</label>
                      <Badge variant={selectedArticle.status === 'submitted' ? 'default' : 'secondary'}>
                        {selectedArticle.status === 'submitted' ? '⏳ Beklemede' : 
                         selectedArticle.status === 'accepted' ? '✅ Kabul' : 
                         selectedArticle.status === 'rejected' ? '❌ Red' : '📝 İnceleniyor'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Kelime Sayısı</label>
                      <p className="text-lg text-blue-900 dark:text-blue-100">{selectedArticle.word_count || 'Hesaplanmamış'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Gönderim Tarihi</label>
                      <p className="text-lg text-blue-900 dark:text-blue-100">
                        {selectedArticle.submission_date ? new Date(selectedArticle.submission_date).toLocaleDateString('tr-TR') :
                         selectedArticle.created_at ? new Date(selectedArticle.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                      </p>
                    </div>
                    {selectedArticle.target_issue && (
                      <div>
                        <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Hedef Sayı</label>
                        <p className="text-lg text-blue-900 dark:text-blue-100">Sayı {selectedArticle.target_issue}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Yazar Bilgileri */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">👤 Yazar Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-green-600 dark:text-green-400">Yazar Adı</label>
                      <p className="text-lg text-green-900 dark:text-green-100">{selectedArticle.author_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-600 dark:text-green-400">Email</label>
                      <p className="text-lg text-green-900 dark:text-green-100">{selectedArticle.author_email}</p>
                    </div>
                    {selectedArticle.author_affiliation && (
                      <div>
                        <label className="text-sm font-medium text-green-600 dark:text-green-400">Kurum/Üniversite</label>
                        <p className="text-lg text-green-900 dark:text-green-100">{selectedArticle.author_affiliation}</p>
                      </div>
                    )}
                    {selectedArticle.co_authors && selectedArticle.co_authors.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-green-600 dark:text-green-400">Ortak Yazarlar</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedArticle.co_authors.map((author: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-green-800 border-green-300">
                              {author}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Makale İçeriği */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-3">📖 Makale İçeriği</h3>
                  
                  {selectedArticle.abstract && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Özet</label>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border mt-1">
                        <p className="text-sm leading-relaxed">{selectedArticle.abstract}</p>
                      </div>
                    </div>
                  )}

                  {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Anahtar Kelimeler</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedArticle.keywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedArticle.cover_letter && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kapak Mektubu</label>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border mt-1 max-h-32 overflow-y-auto">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedArticle.cover_letter}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* İnceleme Bilgileri */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">🔍 İnceleme Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedArticle.assigned_reviewer && (
                      <div>
                        <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Atanan Hakem</label>
                        <p className="text-lg text-purple-900 dark:text-purple-100">{selectedArticle.assigned_reviewer}</p>
                      </div>
                    )}
                    {selectedArticle.review_deadline && (
                      <div>
                        <label className="text-sm font-medium text-purple-600 dark:text-purple-400">İnceleme Süresi</label>
                        <p className="text-lg text-purple-900 dark:text-purple-100">
                          {new Date(selectedArticle.review_deadline).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                    {selectedArticle.decision_date && (
                      <div>
                        <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Karar Tarihi</label>
                        <p className="text-lg text-purple-900 dark:text-purple-100">
                          {new Date(selectedArticle.decision_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                    {selectedArticle.file_url && (
                      <div>
                        <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Dosya</label>
                        <Button variant="outline" size="sm" className="mt-1" onClick={() => window.open(selectedArticle.file_url, '_blank')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Dosyayı Görüntüle
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedArticle.reviewer_comments && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Hakem Yorumları</label>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border mt-1 max-h-32 overflow-y-auto">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedArticle.reviewer_comments}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setArticleDetailModalOpen(false)}>
                    ❌ Kapat
                  </Button>
                  <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    ✏️ Düzenle
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setArticleDetailModalOpen(false);
                      handleDeleteArticle(selectedArticle);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    🗑️ Sil
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={articleDeleteModalOpen} onOpenChange={setArticleDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                 Makale Sil
              </DialogTitle>
              <DialogDescription>
                Bu işlem geri alınamaz. Makale kalıcı olarak silinecektir.
              </DialogDescription>
            </DialogHeader>
            
            {selectedArticle && (
              <div className="space-y-4 mt-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Silinecek Makale:</h4>
                  <p className="text-sm font-semibold">{selectedArticle.title}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Yazar: {selectedArticle.author_name}</p>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setArticleDeleteModalOpen(false)}
                  >
                    ❌ İptal
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDeleteArticle}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    🗑️ Sil
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Detail Modal - YENİ */}
        <Dialog open={messageDetailModalOpen} onOpenChange={setMessageDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                💬 Mesaj Detayları
              </DialogTitle>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-6 mt-4">
                {/* Mesaj Bilgileri */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">📋 Mesaj Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Gönderen</label>
                      <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">E-posta</label>
                      <p className="text-lg text-blue-900 dark:text-blue-100">
                        {selectedMessage.email ? (
                          <a href={`mailto:${selectedMessage.email}`} className="hover:underline text-blue-600">
                            {selectedMessage.email}
                          </a>
                        ) : (
                          <span className="text-gray-500 italic">E-posta verilmemiş</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Durum</label>
                      <div className="flex gap-2 items-center">
                        <Badge variant={selectedMessage.status === 'unread' ? 'default' : 'secondary'}>
                          {selectedMessage.status === 'unread' ? '📭 Okunmadı' : 
                           selectedMessage.status === 'read' ? '📖 Okundu' : 
                           selectedMessage.status === 'replied' ? '✅ Yanıtlandı' : '📁 Arşivlendi'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Gönderim Tarihi</label>
                      <p className="text-lg text-blue-900 dark:text-blue-100">
                        {new Date(selectedMessage.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Konu */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">📝 Konu</h3>
                  <p className="text-lg text-green-900 dark:text-green-100 font-medium">
                    {selectedMessage.subject}
                  </p>
                </div>

                {/* Mesaj İçeriği */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-3">💬 Mesaj İçeriği</h3>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border min-h-[200px]">
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Hızlı Aksiyonlar */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">⚡ Hızlı Aksiyonlar</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedMessage.email && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const subject = `Re: ${selectedMessage.subject}`;
                          const body = `Merhaba ${selectedMessage.name},\n\n${selectedMessage.subject} konulu mesajınızla ilgili...\n\n---\nOrijinal Mesajınız:\n${selectedMessage.message}`;
                          window.open(`mailto:${selectedMessage.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        📧 E-posta ile Yanıtla
                      </Button>
                    )}
                    
                    {selectedMessage.status === 'unread' && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleMarkAsRead(selectedMessage.id);
                          setSelectedMessage({...selectedMessage, status: 'read'});
                        }}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ✅ Okundu İşaretle
                      </Button>
                    )}
                    
                    {selectedMessage.status !== 'replied' && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleMarkAsReplied(selectedMessage.id);
                          setSelectedMessage({...selectedMessage, status: 'replied'});
                        }}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        📮 Yanıtlandı İşaretle
                      </Button>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setMessageDetailModalOpen(false)}>
                    ❌ Kapat
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setMessageDetailModalOpen(false);
                      handleDeleteMessage(selectedMessage);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    🗑️ Mesajı Sil
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Delete Modal - YENİ */}
        <Dialog open={messageDeleteModalOpen} onOpenChange={setMessageDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                🗑️ Mesajı Sil
              </DialogTitle>
              <DialogDescription>
                Bu işlem geri alınamaz. Mesaj kalıcı olarak silinecektir.
              </DialogDescription>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-4 mt-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Silinecek Mesaj:</h4>
                  <p className="text-sm font-semibold">{selectedMessage.subject}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Gönderen: {selectedMessage.name}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Tarih: {new Date(selectedMessage.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setMessageDeleteModalOpen(false)}
                  >
                    ❌ İptal
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDeleteMessage}
                    disabled={deleteContactMessage.isPending}
                  >
                    {deleteContactMessage.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Siliniyor...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        🗑️ Sil
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Product Design Request Detail Modal */}
        <ProductDesignRequestDetailModal
          isOpen={designRequestDetailModalOpen}
          onClose={() => setDesignRequestDetailModalOpen(false)}
          request={selectedDesignRequest}
        />

        {/* Confirmation Dialog for Status Changes */}
        <Dialog open={confirmationModalOpen} onOpenChange={cancelStatusChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                ⚠️ Durum Değişikliği Onayı
              </DialogTitle>
              <DialogDescription>
                Bu işlemi gerçekleştirmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            
            {pendingStatusChange && (
              <div className="space-y-4 mt-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">💼 Değişiklik Detayları:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Yeni Durum:</strong> {pendingStatusChange.action}</p>
                    <p className="text-yellow-600 dark:text-yellow-400">
                      Bu değişiklik geri alınabilir ancak bildirim e-postası gönderilecektir.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={cancelStatusChange}
                  >
                    ❌ İptal
                  </Button>
                  <Button 
                    onClick={confirmStatusChange}
                    disabled={updateProductDesignRequest.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updateProductDesignRequest.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        ✅ Onayla
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
