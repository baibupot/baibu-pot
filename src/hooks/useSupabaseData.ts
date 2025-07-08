import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

// Users hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // 🔒 Permission kontrolü - sadece admin kullanıcılar
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Kullanıcının rollerini kontrol et
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_approved', true);

      if (!userRoles || userRoles.length === 0) {
        throw new Error('No permissions');
      }

      // Role permissions'ları kontrol et
      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .in('role', userRoles.map(ur => ur.role));

      const hasUsersPermission = rolePermissions?.some(rp => rp.permission === 'users');
      
      if (!hasUsersPermission) {
        throw new Error('No users permission');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    retry: false,
  });
};

// User roles hooks - Fixed the relationship issue by specifying the column hint
export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      // 🔒 Permission kontrolü - sadece admin kullanıcılar
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Kullanıcının rollerini kontrol et
      const { data: currentUserRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_approved', true);

      if (!currentUserRoles || currentUserRoles.length === 0) {
        throw new Error('No permissions');
      }

      // Role permissions'ları kontrol et
      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .in('role', currentUserRoles.map(ur => ur.role));

      const hasUsersPermission = rolePermissions?.some(rp => rp.permission === 'users');
      
      if (!hasUsersPermission) {
        throw new Error('No users permission');
      }

      // 🎯 TÜM user roles'ları getir (onaylı + onaysız) - Column hint ile
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          users!user_id(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    retry: false,
  });
};

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: Tables['user_roles']['Insert']) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([roleData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['user_roles']['Update']) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
    },
  });
};

