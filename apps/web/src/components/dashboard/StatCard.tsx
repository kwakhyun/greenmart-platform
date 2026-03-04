"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}: StatCardProps) {
  return (
    <div className="stat-card group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        <div className={cn("rounded-lg p-2", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span
          className={cn(
            "text-xs font-medium mb-1",
            changeType === "positive" && "text-green-600",
            changeType === "negative" && "text-red-600",
            changeType === "neutral" && "text-gray-500",
          )}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
