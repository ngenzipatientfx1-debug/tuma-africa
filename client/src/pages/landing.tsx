import { Button } from "@/components/ui/button";
import { Package, Globe, TrendingUp, Shield, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="font-['Plus_Jakarta_Sans'] text-6xl md:text-7xl font-bold mb-6 text-foreground">
              Your Gateway to
              <span className="block text-primary mt-2">Global Shopping</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Buy products from China and get them delivered across Africa with ease, transparency, and trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                asChild
                data-testid="button-get-started"
              >
                <a href="/api/login">Get Started</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 backdrop-blur-sm"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-how-it-works"
              >
                How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-5xl font-semibold mb-4 text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to get your products from China to Africa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Globe,
                step: "01",
                title: "Paste Product Link",
                description: "Copy and paste any product link from Chinese e-commerce sites like Taobao, 1688, or AliExpress"
              },
              {
                icon: Package,
                step: "02",
                title: "We Purchase & Ship",
                description: "Our team purchases the item, inspects quality, and ships it to our African warehouse"
              },
              {
                icon: TrendingUp,
                step: "03",
                title: "Track & Receive",
                description: "Monitor your order in real-time with our visual tracking system and receive at your doorstep"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
                data-testid={`feature-step-${index + 1}`}
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="text-primary font-['JetBrains_Mono'] text-sm font-semibold mb-2">
                  STEP {item.step}
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-semibold mb-3 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Secure & Trustworthy",
                description: "Your orders are protected with quality inspection and secure payment handling"
              },
              {
                icon: Clock,
                title: "Fast Delivery",
                description: "Regular shipments and efficient logistics ensure your products arrive quickly"
              },
              {
                icon: Users,
                title: "Dedicated Support",
                description: "Our team is here to help you every step of the way with responsive communication"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-card border border-card-border hover-elevate"
                data-testid={`trust-feature-${index + 1}`}
              >
                <item.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-semibold mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-['Plus_Jakarta_Sans'] text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of satisfied customers across Africa
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              asChild
              data-testid="button-cta-start"
            >
              <a href="/api/login">Start Your Order</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-card-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Tuma-Africa Link Cargo. Your trusted partner in global shopping.
          </p>
        </div>
      </footer>
    </div>
  );
}
