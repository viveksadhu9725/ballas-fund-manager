import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Plus, ClipboardList, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Task, Member, Resource, InsertTask, InsertTaskCompletion } from "@shared/schema";

export default function Tasks() {
  const { isGuest, isAdmin } = useAuth();
  const { toast } = useToast();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState<InsertTask>({
    title: "",
    description: "",
    resource_id: null,
    required_amount: 0,
    assigned_member_id: null,
    recurrence: "daily",
  });
  const [completionFormData, setCompletionFormData] = useState<InsertTaskCompletion>({
    task_id: "",
    member_id: null,
    date: new Date().toISOString().split('T')[0],
    amount_collected: 0,
    completed: false,
  });

  const { data: tasks, isLoading } = useQuery({
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

  const { data: resources } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json() as Promise<Resource[]>;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setTaskDialogOpen(false);
      resetTaskForm();
      toast({
        title: "Success",
        description: "Task created successfully.",
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

  const createCompletionMutation = useMutation({
    mutationFn: async (data: InsertTaskCompletion) => {
      const res = await fetch('/api/task-completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to log completion');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-completions'] });
      setCompletionDialogOpen(false);
      resetCompletionForm();
      toast({
        title: "Success",
        description: "Task completion logged successfully.",
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

  const resetTaskForm = () => {
    setTaskFormData({
      title: "",
      description: "",
      resource_id: null,
      required_amount: 0,
      assigned_member_id: null,
      recurrence: "daily",
    });
  };

  const resetCompletionForm = () => {
    setCompletionFormData({
      task_id: "",
      member_id: null,
      date: new Date().toISOString().split('T')[0],
      amount_collected: 0,
      completed: false,
    });
    setSelectedTask(null);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(taskFormData);
  };

  const handleCompletionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompletionMutation.mutate(completionFormData);
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return "Unassigned";
    const member = members?.find(m => m.id === memberId);
    return member?.name || "Unknown";
  };

  const getResourceName = (resourceId: string | null) => {
    if (!resourceId) return null;
    const resource = resources?.find(r => r.id === resourceId);
    return resource?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-2">
            Manage tasks and log completions
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setTaskDialogOpen(true)}
            data-testid="button-add-task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      {isGuest && (
        <Card className="border-muted-foreground/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              You're in guest mode. You can view tasks but cannot make changes.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const resourceName = getResourceName(task.resource_id);
            const memberName = getMemberName(task.assigned_member_id);
            
            return (
              <Card key={task.id} data-testid={`card-task-${task.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline">
                          {task.recurrence}
                        </Badge>
                        {resourceName && (
                          <Badge variant="secondary">
                            {resourceName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Required:</span>
                      <span className="font-medium">{task.required_amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="font-medium">{memberName}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setCompletionFormData({
                          ...completionFormData,
                          task_id: task.id,
                          member_id: task.assigned_member_id,
                        });
                        setCompletionDialogOpen(true);
                      }}
                      data-testid={`button-log-completion-${task.id}`}
                      className="w-full"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      Log Completion
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No tasks yet. Create your first task to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-task-form">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Set up a new task with resource requirements
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    required
                    data-testid="input-task-title"
                    placeholder="e.g., Gather autoparts"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <Select
                    value={taskFormData.recurrence}
                    onValueChange={(value: any) => setTaskFormData({ ...taskFormData, recurrence: value })}
                  >
                    <SelectTrigger data-testid="select-recurrence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskFormData.description || ""}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Optional task description"
                  rows={3}
                  data-testid="input-task-description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Select
                    value={taskFormData.resource_id || "none"}
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, resource_id: value === "none" ? null : value })}
                  >
                    <SelectTrigger data-testid="select-resource">
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {resources?.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="required_amount">Required Amount</Label>
                  <Input
                    id="required_amount"
                    type="number"
                    min="0"
                    value={taskFormData.required_amount}
                    onChange={(e) => setTaskFormData({ ...taskFormData, required_amount: parseInt(e.target.value) || 0 })}
                    data-testid="input-required-amount"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_member">Assign to Member</Label>
                <Select
                  value={taskFormData.assigned_member_id || "none"}
                  onValueChange={(value) => setTaskFormData({ ...taskFormData, assigned_member_id: value === "none" ? null : value })}
                >
                  <SelectTrigger data-testid="select-member">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTaskDialogOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                data-testid="button-save-task"
              >
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent data-testid="dialog-completion-form">
          <DialogHeader>
            <DialogTitle>Log Task Completion</DialogTitle>
            <DialogDescription>
              Record completion for: {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompletionSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="completion-member">Member</Label>
                <Select
                  value={completionFormData.member_id || "none"}
                  onValueChange={(value) => setCompletionFormData({ ...completionFormData, member_id: value === "none" ? null : value })}
                >
                  <SelectTrigger data-testid="select-completion-member">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={completionFormData.date}
                  onChange={(e) => setCompletionFormData({ ...completionFormData, date: e.target.value })}
                  required
                  data-testid="input-completion-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_collected">Amount Collected</Label>
                <Input
                  id="amount_collected"
                  type="number"
                  min="0"
                  value={completionFormData.amount_collected}
                  onChange={(e) => setCompletionFormData({ ...completionFormData, amount_collected: parseInt(e.target.value) || 0 })}
                  required
                  data-testid="input-amount-collected"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="completed"
                  checked={completionFormData.completed}
                  onChange={(e) => setCompletionFormData({ ...completionFormData, completed: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                  data-testid="checkbox-completed"
                />
                <Label htmlFor="completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Mark as completed
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompletionDialogOpen(false)}
                data-testid="button-cancel-completion"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCompletionMutation.isPending}
                data-testid="button-save-completion"
              >
                Log Completion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
