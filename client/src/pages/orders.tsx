import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { insertOrderSchema, type Order } from '@shared/schema';
import { z } from 'zod';

type OrderForm = z.infer<typeof insertOrderSchema>;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function Orders() {
  const { isAdmin, isGuest } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: allOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 5000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['/api/members'],
  });

  const activeOrders = allOrders.filter(o => o.status !== 'completed');
  const completedOrders = allOrders.filter(o => o.status === 'completed');

  const addMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueryData({ queryKey: ['/api/orders'] });
      form.reset();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: { id: string } & OrderForm) => {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueryData({ queryKey: ['/api/orders'] });
      setEditingId(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueryData({ queryKey: ['/api/orders'] });
    },
  });

  const form = useForm<OrderForm>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      reference_id: '',
      items: '',
      quantity: 1,
      customer_name: '',
      customer_contact: null,
      notes: null,
      status: 'pending',
      assigned_member_id: null,
    },
  });

  const onSubmit = (data: OrderForm) => {
    if (editingId) {
      editMutation.mutate({ id: editingId, ...data });
    } else {
      addMutation.mutate(data);
    }
  };

  const startEdit = (order: Order) => {
    setEditingId(order.id);
    form.setValue('reference_id', order.reference_id);
    form.setValue('items', order.items);
    form.setValue('quantity', order.quantity);
    form.setValue('customer_name', order.customer_name);
    form.setValue('customer_contact', order.customer_contact);
    form.setValue('notes', order.notes);
    form.setValue('status', order.status);
    form.setValue('assigned_member_id', order.assigned_member_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return 'Unassigned';
    return members.find(m => m.id === memberId)?.name || memberId;
  };

  const renderOrderTable = (orders: Order[], title: string) => (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold">Ref ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Items</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Qty</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Assigned</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Updated</th>
              {!isGuest && <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={isGuest ? 7 : 8} className="px-6 py-4 text-center text-muted-foreground">
                  No orders
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`row-order-${order.id}`}>
                  <td className="px-6 py-3 text-sm font-medium" data-testid={`text-ref-${order.id}`}>{order.reference_id}</td>
                  <td className="px-6 py-3 text-sm" data-testid={`text-items-${order.id}`}>{order.items}</td>
                  <td className="px-6 py-3 text-sm"><Badge variant="secondary">{order.quantity}</Badge></td>
                  <td className="px-6 py-3 text-sm" data-testid={`text-customer-${order.id}`}>{order.customer_name}</td>
                  <td className="px-6 py-3 text-sm" data-testid={`text-assigned-${order.id}`}>{getMemberName(order.assigned_member_id)}</td>
                  <td className="px-6 py-3 text-sm">
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {new Date(order.updated_at).toLocaleDateString()}
                  </td>
                  {!isGuest && (
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(order)} data-testid={`button-edit-${order.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive" data-testid={`button-delete-${order.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete order "{order.reference_id}"? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-3 justify-end">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(order.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid={`button-confirm-delete-${order.id}`}>
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
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground mt-1">Manage RP orders with full status workflow</p>
      </div>

      {!isGuest && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Order' : 'Create New Order'}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="reference_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Reference ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ORD-001" data-testid="input-ref-id" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="customer_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" data-testid="input-customer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="items" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Items *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lockpicks, Ammo, Armor" data-testid="input-items" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="1" data-testid="input-qty" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="customer_contact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Contact (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone or Discord" data-testid="input-contact" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Special instructions..." data-testid="input-notes" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="assigned_member_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To Member</FormLabel>
                    <Select value={field.value || 'unassigned'} onValueChange={(v) => field.onChange(v === 'unassigned' ? null : v)}>
                      <FormControl>
                        <SelectTrigger data-testid="select-member">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={addMutation.isPending || editMutation.isPending} data-testid="button-submit">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingId ? 'Update Order' : 'Create Order'}
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

      {renderOrderTable(activeOrders, 'Active Orders')}
      {renderOrderTable(completedOrders, 'Order History')}
    </div>
  );
}
