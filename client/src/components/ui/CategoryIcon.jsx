import {
  UtensilsCrossed,
  Car,
  ShoppingBasket,
  ShoppingBag,
  Sparkles,
  Receipt,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  CircleDot,
} from 'lucide-react';
import { CATEGORY_COLORS } from '../../utils/constants';

const ICONS = {
  Food: UtensilsCrossed,
  Transport: Car,
  Grocery: ShoppingBasket,
  Shopping: ShoppingBag,
  Grooming: Sparkles,
  Bills: Receipt,
  Entertainment: Clapperboard,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Other: CircleDot,
};

export default function CategoryIcon({ category, size = 18 }) {
  const Icon = ICONS[category] || CircleDot;
  const meta = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

  return (
    <span
      className="category-icon"
      style={{ background: meta.light, color: meta.color, '--icon-size': `${size}px` }}
    >
      <Icon size={size} strokeWidth={2} aria-hidden />
    </span>
  );
}
