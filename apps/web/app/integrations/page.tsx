'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { User } from 'better-auth';
import { IntegrationList } from '@/components/integrations/IntegrationList';
import { SuccessMessage } from '@/components/integrations/SuccessMessage';
import { LoadingState } from '@/components/integrations/LoadingState';
import { AuthRequired } from '@/components/integrations/AuthRequired';
import { useIntegrations } from '@/hooks/useIntegrations';

export default function IntegrationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    integrations,
    connectingProvider,
    showSuccessMessage,
    successMessage,
    linkAccount,
    disconnectIntegration
  } = useIntegrations();

  useEffect(() => {
    async function getSession() {
      try {
        const { data: session } = await authClient.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getSession();
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your accounts to unlock powerful features and streamline your workflow.
          </p>
        </div>

        {/* Success Message */}
        <SuccessMessage 
          show={showSuccessMessage} 
          message={successMessage} 
        />

        {/* Integration List */}
        <IntegrationList
          integrations={integrations}
          connectingProvider={connectingProvider}
          onConnect={linkAccount}
          onDisconnect={disconnectIntegration}
        />
      </div>
    </div>
  );
}
