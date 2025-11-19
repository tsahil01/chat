import { useEffect, useCallback } from "react";
import { AnnouncementToastOptions } from "@workspace/ui/components/announcement-toast";
import { markAnnouncementToastSeen } from "@workspace/ui/components/announcement-toast";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

type AnnouncementToastContentProps = {
  toastId: string | number;
  options: AnnouncementToastOptions & { persistSeen: boolean };
  onClose?: () => void;
};

export function AnnouncementToastContent({
  toastId,
  options,
  onClose,
}: AnnouncementToastContentProps) {
  const {
    id,
    title,
    description,
    action,
    extendedContent,
    extendedTitle,
    dismissLabel,
    persistSeen,
    highlights,
    onDismiss,
    onAction,
  } = options;

  useEffect(() => {
    if (persistSeen) {
      markAnnouncementToastSeen(id);
    }
  }, [id, persistSeen]);

  const handleDismiss = useCallback(() => {
    toast.dismiss(toastId);
    onClose?.();
    onDismiss?.();
    if (persistSeen) {
      markAnnouncementToastSeen(id);
    }
  }, [toastId, onClose, onDismiss, persistSeen, id]);

  const handleActionClick = useCallback(() => {
    action?.onClick?.();
    onAction?.();
    toast.dismiss(toastId);
    onClose?.();
    if (persistSeen) {
      markAnnouncementToastSeen(id);
    }
  }, [action, onAction, toastId, onClose, persistSeen, id]);

  useEffect(() => {
    return () => {
      onClose?.();
    };
  }, [onClose]);

  const renderAction = () => {
    if (!action) return null;

    const button = (
      <Button
        size="sm"
        variant={action.variant ?? "default"}
        onClick={action.href ? undefined : handleActionClick}
      >
        {action.label}
      </Button>
    );

    if (action.href) {
      return (
        <Button
          asChild
          size="sm"
          variant={action.variant ?? "default"}
          onClick={handleActionClick}
        >
          <a href={action.href} target={action.target} rel={action.rel}>
            {action.label}
          </a>
        </Button>
      );
    }

    return button;
  };

  const renderDismissButton = () => {
    if (!dismissLabel) return null;

    return (
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground"
        onClick={handleDismiss}
      >
        {dismissLabel}
      </Button>
    );
  };

  return (
    <Card
      className={cn(
        "focus-visible:ring-ring/30 pointer-events-auto focus-visible:ring-2 focus-visible:outline-none sm:max-w-lg",
      )}
    >
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <CardTitle className="text-sm">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {extendedTitle && extendedContent && (
          <div className="bg-muted/40 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              {extendedTitle}
            </p>
            <p className="text-foreground mt-1 text-sm">{extendedContent}</p>
          </div>
        )}
        <div className="space-y-3">
          <h4 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Highlights
          </h4>
          <div className="grid gap-3">
            {highlights &&
              highlights.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="bg-primary mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  <div className="space-y-1">
                    <p className="text-foreground text-sm font-medium">
                      {item.title}
                    </p>
                    {item.description ? (
                      <p className="text-muted-foreground hidden text-sm md:block">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
      {(action || dismissLabel) && (
        <CardFooter className="flex flex-wrap items-center gap-2">
          {renderAction()}
          {renderDismissButton()}
        </CardFooter>
      )}
    </Card>
  );
}
