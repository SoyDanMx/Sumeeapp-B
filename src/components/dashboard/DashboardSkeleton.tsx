'use client';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-[calc(var(--header-offset,72px)+2rem)] animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <div className="h-10 bg-white/20 rounded-lg w-64 mb-3" />
              <div className="h-6 bg-white/20 rounded-lg w-96 mb-4" />
              <div className="h-8 bg-white/20 rounded-full w-48" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="h-12 bg-white/20 rounded-lg w-48" />
              <div className="h-12 bg-white/20 rounded-lg w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Emergency CTA Skeleton */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-7 lg:p-8">
            <div className="h-4 bg-white/20 rounded w-32 mb-2" />
            <div className="h-8 bg-white/20 rounded w-3/4 mb-3" />
            <div className="h-6 bg-white/20 rounded w-1/2 mb-4" />
            <div className="flex gap-3">
              <div className="h-12 bg-white/20 rounded-xl w-48" />
              <div className="h-12 bg-white/20 rounded-xl w-48" />
              <div className="h-12 bg-white/20 rounded-xl w-48" />
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Main Widget Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
              <div className="space-y-4">
                <div className="h-24 bg-gray-200 rounded-lg" />
                <div className="h-24 bg-gray-200 rounded-lg" />
                <div className="h-24 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Sidebar Widgets Skeleton */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-20 bg-gray-200 rounded-lg" />
            </div>
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-20 bg-gray-200 rounded-lg" />
            </div>
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-2">
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Leads List Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




