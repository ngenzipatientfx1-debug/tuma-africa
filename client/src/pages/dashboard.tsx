import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, LogOut, Home, MessageSquare, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

const statusConfig = {
  submitted: { label: "Submitted", color: "bg-blue-500", icon: Circle },
  purchased: { label: "Purchased", color: "bg-purple-500", icon: CheckCircle2 },
  warehouse: { label: "In Warehouse", color: "bg-yellow-500", icon: Package },
  shipping: { label: "Shipping", color: "bg-orange-500", icon: Clock },
  "in-country": { label: "In Country", color: "bg-teal-500", icon: CheckCircle2 },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle2 },
};

const statusOrder = ["submitted", "purchased", "warehouse", "shipping", "in-country", "delivered"];

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
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

  const activeOrders = orders?.filter(o => o.status !== "delivered") || [];
  const deliveredOrders = orders?.filter(o => o.status === "delivered") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-foreground">
              Tuma-Africa
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild data-testid="link-home">
              <a href="/">
                <Home className="w-5 h-5 mr-2" />
                Home
              </a>
            </Button>
            <Button variant="ghost" asChild data-testid="link-inbox">
              <a href="/inbox">
                <MessageSquare className="w-5 h-5 mr-2" />
                Inbox
              </a>
            </Button>
            {user?.isAdmin === 1 && (
              <Button variant="ghost" asChild data-testid="link-admin">
                <a href="/admin">Admin</a>
              </Button>
            )}
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
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track and manage your purchases
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Orders", value: activeOrders.length, color: "text-primary" },
            { label: "Delivered", value: deliveredOrders.length, color: "text-green-600" },
            { label: "Total Orders", value: orders?.length || 0, color: "text-foreground" },
            { label: "In Transit", value: orders?.filter(o => o.status === "shipping").length || 0, color: "text-orange-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6" data-testid={`stat-card-${index}`}>
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

        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-6">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-semibold mb-4 text-foreground">
                  Active Orders
                </h2>
                <div className="space-y-4">
                  {activeOrders.map((order, index) => (
                    <OrderCard key={order.id} order={order} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Delivered Orders */}
            {deliveredOrders.length > 0 && (
              <div className="mt-8">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-semibold mb-4 text-foreground">
                  Delivered Orders
                </h2>
                <div className="space-y-4">
                  {deliveredOrders.map((order, index) => (
                    <OrderCard key={order.id} order={order} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-semibold mb-2 text-foreground">
              No orders yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start shopping and your orders will appear here
            </p>
            <Button asChild data-testid="button-start-shopping">
              <a href="/">Start Shopping</a>
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const currentStatusIndex = statusOrder.indexOf(order.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      data-testid={`order-card-${order.id}`}
    >
      <Card className="p-6 hover-elevate">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-['JetBrains_Mono'] text-sm text-muted-foreground" data-testid={`order-id-${order.id}`}>
                #{order.id.slice(0, 8)}
              </span>
              <Badge variant={order.status === "delivered" ? "default" : "secondary"} data-testid={`order-status-${order.id}`}>
                {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
              </Badge>
              {order.trackingNumber && (
                <span className="text-xs text-muted-foreground font-['JetBrains_Mono']" data-testid={`tracking-${order.id}`}>
                  Track: {order.trackingNumber}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 break-all" data-testid={`product-link-${order.id}`}>
              {order.productLink}
            </p>

            {/* Visual Timeline */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {statusOrder.map((status, idx) => {
                const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Circle;
                const isActive = idx === currentStatusIndex;
                const isCompleted = idx < currentStatusIndex;
                const isFuture = idx > currentStatusIndex;

                return (
                  <div key={status} className="flex items-center" data-testid={`timeline-step-${status}`}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs mt-1 whitespace-nowrap ${
                        isActive ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}>
                        {statusConfig[status as keyof typeof statusConfig]?.label.split(" ")[0]}
                      </span>
                    </div>
                    {idx < statusOrder.length - 1 && (
                      <div className={`h-0.5 w-8 mx-1 ${
                        isCompleted ? "bg-green-500" : "bg-muted"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild data-testid={`button-view-${order.id}`}>
              <a href={`/order/${order.id}`}>
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
            {order.status !== "delivered" && (
              <Button variant="ghost" size="sm" asChild data-testid={`button-contact-${order.id}`}>
                <a href="/inbox">Contact Support</a>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
