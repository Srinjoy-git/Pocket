import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, IndianRupee } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, emptyExpenseForm } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/format';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../components/ui/motion';

export default function MoneyOwed() {
  const { loading, loans, saveExpense, deleteExpense, repayLoan } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyExpenseForm('loan'));
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return loans.filter((l) => {
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchSearch = !q || l.personName?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [loans, search, statusFilter]);

  const totalOwed = loans.filter((l) => l.status === 'Pending').reduce((s, l) => s + Number(l.remainingAmount), 0);
  const pendingCount = loans.filter((l) => l.status === 'Pending').length;
  const settledCount = loans.filter((l) => l.status === 'Completed').length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyExpenseForm('loan'));
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      kind: 'loan',
      category: item.category || 'Other',
      title: item.title || '',
      description: item.description || '',
      amount: String(item.originalAmount || item.amount),
      date: item.date.slice(0, 10),
      personName: item.personName || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyExpenseForm('loan'));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveExpense(form, editing?._id);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const submitRepay = async (e) => {
    e.preventDefault();
    if (!repayOpen || !repayAmount) return;
    setSaving(true);
    try {
      await repayLoan(repayOpen._id, repayAmount);
      setRepayOpen(null);
      setRepayAmount('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <span className="eyebrow">THE IOU BOOK</span>
          <h1>Money Owed To Me</h1>
          <p>Track every rupee others owe you — with partial payment support.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add record
        </Button>
      </header>

      {loading ? (
        <div className="grid-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <motion.div className="grid-3" variants={staggerContainer} initial="initial" animate="animate">
          <motion.article className="stat-card compact" variants={staggerItem}>
            <span className="stat-label">Total still owed</span>
            <h2 className="text-success">{formatCurrency(totalOwed)}</h2>
          </motion.article>
          <motion.article className="stat-card compact" variants={staggerItem}>
            <span className="stat-label">Pending</span>
            <h2 className="text-warning">{pendingCount}</h2>
          </motion.article>
          <motion.article className="stat-card compact" variants={staggerItem}>
            <span className="stat-label">Settled</span>
            <h2>{settledCount}</h2>
          </motion.article>
        </motion.div>
      )}

      <div className="filter-bar">
        <div className="search-field">
          <Search size={16} />
          <input placeholder="Search by person or note…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All records</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Settled</option>
        </select>
      </div>

      <section className="panel-card list-panel">
        {loading ? (
          <SkeletonList rows={4} />
        ) : filtered.length === 0 ? (
          <p className="empty-state">No records yet. Click "Add record" to log money you've spent for someone else.</p>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {filtered.map((loan) => (
              <motion.article key={loan._id} className="list-row loan-row" variants={staggerItem} whileHover={{ x: 4 }}>
                <div className="loan-avatar">{loan.personName?.[0]?.toUpperCase() || '?'}</div>
                <div className="list-main">
                  <div className="list-title">
                    <strong>{loan.personName || 'Unnamed'}</strong>
                    <span className={`pill ${loan.status === 'Completed' ? 'pill-success' : 'pill-warning'}`}>
                      {loan.status}
                    </span>
                  </div>
                  <p>
                    Original {formatCurrency(loan.originalAmount)} · Returned {formatCurrency(loan.returnedAmount)} ·
                    Remaining {formatCurrency(loan.remainingAmount)}
                  </p>
                  <span className="sub-date">{formatDate(loan.date)}</span>
                </div>
                <div className="list-actions loan-actions">
                  {loan.status === 'Pending' && (
                    <Button variant="outline" className="btn-xs" onClick={() => setRepayOpen(loan)}>
                      <IndianRupee size={14} /> Repay
                    </Button>
                  )}
                  <button type="button" className="icon-btn" onClick={() => openEdit(loan)} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => deleteExpense(loan._id)} aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit record' : 'Add record'}>
        <form className="stack-form" onSubmit={submit}>
          <label>
            Person's name
            <input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} placeholder="e.g. Rahul" required />
          </label>
          <div className="form-row-2">
            <label>
              Amount (₹)
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Note
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" rows={2} />
          </label>
          <label>
            Date
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </label>
          <div className="modal-footer">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!repayOpen} onClose={() => setRepayOpen(null)} title="Add repayment">
        <form className="stack-form" onSubmit={submitRepay}>
          <p className="modal-hint">
            Recording payment from <strong>{repayOpen?.personName}</strong>. Remaining:{' '}
            {formatCurrency(repayOpen?.remainingAmount)}
          </p>
          <label>
            Repayment amount (₹)
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={repayOpen?.remainingAmount}
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              required
            />
          </label>
          <div className="modal-footer">
            <Button variant="ghost" type="button" onClick={() => setRepayOpen(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Record payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
