const express = require('express');
const Expense = require('../models/Expense');

// Routes
const expenseRouter = express.Router();

// Get all expenses.
expenseRouter.get('/', async (req, res) => {
    try {
        const expenses = (await Expense.find());
        return res.status(200).json({
            success: true,
            data: expenses,
            count: expenses.length
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

// Add a new expense.
expenseRouter.post('/', async (req, res) => {
    try{
        const { description, amount, payer, participants } = req.body;

        if (!description || !amount || !payer || !participants?.length) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const expense = await Expense.create({ description, amount, payer, participants });
        return res.status(201).json({
            success: true,
            data: expense
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

// Delete an expense.
expenseRouter.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'No expense found'
            });
        }

        await expense.deleteOne({ _id: req.params.id });
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

module.exports = expenseRouter;