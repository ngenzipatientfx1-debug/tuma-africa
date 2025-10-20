import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, LogOut, Users, CheckCircle, XCircle, BarChart3, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Order } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["admin", "super_admin"].includes(user?.role || ""))) {
      toast({ title: "Access Denied", description: "Admin access required.", variant: "destructive" });
      setTimeout(() => window.location.href = "/", 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && ["admin", "super_admin"].includes(user?.role || ""),
  });

  const { data: pendingVerifications = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/verification/pending"],
    enabled: isAuthenticated && ["admin", "super_admin"].includes(user?.role || ""),
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && ["admin", "super_admin"].includes(user?.role || ""),
  });

  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/verify`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification/pending"] });
      toast({ title: "User verification updated" });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const verifiedUsers = users.filter(u => u.verificationStatus === "verified");
  const pendingOrders = orders.filter(o => o.status === "pending");
  const approvedOrders = orders.filter(o => o.status === "approved");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-foreground">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default">{user?.role}</Badge>
            <Button variant="ghost" asChild><a href="/">Home</a></Button>
            <Button variant="ghost" size="icon" onClick={() => window.location.href = "/api/logout"}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold mb-6 text-foreground">Admin Control Panel</h1>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-primary" />
              <Badge>{users.length}</Badge>
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <Badge>{verifiedUsers.length}</Badge>
            </div>
            <p className="text-2xl font-bold">{verifiedUsers.length}</p>
            <p className="text-sm text-muted-foreground">Verified Users</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-500" />
              <Badge>{pendingOrders.length}</Badge>
            </div>
            <p className="text-2xl font-bold">{pendingOrders.length}</p>
            <p className="text-sm text-muted-foreground">Pending Orders</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <Badge>{approvedOrders.length}</Badge>
            </div>
            <p className="text-2xl font-bold">{approvedOrders.length}</p>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="verification">Verifications ({pendingVerifications.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-6">
            {users.map(u => (
              <Card key={u.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={u.profileImageUrl || ""} />
                      <AvatarFallback>{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.verificationStatus === "verified" ? "default" : "secondary"}>
                      {u.verificationStatus}
                    </Badge>
                    <Badge variant="outline">{u.role}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4 mt-6">
            {pendingVerifications.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No pending verifications</p>
              </Card>
            ) : (
              pendingVerifications.map(u => (
                <Card key={u.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => verifyUserMutation.mutate({ userId: u.id, status: "verified" })}>
                        <CheckCircle className="w-4 h-4 mr-2" />Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => verifyUserMutation.mutate({ userId: u.id, status: "rejected" })}>
                        <XCircle className="w-4 h-4 mr-2" />Reject
                      </Button>
                    </div>
                  </div>
                  {u.idPhotoPath && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Verification Documents:</p>
                      <div className="grid grid-cols-2 gap-4">
                        <img src={u.idPhotoPath} alt="ID" className="rounded border max-h-48 object-cover" />
                        {u.selfiePath && <img src={u.selfiePath} alt="Selfie" className="rounded border max-h-48 object-cover" />}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 mt-6">
            {orders.map(order => (
              <Card key={order.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{order.productName}</h3>
                    <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
                  </div>
                  <Badge variant={order.status === "approved" ? "default" : order.status === "declined" ? "destructive" : "secondary"}>
                    {order.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="p-8 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Analytics dashboard coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
