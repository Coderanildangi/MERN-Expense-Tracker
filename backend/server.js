const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected......');
    }
    catch (err) {
        console.error(`MongoDB connection errro: ${err.message}`);
        process.exit(1);
    }
};

connectDB();

const Transaction = require('./models/Transaction');

// Routes
const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

app.use('/api/transactions', router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});