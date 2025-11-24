import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { insertCraftedItemSchema, type CraftedItem } from '@shared/schema';
import { z } from 'zod';

type CraftedItemForm = z.infer<typeof insertCraftedItemSchema>;

export default function Crafting() {
  const { isAdmin, isGuest } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery<CraftedItem[]>({
    queryKey: ['/api/crafted-items'],
    refetchInterval: 5000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['/api/members'],
  });

  const addMutation = useMutation({
    mutationFn: async (data: CraftedItemForm) => {
      const response = await fetch('/api/crafted-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueryData({ queryKey: ['/api/crafted-items'] });
      form.reset();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: { id: string } & CraftedItemForm) => {
      const response = await fetch('/api/crafted-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueryData({ queryKey: ['/api/crafted-items'] });
      setEditingId(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/crafted-items/${id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueryData({ queryKey: ['/api/crafted-items'] });
    },
  });

  const form = useForm<CraftedItemForm>({
    resolver: zodResolver(insertCraftedItemSchema),
    defaultValues: {
      item_name: '',
      quantity: 1,
      crafted_by: null,
    },
  });

  const onSubmit = (data: CraftedItemForm) => {
    if (editingId) {
      editMutation.mutate({ id: editingId, ...data });
    } else {
      addMutation.mutate(data);
    }
  };

  const startEdit = (item: CraftedItem) => {
    setEditingId(item.id);
    form.setValue('item_name', item.item_name);
    form.setValue('quantity', item.quantity);
    form.setValue('crafted_by', item.crafted_by);
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return 'N/A';
    return members.find(m => m.id === memberId)?.name || memberId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crafting Management</h1>
        <p className="text-muted-foreground mt-1">Track all crafted items for gang operations</p>
      </div>

      {!isGuest && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Crafted Item' : 'Add New Crafted Item'}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="item_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Lockpick Kit, Armor Plating"
                        data-testid="input-item-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        data-testid="input-quantity"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crafted_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crafted By (Optional)</FormLabel>
                    <Select value={field.value || 'unassigned'} onValueChange={(v) => field.onChange(v === 'unassigned' ? null : v)}>
                      <FormControl>
                        <SelectTrigger data-testid="select-crafter">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Not Assigned</SelectItem>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={addMutation.isPending || editMutation.isPending} data-testid="button-submit">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingId ? 'Update Item' : 'Add Item'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit} data-testid="button-cancel">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-semibold">Item Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Crafted By</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Updated</th>
                {!isGuest && <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isGuest ? 5 : 6} className="px-6 py-4 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={isGuest ? 5 : 6} className="px-6 py-4 text-center text-muted-foreground">
                    No crafted items yet
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`row-item-${item.id}`}>
                    <td className="px-6 py-3 text-sm font-medium" data-testid={`text-item-name-${item.id}`}>{item.item_name}</td>
                    <td className="px-6 py-3 text-sm" data-testid={`text-quantity-${item.id}`}>
                      <Badge variant="secondary">{item.quantity}</Badge>
                    </td>
                    <td className="px-6 py-3 text-sm" data-testid={`text-crafter-${item.id}`}>
                      {getMemberName(item.crafted_by)}
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    {!isGuest && (
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(item)}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                data-testid={`button-delete-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Crafted Item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{item.item_name}"? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-3 justify-end">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-testid={`button-confirm-delete-${item.id}`}
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
