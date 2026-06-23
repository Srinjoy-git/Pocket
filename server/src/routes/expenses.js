const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const records = await Expense.find({ userId: req.user.userId }).sort({ date: -1, createdAt: -1 });
  return res.json(records);
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body;

    const base = {
      userId: req.user.userId,
      kind: payload.kind,
      amount: Number(payload.amount),
      date: payload.date,
      title: payload.title || '',
      description: payload.description || '',
      category: payload.category || 'Other',
    };

    let doc;
    if (payload.kind === 'loan') {
      const originalAmount = Number(payload.amount);
      doc = await Expense.create({
        ...base,
        personName: payload.personName || '',
        originalAmount,
        returnedAmount: Number(payload.returnedAmount || 0),
        remainingAmount: originalAmount - Number(payload.returnedAmount || 0),
        status: originalAmount - Number(payload.returnedAmount || 0) <= 0 ? 'Completed' : 'Pending',
      });
    } else {
      doc = await Expense.create(base);
    }

    return res.status(201).json(doc);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create record' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const record = await Expense.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const { category, title, description, amount, date, personName } = req.body;

    if (category !== undefined) record.category = category;
    if (title !== undefined) record.title = title;
    if (description !== undefined) record.description = description;
    if (date !== undefined) record.date = date;
    if (personName !== undefined) record.personName = personName;

    if (amount !== undefined) {
      record.amount = Number(amount);
      if (record.kind === 'loan') {
        record.originalAmount = Number(amount);
        record.remainingAmount = record.originalAmount - Number(record.returnedAmount || 0);
        if (record.remainingAmount <= 0) {
          record.remainingAmount = 0;
          record.status = 'Completed';
        } else {
          record.status = 'Pending';
        }
      }
    }

    await record.save();
    return res.json(record);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update record' });
  }
});

router.patch('/:id/repay', async (req, res) => {
  try {
    const { amount } = req.body;
    const loan = await Expense.findOne({ _id: req.params.id, userId: req.user.userId, kind: 'loan' });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const repayAmount = Number(amount || 0);
    if (repayAmount <= 0) return res.status(400).json({ message: 'Repayment amount should be positive' });

    loan.returnedAmount = Number(loan.returnedAmount || 0) + repayAmount;
    loan.remainingAmount = Number(loan.originalAmount) - Number(loan.returnedAmount);
    if (loan.remainingAmount <= 0) {
      loan.remainingAmount = 0;
      loan.status = 'Completed';
    }
    await loan.save();

    return res.json(loan);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to repay loan' });
  }
});

router.delete('/:id', async (req, res) => {
  const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!deleted) return res.status(404).json({ message: 'Record not found' });
  return res.json({ ok: true });
});

module.exports = router;
