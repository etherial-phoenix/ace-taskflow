-- Create enum for team member roles
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member');

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Add team_id to projects table
ALTER TABLE public.projects ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid AND user_id = user_uuid
  )
$$;

-- Create function to check team role
CREATE OR REPLACE FUNCTION public.has_team_role(team_uuid UUID, user_uuid UUID, required_role team_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_uuid 
    AND user_id = user_uuid
    AND (
      role = required_role 
      OR (required_role = 'member' AND role IN ('admin', 'owner'))
      OR (required_role = 'admin' AND role = 'owner')
    )
  )
$$;

-- RLS policies for teams
CREATE POLICY "Users can view teams they are members of"
  ON public.teams FOR SELECT
  USING (public.is_team_member(id, auth.uid()));

CREATE POLICY "Team owners can update their teams"
  ON public.teams FOR UPDATE
  USING (public.has_team_role(id, auth.uid(), 'admin'));

CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams"
  ON public.teams FOR DELETE
  USING (owner_id = auth.uid());

-- RLS policies for team_members
CREATE POLICY "Users can view team members of their teams"
  ON public.team_members FOR SELECT
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "Team admins can add members"
  ON public.team_members FOR INSERT
  WITH CHECK (public.has_team_role(team_id, auth.uid(), 'admin'));

CREATE POLICY "Team admins can update member roles"
  ON public.team_members FOR UPDATE
  USING (public.has_team_role(team_id, auth.uid(), 'admin'));

CREATE POLICY "Team admins can remove members"
  ON public.team_members FOR DELETE
  USING (public.has_team_role(team_id, auth.uid(), 'admin'));

-- Update projects RLS to include team access
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own or team projects"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid()))
  );

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own or team projects"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (team_id IS NOT NULL AND public.has_team_role(team_id, auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own or team projects"
  ON public.projects FOR DELETE
  USING (
    auth.uid() = user_id 
    OR (team_id IS NOT NULL AND public.has_team_role(team_id, auth.uid(), 'admin'))
  );

-- Update tasks RLS to include team access
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own or team tasks"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (
      project_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND team_id IS NOT NULL 
        AND public.is_team_member(team_id, auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own or team tasks"
  ON public.tasks FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (
      project_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND team_id IS NOT NULL 
        AND public.is_team_member(team_id, auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own or team tasks"
  ON public.tasks FOR DELETE
  USING (
    auth.uid() = user_id 
    OR (
      project_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND team_id IS NOT NULL 
        AND public.has_team_role(team_id, auth.uid(), 'admin')
      )
    )
  );

-- Trigger for teams updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-add team creator as owner
CREATE OR REPLACE FUNCTION public.add_team_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_team_owner();