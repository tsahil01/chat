'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Separator } from '@workspace/ui/components/separator';
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
          <Button onClick={handleNewChat} className="shrink-0">
            New Chat
          </Button>
        </div>
        
        <Separator />

        {/* Chats List */}
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
                <Button variant="outline" onClick={fetchChats}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : chats.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  No conversations yet. Start a new chat to get going!
                </p>
                <Button onClick={handleNewChat}>
                  Start Your First Chat
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
                      href={pagination.hasPrevPage ? `?page=${currentPage - 1}` : undefined}
                      className={!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {/* Show first page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink href="?page=1">1</PaginationLink>
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
                          href={`?page=${pageNum}`}
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
                        <PaginationLink href={`?page=${pagination.totalPages}`}>
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href={pagination.hasNextPage ? `?page=${currentPage + 1}` : undefined}
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
