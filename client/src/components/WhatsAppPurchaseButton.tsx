import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface WhatsAppPurchaseButtonProps {
  courseName: string;
  price: number;
  whatsappNumber?: string;
  variant?: "default" | "outline";
}

export function WhatsAppPurchaseButton({
  courseName,
  price,
  whatsappNumber = "9647801234567", // Default Iraqi number format
  variant = "default",
}: WhatsAppPurchaseButtonProps) {
  const handlePurchase = () => {
    const message = encodeURIComponent(
      `Hello! I'm interested in purchasing the course "${courseName}" for $${price}. Please provide payment details.`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    console.log('Opening WhatsApp for course:', courseName);
  };

  return (
    <Button
      onClick={handlePurchase}
      variant={variant}
      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white border-[#25D366] hover:border-[#20BA5A]"
      data-testid="button-whatsapp-purchase"
    >
      <SiWhatsapp className="h-5 w-5 mr-2" />
      Buy via WhatsApp (${price})
    </Button>
  );
}
