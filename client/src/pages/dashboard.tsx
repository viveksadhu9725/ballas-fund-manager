import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ClipboardList, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Member, Resource, Task, TaskCompletion } from "@shared/schema";

export default function Dashboard() {
  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['/api/members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Member[];
    },
  });

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*');
      if (error) throw error;
      return data as Resource[];
    },
  });

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: completions, isLoading: loadingCompletions } = useQuery({
    queryKey: ['/api/task-completions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .order('noted_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as TaskCompletion[];
    },
  });

  const statCards = [
    {
      title: "Total Members",
      value: members?.length || 0,
      icon: Users,
      description: "Active members",
      testId: "stat-members"
    },
    {
      title: "Resources",
      value: resources?.length || 0,
      icon: Package,
      description: "Resource types",
      testId: "stat-resources"
    },
    {
      title: "Active Tasks",
      value: tasks?.length || 0,
      icon: ClipboardList,
      description: "Tasks assigned",
      testId: "stat-tasks"
    },
    {
      title: "Recent Completions",
      value: completions?.length || 0,
      icon: CheckCircle2,
      description: "Last 10 entries",
      testId: "stat-completions"
    },
  ];

  const isLoading = loadingMembers || loadingResources || loadingTasks || loadingCompletions;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your organization's activities and metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid={stat.testId}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMembers ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                    data-testid={`member-${member.id}`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.tag && (
                        <p className="text-xs text-muted-foreground">@{member.tag}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No members yet. Add your first member to get started.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Task Completions</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCompletions ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : completions && completions.length > 0 ? (
              <div className="space-y-3">
                {completions.map((completion) => (
                  <div
                    key={completion.id}
                    className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                    data-testid={`completion-${completion.id}`}
                  >
                    <CheckCircle2 className={`h-5 w-5 ${completion.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {completion.amount_collected} collected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(completion.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No task completions yet. Complete tasks to see them here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
