import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Edit, Trash2, User, Calendar, Users, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type Team = Database['public']['Tables']['teams']['Row'] & { team_members: TeamMember[] };
type Period = Database['public']['Tables']['periods']['Row'] & { teams: Team[] };

interface TeamManagementSectionProps {
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
}

const TeamManagementSection: React.FC<TeamManagementSectionProps> = ({ onEditMember, onDeleteMember }) => {
  const { data: periods, isLoading, error } = useQuery({
    queryKey: ['all_teams_and_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('periods')
        .select(`
          id,
          name,
          teams (
            id,
            name,
            description,
            is_board,
            sort_order,
            team_members (
              id,
              name,
              role,
              profile_image,
              sort_order
            )
          )
        `)
        .order('name', { ascending: false });

      if (error) throw error;
      return data as Period[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Ekip verileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Hata: {error.message}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mevcut Ekipler ve Üyeler</CardTitle>
        <CardDescription>
          Tüm dönemlerdeki ekipleri ve üyeleri buradan yönetebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {periods?.map(period => (
            <div key={period.id} className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5" />
                {period.name}
              </h3>
              <Accordion type="multiple" className="w-full">
                {period.teams.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map(team => (
                  <AccordionItem key={team.id} value={team.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <span>{team.name}</span>
                        <Badge variant="secondary">{team.team_members.length} üye</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {team.team_members.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Bu ekipte üye bulunmuyor.</p>
                        ) : (
                          team.team_members.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50">
                              <div className="flex items-center gap-3">
                                {member.profile_image ? (
                                  <img src={member.profile_image} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-500" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-sm text-muted-foreground">{member.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => onEditMember(member)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => onDeleteMember(member.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};



export default TeamManagementSection; 