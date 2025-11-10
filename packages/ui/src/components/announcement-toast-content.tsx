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
        "pointer-events-auto sm:max-w-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
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
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {extendedTitle}
            </p>
            <p className="mt-1 text-sm text-foreground">{extendedContent}</p>
          </div>
        )}
        <div className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Highlights
          </h4>
          <div className="grid gap-3">
            {highlights &&
              highlights.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.description ? (
                      <p className="text-sm text-muted-foreground hidden md:block">
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
