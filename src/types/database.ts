
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          excerpt: string | null
          content: string
          category: string
          featured_image: string | null
          slug: string
          published: boolean
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          excerpt?: string | null
          content: string
          category: string
          featured_image?: string | null
          slug: string
          published?: boolean
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string | null
          content?: string
          category?: string
          featured_image?: string | null
          slug?: string
          published?: boolean
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          event_date: string
          end_date: string | null
          location: string | null
          event_type: string
          max_participants: number | null
          registration_required: boolean
          registration_link: string | null
          featured_image: string | null
          gallery_images: string[] | null
          status: string
          slug: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_date: string
          end_date?: string | null
          location?: string | null
          event_type: string
          max_participants?: number | null
          registration_required?: boolean
          registration_link?: string | null
          featured_image?: string | null
          gallery_images?: string[] | null
          status?: string
          slug: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_date?: string
          end_date?: string | null
          location?: string | null
          event_type?: string
          max_participants?: number | null
          registration_required?: boolean
          registration_link?: string | null
          featured_image?: string | null
          gallery_images?: string[] | null
          status?: string
          slug?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      magazine_issues: {
        Row: {
          id: string
          issue_number: number
          title: string
          theme: string | null
          description: string | null
          cover_image: string | null
          pdf_file: string | null
          publication_date: string
          slug: string
          published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_number: number
          title: string
          theme?: string | null
          description?: string | null
          cover_image?: string | null
          pdf_file?: string | null
          publication_date: string
          slug: string
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_number?: number
          title?: string
          theme?: string | null
          description?: string | null
          cover_image?: string | null
          pdf_file?: string | null
          publication_date?: string
          slug?: string
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sponsors: {
        Row: {
          id: string
          name: string
          logo: string | null
          website: string | null
          description: string | null
          sponsor_type: string
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo?: string | null
          website?: string | null
          description?: string | null
          sponsor_type: string
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo?: string | null
          website?: string | null
          description?: string | null
          sponsor_type?: string
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          team: string
          bio: string | null
          profile_image: string | null
          linkedin_url: string | null
          email: string | null
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          team: string
          bio?: string | null
          profile_image?: string | null
          linkedin_url?: string | null
          email?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          team?: string
          bio?: string | null
          profile_image?: string | null
          linkedin_url?: string | null
          email?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      academic_documents: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          file_url: string
          file_type: string
          tags: string[] | null
          author: string | null
          upload_date: string
          downloads: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          file_url: string
          file_type: string
          tags?: string[] | null
          author?: string | null
          upload_date?: string
          downloads?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          file_url?: string
          file_type?: string
          tags?: string[] | null
          author?: string | null
          upload_date?: string
          downloads?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      internships: {
        Row: {
          id: string
          company_name: string
          position: string
          location: string
          description: string
          requirements: string | null
          application_deadline: string | null
          contact_info: string | null
          application_link: string | null
          internship_type: string | null
          active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          position: string
          location: string
          description: string
          requirements?: string | null
          application_deadline?: string | null
          contact_info?: string | null
          application_link?: string | null
          internship_type?: string | null
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          position?: string
          location?: string
          description?: string
          requirements?: string | null
          application_deadline?: string | null
          contact_info?: string | null
          application_link?: string | null
          internship_type?: string | null
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      surveys: {
        Row: {
          id: string
          title: string
          description: string | null
          survey_link: string
          start_date: string
          end_date: string
          active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          survey_link: string
          start_date: string
          end_date: string
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          survey_link?: string
          start_date?: string
          end_date?: string
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string | null
          subject: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          subject: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          subject?: string
          message?: string
          status?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          author_name: string
          author_email: string | null
          entity_type: string
          entity_id: string
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          author_name: string
          author_email?: string | null
          entity_type: string
          entity_id: string
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_name?: string
          author_email?: string | null
          entity_type?: string
          entity_id?: string
          approved?: boolean
          created_at?: string
        }
      }
    }
  }
}
