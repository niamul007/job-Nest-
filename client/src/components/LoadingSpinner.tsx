/**
 * LoadingSpinner — full screen loading indicator.
 * Shown while API calls are in progress.
 * Used with isLoading state from Zustand stores.
 *
 * Usage:
 *   const { isLoading } = useJobStore()
 *   if (isLoading) return <LoadingSpinner />
 */
const LoadingSpinner = () => {
  return (
    // Centers spinner both vertically and horizontally on full screen
    <div className="flex items-center justify-center h-screen">
      {/*
        Spinning circle:
        animate-spin    → continuous rotation animation
        rounded-full    → circle shape
        h-12 w-12       → 48px × 48px size
        border-t-2      → top border visible
        border-b-2      → bottom border visible (left/right hidden = spinning gap effect)
        border-blue-600 → blue color matching app theme
      */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default LoadingSpinner;