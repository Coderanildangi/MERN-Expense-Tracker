const mongoose = require('mongoose');
const { create } = require('./Member');

const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: [true, 'Description is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be positive']
    },
    payer: {
        type: String,
        required: [true, 'Payer is required']
    },
    participants: {
        type: [String],
        required: [true, 'At least one participant is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{
  timestamps: true
});

//const arrayLimit = val => val.length > 0;
module.exports = mongoose.model('Expense', expenseSchema);