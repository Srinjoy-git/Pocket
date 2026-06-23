import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MONTH_FULL, MONTH_NAMES, CATEGORY_COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/format';
import CategoryIcon from '../components/ui/CategoryIcon';
import Modal from '../components/ui/Modal';
import { SkeletonCard, PageLoader } from '../components/ui/Skeleton';

const EMPTY_MONTHS = Array.from({ length: 12 }, (_, i) => ({ month: i, expenses: 0, pendingLent: 0 }));

export default function Calendar() {
  const { loading, year, setYear, calendarMonths, monthDetail, loadMonthDetail, detailLoading, myExpenses } = useApp();
  const [page, setPage] = useState(0);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState(null);

  const months = calendarMonths.length === 12 ? calendarMonths : EMPTY_MONTHS;
  const yearTotal = months.reduce((s, m) => s + Number(m.expenses), 0);
  const monthsOnPage = months.slice(page * 6, page * 6 + 6);

  const entryCountForMonth = (monthIdx) =>
    myExpenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === monthIdx;
    }).length;

  const breakdownCategories = useMemo(() => {
    const grouped = monthDetail.groupedExpenses || {};
    const allItems = Object.values(grouped).flat();
    const total = allItems.reduce((s, item) => s + Number(item.amount), 0) || 1;

    return Object.entries(grouped)
      .map(([category, items]) => {
        const amount = items.reduce((s, i) => s + Number(i.amount), 0);
        return { category, items, amount, pct: Math.round((amount / total) * 100), meta: CATEGORY_COLORS[category] };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthDetail]);

  const openMonth = (monthIdx) => {
    setActiveMonth(monthIdx);
    setBreakdownOpen(true);
    loadMonthDetail(year, monthIdx);
  };

  const closeBreakdown = () => {
    setBreakdownOpen(false);
    setActiveMonth(null);
  };

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <span className="eyebrow">ANNUAL VIEW</span>
          <h1>Calendar</h1>
          <p>Year total: {formatCurrency(yearTotal)}</p>
        </div>
        <div className="year-stepper">
          <button type="button" className="nav-pill icon-only" onClick={() => setYear((y) => y - 1)} aria-label="Previous year">
            <ChevronLeft size={18} />
          </button>
          <strong className="year-display">{year}</strong>
          <button type="button" className="nav-pill icon-only" onClick={() => setYear((y) => y + 1)} aria-label="Next year">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="calendar-nav">
        <button type="button" className="nav-pill" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft size={16} /> Previous
        </button>
        <span>
          Months {page * 6 + 1}–{Math.min(page * 6 + 6, 12)} of 12
        </span>
        <button type="button" className="nav-pill" disabled={page >= 1} onClick={() => setPage((p) => p + 1)}>
          Next <ChevronRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="month-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="month-grid">
          {monthsOnPage.map((month, idx) => {
            const monthIdx = page * 6 + idx;
            return (
              <button
                key={`${year}-${monthIdx}`}
                type="button"
                className="month-tile"
                onClick={() => openMonth(monthIdx)}
              >
                <div className="month-tile-top">
                  <span>{year}</span>
                  <span>{entryCountForMonth(monthIdx)} entries</span>
                </div>
                <h3>{MONTH_FULL[monthIdx]}</h3>
                <strong>{formatCurrency(month.expenses)}</strong>
                <small>Click to view breakdown</small>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={breakdownOpen}
        onClose={closeBreakdown}
        title={activeMonth !== null ? `${MONTH_FULL[activeMonth]} ${year}` : 'Month breakdown'}
        size="lg"
      >
        {detailLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="breakdown-summary">
              <div>
                <span>Total</span>
                <strong>{formatCurrency(months[activeMonth]?.expenses)}</strong>
              </div>
              <div>
                <span>Records</span>
                <strong>{breakdownCategories.reduce((s, c) => s + c.items.length, 0)}</strong>
              </div>
            </div>

            {breakdownCategories.length === 0 ? (
              <p className="empty-hint">No expenses this month.</p>
            ) : (
              breakdownCategories.map(({ category, items, amount, pct, meta }) => (
                <div key={category} className="breakdown-cat" style={{ borderColor: meta?.light }}>
                  <div className="breakdown-cat-head" style={{ background: meta?.bg }}>
                    <CategoryIcon category={category} />
                    <div>
                      <strong>{category}</strong>
                      <span>
                        {items.length} record{items.length > 1 ? 's' : ''} · {pct}% of month
                      </span>
                    </div>
                    <div className="breakdown-cat-end">
                      <Link to="/expenses/mine" className="text-link sm" onClick={closeBreakdown}>
                        View in My Expenses <ArrowUpRight size={12} />
                      </Link>
                      <strong style={{ color: meta?.color }}>{formatCurrency(amount)}</strong>
                    </div>
                  </div>
                  {items.map((item) => (
                    <div key={item._id} className="breakdown-item">
                      <span>{item.title || category}</span>
                      <span>{item.date?.slice(0, 10)}</span>
                      <strong>{formatCurrency(item.amount)}</strong>
                    </div>
                  ))}
                </div>
              ))
            )}

            {(monthDetail.pendingLoans || []).length > 0 && activeMonth !== null && (
              <div className="breakdown-pending">
                <h4>Pending money from {MONTH_NAMES[activeMonth]}</h4>
                {monthDetail.pendingLoans.map((loan, i) => (
                  <div key={i} className="breakdown-item">
                    <span>{loan.personName}</span>
                    <strong className="text-success">{formatCurrency(loan.pendingAmount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
