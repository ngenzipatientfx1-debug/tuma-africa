import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, LogOut, Settings, Globe, Image, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, HeroContent, AboutUs, Company, SocialMediaLink, TermsPolicy } from "@shared/schema";

export default function SuperAdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("homepage");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "super_admin")) {
      toast({ title: "Access Denied", description: "Super Admin access required.", variant: "destructive" });
      setTimeout(() => window.location.href = "/", 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === "super_admin",
  });

  const { data: heroContent = [] } = useQuery<HeroContent[]>({
    queryKey: ["/api/super-admin/hero"],
    enabled: isAuthenticated && user?.role === "super_admin",
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest("PATCH", `/api/super-admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User role updated successfully" });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-foreground">Super Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default">Super Admin</Badge>
            <Button variant="ghost" asChild><a href="/">Home</a></Button>
            <Button variant="ghost" size="icon" onClick={() => window.location.href = "/api/logout"}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold mb-6 text-foreground">Super Admin Control</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="homepage">Homepage Management</TabsTrigger>
            <TabsTrigger value="users">User Roles</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="homepage" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Hero Content</h2>
              <p className="text-muted-foreground mb-4">Manage homepage hero section</p>
              <div className="space-y-4">
                {heroContent.map(content => (
                  <div key={content.id} className="p-4 border rounded-lg">
                    <p className="font-semibold">{content.heading}</p>
                    <p className="text-sm text-muted-foreground">{content.subheading}</p>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground italic">Hero content editor will be implemented here</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">About Us</h2>
              <p className="text-muted-foreground italic">About us content editor will be implemented here</p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Companies Showcase</h2>
              <p className="text-muted-foreground italic">Companies management will be implemented here (max 10)</p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Social Media Links</h2>
              <p className="text-muted-foreground italic">Social media links editor will be implemented here</p>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">User Role Management</h2>
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 border-b last:border-0">
                  <div>
                    <p className="font-semibold">{u.firstName} {u.lastName}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={u.role} onValueChange={(role) => updateRoleMutation.mutate({ userId: u.id, role })}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Terms & Privacy Policy</h2>
              <p className="text-muted-foreground italic">Policy editor will be implemented here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
