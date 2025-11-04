"use client";

import { useState, useEffect } from "react";
import { buildOAuthUrl } from "@/lib/integrations";

interface Integration {
  id: string;
  name: string;
  connected: boolean;
  accountCount?: number;
  lastConnected?: string;
  status: "connected" | "disconnected";
  accounts?: Array<{
    id: string;
    email: string;
    name: string;
    connectedAt: string;
    status: "active" | "expired";
  }>;
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null,
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations");
      const data = await response.json();

      if (data.success) {
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const linkAccount = async (provider: string) => {
    setConnectingProvider(provider);
    try {
      const oauthUrl = buildOAuthUrl(provider as "github" | "google");
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(`Failed to link ${provider} account:`, error);
      setConnectingProvider(null);
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    setDisconnectingId(integrationId);
    try {
      const response = await fetch(
        `/api/integrations/${integrationId}/disconnect`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (response.ok) {
        await fetchIntegrations();
      } else {
        console.error("Disconnect error:", data.error);
      }
    } catch (error) {
      console.error("Error disconnecting integration:", error);
    } finally {
      setDisconnectingId(null);
    }
  };

  const checkSuccessMessage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("linked") === "success") {
      const provider = urlParams.get("provider") || "account";
      const providerName = getProviderDisplayName(provider);
      setSuccessMessage(`${providerName} account linked successfully!`);
      setShowSuccessMessage(true);
      // Remove the parameter from URL
      window.history.replaceState({}, "", "/integrations");
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const getProviderDisplayName = (provider: string): string => {
    switch (provider) {
      case "google":
        return "Google";
      case "github":
        return "GitHub";
      case "slack":
        return "Slack";
      case "notion":
        return "Notion";
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    checkSuccessMessage();
  }, []);

  return {
    integrations,
    isLoading,
    connectingProvider,
    showSuccessMessage,
    successMessage,
    linkAccount,
    disconnectIntegration,
    disconnectingId,
    refetch: fetchIntegrations,
  };
}
