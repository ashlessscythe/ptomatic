export default function Loading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-2" />
        <div className="flex gap-4">
          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-6 rounded-lg shadow">
          <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            <div className="h-10 bg-neutral-100 rounded animate-pulse" />
            <div className="h-10 bg-neutral-100 rounded animate-pulse" />
            <div className="h-24 bg-neutral-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-neutral-200 rounded animate-pulse" />
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-neutral-100 rounded animate-pulse"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
