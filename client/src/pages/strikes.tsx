import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShieldAlert, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Strike, Member, InsertStrike } from "@shared/schema";

export default function Strikes() {
  const { isGuest, isAdmin } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InsertStrike>({
    member_id: "",
    reason: "",
    points: 1,
  });

  const { data: strikes, isLoading: loadingStrikes } = useQuery({
    queryKey: ['/api/strikes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strikes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Strike[];
    },
  });

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['/api/members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*');
      if (error) throw error;
      return data as Member[];
    },
  });

  const createStrikeMutation = useMutation({
    mutationFn: async (data: InsertStrike) => {
      const { error } = await supabase
        .from('strikes')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strikes'] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Strike issued successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      member_id: "",
      reason: "",
      points: 1,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStrikeMutation.mutate(formData);
  };

  const getMemberName = (memberId: string) => {
    const member = members?.find(m => m.id === memberId);
    return member?.name || "Unknown";
  };

  const getMemberStrikes = (memberId: string) => {
    return strikes?.filter(s => s.member_id === memberId) || [];
  };

  const getMemberStrikePoints = (memberId: string) => {
    return getMemberStrikes(memberId).reduce((sum, strike) => sum + strike.points, 0);
  };

  const membersWithStrikes = members?.map(member => ({
    ...member,
    strike_count: getMemberStrikes(member.id).length,
    total_strike_points: getMemberStrikePoints(member.id),
  })).sort((a, b) => b.total_strike_points - a.total_strike_points) || [];

  const isLoading = loadingStrikes || loadingMembers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold">Strikes</h1>
          <p className="text-muted-foreground mt-2">
            Track disciplinary actions and member violations
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setDialogOpen(true)}
            data-testid="button-issue-strike"
          >
            <Plus className="h-4 w-4 mr-2" />
            Issue Strike
          </Button>
        )}
      </div>

      {isGuest && (
        <Card className="border-muted-foreground/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              You're in guest mode. You can view strikes but cannot make changes.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Strike Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : membersWithStrikes.length > 0 ? (
              <div className="space-y-3">
                {membersWithStrikes.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-md hover-elevate"
                    data-testid={`member-summary-${member.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.name[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.strike_count} strike{member.strike_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={member.total_strike_points > 3 ? "destructive" : "secondary"}
                        className="text-sm font-bold"
                      >
                        {member.total_strike_points} pts
                      </Badge>
                      {member.total_strike_points > 3 && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No strikes issued yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Strikes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : strikes && strikes.length > 0 ? (
              <div className="space-y-3">
                {strikes.slice(0, 10).map((strike) => (
                  <div
                    key={strike.id}
                    className="p-3 rounded-md border border-border"
                    data-testid={`strike-${strike.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm">
                          {getMemberName(strike.member_id)}
                        </span>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {strike.points} pt{strike.points !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {strike.reason && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {strike.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(strike.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No strikes issued yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-strike-form">
          <DialogHeader>
            <DialogTitle>Issue Strike</DialogTitle>
            <DialogDescription>
              Record a disciplinary strike for a member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member">Member *</Label>
                <Select
                  value={formData.member_id}
                  onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                  required
                >
                  <SelectTrigger data-testid="select-strike-member">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  placeholder="Describe the violation"
                  rows={3}
                  data-testid="input-strike-reason"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Strike Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                  required
                  data-testid="input-strike-points"
                />
                <p className="text-xs text-muted-foreground">
                  Severity: 1 = Minor, 2 = Moderate, 3+ = Severe
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStrikeMutation.isPending}
                variant="destructive"
                data-testid="button-save-strike"
              >
                Issue Strike
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
