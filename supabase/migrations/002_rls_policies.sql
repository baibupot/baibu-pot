
-- RLS Policies for BAİBÜ PÖT website

-- Users table policies
CREATE POLICY "Users can view approved users" ON public.users
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator')
            AND is_approved = true
        )
    );

-- News table policies
CREATE POLICY "Anyone can view published news" ON public.news
    FOR SELECT USING (published = true);

CREATE POLICY "Authorized users can manage news" ON public.news
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Events table policies
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Authorized users can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'etkinlik_koordinator', 'etkinlik_ekip')
            AND is_approved = true
        )
    );

-- Magazine issues table policies
CREATE POLICY "Anyone can view published magazine issues" ON public.magazine_issues
    FOR SELECT USING (published = true);

CREATE POLICY "Authorized users can manage magazine" ON public.magazine_issues
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'dergi_koordinator', 'dergi_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Sponsors table policies
CREATE POLICY "Anyone can view active sponsors" ON public.sponsors
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage sponsors" ON public.sponsors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'etkinlik_koordinator', 'etkinlik_ekip', 'dergi_koordinator', 'dergi_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Team members table policies
CREATE POLICY "Anyone can view active team members" ON public.team_members
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator')
            AND is_approved = true
        )
    );

-- Academic documents table policies
CREATE POLICY "Anyone can view academic documents" ON public.academic_documents
    FOR SELECT USING (true);

CREATE POLICY "Authorized users can manage academic documents" ON public.academic_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Internships table policies
CREATE POLICY "Anyone can view active internships" ON public.internships
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage internships" ON public.internships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Surveys table policies
CREATE POLICY "Anyone can view active surveys" ON public.surveys
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage surveys" ON public.surveys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Contact messages table policies
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authorized users can view contact messages" ON public.contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'iletisim_koordinator')
            AND is_approved = true
        )
    );

CREATE POLICY "Authorized users can update contact messages" ON public.contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'iletisim_koordinator')
            AND is_approved = true
        )
    );

-- Comments table policies
CREATE POLICY "Anyone can view approved comments" ON public.comments
    FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authorized users can manage comments" ON public.comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'iletisim_koordinator')
            AND is_approved = true
        )
    );
