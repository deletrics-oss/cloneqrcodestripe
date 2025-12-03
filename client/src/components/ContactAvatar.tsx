import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ContactAvatarProps {
    deviceId?: string;
    contactId?: string;
    name?: string;
    className?: string;
}

export function ContactAvatar({ deviceId, contactId, name, className }: ContactAvatarProps) {
    // Logic to construct image URL if backend supports it
    // For now, we'll assume a standard path or just use initials
    const imageUrl = deviceId && contactId
        ? `/api/whatsapp/contacts/${deviceId}/${contactId}/pic`
        : undefined;

    const initials = name
        ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "?";

    return (
        <Avatar className={cn("h-10 w-10", className)}>
            <AvatarImage src={imageUrl} alt={name || "Contact"} />
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
    );
}
