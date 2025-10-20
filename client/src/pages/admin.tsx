import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, LogOut, Home, Search, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Order } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const statusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "purchased", label: "Purchased" },
  { value: "warehouse", label: "In Warehouse" },
  { value: "shipping", label: "Shipping" },
  { value: "in-country", label: "In Country" },
  { value: "delivered", label: "Delivered" },
];

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    } else if (!isLoading && isAuthenticated && user?.isAdmin !== 1) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && user?.isAdmin === 1,
  });

  if (isLoading || !isAuthenticated || user?.isAdmin !== 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredOrders = orders?.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productLink.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: orders?.length || 0,
    submitted: orders?.filter(o => o.status === "submitted").length || 0,
    inProgress: orders?.filter(o => ["purchased", "warehouse", "shipping"].includes(o.status)).length || 0,
    delivered: orders?.filter(o => o.status === "delivered").length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-foreground">
              Tuma-Africa Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild data-testid="link-home">
              <a href="/">
                <Home className="w-5 h-5 mr-2" />
                Home
              </a>
            </Button>
            <Button variant="ghost" asChild data-testid="link-dashboard">
              <a href="/dashboard">My Orders</a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                window.location.href = "/api/logout";
              }}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold mb-2 text-foreground">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, color: "text-foreground" },
            { label: "New Submitted", value: stats.submitted, color: "text-blue-600" },
            { label: "In Progress", value: stats.inProgress, color: "text-orange-600" },
            { label: "Delivered", value: stats.delivered, color: "text-green-600" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6" data-testid={`admin-stat-${index}`}>
                <div className={`font-['Plus_Jakarta_Sans'] text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, user ID, or product link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </Card>

        {/* Orders Table */}
        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} queryClient={queryClient} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </Card>
        )}
      </main>
    </div>
  );
}

function OrderRow({ order, queryClient }: { order: Order; queryClient: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const { toast } = useToast();

  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/admin/orders/${order.id}`, {
        status,
        trackingNumber: trackingNumber || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });

  return (
    <tr className="border-t border-card-border hover:bg-muted/50" data-testid={`admin-order-${order.id}`}>
      <td className="px-4 py-3 font-['JetBrains_Mono'] text-sm">{order.id.slice(0, 8)}</td>
      <td className="px-4 py-3 font-['JetBrains_Mono'] text-sm text-muted-foreground">{order.userId.slice(0, 8)}</td>
      <td className="px-4 py-3 text-sm max-w-xs truncate">{order.productLink}</td>
      <td className="px-4 py-3 text-sm">{order.quantity}</td>
      <td className="px-4 py-3">
        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
          {order.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(order.createdAt!).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" data-testid={`button-edit-${order.id}`}>
              <Edit className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order</DialogTitle>
              <DialogDescription>
                Order #{order.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  data-testid="input-tracking"
                />
              </div>
              <Button
                onClick={() => updateOrderMutation.mutate()}
                disabled={updateOrderMutation.isPending}
                className="w-full"
                data-testid="button-save"
              >
                {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
