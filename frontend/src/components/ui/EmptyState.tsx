"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen, LucideIcon } from "lucide-react";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
}

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = "No records yet",
  description = "There are currently no items to display in this section.",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#E1E6F3] bg-white/70 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F0F4FF] border border-[#E1E6F3] flex items-center justify-center text-[#245CFF] mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[#0B123D] mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#64708C] max-w-md leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#245CFF] text-white text-xs sm:text-sm font-semibold hover:bg-[#1d4bd8] transition-colors shadow-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#245CFF] text-white text-xs sm:text-sm font-semibold hover:bg-[#1d4bd8] transition-colors shadow-sm"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

