"use client";

import React from "react";
import { LucideIcon, FolderOpen } from "lucide-react";
import EmptyState, { EmptyStateAction } from "./EmptyState";

export interface DataContainerProps<T> {
  isLoading?: boolean;
  data?: T[] | null;
  emptyIcon?: LucideIcon | React.ComponentType<{ className?: string }>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: EmptyStateAction;
  emptyClassName?: string;
  loadingSkeleton?: React.ReactNode;
  skeletonCount?: number;
  skeletonType?: "cards" | "rows" | "stats";
  children: ((items: T[]) => React.ReactNode) | React.ReactNode;
}

export default function DataContainer<T>({
  isLoading = false,
  data,
  emptyIcon = FolderOpen,
  emptyTitle = "No records yet",
  emptyDescription = "There are no items recorded in this section at the moment.",
  emptyAction,
  emptyClassName,
  loadingSkeleton,
  skeletonCount = 3,
  skeletonType = "cards",
  children,
}: DataContainerProps<T>) {
  if (isLoading) {
    if (loadingSkeleton) {
      return <>{loadingSkeleton}</>;
    }

    if (skeletonType === "stats") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/80 border border-[#E1E6F3] p-5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-200 rounded-md" />
                <div className="h-9 w-9 bg-slate-200 rounded-xl" />
              </div>
              <div className="h-7 w-16 bg-slate-200 rounded-md" />
            </div>
          ))}
        </div>
      );
    }

    if (skeletonType === "rows") {
      return (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-white/80 border border-[#E1E6F3] p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      );
    }

    // Default "cards" skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="h-56 rounded-2xl bg-white/80 border border-[#E1E6F3] p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 bg-slate-200 rounded-md" />
                <div className="h-4 w-12 bg-slate-100 rounded" />
              </div>
              <div className="h-5 w-48 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>
            <div className="h-9 w-full bg-slate-200 rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  const items = Array.isArray(data) ? data : [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={emptyClassName}
      />
    );
  }

  if (typeof children === "function") {
    return <>{children(items)}</>;
  }

  return <>{children}</>;
}

