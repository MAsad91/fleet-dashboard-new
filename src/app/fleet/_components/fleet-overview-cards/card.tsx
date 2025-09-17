import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
    description?: string;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function FleetOverviewCard({ label, data, Icon }: PropsType) {
  const isDecreasing = data.growthRate < 0;

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
      {/* Header with title and icon */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-dark dark:text-white">
          {label}
        </h3>
        <div className="flex-shrink-0">
          <Icon />
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-3">
        {/* Main metric */}
        <div className="text-3xl font-bold text-dark dark:text-white">
          {data.value}
        </div>

        {/* Description */}
        <div className="text-sm text-body-color dark:text-body-color-dark">
          {data.description || label}
        </div>

        {/* Growth indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              isDecreasing ? "text-red" : "text-green",
            )}
          >
            {isDecreasing ? (
              <ArrowDownIcon className="h-3 w-3" aria-hidden />
            ) : (
              <ArrowUpIcon className="h-3 w-3" aria-hidden />
            )}
            <span className="font-semibold">{data.growthRate}%</span>
          </div>
          <span className="text-xs text-body-color dark:text-body-color-dark">
            vs last week
          </span>
        </div>
      </div>
    </div>
  );
}
