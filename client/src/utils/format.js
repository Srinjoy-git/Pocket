import { format } from 'date-fns';

export const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy');

export const thisMonthKey = () => format(new Date(), 'yyyy-MM');

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

export const displayName = (user) => user?.name?.trim() || user?.username || 'there';
