import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    full_name: string | null;
  };
}

interface TeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
  userRole: string;
}

export const TeamMembersDialog = ({ open, onOpenChange, teamId, teamName, userRole }: TeamMembersDialogProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, teamId]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, user_id, role, profiles(full_name)")
      .eq("team_id", teamId);

    if (error) {
      toast.error(error.message);
    } else {
      setMembers(data as TeamMember[]);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Find user by email
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", `%${email}%`)
      .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
      toast.error("User not found. They must sign up first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: profiles[0].id,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add member");
      }

      toast.success("Member added successfully!");
      setEmail("");
      setRole("member");
      fetchMembers();
    } catch (error) {
      toast.error("Error adding member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the team?")) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      toast.success("Member removed successfully!");
      fetchMembers();
    } catch (error) {
      toast.error("Error removing member");
    }
  };

  const canManageMembers = userRole === "owner" || userRole === "admin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Team Members - {teamName}</DialogTitle>
          <DialogDescription>
            Add or remove members from your team.
          </DialogDescription>
        </DialogHeader>

        {canManageMembers && (
          <form onSubmit={handleAddMember} className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Search by email..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: "member" | "admin") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </form>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Team Members ({members.length})</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{member.profiles.full_name || "Unknown User"}</p>
                  <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                </div>
                {canManageMembers && member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
