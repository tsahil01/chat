'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Separator } from '@workspace/ui/components/separator';
import { Card, CardContent } from '@workspace/ui/components/card';
import { ChatList } from '@/components/chat/ChatList';
import { PaginationControls } from '@/components/chat/PaginationControls';
import { authClient } from '@/lib/auth-client';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ChatsResponse {
  chats: Chat[];
  pagination: PaginationInfo;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: session, isPending } = authClient.useSession();
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = 10;

  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.push('/');
      return;
    }

    fetchChats();
  }, [session, isPending, router, currentPage]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/conversations?page=${currentPage}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      
      const data: ChatsResponse = await response.json();
      setChats(data.chats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };



  if (isPending) {
    return (
      <div className="flex flex-col max-w-4xl mx-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Separator />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] max-w-4xl mx-auto p-4">
      <div className="flex-1 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your Chats</h1>
            <p className="text-sm text-muted-foreground">
              {pagination ? (
                `Showing ${((currentPage - 1) * limit) + 1}-${Math.min(currentPage * limit, pagination.totalCount)} of ${pagination.totalCount} conversations`
              ) : (
                `${chats.length} conversation${chats.length !== 1 ? 's' : ''}`
              )}
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="shrink-0">
            New Chat
          </Button>
        </div>
        
        <Separator />

        {/* Chats List */}
        <ChatList
          chats={chats}
          loading={loading}
          error={error}
          onChatClick={handleChatClick}
          onNewChat={() => router.push('/')}
          onRetry={fetchChats}
        />

        {/* Pagination Controls */}
        <PaginationControls
          pagination={pagination}
          currentPage={currentPage}
          buildPageUrl={(page) => `?page=${page}`}
        />
      </div>
    </div>
  );
}
