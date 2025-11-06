const express = require('express');
const cors = require('cors');
const connectDB = require('./config/Db');
const transactionRouter = require('./routes/TransactionRoutes');
const memberRouter = require('./routes/MemberRoutes');
const expenseRouter = require('./routes/ExpenseRoutes');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionRouter);
app.use('/api/members', memberRouter);
app.use('/api/expenses', expenseRouter);

// Start the server.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});