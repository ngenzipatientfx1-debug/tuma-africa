import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Upload } from "lucide-react";

export function VerificationUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idPhoto || !selfie) {
      toast({
        title: "Missing Documents",
        description: "Please upload both ID photo and selfie",
        variant: "destructive",
      });
      return;
    }

    // Check file sizes (≤2MB each)
    if (idPhoto.size > 2 * 1024 * 1024 || selfie.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Each file must be ≤2 MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("idPhoto", idPhoto);
      formData.append("selfie", selfie);

      const response = await fetch("/api/verification/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast({
        title: "Thanks — we've received your info",
        description: "English: We'll check it and let you know within 24 hours. | Kinyarwanda: Murakoze twakiriye ubutumwa bwanyu, mwihangane mu gihe tukiri kugenzura.",
        duration: 10000,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Account Verification</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Upload your government ID and a selfie holding your ID to verify your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="idPhoto">Government ID (≤2 MB)</Label>
          <Input
            id="idPhoto"
            type="file"
            accept="image/*"
            onChange={(e) => setIdPhoto(e.target.files?.[0] || null)}
            data-testid="input-id-photo"
          />
        </div>

        <div>
          <Label htmlFor="selfie">Selfie with ID (≤2 MB)</Label>
          <Input
            id="selfie"
            type="file"
            accept="image/*"
            onChange={(e) => setSelfie(e.target.files?.[0] || null)}
            data-testid="input-selfie"
          />
        </div>

        <Button type="submit" disabled={uploading || !idPhoto || !selfie} className="w-full" data-testid="button-submit-verification">
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Submit for Verification"}
        </Button>
      </form>
    </Card>
  );
}
