const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const { monthKeyFromDate } = require('../utils/date');

const router = express.Router();

router.use(auth);

router.get('/summary/:monthKey', async (req, res) => {
  const { monthKey } = req.params;
  const records = await Expense.find({ userId: req.user.userId });

  const thisMonthExpenses = records
    .filter((item) => item.kind === 'expense' && monthKeyFromDate(item.date) === monthKey)
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const moneyOwed = records
    .filter((item) => item.kind === 'loan' && item.status === 'Pending')
    .reduce((sum, item) => sum + Number(item.remainingAmount), 0);

  return res.json({ thisMonthExpenses, moneyOwed });
});

router.get('/calendar/:year', async (req, res) => {
  const year = Number(req.params.year);
  const records = await Expense.find({ userId: req.user.userId });

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    expenses: 0,
    pendingLent: 0,
  }));

  records.forEach((item) => {
    const d = new Date(item.date);
    if (d.getFullYear() !== year) return;
    const m = d.getMonth();

    if (item.kind === 'expense') months[m].expenses += Number(item.amount);
    if (item.kind === 'loan' && item.status === 'Pending') months[m].pendingLent += Number(item.remainingAmount);
  });

  return res.json(months);
});

router.get('/calendar/:year/:month', async (req, res) => {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  const records = await Expense.find({ userId: req.user.userId });

  const filtered = records.filter((item) => {
    const d = new Date(item.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const grouped = filtered
    .filter((item) => item.kind === 'expense')
    .reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

  const pendingLoans = filtered
    .filter((item) => item.kind === 'loan' && item.status === 'Pending')
    .map((item) => ({ personName: item.personName, pendingAmount: item.remainingAmount }));

  return res.json({ groupedExpenses: grouped, pendingLoans });
});

module.exports = router;
