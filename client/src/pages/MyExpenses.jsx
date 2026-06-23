import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, emptyExpenseForm } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/format';
import CategoryIcon from '../components/ui/CategoryIcon';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { SkeletonList } from '../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../components/ui/motion';

export default function MyExpenses() {
  const { loading, myExpenses, saveExpense, deleteExpense } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyExpenseForm('expense'));
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const [y, m] = monthFilter.split('-').map(Number);
    const start = startOfMonth(new Date(y, m - 1));
    const end = endOfMonth(start);

    return myExpenses.filter((item) => {
      const inMonth = isWithinInterval(parseISO(item.date.slice(0, 10)), { start, end });
      const matchCat = category === 'All' || item.category === category;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);
      return inMonth && matchCat && matchSearch;
    });
  }, [myExpenses, search, category, monthFilter]);

  const total = filtered.reduce((s, i) => s + Number(i.amount), 0);

  const categoryTotals = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyExpenseForm('expense'));
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      kind: 'expense',
      category: item.category,
      title: item.title || '',
      description: item.description || '',
      amount: String(item.amount),
      date: item.date.slice(0, 10),
      personName: '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyExpenseForm('expense'));
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

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <span className="eyebrow">LEDGER</span>
          <h1>My Expenses</h1>
          <p>
            {filtered.length} records · Total {formatCurrency(total)}
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add expense
        </Button>
      </header>

      <div className="filter-bar">
        <div className="search-field">
          <Search size={16} />
          <input placeholder="Search shop or note…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
      </div>

      {categoryTotals.length > 0 && (
        <div className="mini-stats">
          {categoryTotals.slice(0, 4).map(([cat, amt]) => (
            <div key={cat} className="mini-stat">
              <CategoryIcon category={cat} />
              <div>
                <span>{cat}</span>
                <strong>{formatCurrency(amt)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="panel-card list-panel">
        {loading ? (
          <SkeletonList rows={5} />
        ) : filtered.length === 0 ? (
          <p className="empty-state">No expenses found. Click "Add expense" to log your first one.</p>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {filtered.map((item) => (
              <motion.article key={item._id} className="list-row" variants={staggerItem} whileHover={{ x: 4 }}>
                <CategoryIcon category={item.category} />
                <div className="list-main">
                  <div className="list-title">
                    <strong>{item.title || item.category}</strong>
                    <span className="pill">{item.category}</span>
                  </div>
                  {item.description && <p>{item.description}</p>}
                </div>
                <div className="list-end">
                  <strong>{formatCurrency(item.amount)}</strong>
                  <span>{formatDate(item.date)}</span>
                </div>
                <div className="list-actions">
                  <button type="button" className="icon-btn" onClick={() => openEdit(item)} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => deleteExpense(item._id)} aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit expense' : 'Add expense'}>
        <form className="stack-form" onSubmit={submit}>
          <label>
            Shop / Merchant Name
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. real mart" />
          </label>
          <label>
            Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Note
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" rows={2} />
          </label>
          <div className="form-row-2">
            <label>
              Amount (₹)
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </label>
            <label>
              Date
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
          </div>
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
    </div>
  );
}
