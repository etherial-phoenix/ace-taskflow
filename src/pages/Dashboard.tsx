import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut, FolderKanban, CheckSquare, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { ProjectDialog } from "@/components/ProjectDialog";
import { TaskDialog } from "@/components/TaskDialog";
import { ProjectCard } from "@/components/ProjectCard";
import { TaskList } from "@/components/TaskList";
import { TeamDialog } from "@/components/TeamDialog";
import { TeamCard } from "@/components/TeamCard";
import { TeamMembersDialog } from "@/components/TeamMembersDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  full_name: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: string | null;
  projects: { name: string; color: string } | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string; role: string } | null>(null);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    await fetchProfile(session.user.id);
    await fetchProjects();
    await fetchTasks();
    await fetchTeams();
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading projects");
    } else {
      setProjects(data || []);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        projects (name, color)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading tasks");
    } else {
      setTasks(data || []);
    }
  };

  const fetchTeams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: teamsData } = await supabase
      .from("team_members")
      .select("team_id, role, teams(id, name, description)")
      .eq("user_id", user.id);

    const teamsWithCounts = await Promise.all(
      (teamsData || []).map(async (teamMember: any) => {
        const { count } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamMember.team_id);

        return {
          id: teamMember.teams.id,
          name: teamMember.teams.name,
          description: teamMember.teams.description,
          memberCount: count || 0,
          role: teamMember.role,
        };
      })
    );

    setTeams(teamsWithCounts);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-warm" />
              <span className="text-xl font-display font-bold">FlowPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || "User"}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active workspaces
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks finished
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Collaboration spaces
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Projects</h2>
              <Button onClick={() => setProjectDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={fetchProjects}
                />
              ))}
              {projects.length === 0 && (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Button onClick={() => setProjectDialogOpen(true)} variant="outline">
                    Create your first project
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Recent Tasks</h2>
              <Button onClick={() => setTaskDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
            <TaskList tasks={tasks} onUpdate={fetchTasks} />
          </TabsContent>

          <TabsContent value="teams">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Teams</h2>
              <Button onClick={() => setTeamDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  {...team}
                  onDelete={fetchTeams}
                  onManage={() => {
                    setSelectedTeam({ id: team.id, name: team.name, role: team.role });
                    setTeamMembersOpen(true);
                  }}
                />
              ))}
            </div>
            {teams.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <p className="text-muted-foreground mb-4">No teams yet</p>
                <Button onClick={() => setTeamDialogOpen(true)} variant="outline">
                  Create your first team
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSuccess={fetchProjects}
      />
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSuccess={fetchTasks}
        projects={projects}
      />
      <TeamDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        onSuccess={fetchTeams}
      />
      {selectedTeam && (
        <TeamMembersDialog
          open={teamMembersOpen}
          onOpenChange={setTeamMembersOpen}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          userRole={selectedTeam.role}
        />
      )}
    </div>
  );
};

export default Dashboard;