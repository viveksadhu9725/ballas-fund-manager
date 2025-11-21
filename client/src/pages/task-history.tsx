import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, CheckCircle2 } from "lucide-react";
import type { TaskCompletion, Task, Member } from "@shared/schema";

export default function TaskHistory() {
  const { data: completions, isLoading: loadingCompletions } = useQuery({
    queryKey: ['/api/task-completions'],
    queryFn: async () => {
      const res = await fetch('/api/task-completions');
      if (!res.ok) throw new Error('Failed to fetch completions');
      return res.json() as Promise<TaskCompletion[]>;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json() as Promise<Task[]>;
    },
  });

  const { data: members } = useQuery({
    queryKey: ['/api/members'],
    queryFn: async () => {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json() as Promise<Member[]>;
    },
  });

  const getTaskName = (taskId: string) => {
    return tasks?.find(t => t.id === taskId)?.title || "Unknown Task";
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return "Unassigned";
    return members?.find(m => m.id === memberId)?.name || "Unknown";
  };

  const getCompletedCount = (memberId: string) => {
    return completions?.filter(c => c.member_id === memberId && c.completed)?.length || 0;
  };

  const getTotalCollected = (memberId: string) => {
    return completions?.filter(c => c.member_id === memberId).reduce((sum, c) => sum + (c.amount_collected || 0), 0) || 0;
  };

  // Group completions by member
  const completionsByMember = members?.map(member => ({
    member,
    completions: completions?.filter(c => c.member_id === member.id) || [],
    completedCount: getCompletedCount(member.id),
    totalCollected: getTotalCollected(member.id),
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold">Task History</h1>
        <p className="text-muted-foreground mt-2">
          View task completion history by member
        </p>
      </div>

      {loadingCompletions ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : completionsByMember.length > 0 ? (
        <div className="space-y-6">
            {completionsByMember
              .filter(c => c.completions.length > 0)
              .sort((a, b) => b.completions.length - a.completions.length)
              .map(({ member, completions: memberCompletions, completedCount, totalCollected }) => (
                <Card key={member.id} data-testid={`member-history-${member.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {member.name[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {completedCount} completed • {totalCollected} items collected
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        {member.tag || "No tag"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {memberCompletions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No task completions recorded</p>
                      ) : (
                        <>
                          <div className="text-xs font-semibold text-muted-foreground mb-3">
                            Recent Completions
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {memberCompletions
                              .sort((a, b) => new Date(b.noted_at).getTime() - new Date(a.noted_at).getTime())
                              .map((completion) => (
                                <div
                                  key={completion.id}
                                  className="flex items-start justify-between p-3 rounded-md bg-muted/50 border border-border/50"
                                  data-testid={`completion-${completion.id}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {getTaskName(completion.task_id)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(completion.date).toLocaleDateString()}</span>
                                      {completion.completed && (
                                        <>
                                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                                          <span className="text-green-600">Completed</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right ml-2">
                                    <p className="text-sm font-bold text-primary">
                                      {completion.amount_collected}
                                    </p>
                                    <p className="text-xs text-muted-foreground">items</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No task completions recorded yet. Start logging task completions to see history here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
