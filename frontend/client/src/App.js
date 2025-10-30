import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, IndianRupee, PieChart, Tag, Trash2, Loader2, Calendar } from 'lucide-react';

// --- API Endpoint (Points to the Express server) ---
const API_URL = 'http://localhost:5000/api/transactions'; 

// --- CATEGORIES & COLORS ---
const CATEGORIES = [
  'Groceries', 'Utilities', 'Entertainment', 'Transport', 'Housing', 'Health', 'Income', 'Miscellaneous'
];

const CATEGORY_COLORS = {
  'Groceries': 'bg-red-500',
  'Utilities': 'bg-blue-500',
  'Entertainment': 'bg-purple-500',
  'Transport': 'bg-yellow-500',
  'Housing': 'bg-teal-500',
  'Health': 'bg-pink-500',
  'Income': 'bg-green-500',
  'Miscellaneous': 'bg-gray-500',
};


const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState(CATEGORIES[0]);
  const [isIncome, setIsIncome] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper to format currency
  const formatCurrency = useCallback((amount) => {
    // Ensure negative amounts display correctly with the currency sign
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }, []);

  // 1. DATA FETCHING (GET /api/transactions)
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (response.ok) { // Check for successful HTTP status code
        if (result.success && Array.isArray(result.data)) {
            // FIX: Ensure transactions are sorted by date (newest first) to prevent display issues.
            const sortedTransactions = result.data.sort((a, b) => {
                // Ensure valid dates for comparison
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                // Return b - a for descending order (newest first)
                return dateB - dateA;
            });
            setTransactions(sortedTransactions);
        } else {
             // Handle case where API returns 200 but internal error or non-array data
            throw new Error(result.error || "API returned a non-successful response body or invalid data format.");
        }
      } else {
        // Handle non-200 HTTP responses (e.g., 404, 500)
        throw new Error(result.error || `Server responded with status ${response.status}.`);
      }

    } catch (e) {
      console.error("Error fetching transactions:", e);
      // More descriptive error message
      setError(`Failed to load history from the server. Ensure the Node.js server is running on port 5000 and the API is accessible. Error: ${e.message}`);
      setTransactions([]); // Clear data on fetch error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 2. CRUD OPERATIONS

  // A. Create Transaction (POST /api/transactions)
  const addTransaction = useCallback(async (e) => {
    e.preventDefault();
    const amount = parseFloat(newExpenseAmount);

    if (!newExpenseDescription.trim() || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid description and amount (greater than zero).");
      return;
    }
    setError(null);

    try {
      // Store negative for expense, positive for income in the database
      const transactionAmount = isIncome ? amount : -amount; 

      // WARNING: The backend Mongoose schema MUST define the 'type' enum in lowercase: 
      // enum: ['income', 'expense']. 
      // If the backend is incorrectly expecting capitalized ('Income' or 'Expense'), 
      // that is a server-side bug. We are temporarily sending capitalized type to debug the server issue.
      const transactionType = isIncome ? 'Income' : 'Expense';

      const transactionData = {
        description: newExpenseDescription.trim(),
        amount: transactionAmount,
        category: newExpenseCategory,
        // FIX: Temporarily capitalize 'type' to bypass potential incorrect Mongoose schema on the server.
        // The *correct* value should be lowercase ('income' or 'expense').
        type: transactionType, 
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        // Refetch the entire list for simple state update (which will now sort the data)
        await fetchTransactions(); 
        setNewExpenseDescription('');
        setNewExpenseAmount('');
      } else {
        // If the server returns a validation error, the error message will be in result.error
        throw new Error(result.error || `Failed to add transaction. Server status: ${response.status}`);
      }

    } catch (e) {
      console.error("Error adding transaction: ", e);
      // The error message from Mongoose is typically included in e.message here.
      setError(`Could not add transaction. ${e.message}`);
    }
  }, [newExpenseDescription, newExpenseAmount, newExpenseCategory, isIncome, fetchTransactions]);

  // B. Delete Transaction (DELETE /api/transactions/:id)
  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      const response = await fetch(`${API_URL}/${transactionId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Refetch the data after successful deletion (which will now sort the data)
        await fetchTransactions();
      } else {
        throw new Error(result.error || `Failed to delete transaction. Server status: ${response.status}`);
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError(`Could not delete transaction. ${e.message}`);
    }
  }, [fetchTransactions]);


  // 3. CORE LOGIC: SPENDING SUMMARY CALCULATION
  const spendingSummary = useMemo(() => {
    // Safe guard: filter out any invalid transaction objects first
    const validTransactions = transactions.filter(tx => tx && typeof tx.amount === 'number' && !isNaN(tx.amount));

    const totalBalance = validTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    // Check for both casings for robustness
    const totalIncome = validTransactions.filter(tx => tx.type === 'Income' || tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    // Check for both casings for robustness
    const totalExpense = validTransactions.filter(tx => tx.type === 'Expense' || tx.type === 'expense').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const totalSpending = totalExpense;
    
    const byCategory = {};
    // Ensure all categories start at 0
    CATEGORIES.filter(cat => cat !== 'Income').forEach(cat => byCategory[cat] = 0);

    validTransactions.forEach(tx => {
        // Only count expenses for the breakdown, checking both casings for robustness
        if (tx.type === 'Expense' || tx.type === 'expense') {
            const category = tx.category || 'Miscellaneous';
            // Use Math.abs in case the backend stored amount without a negative sign (though it shouldn't)
            byCategory[category] = (byCategory[category] || 0) + Math.abs(tx.amount); 
        }
    });

    const categoryData = Object.keys(byCategory).map(category => ({
        category,
        amount: byCategory[category],
        color: CATEGORY_COLORS[category] || 'bg-gray-500',
        percentage: totalSpending > 0 ? (byCategory[category] / totalSpending) * 100 : 0
    })).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount); // Sorting by amount is fine here

    return { totalBalance, totalIncome, totalExpense, categoryData };
  }, [transactions]);

  // --- UI RENDERING ---

  if (error) {
    // Basic UI for displaying errors
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full p-6 bg-red-100 border border-red-400 rounded-xl shadow-lg text-red-700">
          <h2 className="text-xl font-bold mb-2">Error Connecting to Backend</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { totalBalance, totalIncome, totalExpense, categoryData } = spendingSummary;

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-8 font-inter">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
        
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 flex items-center">
            <PieChart className="w-8 h-8 mr-3 text-emerald-600" />
            MERN Budget Tracker (Full Stack)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connected to MongoDB via Express REST API.
          </p>
        </header>
        
        {/* Spending Summary Section */}
        <section className="mb-10 p-6 bg-emerald-600 text-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <IndianRupee className="w-6 h-6 mr-2" /> Financial Overview
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-sm opacity-80">Current Balance</div>
                    <div className={`text-3xl font-extrabold mt-1 ${totalBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {formatCurrency(totalBalance)}
                    </div>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-sm opacity-80">Total Income</div>
                    <div className="text-3xl font-extrabold mt-1 text-green-300">
                        {formatCurrency(totalIncome)}
                    </div>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-sm opacity-80">Total Expense</div>
                    <div className="text-3xl font-extrabold mt-1 text-red-300">
                        {formatCurrency(totalExpense)}
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {totalExpense > 0 && (
                <div className="mt-6 pt-4 border-t border-white/20">
                    <h3 className="text-lg font-semibold mb-3">Expense Breakdown</h3>
                    <div className="space-y-2">
                        {categoryData.map(item => (
                            <div key={item.category}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium flex items-center">
                                        <Tag className="w-4 h-4 mr-2" />
                                        {item.category}
                                    </span>
                                    <span className="text-sm font-bold">
                                        {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-white/30">
                                    <div 
                                        className={`h-2 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-500'}`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </section>


        {/* Transaction Input Form */}
        <form onSubmit={addTransaction} className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-10 p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
          
          {/* Description */}
          <input
            type="text"
            placeholder="Description (e.g., Paycheck, Coffee)"
            value={newExpenseDescription}
            onChange={(e) => setNewExpenseDescription(e.target.value)}
            disabled={loading}
            className="sm:col-span-2 p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition duration-150 text-gray-700 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />

          {/* Amount */}
          <input
            type="number"
            placeholder="Amount"
            step="0.01"
            min="0.01"
            value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(e.target.value)}
            disabled={loading}
            className="sm:col-span-1 p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition duration-150 text-gray-700 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          
          {/* Category Dropdown */}
          <select
            value={newExpenseCategory}
            onChange={(e) => setNewExpenseCategory(e.target.value)}
            // Disabled when income is selected, as category is set to 'Income' automatically
            disabled={loading || isIncome} 
            className="sm:col-span-1 p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition duration-150 text-gray-700 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
              {/* Only show non-income categories in the dropdown */}
              {CATEGORIES.filter(cat => cat !== 'Income').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
              ))}
          </select>

          {/* Type Toggle (Income/Expense) */}
          <button
              type="button"
              onClick={() => {
                  const newState = !isIncome;
                  setIsIncome(newState);
                  // Automatically set category based on the type toggle state
                  if (newState) {
                      setNewExpenseCategory('Income');
                  } else {
                      // Revert to the default expense category when switching to expense
                      setNewExpenseCategory(CATEGORIES.find(cat => cat !== 'Income') || CATEGORIES[0]);
                  }
              }}
              className={`sm:col-span-1 flex items-center justify-center p-3 rounded-xl transition duration-150 shadow-md font-semibold ${
                  isIncome ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-100 hover:bg-red-200 text-red-600'
              }`}
          >
              {isIncome ? 'Income' : 'Expense'}
          </button>

          {/* Add Button */}
          <button
            type="submit"
            disabled={!newExpenseDescription.trim() || !newExpenseAmount || loading}
            className="sm:col-span-1 flex items-center justify-center p-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition duration-150 shadow-md hover:shadow-lg disabled:bg-emerald-300 disabled:cursor-not-allowed font-semibold"
          >
            <Plus className="w-5 h-5 mr-1" />
            Log
          </button>
        </form>

        {/* Transaction List */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Transaction History</h2>
        
        {loading && (
          <div className="flex justify-center items-center py-12 text-emerald-500">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg font-medium">Loading history...</span>
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl text-gray-600 border border-dashed">
            <IndianRupee className="w-10 h-10 mb-3" />
            <p className="text-lg font-medium">No transactions logged yet!</p>
            <p className="text-sm">Log your first income or expense above.</p>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li
                // It is possible for tx to be undefined or missing _id if the data fetching failed partially
                key={tx?._id || tx?.description || Math.random()} 
                className={`flex items-center p-4 bg-white rounded-xl shadow-md transition duration-200 ease-in-out ${
                    // Check for both casings here
                    tx?.type === 'income' || tx?.type === 'Income' ? 'border-l-4 border-green-500 hover:shadow-lg' : 'border-l-4 border-red-500 hover:shadow-lg'
                }`}
              >
                {/* Type Icon */}
                <div className={`p-2 rounded-full mr-4 ${tx?.type === 'income' || tx?.type === 'Income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <IndianRupee className="w-5 h-5" />
                </div>

                {/* Transaction Details */}
                <div className="flex-grow flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-gray-800 text-lg sm:w-1/3 truncate pr-4">
                        {tx?.description || 'N/A'}
                    </span>
                    <div className="text-sm text-gray-500 sm:w-1/3 flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        Category: <span className="font-medium text-emerald-600 ml-1">{tx?.category || 'N/A'}</span>
                    </div>
                    <div className={`text-lg font-bold sm:w-1/3 ${tx?.type === 'income' || tx?.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx?.type === 'income' || tx?.type === 'Income' ? '+' : '-'} {formatCurrency(Math.abs(tx?.amount || 0))}
                    </div>
                </div>

                {/* Date and Delete Button */}
                <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-400 flex items-center mr-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </div>
                    {tx?._id && (
                        <button
                            onClick={() => deleteTransaction(tx._id)}
                            className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-red-600 transition duration-150"
                            aria-label="Delete transaction"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
        
      </div>
    </div>
  );
};

export default App;