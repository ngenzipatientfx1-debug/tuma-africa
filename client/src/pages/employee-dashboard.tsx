import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package, 
  LogOut,
  CheckCircle,
  XCircle,
  Search,
  MessageSquare,
  User,
  Clipboard
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order, User as UserType } from "@shared/schema";

export default function EmployeeDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "decline" | "stage" | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [stageNote, setStageNote] = useState("");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["employee", "admin", "super_admin"].includes(user?.role || ""))) {
      toast({
        title: "Access Denied",
        description: "Employee access required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/employee/orders"],
    enabled: isAuthenticated && ["employee", "admin", "super_admin"].includes(user?.role || ""),
  });

  const approveMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest("POST", `/api/employee/orders/${orderId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/orders"] });
      toast({ title: "Order approved successfully" });
      setDialogOpen(false);
    },
  });

  const declineMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      return apiRequest("POST", `/api/employee/orders/${orderId}/decline`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/orders"] });
      toast({ title: "Order declined" });
      setDialogOpen(false);
      setDeclineReason("");
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ orderId, stage, note }: { orderId: string; stage: string; note?: string }) => {
      return apiRequest("PATCH", `/api/employee/orders/${orderId}/stage`, { stage, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/orders"] });
      toast({ title: "Order stage updated" });
      setDialogOpen(false);
      setSelectedStage("");
      setStageNote("");
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === "pending");
  const approvedOrders = orders.filter(o => o.status === "approved");
  const declinedOrders = orders.filter(o => o.status === "declined");

  const filteredOrders = orders.filter(o => 
    o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stages = [
    { value: "purchased_from_china", label: "Purchased from China" },
    { value: "in_warehouse", label: "In Warehouse" },
    { value: "in_ship", label: "In Ship/Airplane" },
    { value: "in_rwanda", label: "In Rwanda" },
    { value: "delivered", label: "Delivered" },
  ];

  const handleAction = (order: Order, action: "approve" | "decline" | "stage") => {
    setSelectedOrder(order);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedOrder) return;

    if (actionType === "approve") {
      approveMutation.mutate(selectedOrder.id);
    } else if (actionType === "decline" && declineReason) {
      declineMutation.mutate({ orderId: selectedOrder.id, reason: declineReason });
    } else if (actionType === "stage" && selectedStage) {
      updateStageMutation.mutate({ orderId: selectedOrder.id, stage: selectedStage, note: stageNote });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-foreground">
              Employee Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary">{user?.role}</Badge>
            <Button variant="ghost" asChild data-testid="link-home">
              <a href="/">Home</a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold mb-2 text-foreground">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer orders and communicate with admin
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders" data-testid="tab-orders">
              All Orders ({filteredOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              Approved ({approvedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="admin-chat" data-testid="tab-admin-chat">
              Admin Chat
            </TabsTrigger>
          </TabsList>

          {/* All Orders */}
          <TabsContent value="orders" className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No orders found</p>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="p-6" data-testid={`order-${order.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{order.productName}</h3>
                        <Badge variant={
                          order.status === "approved" ? "default" :
                          order.status === "declined" ? "destructive" : "secondary"
                        }>
                          {order.status}
                        </Badge>
                        {order.orderStage && (
                          <Badge variant="outline">{order.orderStage.replace(/_/g, " ")}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-['JetBrains_Mono'] mb-2">
                        Order ID: #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm"><span className="text-muted-foreground">Quantity:</span> {order.quantity}</p>
                      {order.shippingAddress && (
                        <p className="text-sm"><span className="text-muted-foreground">Address:</span> {order.shippingAddress}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {order.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleAction(order, "approve")}
                            data-testid={`button-approve-${order.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleAction(order, "decline")}
                            data-testid={`button-decline-${order.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </>
                      )}
                      {order.status === "approved" && (
                        <Button 
                          size="sm"
                          onClick={() => handleAction(order, "stage")}
                          data-testid={`button-update-stage-${order.id}`}
                        >
                          Update Stage
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Pending Orders */}
          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{order.productName}</h3>
                    <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAction(order, "approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(order, "decline")}>
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Approved Orders */}
          <TabsContent value="approved" className="space-y-4">
            {approvedOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{order.productName}</h3>
                    <Badge variant="outline">{order.orderStage || "Processing"}</Badge>
                  </div>
                  <Button size="sm" onClick={() => handleAction(order, "stage")}>
                    Update Stage
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Admin Chat */}
          <TabsContent value="admin-chat">
            <Card className="p-8 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Admin chat will be implemented here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Order"}
              {actionType === "decline" && "Decline Order"}
              {actionType === "stage" && "Update Order Stage"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "Are you sure you want to approve this order?"}
              {actionType === "decline" && "Please provide a reason for declining this order."}
              {actionType === "stage" && "Select the new order stage and add optional notes."}
            </DialogDescription>
          </DialogHeader>

          {actionType === "decline" && (
            <Textarea
              placeholder="Reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              data-testid="textarea-decline-reason"
            />
          )}

          {actionType === "stage" && (
            <div className="space-y-4">
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger data-testid="select-stage">
                  <SelectValue placeholder="Select stage..." />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Optional notes..."
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                data-testid="textarea-stage-note"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={
                (actionType === "decline" && !declineReason) ||
                (actionType === "stage" && !selectedStage)
              }
              data-testid="button-confirm-action"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
