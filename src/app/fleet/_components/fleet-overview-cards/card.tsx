import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number | null;
    description?: string;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function FleetOverviewCard({ label, data, Icon }: PropsType) {
  const isDecreasing = data.growthRate !== null && data.growthRate < 0;

  return (
    <div className="group rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
      {/* Header with title and icon */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </h3>
        <div className="flex-shrink-0">
          <Icon className="h-12 w-12" />
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-3">
        {/* Main metric */}
        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {data.value}
        </div>

        {/* Description */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {data.description || label}
        </div>

        {/* Growth indicator - only show if growth rate is available */}
        {data.growthRate !== null && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full",
                isDecreasing 
                  ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30" 
                  : "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30",
              )}
            >
              {isDecreasing ? (
                <ArrowDownIcon className="h-3 w-3" aria-hidden />
              ) : (
                <ArrowUpIcon className="h-3 w-3" aria-hidden />
              )}
              <span>{Math.abs(data.growthRate)}%</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              vs last week
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
