export default function ProductPageSkeleton() {
  return (
    <main className="flex-1 animate-pulse">

      {/* Breadcrumb */}
      <div className="max-container px-4 md:px-10 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 bg-gray-200 rounded" />
          <div className="h-3 w-2 bg-gray-200 rounded" />
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="h-3 w-2 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Product Section */}
      <div className="max-container px-4 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* Image gallery skeleton */}
          <div className="flex gap-3">
            {/* Thumbnail strip */}
            <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[2.5/3.8] bg-gray-200 w-full" />
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1 aspect-[2.5/3.8] bg-gray-200" />
          </div>

          {/* Product info skeleton */}
          <div className="flex flex-col gap-4 pt-2">
            {/* Brand */}
            <div className="h-2.5 w-28 bg-gray-200 rounded" />
            {/* Title */}
            <div className="space-y-2">
              <div className="h-7 w-3/4 bg-gray-200 rounded" />
              <div className="h-7 w-1/2 bg-gray-200 rounded" />
            </div>
            {/* Stars */}
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 bg-gray-200 rounded-sm" />)}
              <div className="h-4 w-20 bg-gray-200 rounded ml-2" />
            </div>
            {/* Price */}
            <div className="h-7 w-20 bg-gray-200 rounded mt-1" />
            {/* Divider */}
            <div className="w-12 h-px bg-gray-200 my-1" />
            {/* Color label */}
            <div className="h-3 w-32 bg-gray-200 rounded" />
            {/* Color swatches */}
            <div className="flex gap-2">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />)}
            </div>
            {/* Size label */}
            <div className="h-3 w-20 bg-gray-200 rounded mt-2" />
            {/* Size buttons */}
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => <div key={i} className="w-11 h-10 bg-gray-200" />)}
            </div>
            {/* CTA buttons */}
            <div className="flex gap-2.5 mt-2">
              <div className="flex-1 h-12 bg-gray-200" />
              <div className="w-24 h-12 bg-gray-200" />
            </div>
            {/* Shipping badges */}
            <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-100 mt-1">
              {[1,2,3].map(i => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="w-5 h-5 bg-gray-200 rounded-sm" />
                  <div className="h-2.5 w-16 bg-gray-200 rounded" />
                  <div className="h-2 w-12 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            {/* Accordion placeholders */}
            {[1,2,3].map(i => (
              <div key={i} className="border-t border-gray-100 py-4 flex justify-between items-center">
                <div className="h-3 w-28 bg-gray-200 rounded" />
                <div className="w-4 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Style With skeleton */}
      <div className="border-t border-gray-100 py-12">
        <div className="max-container px-4 md:px-10">
          <div className="h-7 w-36 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[1,2,3].map(i => (
              <div key={i}>
                <div className="aspect-square bg-gray-200 w-full" />
                <div className="h-3 w-3/4 bg-gray-200 rounded mt-2" />
                <div className="h-3 w-1/4 bg-gray-200 rounded mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="border-t border-gray-100 py-12 bg-[#f8f6f1]">
        <div className="max-container px-4 md:px-10">
          <div className="h-7 w-48 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div className="bg-white p-8 flex flex-col items-center gap-3">
              <div className="h-14 w-16 bg-gray-200 rounded" />
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 bg-gray-200 rounded-sm" />)}
              </div>
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="col-span-2 flex flex-col justify-center gap-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-3 bg-gray-200 rounded shrink-0" />
                  <div className="w-3 h-3 bg-gray-200 rounded-sm shrink-0" />
                  <div className="flex-1 h-1.5 bg-gray-200 rounded" />
                  <div className="w-5 h-3 bg-gray-200 rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white p-6 border border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => <div key={s} className="w-3 h-3 bg-gray-200 rounded-sm" />)}
                    </div>
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-4/6" />
                </div>
                <div className="flex gap-4 pt-3 border-t border-gray-100">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* You May Also Like skeleton */}
      <div className="border-t border-gray-100 py-12">
        <div className="max-container px-4 md:px-10">
          <div className="h-7 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
            {[1,2,3,4,5].map(i => (
              <div key={i}>
                <div className="aspect-[2.5/3.8] bg-gray-200 w-full" />
                <div className="h-3 w-3/4 bg-gray-200 rounded mt-2" />
                <div className="h-3 w-1/4 bg-gray-200 rounded mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  )
}