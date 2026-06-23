import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExpensesHub from './pages/ExpensesHub';
import MyExpenses from './pages/MyExpenses';
import MoneyOwed from './pages/MoneyOwed';
import Budget from './pages/Budget';
import Calendar from './pages/Calendar';
import AI from './pages/AI';
import Profile from './pages/Profile';
import Toast from './components/ui/Toast';

function ProtectedRoute({ children }) {
  const { token } = useApp();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token } = useApp();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { toasts } = useApp();

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensesHub />} />
          <Route path="/expenses/mine" element={<MyExpenses />} />
          <Route path="/expenses/owed" element={<MoneyOwed />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toast toasts={toasts} />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
