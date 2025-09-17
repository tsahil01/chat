'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Separator } from '@workspace/ui/components/separator';
import { Input } from '@workspace/ui/components/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@workspace/ui/components/pagination';
import { authClient } from '@/lib/auth-client';
import { generateUUID } from '@/lib/utils';

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

export default function SearchPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
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
      // Clear results when search is empty
      setChats([]);
      setPagination(null);
      setError(null);
    }
  }, [debouncedSearchQuery, currentPage, session, isPending]);

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
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
  };

  const handleNewChat = () => {
    const newChatId = generateUUID();
    router.push(`/chat/${newChatId}`);
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
            <h1 className="text-2xl font-semibold tracking-tight">Search Chats</h1>
            <p className="text-sm text-muted-foreground">
              {pagination ? (
                `Found ${pagination.totalCount} result${pagination.totalCount !== 1 ? 's' : ''} for "${debouncedSearchQuery}"`
              ) : (
                'Search through your conversations'
              )}
            </p>
          </div>
          <Button onClick={handleNewChat} className="shrink-0">
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

        {/* Search Results */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={searchChats}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : !debouncedSearchQuery.trim() ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter a search term to find your conversations
                </p>
              </CardContent>
            </Card>
          ) : chats.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  No conversations found for "{debouncedSearchQuery}"
                </p>
                <Button onClick={handleNewChat}>
                  Start a New Chat
                </Button>
              </CardContent>
            </Card>
          ) : (
            chats.map((chat) => (
              <Card 
                key={chat.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleChatClick(chat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{chat.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">
                      <span className="text-xs text-muted-foreground capitalize">
                        {chat.visibility.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between pb-4 w-full">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href={pagination.hasPrevPage ? `?q=${encodeURIComponent(debouncedSearchQuery)}&page=${currentPage - 1}` : undefined}
                      className={!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {/* Show first page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink href={`?q=${encodeURIComponent(debouncedSearchQuery)}&page=1`}>1</PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}
                  
                  {/* Show pages around current page */}
                  {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 1) {
                      pageNum = pagination.totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                    
                    if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          href={`?q=${encodeURIComponent(debouncedSearchQuery)}&page=${pageNum}`}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {/* Show last page */}
                  {currentPage < pagination.totalPages - 2 && (
                    <>
                      {currentPage < pagination.totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink href={`?q=${encodeURIComponent(debouncedSearchQuery)}&page=${pagination.totalPages}`}>
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href={pagination.hasNextPage ? `?q=${encodeURIComponent(debouncedSearchQuery)}&page=${currentPage + 1}` : undefined}
                      className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
