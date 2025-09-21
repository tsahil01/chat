'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface Integration {
  id: string;
  name: string;
  connected: boolean;
  accountCount?: number;
  status: 'connected' | 'disconnected';
}

interface IntegrationCardProps {
  integration: Integration;
  icon: React.ReactNode;
  description: string;
  connectingProvider: string | null;
  onConnect: (provider: string) => void;
  onDisconnect: (provider: string) => void;
  isComingSoon?: boolean;
}

export function IntegrationCard({
  integration,
  icon,
  description,
  connectingProvider,
  onConnect,
  onDisconnect,
  isComingSoon = false
}: IntegrationCardProps) {
  const isConnecting = connectingProvider === integration.id;
  return (
    <Card className={isComingSoon ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {integration.name}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant={integration.connected ? "outline" : "default"}
              size="sm"
              onClick={() => onConnect(integration.id)}
              disabled={isConnecting || isComingSoon}
            >
               {integration.connected ? 'Re-link' : 'Connect'}
            </Button>
          {integration.connected && !isComingSoon && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDisconnect(integration.id)}
              >
                Disconnect
              </Button>
            </div>
          )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
