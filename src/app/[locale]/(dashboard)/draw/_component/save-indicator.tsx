import { Button } from "@/components/ui/button";
import { Check, CircleSmall, Loader2 } from "lucide-react";
import { memo } from "react";

function SaveIndicator({ status }: { status: string }) {
    if (status === "idle") return null;
    let content = null;

    switch (status) {
        case "unsaved":
            content = <CircleSmall color="#f0b100" size={24} fill="#f0b100" />;
            break;
        case "saving":
            content = <Loader2 size={16} className="animate-spin" />;
            break;
        case "saved":
            content = <Check size={16} />;
            break;
    }

    return (
        <Button variant="ghost">
            {content}
        </Button>
    );
}

export default memo(SaveIndicator);