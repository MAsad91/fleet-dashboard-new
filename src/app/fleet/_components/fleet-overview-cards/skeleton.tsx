export function FleetOverviewCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark"
        >
          <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
          
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="mb-1.5 h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            
            <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
