import { motion } from 'framer-motion';

export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className="stat-card skeleton-card">
      <Skeleton className="sk-line sk-sm" />
      <Skeleton className="sk-line sk-lg" />
      <Skeleton className="sk-line sk-md" />
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          className="skeleton-row"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
        >
          <Skeleton className="sk-avatar" />
          <div className="sk-text-group">
            <Skeleton className="sk-line sk-md" />
            <Skeleton className="sk-line sk-sm" />
          </div>
          <Skeleton className="sk-line sk-sm sk-amount" />
        </motion.div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
