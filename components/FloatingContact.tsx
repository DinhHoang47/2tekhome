import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingContact() {
  const phoneNumber = "1900-xxxx"; // Thay bằng số điện thoại thực của bạn
  const messengerLink = "https://m.me/your-page-id"; // Thay bằng link Messenger của bạn

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Messenger Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-[#0084FF] hover:bg-[#0073E6] text-white"
              onClick={() => window.open(messengerLink, "_blank")}
              data-testid="button-contact-messenger"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Chat qua Messenger</p>
          </TooltipContent>
        </Tooltip>

        {/* Phone Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.href = `tel:${phoneNumber}`}
              data-testid="button-contact-phone"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Gọi điện: {phoneNumber}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
