import { motion } from "framer-motion";

/**
 * Skeleton placeholder that matches FruitCard dimensions and layout.
 * Shown while fruit data is being fetched — prevents the
 * "No verified live data available" flash during cold starts.
 */
export default function SkeletonFruitCard({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass noise relative min-h-[410px] overflow-hidden rounded-[2rem] p-4"
    >
      {/* Image placeholder */}
      <div className="skeleton-pulse relative h-56 overflow-hidden rounded-[1.5rem]">
        {/* Badge placeholder */}
        <div className="absolute left-4 top-4 h-6 w-28 rounded-full bg-white/8" />
      </div>

      {/* Content placeholder */}
      <div className="relative mt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Title */}
            <div className="skeleton-pulse h-8 w-3/4 rounded-xl" />
            {/* Description */}
            <div className="skeleton-pulse mt-3 h-4 w-full rounded-lg" />
            <div className="skeleton-pulse mt-2 h-4 w-2/3 rounded-lg" />
          </div>
          {/* Arrow button placeholder */}
          <div className="skeleton-pulse h-11 w-11 shrink-0 rounded-full" />
        </div>

        {/* Vitamin tags placeholder */}
        <div className="mt-5 flex flex-wrap gap-2">
          <div className="skeleton-pulse h-6 w-20 rounded-full" />
          <div className="skeleton-pulse h-6 w-24 rounded-full" />
          <div className="skeleton-pulse h-6 w-16 rounded-full" />
        </div>

        {/* Nutrition stats placeholder */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-black/22 p-3">
              <div className="skeleton-pulse h-3 w-10 rounded" />
              <div className="skeleton-pulse mt-2 h-5 w-8 rounded" />
            </div>
          ))}
        </div>

        {/* Trend signal placeholder */}
        <div className="mt-4 flex items-center gap-2">
          <div className="skeleton-pulse h-4 w-36 rounded" />
        </div>
      </div>
    </motion.div>
  );
}
