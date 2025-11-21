import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Resource, InsertResource, Inventory } from "@shared/schema";

export default function Resources() {
  const { isGuest, isAdmin } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<InsertResource>({
    name: "",
    description: "",
    unit: "pcs",
  });
  const [inventoryQuantity, setInventoryQuantity] = useState<number>(0);

  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json() as Promise<Resource[]>;
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json() as Promise<Inventory[]>;
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: InsertResource) => {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create resource');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Resource added successfully.",
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

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ resourceId, quantity }: { resourceId: string; quantity: number }) => {
      const existing = inventory?.find(i => i.resource_id === resourceId);
      
      if (existing) {
        const res = await fetch('/api/inventory', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: existing.id, quantity })
        });
        if (!res.ok) throw new Error('Failed to update inventory');
        return res.json();
      } else {
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource_id: resourceId, quantity })
        });
        if (!res.ok) throw new Error('Failed to create inventory');
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setInventoryDialogOpen(false);
      setSelectedResource(null);
      toast({
        title: "Success",
        description: "Inventory updated successfully.",
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

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete resource');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setDeleteDialogOpen(false);
      setSelectedResource(null);
      toast({
        title: "Success",
        description: "Resource deleted successfully.",
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
    setFormData({ name: "", description: "", unit: "pcs" });
    setSelectedResource(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createResourceMutation.mutate(formData);
  };

  const handleUpdateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResource) {
      updateInventoryMutation.mutate({
        resourceId: selectedResource.id,
        quantity: inventoryQuantity,
      });
    }
  };

  const getInventoryForResource = (resourceId: string) => {
    // Return only the most recently updated inventory for each resource
    const resourceInventories = inventory?.filter(i => i.resource_id === resourceId) || [];
    if (resourceInventories.length === 0) return undefined;
    return resourceInventories.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold">Resources & Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Manage resource types and track inventory levels
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setDialogOpen(true)}
            data-testid="button-add-resource"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {isGuest && (
        <Card className="border-muted-foreground/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              You're in guest mode. You can view resources but cannot make changes.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : resources && resources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const inv = getInventoryForResource(resource.id);
            return (
              <Card key={resource.id} data-testid={`card-resource-${resource.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {resource.name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {resource.unit}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resource.description && (
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  )}
                  
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Current Stock</span>
                      <span className="text-2xl font-bold text-primary" data-testid={`inventory-${resource.id}`}>
                        {inv?.quantity || 0}
                      </span>
                    </div>
                    {inv && (
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(inv.updated_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedResource(resource);
                          setInventoryQuantity(inv?.quantity || 0);
                          setInventoryDialogOpen(true);
                        }}
                        data-testid={`button-update-inventory-${resource.id}`}
                        className="flex-1"
                      >
                        <Pencil className="h-3 w-3 mr-2" />
                        Update Inventory
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedResource(resource);
                          setDeleteDialogOpen(true);
                        }}
                        data-testid={`button-delete-resource-${resource.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
              <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No resources yet. Add your first resource to start tracking inventory.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-resource-form">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>
              Create a new resource type to track
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Resource Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-resource-name"
                  placeholder="e.g., Autoparts, Steel, Fuel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  data-testid="input-resource-unit"
                  placeholder="e.g., pcs, kg, liters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  data-testid="input-resource-description"
                />
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
                disabled={createResourceMutation.isPending}
                data-testid="button-save-resource"
              >
                Add Resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-resource">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedResource?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedResource) {
                  deleteResourceMutation.mutate(selectedResource.id);
                }
              }}
              data-testid="button-confirm-delete"
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent data-testid="dialog-inventory-form">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Set the current inventory level for {selectedResource?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateInventory}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity ({selectedResource?.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={inventoryQuantity}
                  onChange={(e) => setInventoryQuantity(parseInt(e.target.value) || 0)}
                  required
                  data-testid="input-inventory-quantity"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInventoryDialogOpen(false)}
                data-testid="button-cancel-inventory"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateInventoryMutation.isPending}
                data-testid="button-save-inventory"
              >
                Update Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
