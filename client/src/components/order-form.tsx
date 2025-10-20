import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrderFormProps {
  productLink: string;
  onBack: () => void;
}

export default function OrderForm({ productLink, onBack }: OrderFormProps) {
  const [quantity, setQuantity] = useState("1");
  const [variation, setVariation] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Submitted!",
        description: "Your order has been successfully submitted. You can track it in your dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit order",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 150 * 1024) {
      toast({
        title: "File too large",
        description: "Screenshot must be less than 150KB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("productLink", productLink);
    formData.append("quantity", quantity);
    formData.append("variation", variation);
    formData.append("specifications", specifications);
    if (screenshot) {
      formData.append("screenshot", screenshot);
    }

    createOrderMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8">
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold mb-2 text-foreground">
            Order Details
          </h2>
          <p className="text-muted-foreground mb-8">
            Fill in the details to complete your order
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Link Display */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Product Link</Label>
              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground break-all font-['JetBrains_Mono']" data-testid="text-product-link">
                {productLink}
              </div>
            </div>

            {/* Screenshot Upload */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Product Screenshot (Optional, max 150KB)
              </Label>
              {!screenshot ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-card-border hover-elevate"
                  }`}
                  data-testid="dropzone-screenshot"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    Drag and drop your screenshot here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 150KB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    data-testid="input-file"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative border border-card-border rounded-lg overflow-hidden"
                  data-testid="preview-screenshot"
                >
                  <img
                    src={previewUrl!}
                    alt="Screenshot preview"
                    className="w-full h-64 object-contain bg-muted"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setScreenshot(null);
                      setPreviewUrl(null);
                    }}
                    data-testid="button-remove-screenshot"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    <Check className="w-3 h-3 inline mr-1" />
                    {(screenshot.size / 1024).toFixed(1)}KB
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                data-testid="input-quantity"
              />
            </div>

            {/* Variation */}
            <div>
              <Label htmlFor="variation" className="text-sm font-medium mb-2 block">
                Variation (Color, Size, etc.)
              </Label>
              <Input
                id="variation"
                placeholder="e.g., Black, Size L"
                value={variation}
                onChange={(e) => setVariation(e.target.value)}
                data-testid="input-variation"
              />
            </div>

            {/* Specifications */}
            <div>
              <Label htmlFor="specifications" className="text-sm font-medium mb-2 block">
                Additional Specifications
              </Label>
              <Textarea
                id="specifications"
                placeholder="Any special requests or details..."
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                rows={4}
                data-testid="textarea-specifications"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg"
              disabled={createOrderMutation.isPending}
              data-testid="button-submit-order"
            >
              {createOrderMutation.isPending ? "Submitting..." : "Submit Order"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
