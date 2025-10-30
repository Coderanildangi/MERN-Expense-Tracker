const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: [true, 'Description is required'  ]
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required' ]
    },
    category: {
        type: String,
        enum: ['Groceries', 'Utilities', 'Entertainment', 'Transport', 'Housing', 'Health', 'Income', 'Miscellaneous'],
        default: 'Miscellaneous'
    },
    type: {
        type: String,
        enum: ['Income', 'Expense'],
        required: [true, 'Transaction type is required' ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
