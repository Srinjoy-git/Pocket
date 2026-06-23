export const CATEGORIES = [
  'Food',
  'Transport',
  'Grocery',
  'Shopping',
  'Grooming',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const CATEGORY_COLORS = {
  Food: { color: '#ea580c', bg: '#fff7ed', light: '#ffedd5' },
  Transport: { color: '#2563eb', bg: '#eff6ff', light: '#dbeafe' },
  Grocery: { color: '#16a34a', bg: '#f0fdf4', light: '#dcfce7' },
  Shopping: { color: '#9333ea', bg: '#faf5ff', light: '#f3e8ff' },
  Grooming: { color: '#db2777', bg: '#fdf2f8', light: '#fce7f3' },
  Bills: { color: '#ca8a04', bg: '#fefce8', light: '#fef9c3' },
  Entertainment: { color: '#0891b2', bg: '#ecfeff', light: '#cffafe' },
  Healthcare: { color: '#dc2626', bg: '#fef2f2', light: '#fee2e2' },
  Education: { color: '#4f46e5', bg: '#eef2ff', light: '#e0e7ff' },
  Other: { color: '#6b7280', bg: '#f9fafb', light: '#f3f4f6' },
};

export const emptyExpenseForm = (kind = 'expense') => ({
  kind,
  category: 'Food',
  title: '',
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  personName: '',
});
