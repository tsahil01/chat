'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Separator } from '@workspace/ui/components/separator';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
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

interface SearchResponse {
  chats: Chat[];
  pagination: PaginationInfo;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function ChatsPageContent() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: session, isPending } = authClient.useSession();
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  
  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.push('/');
      return;
    }

    // Initialize search query from URL params
    const urlQuery = searchParams.get('q') || '';
    setSearchQuery(urlQuery);
  }, [session, isPending, router, searchParams]);

  useEffect(() => {
    if (isPending || !session) return;
    
    if (debouncedSearchQuery.trim()) {
      searchChats();
    } else {
      // Show recent chats when no search query
      fetchChats();
    }
  }, [debouncedSearchQuery, currentPage, session, isPending]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
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

  const searchChats = useCallback(async () => {
    if (!debouncedSearchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/chat/search?q=${encodeURIComponent(debouncedSearchQuery)}&page=${currentPage}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search chats');
      }
      
      const data: SearchResponse = await response.json();
      setChats(data.chats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, limit]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('q', value);
      params.set('page', '1'); // Reset to first page on new search
    } else {
      params.delete('q');
      params.delete('page');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/chats';
    router.replace(newUrl, { scroll: false });
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
          <Skeleton className="h-10 w-full" />
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
            <h1 className="text-2xl font-semibold tracking-tight">
              {debouncedSearchQuery.trim() ? 'Search Results' : 'Your Chats'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {debouncedSearchQuery.trim() ? (
                pagination ? (
                  `Found ${pagination.totalCount} result${pagination.totalCount !== 1 ? 's' : ''} for "${debouncedSearchQuery}"`
                ) : (
                  'Search through your conversations'
                )
              ) : (
                pagination ? (
                  `Showing ${((currentPage - 1) * limit) + 1}-${Math.min(currentPage * limit, pagination.totalCount)} of ${pagination.totalCount} conversations`
                ) : (
                  `${chats.length} conversation${chats.length !== 1 ? 's' : ''}`
                )
              )}
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="shrink-0">
            New Chat
          </Button>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pr-10"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          )}
        </div>
        
        <Separator />

        {/* Chats List */}
        <ChatList
          chats={chats}
          loading={loading}
          error={error}
          onChatClick={handleChatClick}
          onNewChat={() => router.push('/')}
          onRetry={debouncedSearchQuery.trim() ? searchChats : fetchChats}
          emptyMessage={
            debouncedSearchQuery.trim() 
              ? `No conversations found for "${debouncedSearchQuery}"`
              : undefined
          }
          emptyActionText={
            debouncedSearchQuery.trim() 
              ? "Start a New Chat"
              : undefined
          }
        />

        {/* Pagination Controls */}
        <PaginationControls
          pagination={pagination}
          currentPage={currentPage}
          buildPageUrl={(page) => 
            debouncedSearchQuery.trim() 
              ? `?q=${encodeURIComponent(debouncedSearchQuery)}&page=${page}`
              : `?page=${page}`
          }
        />
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col max-w-4xl mx-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-10 w-full" />
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
    }>
      <ChatsPageContent />
    </Suspense>
  );
}
