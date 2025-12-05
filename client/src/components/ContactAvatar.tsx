import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ContactAvatarProps {
    deviceId?: string;
    contactId?: string;
    name?: string;
    profilePicUrl?: string | null;
    className?: string;
}

export function ContactAvatar({ deviceId, contactId, name, profilePicUrl, className }: ContactAvatarProps) {
    // Use provided URL or fallback to API
    const imageUrl = profilePicUrl || (deviceId && contactId
        ? `/api/whatsapp/contacts/${deviceId}/${encodeURIComponent(contactId)}/pic`
        : undefined);

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
