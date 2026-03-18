"use client";

import { memo } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui";

interface StatCardProps {
  title: string;
  value: string;
  rawValue?: number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

const StatCard = memo(function StatCard({
  title,
  value,
  rawValue,
  change,
  changeType,
  icon: Icon,
  iconColor,
}: StatCardProps) {
  return (
    <div
      className="stat-card group"
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <div
          className={cn(
            "rounded-lg p-2 transition-transform duration-300 group-hover:scale-110",
            iconColor,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {rawValue !== undefined ? (
            <AnimatedNumber
              value={rawValue}
              formatter={(n) => {
                if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
                if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
                if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
                return n.toLocaleString();
              }}
            />
          ) : (
            value
          )}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium mb-1",
            changeType === "positive" && "text-green-600 dark:text-green-400",
            changeType === "negative" && "text-red-600 dark:text-red-400",
            changeType === "neutral" && "text-gray-500",
          )}
        >
          {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
          {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
          {change}
        </span>
      </div>
    </div>
  );
});

export default StatCard;
