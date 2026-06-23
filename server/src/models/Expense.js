const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['expense', 'loan'], required: true },
    category: {
      type: String,
      enum: [
        'Food',
        'Transport',
        'Grocery',
        'Shopping',
        'Grooming',
        'Bills',
        'Entertainment',
        'Healthcare',
        'Education',
        'Other',
      ],
      default: 'Other',
    },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    personName: { type: String, default: '' },
    originalAmount: { type: Number, default: 0 },
    returnedAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
