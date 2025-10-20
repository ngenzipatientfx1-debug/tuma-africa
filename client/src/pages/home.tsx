import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, Package, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import OrderForm from "@/components/order-form";

export default function Home() {
  const { user } = useAuth();
  const [productLink, setProductLink] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handlePasteLink = () => {
    if (productLink.trim()) {
      setShowOrderForm(true);
    }
  };

  const handleBack = () => {
    setShowOrderForm(false);
    setProductLink("");
  };

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
            <Button
              variant="ghost"
              asChild
              data-testid="link-dashboard"
            >
              <a href="/dashboard">My Orders</a>
            </Button>
            <Button
              variant="ghost"
              asChild
              data-testid="link-inbox"
            >
              <a href="/inbox">Inbox</a>
            </Button>
            {user?.isAdmin === 1 && (
              <Button
                variant="ghost"
                asChild
                data-testid="link-admin"
              >
                <a href="/admin">Admin</a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                queryClient.clear();
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
      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!showOrderForm ? (
            <motion.div
              key="link-box"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-['Plus_Jakarta_Sans'] text-5xl md:text-6xl font-bold mb-4 text-foreground"
                >
                  What would you like to buy?
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-muted-foreground"
                >
                  Paste a link from Taobao, 1688, AliExpress, or any Chinese e-commerce site
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8">
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://item.taobao.com/..."
                        value={productLink}
                        onChange={(e) => setProductLink(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handlePasteLink()}
                        className="pl-10 h-14 text-lg"
                        data-testid="input-product-link"
                      />
                    </div>
                    <Button
                      size="lg"
                      onClick={handlePasteLink}
                      disabled={!productLink.trim()}
                      className="h-14 text-lg"
                      data-testid="button-continue"
                    >
                      Continue
                    </Button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-card-border">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Supported platforms
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {["Taobao", "1688.com", "AliExpress", "Tmall"].map((platform) => (
                        <div
                          key={platform}
                          className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground"
                          data-testid={`platform-${platform.toLowerCase().replace(".", "-")}`}
                        >
                          {platform}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 grid grid-cols-3 gap-4"
              >
                {[
                  { label: "Orders Delivered", value: "10,000+" },
                  { label: "Happy Customers", value: "5,000+" },
                  { label: "Countries Served", value: "20+" }
                ].map((stat, index) => (
                  <div key={index} className="text-center" data-testid={`stat-${index}`}>
                    <div className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="order-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <OrderForm
                productLink={productLink}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
