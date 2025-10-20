import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Ship, 
  Warehouse, 
  Plane,
  MapPin,
  User as UserIcon,
  Shield,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { VerificationUploadForm } from "@/components/verification-upload-form";
import type { Order } from "@shared/schema";

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  // Show profile tab first if user is not verified, otherwise show orders
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Update tab when verification status changes
  useEffect(() => {
    if (user?.verificationStatus === "verified") {
      setActiveTab("orders");
    } else if (user?.verificationStatus === "pending" || user?.verificationStatus === "not_verified") {
      setActiveTab("profile");
    }
  }, [user?.verificationStatus]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if user is verified
  const isVerified = user?.verificationStatus === "verified";

  // Filter orders by status
  const pendingOrders = allOrders.filter(o => o.status === "pending");
  const declinedOrders = allOrders.filter(o => o.status === "declined");
  const approvedOrders = allOrders.filter(o => o.status === "approved");

  // Get tracking stages
  const trackingStages = [
    { key: "purchased_from_china", label: "Purchased from China", icon: Package },
    { key: "in_warehouse", label: "In Warehouse", icon: Warehouse },
    { key: "in_ship", label: "In Ship/Airplane", icon: Ship },
    { key: "in_rwanda", label: "In Rwanda", icon: MapPin },
  ];

  const getStageIndex = (stage: string | null) => {
    if (!stage) return -1;
    return trackingStages.findIndex(s => s.key === stage);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-foreground">
              Tuma-Africa Link Cargo
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild data-testid="link-home">
              <a href="/">Home</a>
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
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold mb-2 text-foreground">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your orders, track shipments, and verify your account
          </p>
        </div>

        {/* Verification Warning */}
        {!isVerified && (
          <Card className="p-6 mb-6 border-2 border-yellow-500/50 bg-yellow-500/10">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Account Verification {user?.verificationStatus === "pending" ? "Pending" : "Required"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {user?.verificationStatus === "pending" 
                    ? "Thanks — we've received your info. We'll check it and let you know within 24 hours."
                    : "You need to verify your account before placing orders. Please upload your ID and selfie."}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Murakoze twakiriye ubutumwa bwanyu, mwihangane mu gihe tukiri kugenzura.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="tracking" data-testid="tab-tracking">Tracking</TabsTrigger>
            <TabsTrigger value="new-order" data-testid="tab-new-order">New Order</TabsTrigger>
            <TabsTrigger value="inbox" data-testid="tab-inbox">Inbox</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending" data-testid="subtab-pending">
                  Order Made ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="declined" data-testid="subtab-declined">
                  Declined ({declinedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="approved" data-testid="subtab-approved">
                  Approved ({approvedOrders.length})
                </TabsTrigger>
              </TabsList>

              {/* Pending Orders */}
              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingOrders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No pending orders</p>
                  </Card>
                ) : (
                  pendingOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6" data-testid={`order-pending-${order.id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-foreground">
                                {order.productName}
                              </h3>
                              <Badge variant="secondary">Pending Review</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                              Order ID: #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Quantity:</span> {order.quantity}</p>
                          <p><span className="text-muted-foreground">Product Link:</span> <a href={order.productLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{order.productLink.slice(0, 50)}...</a></p>
                          {order.variation && <p><span className="text-muted-foreground">Variation:</span> {order.variation}</p>}
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* Declined Orders */}
              <TabsContent value="declined" className="space-y-4 mt-4">
                {declinedOrders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No declined orders</p>
                  </Card>
                ) : (
                  declinedOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 border-destructive" data-testid={`order-declined-${order.id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-foreground">
                                {order.productName}
                              </h3>
                              <Badge variant="destructive">Declined</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                              Order ID: #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <XCircle className="w-6 h-6 text-destructive" />
                        </div>
                        {order.declineReason && (
                          <div className="bg-destructive/10 p-4 rounded-lg mt-4">
                            <p className="text-sm font-semibold text-foreground mb-1">Reason for Decline:</p>
                            <p className="text-sm text-muted-foreground">{order.declineReason}</p>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* Approved Orders */}
              <TabsContent value="approved" className="space-y-4 mt-4">
                {approvedOrders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No approved orders yet</p>
                  </Card>
                ) : (
                  approvedOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 border-green-500" data-testid={`order-approved-${order.id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-foreground">
                                {order.productName}
                              </h3>
                              <Badge className="bg-green-500">Approved</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                              Order ID: #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Current Stage:</span> <Badge variant="secondary">{order.orderStage || "Processing"}</Badge></p>
                          {order.trackingNumber && <p><span className="text-muted-foreground">Tracking:</span> {order.trackingNumber}</p>}
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Order Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-foreground">Order Tracking</h2>
            {approvedOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Ship className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No orders to track yet</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {approvedOrders.map((order) => {
                  const currentStageIndex = getStageIndex(order.orderStage);
                  
                  return (
                    <Card key={order.id} className="p-6" data-testid={`tracking-${order.id}`}>
                      <div className="mb-6">
                        <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-lg mb-1">
                          {order.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                          Order ID: #{order.id.slice(0, 8)}
                        </p>
                      </div>

                      {/* Tracking Timeline */}
                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                        <div className="space-y-6">
                          {trackingStages.map((stage, index) => {
                            const Icon = stage.icon;
                            const isComplete = currentStageIndex >= index;
                            const isCurrent = currentStageIndex === index;

                            return (
                              <div key={stage.key} className="relative flex items-center gap-4">
                                <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                                  isComplete 
                                    ? "bg-primary border-primary" 
                                    : isCurrent
                                    ? "bg-primary/20 border-primary"
                                    : "bg-background border-border"
                                }`}>
                                  <Icon className={`w-5 h-5 ${isComplete ? "text-primary-foreground" : "text-muted-foreground"}`} />
                                </div>
                                <div className="flex-1">
                                  <p className={`font-semibold ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                                    {stage.label}
                                  </p>
                                  {isCurrent && <Badge variant="secondary" className="mt-1">Current Stage</Badge>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Make New Order Tab */}
          <TabsContent value="new-order" className="space-y-6">
            <Card className="p-8">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4 text-foreground">
                Make New Order
              </h2>
              {!isVerified ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Please verify your account before making an order
                  </p>
                  <Button onClick={() => setActiveTab("profile")} data-testid="button-go-to-verification">
                    Go to Profile & Verification
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Order form will be implemented here
                  </p>
                  <Button asChild data-testid="button-start-order">
                    <a href="/">Go to Order Page</a>
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <Card className="p-8">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-4 text-foreground">
                Inbox
              </h2>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Inbox will be implemented here
                </p>
                <Button asChild data-testid="button-go-to-inbox">
                  <a href="/inbox">Open Inbox</a>
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Profile & Verification Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-8">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-6 text-foreground">
                Profile & Verification
              </h2>

              {/* Verification Status */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">Verification Status</h3>
                </div>
                <div className="flex items-center gap-2">
                  {user?.verificationStatus === "verified" ? (
                    <Badge className="bg-green-500">Verified</Badge>
                  ) : user?.verificationStatus === "pending" ? (
                    <Badge variant="secondary">Pending</Badge>
                  ) : (
                    <Badge variant="destructive">Not Verified</Badge>
                  )}
                </div>
                {user?.verificationStatus === "pending" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    We're reviewing your documents. You'll be notified within 24 hours.
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <UserIcon className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>

                  {user?.phone && (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="font-medium">{new Date(user?.createdAt!).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Upload Section */}
              {user?.verificationStatus !== "verified" && (
                <div className="mt-8">
                  <VerificationUploadForm onSuccess={() => window.location.reload()} />
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
