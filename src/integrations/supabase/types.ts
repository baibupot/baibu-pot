export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_documents: {
        Row: {
          author: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          downloads: number | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          upload_date: string | null
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downloads?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downloads?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      article_submissions: {
        Row: {
          abstract: string
          assigned_reviewer: string | null
          author_affiliation: string | null
          author_email: string
          author_name: string
          category: string
          co_authors: string[] | null
          cover_letter: string | null
          created_at: string | null
          decision_date: string | null
          file_url: string | null
          id: string
          keywords: string[] | null
          review_deadline: string | null
          reviewer_comments: string | null
          status: string | null
          submission_date: string | null
          target_issue: number | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          abstract: string
          assigned_reviewer?: string | null
          author_affiliation?: string | null
          author_email: string
          author_name: string
          category: string
          co_authors?: string[] | null
          cover_letter?: string | null
          created_at?: string | null
          decision_date?: string | null
          file_url?: string | null
          id?: string
          keywords?: string[] | null
          review_deadline?: string | null
          reviewer_comments?: string | null
          status?: string | null
          submission_date?: string | null
          target_issue?: number | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          abstract?: string
          assigned_reviewer?: string | null
          author_affiliation?: string | null
          author_email?: string
          author_name?: string
          category?: string
          co_authors?: string[] | null
          cover_letter?: string | null
          created_at?: string | null
          decision_date?: string | null
          file_url?: string | null
          id?: string
          keywords?: string[] | null
          review_deadline?: string | null
          reviewer_comments?: string | null
          status?: string | null
          submission_date?: string | null
          target_issue?: number | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "article_submissions_assigned_reviewer_fkey"
            columns: ["assigned_reviewer"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          approved: boolean | null
          author_email: string | null
          author_name: string
          content: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string
          name: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          user_name: string
          user_role: string | null
          action_type: string
          entity_type: string
          entity_id: string | null
          entity_title: string | null
          description: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_name: string
          user_role?: string | null
          action_type: string
          entity_type: string
          entity_id?: string | null
          entity_title?: string | null
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          user_name?: string
          user_role?: string | null
          action_type?: string
          entity_type?: string
          entity_id?: string | null
          entity_title?: string | null
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      event_sponsors: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          sort_order: number | null
          sponsor_logo: string | null
          sponsor_name: string
          sponsor_type: string
          sponsor_website: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          sort_order?: number | null
          sponsor_logo?: string | null
          sponsor_name: string
          sponsor_type?: string
          sponsor_website?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          sort_order?: number | null
          sponsor_logo?: string | null
          sponsor_name?: string
          sponsor_type?: string
          sponsor_website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_suggestions: {
        Row: {
          additional_notes: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          description: string
          estimated_budget: number | null
          estimated_participants: number | null
          event_type: string
          id: string
          priority_level: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string
          suggested_date: string | null
          suggested_location: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          description: string
          estimated_budget?: number | null
          estimated_participants?: number | null
          event_type?: string
          id?: string
          priority_level?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          suggested_date?: string | null
          suggested_location?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string
          estimated_budget?: number | null
          estimated_participants?: number | null
          event_type?: string
          id?: string
          priority_level?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          suggested_date?: string | null
          suggested_location?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_suggestions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string
          end_date: string | null
          event_date: string
          event_type: string
          featured_image: string | null
          gallery_images: string[] | null
          has_custom_form: boolean | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          max_participants: number | null
          price: number | null
          registration_enabled: boolean | null
          registration_closed_reason: string | null
          registration_link: string | null
          registration_required: boolean | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description: string
          end_date?: string | null
          event_date: string
          event_type?: string
          featured_image?: string | null
          gallery_images?: string[] | null
          has_custom_form?: boolean | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_participants?: number | null
          price?: number | null
          registration_enabled?: boolean | null
          registration_closed_reason?: string | null
          registration_link?: string | null
          registration_required?: boolean | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string
          end_date?: string | null
          event_date?: string
          event_type?: string
          featured_image?: string | null
          gallery_images?: string[] | null
          has_custom_form?: boolean | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_participants?: number | null
          price?: number | null
          registration_enabled?: boolean | null
          registration_closed_reason?: string | null
          registration_link?: string | null
          registration_required?: boolean | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string | null
          field_label: string
          field_name: string
          field_type: string
          form_id: string
          form_type: string
          id: string
          options: string[] | null
          required: boolean | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          field_label: string
          field_name: string
          field_type: string
          form_id: string
          form_type: string
          id?: string
          options?: string[] | null
          required?: boolean | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          field_label?: string
          field_name?: string
          field_type?: string
          form_id?: string
          form_type?: string
          id?: string
          options?: string[] | null
          required?: boolean | null
          sort_order?: number | null
        }
        Relationships: []
      }
      form_responses: {
        Row: {
          form_id: string
          form_type: string
          id: string
          response_data: Json
          submitted_at: string | null
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          form_id: string
          form_type: string
          id?: string
          response_data: Json
          submitted_at?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          form_id?: string
          form_type?: string
          id?: string
          response_data?: Json
          submitted_at?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      internships: {
        Row: {
          active: boolean | null
          application_deadline: string | null
          application_link: string | null
          company_name: string
          contact_info: string | null
          created_at: string | null
          created_by: string | null
          description: string
          duration_months: number | null
          id: string
          internship_type: string | null
          location: string
          position: string
          requirements: string | null
          salary_info: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          application_deadline?: string | null
          application_link?: string | null
          company_name: string
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          duration_months?: number | null
          id?: string
          internship_type?: string | null
          location: string
          position: string
          requirements?: string | null
          salary_info?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          application_deadline?: string | null
          application_link?: string | null
          company_name?: string
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          duration_months?: number | null
          id?: string
          internship_type?: string | null
          location?: string
          position?: string
          requirements?: string | null
          salary_info?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      academics: {
        Row: {
          id: string
          name: string
          title: string | null
          email: string | null
          profile_image: string | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          email?: string | null
          profile_image?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string | null
          email?: string | null
          profile_image?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      internship_guides: {
        Row: {
          id: string
          title: string
          content: string | null
          youtube_video_url: string | null
          document_links: Json | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          youtube_video_url?: string | null
          document_links?: Json | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          youtube_video_url?: string | null
          document_links?: Json | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      internship_experiences: {
        Row: {
          id: string
          student_name: string
          internship_place: string
          internship_year: number | null
          experience_text: string
          is_approved: boolean
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_name: string
          internship_place: string
          internship_year?: number | null
          experience_text: string
          is_approved?: boolean
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_name?: string
          internship_place?: string
          internship_year?: number | null
          experience_text?: string
          is_approved?: boolean
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_experiences_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      magazine_contributors: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          magazine_issue_id: string | null
          name: string
          profile_image: string | null
          role: string
          social_links: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          magazine_issue_id?: string | null
          name: string
          profile_image?: string | null
          role: string
          social_links?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          magazine_issue_id?: string | null
          name?: string
          profile_image?: string | null
          role?: string
          social_links?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magazine_contributors_magazine_issue_id_fkey"
            columns: ["magazine_issue_id"]
            isOneToOne: false
            referencedRelation: "magazine_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      magazine_issues: {
        Row: {
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          issue_number: number
          pdf_file: string | null
          publication_date: string
          published: boolean | null
          slug: string
          theme: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          issue_number: number
          pdf_file?: string | null
          publication_date: string
          published?: boolean | null
          slug: string
          theme?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          issue_number?: number
          pdf_file?: string | null
          publication_date?: string
          published?: boolean | null
          slug?: string
          theme?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magazine_issues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      magazine_page_reads: {
        Row: {
          created_at: string | null
          id: string
          magazine_issue_id: string | null
          magazine_read_id: string | null
          page_number: number
          scroll_percentage: number | null
          time_spent: number | null
          zoom_level: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          magazine_issue_id?: string | null
          magazine_read_id?: string | null
          page_number: number
          scroll_percentage?: number | null
          time_spent?: number | null
          zoom_level?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          magazine_issue_id?: string | null
          magazine_read_id?: string | null
          page_number?: number
          scroll_percentage?: number | null
          time_spent?: number | null
          zoom_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "magazine_page_reads_magazine_issue_id_fkey"
            columns: ["magazine_issue_id"]
            isOneToOne: false
            referencedRelation: "magazine_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "magazine_page_reads_magazine_read_id_fkey"
            columns: ["magazine_read_id"]
            isOneToOne: false
            referencedRelation: "magazine_reads"
            referencedColumns: ["id"]
          },
        ]
      }
      magazine_reads: {
        Row: {
          browser_info: string | null
          completed_reading: boolean | null
          created_at: string | null
          device_type: string | null
          id: string
          magazine_issue_id: string | null
          pages_read: number | null
          reader_ip: string | null
          reader_location: string | null
          reading_duration: number | null
          referrer_url: string | null
          session_id: string | null
        }
        Insert: {
          browser_info?: string | null
          completed_reading?: boolean | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          magazine_issue_id?: string | null
          pages_read?: number | null
          reader_ip?: string | null
          reader_location?: string | null
          reading_duration?: number | null
          referrer_url?: string | null
          session_id?: string | null
        }
        Update: {
          browser_info?: string | null
          completed_reading?: boolean | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          magazine_issue_id?: string | null
          pages_read?: number | null
          reader_ip?: string | null
          reader_location?: string | null
          reading_duration?: number | null
          referrer_url?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magazine_reads_magazine_issue_id_fkey"
            columns: ["magazine_issue_id"]
            isOneToOne: false
            referencedRelation: "magazine_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      magazine_sponsors: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          magazine_issue_id: string | null
          sort_order: number | null
          sponsor_name: string
          sponsorship_type: string
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          magazine_issue_id?: string | null
          sort_order?: number | null
          sponsor_name: string
          sponsorship_type?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          magazine_issue_id?: string | null
          sort_order?: number | null
          sponsor_name?: string
          sponsorship_type?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magazine_sponsors_magazine_issue_id_fkey"
            columns: ["magazine_issue_id"]
            isOneToOne: false
            referencedRelation: "magazine_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available: boolean | null
          category: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          name: string
          price: number | null
          sort_order: number | null
          stock_status: string | null
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          name: string
          price?: number | null
          sort_order?: number | null
          stock_status?: string | null
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          name?: string
          price?: number | null
          sort_order?: number | null
          stock_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_design_requests: {
        Row: {
          additional_notes: string | null
          color_preferences: string[] | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contact_student_number: string | null
          created_at: string | null
          currency: string | null
          deadline_date: string | null
          design_description: string
          design_files: string[] | null
          design_preferences: string | null
          design_title: string
          estimated_cost: number | null
          estimated_time_days: number | null
          final_product_images: string[] | null
          id: string
          inspiration_images: string[] | null
          priority_level: string | null
          product_category: string
          prototype_images: string[] | null
          quantity_needed: number | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          size_preferences: string[] | null
          special_requirements: string | null
          status: string
          target_price_max: number | null
          target_price_min: number | null
          updated_at: string | null
          usage_purpose: string | null
        }
        Insert: {
          additional_notes?: string | null
          color_preferences?: string[] | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contact_student_number?: string | null
          created_at?: string | null
          currency?: string | null
          deadline_date?: string | null
          design_description: string
          design_files?: string[] | null
          design_preferences?: string | null
          design_title: string
          estimated_cost?: number | null
          estimated_time_days?: number | null
          final_product_images?: string[] | null
          id?: string
          inspiration_images?: string[] | null
          priority_level?: string | null
          product_category: string
          prototype_images?: string[] | null
          quantity_needed?: number | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          size_preferences?: string[] | null
          special_requirements?: string | null
          status?: string
          target_price_max?: number | null
          target_price_min?: number | null
          updated_at?: string | null
          usage_purpose?: string | null
        }
        Update: {
          additional_notes?: string | null
          color_preferences?: string[] | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contact_student_number?: string | null
          created_at?: string | null
          currency?: string | null
          deadline_date?: string | null
          design_description?: string
          design_files?: string[] | null
          design_preferences?: string | null
          design_title?: string
          estimated_cost?: number | null
          estimated_time_days?: number | null
          final_product_images?: string[] | null
          id?: string
          inspiration_images?: string[] | null
          priority_level?: string | null
          product_category?: string
          prototype_images?: string[] | null
          quantity_needed?: number | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          size_preferences?: string[] | null
          special_requirements?: string | null
          status?: string
          target_price_max?: number | null
          target_price_min?: number | null
          updated_at?: string | null
          usage_purpose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_design_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          granted_by: string | null
          id: string
          permission: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          logo: string | null
          name: string
          sort_order: number | null
          sponsor_type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name: string
          sort_order?: number | null
          sponsor_type?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name?: string
          sort_order?: number | null
          sponsor_type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      surveys: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          has_custom_form: boolean | null
          id: string
          slug: string | null // Eklendi
          start_date: string
          survey_link: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          has_custom_form?: boolean | null
          id?: string
          slug?: string | null // Eklendi
          start_date: string
          survey_link?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          has_custom_form?: boolean | null
          id?: string
          slug?: string | null // Eklendi
          start_date?: string
          survey_link?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          active: boolean | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          linkedin_url: string | null
          name: string
          profile_image: string | null
          role: string
          sort_order: number | null
          team: string
          updated_at: string | null
          year: number
        }
        Insert: {
          active?: boolean | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          profile_image?: string | null
          role: string
          sort_order?: number | null
          team: string
          updated_at?: string | null
          year?: number
        }
        Update: {
          active?: boolean | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          profile_image?: string | null
          role?: string
          sort_order?: number | null
          team?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      debug_user_auth: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_user_id: string
          current_user_email: string
          has_roles: boolean
          user_roles: string[]
        }[]
      }
      increment_document_downloads: {
        Args: {
          document_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const