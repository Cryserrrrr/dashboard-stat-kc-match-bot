import React from "react";
import { cn } from "../utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: any;
  description?: string;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    showComparison?: boolean;
  };
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-0 p-6 transition-all duration-300 animate-fade-in",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="flex-shrink-0 h-12 w-12 bg-[#344e41]/10 dark:bg-gray-600 rounded-xl flex items-center justify-center transition-colors duration-300">
              {React.createElement(icon, {
                size: 24,
                className: "text-brand-light dark:text-gray-300",
              })}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-white">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
