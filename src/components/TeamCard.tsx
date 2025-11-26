import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamCardProps {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  role: string;
  onDelete: () => void;
  onManage: () => void;
}

export const TeamCard = ({ id, name, description, memberCount, role, onDelete, onManage }: TeamCardProps) => {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Team deleted successfully!");
      onDelete();
    }
  };

  return (
    <Card className="group hover:shadow-card transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {description || "No description"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onManage}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {role === "owner" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {role}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
