import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../components/ui/motion';

export default function Budget() {
  const { loading, budget, monthKey, saveBudget } = useApp();
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveBudget(amount);
      setAmount('');
    } finally {
      setSaving(false);
    }
  };

  const remaining = budget?.remainingBudget ?? 0;
  const pctUsed = budget?.monthlyBudget ? Math.min(100, ((budget?.totalExpenses || 0) / budget.monthlyBudget) * 100) : 0;

  return (
    <div className="page">
      <header className="page-header">
        <span className="eyebrow">BUDGET</span>
        <h1>Monthly Budget</h1>
        <p>Set your spending limit for {monthKey}. Budget calculations use only your expenses — not money owed to you.</p>
      </header>

      <form className="budget-form panel-card" onSubmit={submit}>
        <PiggyBank size={20} />
        <input
          type="number"
          step="0.01"
          placeholder="Set monthly budget (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save budget'}
        </Button>
      </form>

      <div className="budget-section">
        {loading ? (
          <div className="grid-3 budget-stats">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <motion.div className="grid-3 budget-stats" variants={staggerContainer} initial="initial" animate="animate">
          <motion.article className="stat-card compact" variants={staggerItem} whileHover={{ y: -3 }}>
            <span className="stat-label">Monthly budget</span>
            <h2>{formatCurrency(budget?.monthlyBudget)}</h2>
          </motion.article>
          <motion.article className="stat-card compact" variants={staggerItem} whileHover={{ y: -3 }}>
            <span className="stat-label">Total my expenses</span>
            <h2>{formatCurrency(budget?.totalExpenses)}</h2>
          </motion.article>
          <motion.article className="stat-card compact" variants={staggerItem} whileHover={{ y: -3 }}>
            <span className="stat-label">Remaining budget</span>
            <h2 className={remaining < 0 ? 'text-danger' : 'text-success'}>{formatCurrency(remaining)}</h2>
          </motion.article>
        </motion.div>
        )}

        {budget?.monthlyBudget > 0 && (
          <section className="panel-card budget-usage-card">
          <div className="panel-head">
            <h3>Budget usage</h3>
            <span>{Math.round(pctUsed)}% used</span>
          </div>
          <div className="progress-track lg">
            <motion.div
              className="progress-fill"
              style={{ background: remaining < 0 ? 'var(--danger)' : 'var(--accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pctUsed}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          </section>
        )}

        <section className="panel-card budget-loans-card">
        <div className="panel-head">
          <h3>Money lent (pending)</h3>
          <span>Separate from budget</span>
        </div>
        {(budget?.pendingLoans || []).length === 0 ? (
          <p className="empty-hint">No pending loans right now.</p>
        ) : (
          <div className="recent-list">
            {budget.pendingLoans.map((loan, i) => (
              <div key={loan._id || i} className="recent-row">
                <div className="loan-avatar sm">{loan.personName?.[0]?.toUpperCase() || '?'}</div>
                <div>
                  <strong>{loan.personName || 'Unnamed'}</strong>
                </div>
                <strong className="text-success">{formatCurrency(loan.remainingAmount)}</strong>
              </div>
            ))}
          </div>
        )}
        <p className="total-line">Total pending: {formatCurrency(budget?.totalPendingAmount)}</p>
        </section>
      </div>
    </div>
  );
}
