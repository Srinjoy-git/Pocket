import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalContent, transition } from './motion';

function getPortalRoot() {
  return document.getElementById('modal-root') || document.body;
}

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? (
        <motion.div
          key="modal-backdrop"
          className="modal-backdrop"
          variants={modalBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className={`modal-panel modal-${size}`}
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {title && (
              <div className="modal-header">
                <h2 id="modal-title">{title}</h2>
                <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    getPortalRoot()
  );
}
