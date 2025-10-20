import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Package, LogOut, Home, Send, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message, Order } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Inbox() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders } = useQuery<Order[]>({
    queryKey: user?.isAdmin === 1 ? ["/api/admin/messages"] : ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedOrderId],
    queryFn: async () => {
      const response = await fetch(`/api/messages/${selectedOrderId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
    enabled: isAuthenticated && !!selectedOrderId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        orderId: selectedOrderId,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedOrderId] });
      setMessageText("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (orders && orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const selectedOrder = orders?.find(o => o.id === selectedOrderId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <Button variant="ghost" asChild data-testid="link-dashboard">
              <a href="/dashboard">My Orders</a>
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
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold mb-2 text-foreground">
            Inbox
          </h1>
          <p className="text-muted-foreground">
            Chat with support about your orders
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-semibold mb-2 text-foreground">
              No orders yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Place an order first to start chatting with support
            </p>
            <Button asChild data-testid="button-start-shopping">
              <a href="/">Start Shopping</a>
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            {/* Order List */}
            <Card className="lg:col-span-1 p-4 overflow-y-auto">
              <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold mb-4 text-foreground">
                Your Orders
              </h2>
              <div className="space-y-2">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedOrderId === order.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover-elevate"
                    }`}
                    data-testid={`order-${order.id}`}
                  >
                    <div className="font-['JetBrains_Mono'] text-xs mb-1">
                      #{order.id.slice(0, 8)}
                    </div>
                    <div className="text-sm truncate">
                      {order.productLink.slice(0, 50)}...
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 flex flex-col overflow-hidden">
              {selectedOrder && (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-card-border">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-foreground">
                      Order #{selectedOrder.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedOrder.productLink}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto" data-testid="messages-container">
                    {messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${message.senderId === user?.id ? "flex-row-reverse" : "flex-row"}`}>
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className={message.isAdminMessage ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                  {message.isAdminMessage ? "A" : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`p-3 rounded-lg ${
                                  message.senderId === user?.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.createdAt!).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-card-border">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (messageText.trim()) {
                          sendMessageMutation.mutate(messageText);
                        }
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={sendMessageMutation.isPending}
                        data-testid="input-message"
                      />
                      <Button
                        type="submit"
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        data-testid="button-send"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
