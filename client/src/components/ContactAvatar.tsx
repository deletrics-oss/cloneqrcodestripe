import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ContactAvatarProps {
    deviceId?: string;
    contactId?: string; // Pode ser o número de telefone ou ID serializado
    name?: string;
    className?: string;
}

export function ContactAvatar({ deviceId, contactId, name, className }: ContactAvatarProps) {
    // Constrói a URL para buscar a foto no backend
    // O backend precisará implementar essa rota
    const imageUrl = deviceId && contactId
        ? `/api/whatsapp/contacts/${deviceId}/${encodeURIComponent(contactId)}/pic`
        : undefined;

    const initials = name
        ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "?";

    return (
        <Avatar className={cn("h-10 w-10", className)}>
            <AvatarImage src={imageUrl} alt={name || "Contact"} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