// News hooks - Added refetch function
export const useNews = (published = true) => {
  return useQuery({
    queryKey: ['news', published],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (published) {
        query = query.eq('published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 3 * 60 * 1000, // 3 dakika fresh (news orta sıklıkta değişir)
    gcTime: 10 * 60 * 1000, // 10 dakika cache
    refetchOnWindowFocus: false,
  });
};

export const useCreateNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newsData: Tables['news']['Insert']) => {
      const { data, error } = await supabase
        .from('news')
        .insert([newsData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['news']['Update']) => {
      const { data, error } = await supabase
        .from('news')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

// Events hooks
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 dakika fresh tut (events sık değişmez)
    gcTime: 10 * 60 * 1000, // 10 dakika cache'de tut
    refetchOnWindowFocus: false, // Pencere focus'ta refetch etme
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_sponsors (
            sponsor_id,
            sponsors ( id, name, logo, website, sponsor_type )
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['events', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_sponsors (
            sponsor_id,
            sponsors ( id, name, logo, website, sponsor_type )
          )
        `)
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: Tables['events']['Insert']) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['events']['Update']) => {
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Form fields hooks
export const useFormFields = (formId: string, formType: string) => {
  return useQuery({
    queryKey: ['form_fields', formId, formType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .eq('form_type', formType)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFormField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fieldData: Tables['form_fields']['Insert']) => {
      const { data, error } = await supabase
        .from('form_fields')
        .insert([fieldData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['form_fields', variables.form_id, variables.form_type] 
      });
    },
  });
};

export const useUpdateFormField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['form_fields']['Update']) => {
      const { data, error } = await supabase
        .from('form_fields')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['form_fields', data.form_id, data.form_type] 
      });
    },
  });
};

export const useDeleteFormField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, form_id, form_type }: { id: string; form_id: string; form_type: string }) => {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { id, form_id, form_type };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['form_fields', variables.form_id, variables.form_type] 
      });
    },
  });
};

// Form responses hooks
export const useFormResponses = (formId: string, formType: string) => {
  return useQuery({
    queryKey: ['form_responses', formId, formType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .eq('form_type', formType)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFormResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (responseData: Tables['form_responses']['Insert']) => {
      // 🔒 Anonim kullanıcılar için SELECT kaldırıldı - sadece INSERT
      const { error } = await supabase
        .from('form_responses')
        .insert([responseData]);
      if (error) throw error;
      return { success: true }; // Basit success response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['form_responses', variables.form_id, variables.form_type] 
      });
    },
  });
};

export const useDeleteFormResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Form responses cache'ini invalidate et
      queryClient.invalidateQueries({ queryKey: ['form_responses'] });
    },
  });
};

// Magazine hooks
export const useMagazineIssues = (published = true) => {
  return useQuery({
    queryKey: ['magazine_issues', published],
    queryFn: async () => {
      let query = supabase
        .from('magazine_issues')
        .select('*')
        .order('issue_number', { ascending: false });
      
      if (published) {
        query = query.eq('published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 dakika fresh (magazine daha az değişir)
    gcTime: 15 * 60 * 1000, // 15 dakika cache
    refetchOnWindowFocus: false,
  });
};

export const useCreateMagazine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (magazineData: Tables['magazine_issues']['Insert']) => {
      const { data, error } = await supabase
        .from('magazine_issues')
        .insert([magazineData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_issues'] });
    },
  });
};

export const useUpdateMagazine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['magazine_issues']['Update']) => {
      const { data, error } = await supabase
        .from('magazine_issues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_issues'] });
    },
  });
};

export const useDeleteMagazine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('magazine_issues')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_issues'] });
    },
  });
};

// Sponsors hooks
export const useSponsors = (active = true) => {
  return useQuery({
    queryKey: ['sponsors', active],
    queryFn: async () => {
      let query = supabase
        .from('sponsors')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (active) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sponsorData: Tables['sponsors']['Insert']) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert([sponsorData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

export const useUpdateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['sponsors']['Update']) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

export const useDeleteSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

// ====================================================================
// TEAM & PERIODS HOOKS (Yeniden Yapılandırıldı)
// ====================================================================

// Periods hooks
export const usePeriods = () => {
  return useQuery({
    queryKey: ['periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .order('name', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

// Teams hooks
export const useTeams = (periodId?: string) => {
  return useQuery({
    queryKey: ['teams', periodId],
    queryFn: async () => {
      let query = supabase.from('teams').select('*');
      if (periodId) {
        query = query.eq('period_id', periodId);
      }
      const { data, error } = await query.order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!periodId, // Sadece periodId varsa çalıştır
  });
};

// Team Members hooks (Updated)
export const useTeamMembers = (teamId?: string) => {
  return useQuery({
    queryKey: ['team_members', teamId],
    queryFn: async () => {
      let query = supabase.from('team_members').select('*');
      if (teamId) {
        query = query.eq('team_id', teamId);
      }
      const { data, error } = await query.order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (memberData: Tables['team_members']['Insert']) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert([memberData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team_members', data.team_id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] }); // Ekipler sayfasını da yenile
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<TeamMemberInsert>) => {
      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_teams_and_members'] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Önce üyenin team_id'sini alalım ki cache'i doğru yenileyebilelim
      const { data: member } = await supabase.from('team_members').select('team_id').eq('id', id).single();

      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      
      return { team_id: member?.team_id };
    },
    onSuccess: (data) => {
      if (data.team_id) {
        queryClient.invalidateQueries({ queryKey: ['team_members', data.team_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['all_teams_and_members'] });
    },
  });
};

// Academic documents hooks
export const useAcademicDocuments = () => {
  return useQuery({
    queryKey: ['academic_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateAcademicDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentData: Tables['academic_documents']['Insert']) => {
      const { data, error } = await supabase
        .from('academic_documents')
        .insert([documentData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_documents'] });
    },
  });
};

export const useUpdateAcademicDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['academic_documents']['Update']) => {
      const { data, error } = await supabase
        .from('academic_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_documents'] });
    },
  });
};

export const useDeleteAcademicDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academic_documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_documents'] });
    },
  });
};

export const useIncrementDocumentDownloads = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      // Güvenli RPC fonksiyonunu kullan (atomic increment)
      const { data, error } = await supabase.rpc('increment_document_downloads', {
        document_id: documentId
      });
      
      if (error) throw error;
      return data; // Yeni indirme sayısını döndürür
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_documents'] });
    },
  });
};

// Internships hooks (Updated to be more comprehensive)
export const useInternships = (active = true) => {
  return useQuery({
    queryKey: ['internships', active],
    queryFn: async () => {
      let query = supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (active) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (internshipData: Tables<'internships'>['Insert']) => {
      const { data, error } = await supabase.from('internships').insert([internshipData]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useUpdateInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables<'internships'>['Update']) => {
      const { data, error } = await supabase.from('internships').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useDeleteInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('internships').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

// Internship Guides hooks
export const useInternshipGuides = () => {
    return useQuery({
        queryKey: ['internship_guides'],
        queryFn: async () => {
            const { data, error } = await supabase.from('internship_guides').select('*').order('sort_order', { ascending: true });
            if (error) throw error;
            return data;
        },
    });
};

// Internship Experiences hooks
export const useInternshipExperiences = (approvedOnly = false) => {
    return useQuery({
        queryKey: ['internship_experiences', approvedOnly],
        queryFn: async () => {
            let query = supabase.from('internship_experiences').select('*').order('created_at', { ascending: false });
            if(approvedOnly) {
                query = query.eq('is_approved', true);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
};

export const useUpdateInternshipExperience = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updateData }: { id: string } & Tables<'internship_experiences'>['Update']) => {
            const { data, error } = await supabase.from('internship_experiences').update(updateData).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['internship_experiences'] });
        },
    });
};

export const useDeleteInternshipExperience = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('internship_experiences').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['internship_experiences'] });
        },
    });
};

// Academics hooks
export const useAcademics = () => {
    return useQuery({
        queryKey: ['academics'],
        queryFn: async () => {
            const { data, error } = await supabase.from('academics').select('*').order('sort_order', { ascending: true });
            if (error) throw error;
            return data;
        },
    });
};

// Surveys hooks
export const useSurveys = (active?: boolean) => {
  return useQuery({
    queryKey: ['surveys', active],
    queryFn: async () => {
      let query = supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (typeof active === 'boolean') {
        query = query.eq('active', active);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useSurveyBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['surveys', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        // slug'a ait anket bulunamadığında hata fırlatma, null dön
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!slug, // Sadece slug mevcut olduğunda sorguyu çalıştır
  });
};

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (surveyData: Tables['surveys']['Insert']) => {
      const { data, error } = await supabase
        .from('surveys')
        .insert([surveyData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });
};

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['surveys']['Update']) => {
      const { data, error } = await supabase
        .from('surveys')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });
};

// Contact messages hooks
export const useContactMessages = () => {
  return useQuery({
    queryKey: ['contact_messages'],
    queryFn: async () => {
      // 🔒 Permission kontrolü - sadece admin kullanıcılar
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Kullanıcının rollerini kontrol et
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_approved', true);

      if (!userRoles || userRoles.length === 0) {
        throw new Error('No permissions');
      }

      // Role permissions'ları kontrol et
      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .in('role', userRoles.map(ur => ur.role));

      const hasMessagesPermission = rolePermissions?.some(rp => rp.permission === 'messages');
      
      if (!hasMessagesPermission) {
        throw new Error('No messages permission');
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    retry: false, // Permission hatası durumunda tekrar deneme
  });
};

export const useCreateContactMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: Tables['contact_messages']['Insert']) => {
      // 🔒 Anonim kullanıcılar için SELECT kaldırıldı - sadece INSERT
      const { error } = await supabase
        .from('contact_messages')
        .insert([message]);
      if (error) throw error;
      return { success: true }; // Basit success response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_messages'] });
    },
  });
};

export const useUpdateContactMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['contact_messages']['Update']) => {
      const { data, error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_messages'] });
    },
  });
};

export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_messages'] });
    },
  });
};

// Comments hooks
export const useComments = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comment: Tables['comments']['Insert']) => {
      const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.entity_type, variables.entity_id] 
      });
    },
  });
};

// Products hooks
export const useProducts = (available = true) => {
  return useQuery({
    queryKey: ['products', available],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (available) {
        query = query.eq('available', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Tables['products']['Insert']) => {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['products']['Update']) => {
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Magazine analytics hooks - GERÇEk İSTATİSTİKLER
export const useMagazineAnalytics = () => {
  return useQuery({
    queryKey: ['magazine_analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magazine_reads')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });
};

export const useMagazineReadsByIssue = (magazineId?: string) => {
  return useQuery({
    queryKey: ['magazine_reads', magazineId],
    queryFn: async () => {
      let query = supabase
        .from('magazine_reads')
        .select('*');
      
      if (magazineId) {
        query = query.eq('magazine_issue_id', magazineId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Dergi katkıda bulunanları
export const useMagazineContributors = (magazineId?: string) => {
  return useQuery({
    queryKey: ['magazine_contributors', magazineId],
    queryFn: async () => {
      let query = supabase
        .from('magazine_contributors')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (magazineId) {
        query = query.eq('magazine_issue_id', magazineId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Dergi okuma istatistiği kaydetme
export const useCreateMagazineRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (readData: Tables['magazine_reads']['Insert']) => {
      const { data, error } = await supabase
        .from('magazine_reads')
        .insert([readData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_analytics'] });
      queryClient.invalidateQueries({ queryKey: ['magazine_reads'] });
    },
  });
};

// Article Submissions hook - YENİ ÖZELLİK
export const useArticleSubmissions = () => {
  return useQuery({
    queryKey: ['article_submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

// Event Sponsors hooks - YENİ ÖZELLİK
export const useEventSponsors = (eventId?: string) => {
  return useQuery({
    queryKey: ['event_sponsors', eventId],
    queryFn: async () => {
      let query = supabase
        .from('event_sponsors')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateEventSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sponsorData: Tables['event_sponsors']['Insert']) => {
      const { data, error } = await supabase
        .from('event_sponsors')
        .insert([sponsorData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event_sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['event_sponsors', variables.event_id] });
    },
  });
};

export const useUpdateEventSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['event_sponsors']['Update']) => {
      const { data, error } = await supabase
        .from('event_sponsors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_sponsors'] });
    },
  });
};

export const useDeleteEventSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('event_sponsors')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_sponsors'] });
    },
  });
};

// Event suggestions hooks (ADMIN ONLY - requires authentication)
export const useEventSuggestions = () => {
  return useQuery({
    queryKey: ['event_suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    // Güvenlik: Sadece giriş yapmış kullanıcılar için çalışır
    enabled: true, // RLS politikası zaten kontrol ediyor
  });
};

export const useCreateEventSuggestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (suggestionData: Tables['event_suggestions']['Insert']) => {
      const { data, error } = await supabase
        .from('event_suggestions')
        .insert([suggestionData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_suggestions'] });
    },
  });
};

export const useUpdateEventSuggestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['event_suggestions']['Update']) => {
      const { data, error } = await supabase
        .from('event_suggestions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_suggestions'] });
    },
  });
};

export const useDeleteEventSuggestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('event_suggestions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_suggestions'] });
    },
  });
};

// Product Design Requests hooks (admin + public)
export const useProductDesignRequests = () => {
  return useQuery({
    queryKey: ['product_design_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_design_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    // Güvenlik: Sadece giriş yapmış kullanıcılar için çalışır
    enabled: true, // RLS politikası zaten kontrol ediyor
  });
};

export const useCreateProductDesignRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestData: Tables['product_design_requests']['Insert']) => {
      // 🔒 Anonim kullanıcılar için SELECT kaldırıldı - sadece INSERT
      const { error } = await supabase
        .from('product_design_requests')
        .insert([requestData]);
      if (error) throw error;
      return { success: true }; // Basit success response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_design_requests'] });
    },
  });
};

export const useUpdateProductDesignRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['product_design_requests']['Update']) => {
      // 👤 Admin editing yaparken reviewer_id'yi otomatik set et
      const { data: { user } } = await supabase.auth.getUser();
      
      const finalUpdateData = {
        ...updateData,
        // Eğer admin tarafından güncelleme yapılıyorsa reviewer_id set et
        ...(user && (updateData.priority_level || updateData.estimated_cost || updateData.estimated_time_days || updateData.reviewer_notes) && {
          reviewer_id: user.id
        })
      };

      const { data, error } = await supabase
        .from('product_design_requests')
        .update(finalUpdateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_design_requests'] });
    },
  });
};

export const useDeleteProductDesignRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // 🔍 Önce request'i al (GitHub cleanup için inspiration images lazım)
      const { data: request, error: fetchError } = await supabase
        .from('product_design_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // 🗑️ GitHub'dan inspiration images'ları sil
      if (request?.inspiration_images && request.inspiration_images.length > 0) {
        try {
          const { getGitHubStorageConfig } = await import('@/integrations/github/config');
          const { deleteDesignRequestFilesFromGitHub } = await import('@/utils/githubStorageHelper');
          
          const githubConfig = getGitHubStorageConfig();
          if (githubConfig) {
            await deleteDesignRequestFilesFromGitHub(
              githubConfig,
              request.id,
              request.design_title || 'deleted-request',
              request.inspiration_images
            );
          }
        } catch (githubError) {
          console.warn('GitHub cleanup failed:', githubError);
          // GitHub cleanup başarısız olsa da database'den silmeye devam et
        }
      }
      
      // 🗑️ Database'den sil
      const { error } = await supabase
        .from('product_design_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      return { deletedId: id, cleanedUpFiles: request?.inspiration_images || [] };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['product_design_requests'] });
      
      // Success message ile file cleanup bilgisi
      if (result.cleanedUpFiles.length > 0) {
        console.log(`✅ Design request deleted with ${result.cleanedUpFiles.length} GitHub files cleaned up`);
      }
    },
  });
};

// Aktivite logları hooks
export const useActivityLogs = (limit = 50) => {
  return useQuery({
    queryKey: ['activity_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateActivityLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logData: {
      user_id?: string;
      user_name: string;
      user_role?: string;
      action_type: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'approve' | 'reject' | 'login' | 'logout';
      entity_type: 'news' | 'events' | 'magazine' | 'sponsors' | 'users' | 'team' | 'documents' | 'internships' | 'surveys' | 'products' | 'messages' | 'comments';
      entity_id?: string;
      entity_title?: string;
      description?: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([{
          ...logData,
          ip_address: '127.0.0.1', // Gerçek IP için client-side'dan alınabilir
          user_agent: navigator.userAgent
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });
};

export const useActivityLogsByEntity = (entityType: string, entityId?: string) => {
  return useQuery({
    queryKey: ['activity_logs', entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false });
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!entityType,
  });
};
