export const EASE = [0.4, 0, 0.2, 1];

export const transition = { duration: 0.3, ease: EASE };

export const fastTransition = { duration: 0.22, ease: EASE };

export const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition },
};

export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { y: -3, boxShadow: '0 12px 28px rgba(0,0,0,0.1)', transition: fastTransition },
};

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 6 },
};

export const sidebarVariants = {
  open: { x: 0, transition },
  closed: { x: '-100%', transition },
};
