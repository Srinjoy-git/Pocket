import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AI() {
  return (
    <div className="page center-page">
      <motion.div
        className="coming-soon-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="coming-icon"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={48} />
        </motion.div>
        <h1>AI Assistant</h1>
        <p>Coming Soon</p>
        <small>We're working on smart insights and financial recommendations. Stay tuned!</small>
      </motion.div>
    </div>
  );
}
