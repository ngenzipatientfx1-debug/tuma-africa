import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  currentLang: "en" | "rw";
  onLanguageChange: (lang: "en" | "rw") => void;
}

export function LanguageSwitcher({ currentLang, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onLanguageChange(currentLang === "en" ? "rw" : "en")}
      className="gap-2"
      data-testid="button-language-switcher"
    >
      <Globe className="w-4 h-4" />
      {currentLang === "en" ? "Kinyarwanda" : "English"}
    </Button>
  );
}
