import { motion } from 'framer-motion';
import { fastTransition } from './motion';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <motion.button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={fastTransition}
      {...props}
    >
      {children}
    </motion.button>
  );
}
