'use client';

import { IntegrationCard } from './IntegrationCard';
import { FiCalendar, FiGithub, FiMessageSquare, FiFileText } from 'react-icons/fi';

interface Integration {
  id: string;
  name: string;
  connected: boolean;
  accountCount?: number;
  status: 'connected' | 'disconnected';
}

interface IntegrationListProps {
  integrations: Integration[];
  connectingProvider: string | null;
  onConnect: (provider: string) => void;
  onDisconnect: (provider: string) => void;
}

const INTEGRATION_CONFIG = {
  google: {
    name: 'Google Calendar',
    description: 'Create, view, and manage your Google Calendar events',
    icon: <FiCalendar className="h-5 w-5" />
  },
  github: {
    name: 'GitHub',
    description: 'Access your GitHub repositories and manage issues',
    icon: <FiGithub className="h-5 w-5" />
  },
  slack: {
    name: 'Slack',
    description: 'Send messages and manage your Slack workspace',
    icon: <FiMessageSquare className="h-5 w-5" />
  },
  notion: {
    name: 'Notion',
    description: 'Sync your Notion pages and databases',
    icon: <FiFileText className="h-5 w-5" />
  }
};

export function IntegrationList({ integrations, connectingProvider, onConnect, onDisconnect }: IntegrationListProps) {
  const availableIntegrations = Object.entries(INTEGRATION_CONFIG).map(([id, config]) => {
    const integration = integrations.find(i => i.id === id) || {
      id,
      name: config.name,
      connected: false,
      status: 'disconnected' as const
    };

    return {
      ...integration,
      isComingSoon: !['google', 'github'].includes(id) // Only Google and GitHub are currently available
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Available Integrations</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            icon={INTEGRATION_CONFIG[integration.id as keyof typeof INTEGRATION_CONFIG]?.icon}
            description={INTEGRATION_CONFIG[integration.id as keyof typeof INTEGRATION_CONFIG]?.description || ''}
            connectingProvider={connectingProvider}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            isComingSoon={integration.isComingSoon}
          />
        ))}
      </div>
    </div>
  );
}
