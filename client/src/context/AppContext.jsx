import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { thisMonthKey } from '../utils/format';
import { getThemeByTime, msUntilNextThemeBoundary } from '../utils/theme';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pocket-token'));
  const [user, setUser] = useState(null);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('pocket-theme-mode') || 'auto');
  const [manualTheme, setManualTheme] = useState(() => localStorage.getItem('pocket-theme-manual') || 'light');
  const [theme, setTheme] = useState(() =>
    (localStorage.getItem('pocket-theme-mode') || 'auto') === 'auto'
      ? getThemeByTime()
      : localStorage.getItem('pocket-theme-manual') || 'light'
  );
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [dashboard, setDashboard] = useState({ thisMonthExpenses: 0, moneyOwed: 0 });
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendarMonths, setCalendarMonths] = useState([]);
  const [monthDetail, setMonthDetail] = useState({ groupedExpenses: {}, pendingLoans: [] });
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmState, setConfirmState] = useState(null);

  const monthKey = thisMonthKey();

  const notify = useCallback((message, kind = 'ok') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const confirm = useCallback(
    (title, message, confirmLabel = 'Confirm') =>
      new Promise((resolve) => {
        setConfirmState({ title, message, confirmLabel, resolve });
      }),
    []
  );

  const resolveConfirm = (result) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  useEffect(() => {
    const applyTheme = () => {
      const next = themeMode === 'auto' ? getThemeByTime() : manualTheme;
      setTheme(next);
      document.documentElement.setAttribute('data-theme', next);
    };

    applyTheme();

    if (themeMode !== 'auto') return undefined;

    const boundaryTimer = window.setTimeout(applyTheme, msUntilNextThemeBoundary());
    const intervalTimer = window.setInterval(applyTheme, 60_000);
    return () => {
      window.clearTimeout(boundaryTimer);
      window.clearInterval(intervalTimer);
    };
  }, [themeMode, manualTheme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeMode('manual');
    setManualTheme(next);
    localStorage.setItem('pocket-theme-mode', 'manual');
    localStorage.setItem('pocket-theme-manual', next);
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const useAutoTheme = () => {
    setThemeMode('auto');
    localStorage.setItem('pocket-theme-mode', 'auto');
    const next = getThemeByTime();
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [me, expenseRows, budgetData, dashData, calendarData] = await Promise.all([
        api.get('/auth/me'),
        api.get('/expenses'),
        api.get(`/budget/${monthKey}`),
        api.get(`/dashboard/summary/${monthKey}`),
        api.get(`/dashboard/calendar/${year}`),
      ]);

      setUser(me.user);
      setExpenses(expenseRows);
      setBudget(budgetData);
      setDashboard(dashData);
      setCalendarMonths(calendarData);
    } catch (error) {
      notify(error.message, 'error');
      if (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('pocket-token');
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, monthKey, year, notify]);

  const loadMonthDetail = useCallback(
    async (y, monthIndex) => {
      if (!token) return;
      setDetailLoading(true);
      try {
        const detailData = await api.get(`/dashboard/calendar/${y}/${monthIndex}`);
        setMonthDetail(detailData);
      } catch (error) {
        notify(error.message, 'error');
      } finally {
        setDetailLoading(false);
      }
    },
    [token, notify]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('pocket-token', data.token);
    setToken(data.token);
    notify('Welcome back!');
    return data;
  };

  const register = async (name, username, password) => {
    const data = await api.post('/auth/register', { name, username, password });
    localStorage.setItem('pocket-token', data.token);
    setToken(data.token);
    notify('Account created successfully');
    return data;
  };

  const logout = async () => {
    const ok = await confirm('Logout', 'Are you sure you want to sign out?', 'Logout');
    if (!ok) return;
    localStorage.removeItem('pocket-token');
    setToken(null);
    setUser(null);
    notify('Signed out');
  };

  const saveExpense = async (form, editingId) => {
    if (editingId) {
      await api.patch(`/expenses/${editingId}`, form);
      notify(form.kind === 'expense' ? 'Expense updated' : 'Record updated');
    } else {
      await api.post('/expenses', form);
      notify(form.kind === 'expense' ? 'Expense added' : 'Record added');
    }
    await loadData();
  };

  const deleteExpense = async (id) => {
    const ok = await confirm('Delete record', 'This action cannot be undone.', 'Delete');
    if (!ok) return;
    await api.del(`/expenses/${id}`);
    notify('Deleted successfully');
    await loadData();
  };

  const repayLoan = async (id, amount) => {
    await api.patch(`/expenses/${id}/repay`, { amount: Number(amount) });
    notify('Repayment recorded');
    await loadData();
  };

  const saveBudget = async (amount) => {
    await api.put(`/budget/${monthKey}`, { amount: Number(amount) });
    notify('Budget updated');
    await loadData();
  };

  const saveProfile = async ({ name, username, password }) => {
    const payload = { name, username };
    if (password) payload.password = password;
    const data = await api.patch('/auth/me', payload);
    localStorage.setItem('pocket-token', data.token);
    notify('Profile updated');
    await loadData();
    return data;
  };

  const myExpenses = useMemo(() => expenses.filter((e) => e.kind === 'expense'), [expenses]);
  const loans = useMemo(() => expenses.filter((e) => e.kind === 'loan'), [expenses]);

  const value = {
    token,
    user,
    theme,
    themeMode,
    toggleTheme,
    useAutoTheme,
    loading,
    detailLoading,
    toasts,
    sidebarOpen,
    setSidebarOpen,
    expenses,
    myExpenses,
    loans,
    budget,
    dashboard,
    year,
    setYear,
    calendarMonths,
    monthDetail,
    loadMonthDetail,
    monthKey,
    notify,
    confirm,
    confirmState,
    resolveConfirm,
    login,
    register,
    logout,
    saveExpense,
    deleteExpense,
    repayLoan,
    saveBudget,
    saveProfile,
    loadData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
