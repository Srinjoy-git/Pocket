const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const { monthKeyFromDate } = require('../utils/date');

const router = express.Router();

router.use(auth);

router.get('/:monthKey', async (req, res) => {
  const { monthKey } = req.params;
  const budget = await Budget.findOne({ userId: req.user.userId, monthKey });

  const monthExpenses = await Expense.find({ userId: req.user.userId, kind: 'expense' });
  const totalExpenses = monthExpenses
    .filter((item) => monthKeyFromDate(item.date) === monthKey)
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const pendingLoans = await Expense.find({ userId: req.user.userId, kind: 'loan', status: 'Pending' }).select(
    'personName remainingAmount'
  );

  return res.json({
    monthKey,
    monthlyBudget: budget?.amount || 0,
    totalExpenses,
    remainingBudget: (budget?.amount || 0) - totalExpenses,
    pendingLoans,
    totalPendingAmount: pendingLoans.reduce((sum, item) => sum + Number(item.remainingAmount), 0),
  });
});

router.put('/:monthKey', async (req, res) => {
  const { monthKey } = req.params;
  const amount = Number(req.body.amount || 0);

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user.userId, monthKey },
    { amount },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json(budget);
});

module.exports = router;
