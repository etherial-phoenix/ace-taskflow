import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projects: { name: string; color: string } | null;
}

interface TaskListProps {
  tasks: Task[];
  onUpdate: () => void;
}

const priorityColors = {
  low: "text-blue-500",
  medium: "text-amber-500",
  high: "text-red-500",
};

export const TaskList = ({ tasks, onUpdate }: TaskListProps) => {
  const handleToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed";
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast.error("Error updating task");
    } else {
      onUpdate();
    }
  };

  const handleDelete = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast.error("Error deleting task");
    } else {
      toast.success("Task deleted");
      onUpdate();
    }
  };

  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground">No tasks yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="shadow-card border-border/50 hover:shadow-glow transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={() => handleToggle(task.id, task.status)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        task.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                    className="text-destructive hover:text-destructive ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <span
                    className={`text-xs font-medium capitalize ${
                      priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                  >
                    {task.priority}
                  </span>
                  {task.projects && (
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: task.projects.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {task.projects.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};