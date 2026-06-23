import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, HandCoins, ArrowRight, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getGreeting, displayName } from '../utils/format';
import { CATEGORY_COLORS } from '../utils/constants';
import CategoryIcon from '../components/ui/CategoryIcon';
import Button from '../components/ui/Button';
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../components/ui/motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, dashboard, myExpenses, loans } = useApp();

  const pendingLoans = loans.filter((l) => l.status === 'Pending');
  const settledLoans = loans.filter((l) => l.status === 'Completed');

  const topCategories = useMemo(() => {
    const totals = {};
    myExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
    });
    const total = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, amount]) => ({
        category,
        amount,
        pct: Math.round((amount / total) * 100),
        meta: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
      }));
  }, [myExpenses]);

  const recent = useMemo(() => [...myExpenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [myExpenses]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">{getGreeting().toUpperCase()}</span>
          <h1>Hi, {displayName(user)} 👋</h1>
          <p>Here's a quick overview of where every rupee is — and where it's still waiting to come back.</p>
        </div>
      </header>

      {loading ? (
        <div className="grid-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <motion.div className="grid-2" variants={staggerContainer} initial="initial" animate="animate">
          <motion.article className="stat-card" variants={staggerItem} whileHover={{ y: -3, transition: { duration: 0.25 } }}>
            <div className="stat-top">
              <span className="stat-label">This month's expenses</span>
              <Wallet size={18} />
            </div>
            <h2>{formatCurrency(dashboard.thisMonthExpenses)}</h2>
            <p>From 1st of the month till today</p>
            <div className="stat-actions">
              <Button className="btn-sm" onClick={() => navigate('/expenses/mine')}>
                <Plus size={16} /> Add expense
              </Button>
              <Link to="/expenses/mine" className="text-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>
          </motion.article>

          <motion.article className="stat-card" variants={staggerItem} whileHover={{ y: -3, transition: { duration: 0.25 } }}>
            <div className="stat-top">
              <span className="stat-label">Money owed to me</span>
              <HandCoins size={18} />
            </div>
            <h2 className="text-success">{formatCurrency(dashboard.moneyOwed)}</h2>
            <p>
              {pendingLoans.length} pending · {settledLoans.length} settled
            </p>
            <div className="stat-actions">
              <Button className="btn-sm" onClick={() => navigate('/expenses/owed')}>
                <Plus size={16} /> Add record
              </Button>
              <Link to="/expenses/owed" className="text-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>
          </motion.article>
        </motion.div>
      )}

      <div className="grid-2 bottom-grid">
        <section className="panel-card">
          <div className="panel-head">
            <h3>Top categories this month</h3>
            <span>Where you spent the most</span>
          </div>
          {loading ? (
            <SkeletonList rows={3} />
          ) : topCategories.length === 0 ? (
            <p className="empty-hint">No expenses yet this month.</p>
          ) : (
            <div className="category-bars">
              {topCategories.map(({ category, amount, pct, meta }) => (
                <div key={category} className="category-bar-row">
                  <div className="category-bar-head">
                    <CategoryIcon category={category} size={16} />
                    <span>{category}</span>
                    <strong>
                      {formatCurrency(amount)} · {pct}%
                    </strong>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      style={{ background: meta.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <h3>Recent expenses</h3>
            <span>Last 5</span>
          </div>
          {loading ? (
            <SkeletonList rows={4} />
          ) : recent.length === 0 ? (
            <p className="empty-hint">No recent expenses.</p>
          ) : (
            <div className="recent-list">
              {recent.map((item) => (
                <motion.div key={item._id} className="recent-row" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <CategoryIcon category={item.category} />
                  <div>
                    <strong>{item.title || item.category}</strong>
                    <span>{item.date?.slice(0, 10)}</span>
                  </div>
                  <strong>{formatCurrency(item.amount)}</strong>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
