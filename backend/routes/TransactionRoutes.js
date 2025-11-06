const express = require('express');

const Transaction = require('../models/Transaction');

// Routes
const transactionRouter = express.Router();

// Get all transactions
transactionRouter.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        return res.status(200).json({
            success: true,
            data: transactions,
            count: transactions.length
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Add a new transaction
transactionRouter.post('/', async (req, res) => {
    try{
        const transaction = await Transaction.create(req.body);
        return res.status(201).json({
            success: true,
            data: transaction
        });
    }
    catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
    }
});

// Delete a transaction.
transactionRouter.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'No transaction found'
            });
        }
        await transaction.deleteOne({ _id: req.params.id });
        return res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

module.exports = transactionRouter;