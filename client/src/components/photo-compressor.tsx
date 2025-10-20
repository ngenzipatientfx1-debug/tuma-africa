import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";

export function PhotoCompressor() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const handleCompress = async () => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 15 MB",
        variant: "destructive",
      });
      return;
    }

    setCompressing(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/compress-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Compression failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);

      toast({
        title: "Photo Compressed",
        description: "Your photo has been compressed to 100-150 KB",
      });
    } catch (error) {
      toast({
        title: "Compression Failed",
        description: "Failed to compress photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = `compressed-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(compressedUrl);
    setCompressedUrl(null);
    setFile(null);
  };

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold mb-2">Photo Compressor</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a photo up to 15 MB to get a compressed version between 100 and 150 KB.
      </p>

      <div className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          data-testid="input-photo-upload"
        />

        {file && !compressedUrl && (
          <Button onClick={handleCompress} disabled={compressing} className="w-full" data-testid="button-compress">
            <Upload className="w-4 h-4 mr-2" />
            {compressing ? "Compressing..." : "Compress Photo"}
          </Button>
        )}

        {compressedUrl && (
          <Button onClick={handleDownload} className="w-full" data-testid="button-download-compressed">
            <Download className="w-4 h-4 mr-2" />
            Download Compressed Photo
          </Button>
        )}
      </div>
    </Card>
  );
}
