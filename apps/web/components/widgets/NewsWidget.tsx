"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

type Item = { id: number; title: string; url?: string };

export function NewsWidget({ className }: { className?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        // Hacker News official Firebase API (no key)
        const idsRes = await fetch(
          "https://hacker-news.firebaseio.com/v0/topstories.json",
          { cache: "no-store" },
        );
        const ids: number[] = idsRes.ok ? await idsRes.json() : [];
        const top = ids.slice(0, 5);
        const fetched = await Promise.all(
          top.map(async (id) => {
            try {
              const r = await fetch(
                `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
                { cache: "no-store" },
              );
              if (!r.ok) return null;
              const j = await r.json();
              return {
                id: j.id,
                title: j.title as string,
                url: j.url as string | undefined,
              } as Item;
            } catch {
              return null;
            }
          }),
        );
        setItems(fetched.filter(Boolean) as Item[]);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top News</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-5/6 sm:h-4" />
            <Skeleton className="h-3 w-4/6 sm:h-4" />
            <Skeleton className="h-3 w-3/6 sm:h-4" />
            <Skeleton className="h-3 w-2/3 sm:h-4" />
            <Skeleton className="h-3 w-1/2 sm:h-4" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground text-xs sm:text-sm">
            No headlines available right now.
          </div>
        ) : (
          <ul className="space-y-1.5 text-xs leading-snug sm:space-y-2 sm:text-sm">
            {items.map((item) => (
              <li key={item.id} className="truncate">
                {item.url ? (
                  <a
                    className="hover:underline"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.title}
                  </a>
                ) : (
                  <span>{item.title}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default NewsWidget;
