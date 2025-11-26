import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    status: string;
  };
  onUpdate: () => void;
}

export const ProjectCard = ({ project, onUpdate }: ProjectCardProps) => {
  const handleDelete = async () => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      toast.error("Error deleting project");
    } else {
      toast.success("Project deleted");
      onUpdate();
    }
  };

  return (
    <Card className="shadow-card border-border/50 hover:shadow-glow transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start space-x-3">
          <div
            className="w-3 h-3 rounded-full mt-1"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <span className="text-xs text-muted-foreground capitalize">
          Status: {project.status}
        </span>
      </CardContent>
    </Card>
  );
};