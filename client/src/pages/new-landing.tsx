import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Package, Globe, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { PhotoCompressor } from "@/components/photo-compressor";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

export default function NewLanding() {
  const [language, setLanguage] = useState<Language>("en");
  const { t } = useTranslation(language);
  
  const [productLink, setProductLink] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [variation, setVariation] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will redirect to login if not authenticated
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-foreground">
              {t("appName")}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-muted-foreground hover:text-foreground">{t("home")}</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground">{t("aboutHeading")}</a>
            <a href="#terms" className="text-muted-foreground hover:text-foreground">{t("termsPrivacy")}</a>
            <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
            <Button asChild data-testid="button-login">
              <a href="/api/login">{t("login")} / {t("signup")}</a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-primary/10 via-background to-background py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-['Plus_Jakarta_Sans'] text-5xl md:text-6xl font-bold mb-6 text-foreground">
              {t("heroHeading")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              {t("heroSubheading")}
            </p>
            <p className="text-lg text-primary font-semibold mb-8">
              {t("heroTagline")}
            </p>
            <Button size="lg" asChild data-testid="button-get-started">
              <a href="#order">{t("heroButton")}</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Link Paste / Order Form */}
      <section id="order" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-8">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold mb-4 text-center">
              {t("linkPasteHeading")}
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              {t("linkPasteDesc")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="productLink">{t("productLink")} *</Label>
                <Input
                  id="productLink"
                  type="url"
                  required
                  value={productLink}
                  onChange={(e) => setProductLink(e.target.value)}
                  placeholder="https://item.taobao.com/..."
                  data-testid="input-product-link"
                />
              </div>

              <div>
                <Label htmlFor="productName">{t("productName")} *</Label>
                <Input
                  id="productName"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  data-testid="input-product-name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">{t("quantity")} *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    data-testid="input-quantity"
                  />
                </div>

                <div>
                  <Label htmlFor="screenshot">{t("screenshot")} (≤150 KB)</Label>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    data-testid="input-screenshot"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="variation">{t("variation")}</Label>
                <Input
                  id="variation"
                  value={variation}
                  onChange={(e) => setVariation(e.target.value)}
                  data-testid="input-variation"
                />
              </div>

              <div>
                <Label htmlFor="specifications">{t("specifications")}</Label>
                <Textarea
                  id="specifications"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  data-testid="textarea-specifications"
                />
              </div>

              <div>
                <Label htmlFor="shippingAddress">{t("shippingAddress")} *</Label>
                <Textarea
                  id="shippingAddress"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  data-testid="textarea-shipping-address"
                />
              </div>

              <div>
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="textarea-notes"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" data-testid="button-submit-order">
                {t("submitOrder")}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                {t("verificationRequired")}
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* Photo Compressor */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <PhotoCompressor />
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold mb-4">
            {t("aboutHeading")}
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            {t("aboutSubheading")}
          </p>
          <p className="text-muted-foreground">
            We connect African buyers with Chinese e-commerce platforms, handling everything from product sourcing to shipping. Our mission is to make international shopping simple, reliable, and stress-free.
          </p>
        </div>
      </section>

      {/* Social Media Links */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" data-testid="link-facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" data-testid="link-instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" data-testid="link-youtube">
                <Youtube className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" data-testid="link-twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Companies */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-8">{t("ourCompanies")}</h3>
          <p className="text-center text-muted-foreground">
            Companies showcase will be managed by Super Admin
          </p>
        </div>
      </section>

      {/* Terms & Privacy */}
      <section id="terms" className="py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h3 className="text-2xl font-bold mb-4">{t("termsPrivacy")}</h3>
          <p className="text-muted-foreground mb-6">
            Read our terms of service and privacy policy to understand how we protect your data and ensure fair transactions.
          </p>
          <Button variant="outline">Read Full Policy</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-card-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {t("copyright")}
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="#home" className="text-muted-foreground hover:text-foreground">{t("home")}</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground">{t("aboutHeading")}</a>
            <a href="#terms" className="text-muted-foreground hover:text-foreground">{t("termsPrivacy")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
