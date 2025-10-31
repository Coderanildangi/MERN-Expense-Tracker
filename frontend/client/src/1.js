import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- ICONS (Inline SVGs using Lucide-style props) ---
const PieChartIcon = ({ className = "w-6 h-6 mr-2" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
);
const DollarSignIcon = ({ className = "w-6 h-6 mr-2" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.006 0-3 1.5-3 3h6c0-1.5-1-3-3-3z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v3m0 12v3m9-9h-3m-12 0H3m6 0a3 3 0 00-3 3v2a3 3 0 003 3h6a3 3 0 003-3v-2a3 3 0 00-3-3z"></path></svg>
);
const PlusIcon = ({ className = "w-5 h-5 mr-1" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
);
const Trash2Icon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);
const TagIcon = ({ className = "w-4 h-4 mr-1" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h.01M12 17h.01M17 17h.01"></path></svg>
);
const CalendarIcon = ({ className = "w-3 h-3 mr-1" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
); 
const Loader2Icon = ({ className = "w-8 h-8 animate-spin mr-3" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.96 8.96 0 0120 12c0 4.97-4.477 9-10 9S2 16.97 2 12 6.477 3 12 3c1.94 0 3.76.546 5.342 1.542"></path></svg>
);
const LayoutDashboardIcon = ({ className = "w-6 h-6 mr-2" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
);
const UsersIcon = ({ className = "w-6 h-6 mr-2" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m14 0a3 3 0 10-6 0m-4 0a3 3 0 10-6 0M10 9a3 3 0 10-6 0 3 3 0 006 0zm-4 6h10"></path></svg>
);
const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
);


// --- CONSTANTS & HELPERS ---
const API_URL = 'http://localhost:5000/api/transactions'; 

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

// Helper to format currency (Indian Rupee)
const formatCurrency = (amount) => {
    // Uses 'en-IN' locale for standard Indian formatting and 'INR' currency code.
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};


// --- 1. DASHBOARD COMPONENT ---
const Dashboard = ({ setCurrentPage }) => {
    return (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
            <header className="mb-10 text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 flex items-center justify-center mb-3">
                    <LayoutDashboardIcon className="w-10 h-10 mr-4 text-emerald-600" />
                    Main Dashboard
                </h1>
                <p className="text-lg text-gray-500">
                    Choose a financial tool to get started.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Expense Tracker Card */}
                <button
                    onClick={() => setCurrentPage('tracker')}
                    className="bg-emerald-600 text-white p-8 rounded-xl shadow-xl hover:bg-emerald-700 transform hover:scale-[1.02] transition duration-300 flex flex-col items-center justify-center h-56"
                >
                    <PieChartIcon className="w-12 h-12 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Expense Tracker</h2>
                    <p className="text-sm opacity-90">Log, categorize, and monitor your personal income and expenses.</p>
                </button>

                {/* Expense Splitter Card */}
                <button
                    onClick={() => setCurrentPage('splitter')}
                    className="bg-indigo-600 text-white p-8 rounded-xl shadow-xl hover:bg-indigo-700 transform hover:scale-[1.02] transition duration-300 flex flex-col items-center justify-center h-56"
                >
                    <UsersIcon className="w-12 h-12 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Expense Splitter</h2>
                    <p className="text-sm opacity-90">Calculate how to split shared bills and debts among groups.</p>
                </button>
            </div>

            <footer className="mt-12 text-center text-gray-400 text-sm">
                MERN Stack Financial Tools - Powered by React
            </footer>
        </div>
    );
};


// --- 2. EXPENSE TRACKER VIEW COMPONENT (Remains modular) ---
const ExpenseTrackerView = (props) => {
    const {
        loading, error, transactions, spendingSummary, 
        addTransaction, deleteTransaction, 
        newExpenseDescription, setNewExpenseDescription, 
        newExpenseAmount, setNewExpenseAmount, 
        newExpenseCategory, setNewExpenseCategory, 
        isIncome, setIsIncome, setCurrentPage
    } = props;

    const { totalBalance, totalIncome, totalExpense, categoryData } = spendingSummary;

    return (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
            
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 flex items-center">
                        <PieChartIcon className="w-8 h-8 mr-3 text-emerald-600" />
                        Expense Tracker
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Connected to MongoDB via Express REST API.
                    </p>
                </div>
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition duration-150 text-sm font-medium flex items-center shadow-sm"
                >
                    <LayoutDashboardIcon className="w-5 h-5 mr-1" />
                    Dashboard
                </button>
            </header>
            
            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-xl text-red-700">
                    <p className="font-semibold">Connection Error:</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            {/* Spending Summary Section */}
            <section className="mb-10 p-6 bg-emerald-600 text-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <DollarSignIcon className="w-6 h-6 mr-2" /> Financial Overview
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
                                            <TagIcon className="w-4 h-4 mr-2" />
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
                    disabled={loading || isIncome} 
                    className="sm:col-span-1 p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition duration-150 text-gray-700 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
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
                        if (newState) {
                            setNewExpenseCategory('Income');
                        } else {
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
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Log
                </button>
            </form>

            {/* Transaction List */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Transaction History</h2>
            
            {loading && (
                <div className="flex justify-center items-center py-12 text-emerald-500">
                    <Loader2Icon className="w-8 h-8 animate-spin mr-3" />
                    <span className="text-lg font-medium">Loading history...</span>
                </div>
            )}

            {!loading && transactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl text-gray-600 border border-dashed">
                    <DollarSignIcon className="w-10 h-10 mb-3" /> 
                    <p className="text-lg font-medium">No transactions logged yet!</p>
                    <p className="text-sm">Log your first income or expense above.</p>
                </div>
            )}

            {!loading && transactions.length > 0 && (
                <ul className="space-y-3">
                    {transactions.map((tx) => (
                        <li
                            key={tx?._id || tx?.description || Math.random()} 
                            className={`flex items-center p-4 bg-white rounded-xl shadow-md transition duration-200 ease-in-out ${
                                tx?.type === 'income' || tx?.type === 'Income' ? 'border-l-4 border-green-500 hover:shadow-lg' : 'border-l-4 border-red-500 hover:shadow-lg'
                            }`}
                        >
                            {/* Type Icon */}
                            <div className={`p-2 rounded-full mr-4 ${tx?.type === 'income' || tx?.type === 'Income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <DollarSignIcon className="w-5 h-5" /> 
                            </div>

                            {/* Transaction Details */}
                            <div className="flex-grow flex flex-col sm:flex-row sm:items-center">
                                <span className="font-semibold text-gray-800 text-lg sm:w-1/3 truncate pr-4">
                                    {tx?.description || 'N/A'}
                                </span>
                                <div className="text-sm text-gray-500 sm:w-1/3 flex items-center">
                                    <TagIcon className="w-4 h-4 mr-1" />
                                    Category: <span className="font-medium text-emerald-600 ml-1">{tx?.category || 'N/A'}</span>
                                </div>
                                <div className={`text-lg font-bold sm:w-1/3 ${tx?.type === 'income' || tx?.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx?.type === 'income' || tx?.type === 'Income' ? '+' : '-'} {formatCurrency(Math.abs(tx?.amount || 0))}
                                </div>
                            </div>

                            {/* Date and Delete Button */}
                            <div className="flex items-center space-x-2">
                                <div className="text-xs text-gray-400 flex items-center mr-2">
                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                    {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                </div>
                                {tx?._id && (
                                    <button
                                        onClick={() => deleteTransaction(tx._id)}
                                        className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-red-600 transition duration-150"
                                        aria-label="Delete transaction"
                                    >
                                        <Trash2Icon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            
        </div>
    );
};


// --- 3. EXPENSE SPLITTER VIEW COMPONENT (Fully Implemented and Self-Contained) ---
const ExpenseSplitterView = ({ setCurrentPage }) => {
    // Expense Splitter State
    const [members, setMembers] = useState(['Alice', 'Bob', 'Charlie']);
    const [newMemberName, setNewMemberName] = useState('');
    const [expenses, setExpenses] = useState([]);
    
    // Expense Form State
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expensePayer, setExpensePayer] = useState('Alice');


    // LOGIC: Add/Remove Members
    const handleAddMember = (e) => {
        e.preventDefault();
        const name = newMemberName.trim();
        if (name && !members.includes(name)) {
            setMembers(prev => [...prev, name]);
            setExpensePayer(name); // Set new member as default payer
            setNewMemberName('');
        }
    };

    const handleRemoveMember = (name) => {
        if (members.length > 1) {
            setMembers(prev => prev.filter(m => m !== name));
            // Also update payer and remove any expenses involving this member
            if (expensePayer === name) {
                setExpensePayer(members.filter(m => m !== name)[0]);
            }
            setExpenses(prev => prev.filter(exp => exp.payer !== name));
        }
    };

    // LOGIC: Add Expense (Split Equally for now)
    const handleAddExpense = (e) => {
        e.preventDefault();
        const amount = parseFloat(expenseAmount);

        if (!expenseDescription.trim() || isNaN(amount) || amount <= 0 || members.length === 0) {
            alert('Please ensure you have a description, valid amount, and at least one member.');
            return;
        }

        const newExpense = {
            id: Date.now(),
            description: expenseDescription.trim(),
            payer: expensePayer,
            amount: amount,
        };

        setExpenses(prev => [...prev, newExpense]);

        // Clear form
        setExpenseDescription('');
        setExpenseAmount('');
    };

    const handleDeleteExpense = (id) => {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
    };

    // CORE LOGIC: Calculate Balances (Who owes whom)
    const balances = useMemo(() => {
        const initialBalances = members.reduce((acc, member) => ({ ...acc, [member]: 0 }), {});
        
        const netBalances = expenses.reduce((acc, expense) => {
            if (members.length === 0) return acc;

            const share = expense.amount / members.length;
            
            // 1. Payer gets credit for the whole amount
            acc[expense.payer] += expense.amount;

            // 2. Everyone (including payer) owes their share, so subtract it
            members.forEach(member => {
                acc[member] -= share;
            });

            return acc;
        }, initialBalances);

        return netBalances;
    }, [members, expenses]);

    // UI Rendering Helper: Balances Summary
    const BalancesSummary = () => {
        const positiveBalances = Object.entries(balances)
            .filter(([, amount]) => amount > 0.01)
            .sort(([, a], [, b]) => b - a); // Owed to them

        const negativeBalances = Object.entries(balances)
            .filter(([, amount]) => amount < -0.01)
            .sort(([, a], [, b]) => a - b); // They owe

        if (members.length < 2) return <p className="text-gray-500 italic">Add at least two members and some expenses to see the settlement.</p>;
        if (positiveBalances.length === 0 && negativeBalances.length === 0) return <p className="text-green-600 font-medium">All settled up!</p>;

        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-700">Net Balances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Owed To Me */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-inner">
                        <h4 className="font-semibold text-green-700 flex items-center mb-2"><PlusIcon className="w-5 h-5 mr-1" /> People Owe Me</h4>
                        <ul className="space-y-1 text-sm">
                            {positiveBalances.map(([member, amount]) => (
                                <li key={member} className="flex justify-between">
                                    <span className="font-medium text-gray-700">{member} is owed:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* I Owe People */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-inner">
                        <h4 className="font-semibold text-red-700 flex items-center mb-2"><DollarSignIcon className="w-5 h-5 mr-1" /> I Owe People</h4>
                        <ul className="space-y-1 text-sm">
                            {negativeBalances.map(([member, amount]) => (
                                <li key={member} className="flex justify-between">
                                    <span className="font-medium text-gray-700">{member} owes:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(Math.abs(amount))}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">Positive balance means the person is owed money; negative means they owe money.</p>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
            <header className="mb-8 w-full flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                    <UsersIcon className="w-8 h-8 mr-3 text-indigo-600" />
                    Expense Splitter
                </h1>
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition duration-150 text-sm font-medium flex items-center shadow-sm"
                >
                    <LayoutDashboardIcon className="w-5 h-5 mr-1" />
                    Dashboard
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Column 1: Members List */}
                <div className="md:col-span-1 p-5 border border-gray-200 rounded-xl shadow-lg bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Group Members ({members.length})</h2>
                    <form onSubmit={handleAddMember} className="flex space-x-2 mb-4">
                        <input
                            type="text"
                            placeholder="Add Member Name"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                        />
                        <button type="submit" className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </form>
                    
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {members.map(member => (
                            <li key={member} className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                                <span className="font-medium text-gray-800">{member}</span>
                                <button
                                    onClick={() => handleRemoveMember(member)}
                                    disabled={members.length === 1}
                                    className="text-red-400 hover:text-red-600 disabled:text-gray-300 transition"
                                    aria-label={`Remove ${member}`}
                                >
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 2: Add Expense & History */}
                <div className="md:col-span-2 space-y-8">
                    {/* Add Expense Form */}
                    <div className="p-5 border border-indigo-200 rounded-xl shadow-lg bg-white">
                        <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center">
                            <DollarSignIcon className="w-6 h-6 mr-2" /> Log New Expense (Split Equally)
                        </h2>
                        <form onSubmit={handleAddExpense} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Expense Description (e.g., Dinner, Rent)"
                                value={expenseDescription}
                                onChange={(e) => setExpenseDescription(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                            />
                            <div className="flex space-x-3">
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    step="0.01"
                                    min="0.01"
                                    value={expenseAmount}
                                    onChange={(e) => setExpenseAmount(e.target.value)}
                                    className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                                />
                                <select
                                    value={expensePayer}
                                    onChange={(e) => setExpensePayer(e.target.value)}
                                    className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 bg-white"
                                    disabled={members.length === 0}
                                >
                                    {members.map(member => (
                                        <option key={member} value={member}>Paid by: {member}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={members.length === 0 || !expenseDescription || !expenseAmount}
                                className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-300"
                            >
                                <PlusIcon className="w-5 h-5 inline-block mr-1" /> Record Expense
                            </button>
                        </form>
                    </div>

                    {/* Expense History */}
                    <div className="p-5 border border-gray-200 rounded-xl shadow-lg bg-white">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Expense History ({expenses.length})</h2>
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                            {expenses.length === 0 ? (
                                <p className="text-gray-500 italic">No expenses logged yet.</p>
                            ) : (
                                expenses.slice().reverse().map((exp) => (
                                    <li key={exp.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-md">
                                        <div>
                                            <p className="font-semibold text-gray-800">{exp.description}</p>
                                            <p className="text-sm text-gray-500">Paid by <span className="font-medium text-indigo-500">{exp.payer}</span></p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="font-bold text-lg text-red-600">{formatCurrency(exp.amount)}</span>
                                            <button
                                                onClick={() => handleDeleteExpense(exp.id)}
                                                className="text-red-400 hover:text-red-600 transition"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Balances Section */}
            <section className="mt-8 p-6 bg-white border border-gray-300 rounded-xl shadow-2xl">
                <BalancesSummary />
            </section>
        </div>
    );
};


// --- 4. MAIN APP COMPONENT (Router and Logic) ---
const App = () => {
    // --- ROUTING STATE ---
    const [currentPage, setCurrentPage] = useState('dashboard'); 

    // --- EXPENSE TRACKER STATE & LOGIC ---
    // This part remains in App to act as the main controller for the MERN data flow.
    const [transactions, setTransactions] = useState([]);
    const [newExpenseDescription, setNewExpenseDescription] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [newExpenseCategory, setNewExpenseCategory] = useState(CATEGORIES[0]);
    const [isIncome, setIsIncome] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // DATA FETCHING (GET /api/transactions)
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            const result = await response.json();

            if (response.ok) { 
                if (result.success && Array.isArray(result.data)) {
                    const sortedTransactions = result.data.sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        return dateB - dateA;
                    });
                    setTransactions(sortedTransactions);
                } else {
                    throw new Error(result.error || "API returned an invalid data format.");
                }
            } else {
                throw new Error(result.error || `Server responded with status ${response.status}.`);
            }

        } catch (e) {
            console.error("Error fetching transactions:", e);
            setError(`Failed to load history from the server. Ensure the Node.js server is running on port 5000 and the API is accessible. Error: ${e.message}`);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // CRUD: Add Transaction
    const addTransaction = useCallback(async (e) => {
        e.preventDefault();
        const amount = parseFloat(newExpenseAmount);

        if (!newExpenseDescription.trim() || isNaN(amount) || amount <= 0) {
            setError("Please enter a valid description and amount (greater than zero).");
            return;
        }
        setError(null);

        try {
            const transactionAmount = isIncome ? amount : -amount; 
            const transactionType = isIncome ? 'Income' : 'Expense'; 

            const transactionData = {
                description: newExpenseDescription.trim(),
                amount: transactionAmount,
                category: newExpenseCategory,
                type: transactionType, 
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData),
            });
            
            const result = await response.json();

            if (response.ok && result.success) {
                await fetchTransactions(); 
                setNewExpenseDescription('');
                setNewExpenseAmount('');
            } else {
                throw new Error(result.error || `Failed to add transaction. Server status: ${response.status}`);
            }

        } catch (e) {
            console.error("Error adding transaction: ", e);
            setError(`Could not add transaction. ${e.message}`);
        }
    }, [newExpenseDescription, newExpenseAmount, newExpenseCategory, isIncome, fetchTransactions]);

    // CRUD: Delete Transaction
    const deleteTransaction = useCallback(async (transactionId) => {
        try {
            const response = await fetch(`${API_URL}/${transactionId}`, {
                method: 'DELETE',
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                await fetchTransactions();
            } else {
                throw new Error(result.error || `Failed to delete transaction. Server status: ${response.status}`);
            }
        } catch (e) {
            console.error("Error deleting document: ", e);
            setError(`Could not delete transaction. ${e.message}`);
        }
    }, [fetchTransactions]);


    // CORE LOGIC: SPENDING SUMMARY CALCULATION
    const spendingSummary = useMemo(() => {
        const validTransactions = transactions.filter(tx => tx && typeof tx.amount === 'number' && !isNaN(tx.amount));

        const totalBalance = validTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalIncome = validTransactions.filter(tx => tx.type === 'Income' || tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpense = validTransactions.filter(tx => tx.type === 'Expense' || tx.type === 'expense').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        const totalSpending = totalExpense;
        
        const byCategory = {};
        CATEGORIES.filter(cat => cat !== 'Income').forEach(cat => byCategory[cat] = 0);

        validTransactions.forEach(tx => {
            if (tx.type === 'Expense' || tx.type === 'expense') {
                const category = tx.category || 'Miscellaneous';
                byCategory[category] = (byCategory[category] || 0) + Math.abs(tx.amount); 
            }
        });

        const categoryData = Object.keys(byCategory).map(category => ({
            category,
            amount: byCategory[category],
            color: CATEGORY_COLORS[category] || 'bg-gray-500',
            percentage: totalSpending > 0 ? (byCategory[category] / totalSpending) * 100 : 0
        })).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);

        return { totalBalance, totalIncome, totalExpense, categoryData };
    }, [transactions]);
    

    // UI RENDERING (Router implementation)
    const renderContent = () => {
        switch (currentPage) {
            case 'tracker':
                return (
                    <ExpenseTrackerView
                        loading={loading}
                        error={error}
                        transactions={transactions}
                        spendingSummary={spendingSummary}
                        addTransaction={addTransaction}
                        deleteTransaction={deleteTransaction}
                        newExpenseDescription={newExpenseDescription}
                        setNewExpenseDescription={setNewExpenseDescription}
                        newExpenseAmount={newExpenseAmount}
                        setNewExpenseAmount={setNewExpenseAmount}
                        newExpenseCategory={newExpenseCategory}
                        setNewExpenseCategory={setNewExpenseCategory}
                        isIncome={isIncome}
                        setIsIncome={setIsIncome}
                        setCurrentPage={setCurrentPage}
                    />
                );
            case 'splitter':
                // ExpenseSplitterView manages all its own state and logic internally.
                return <ExpenseSplitterView setCurrentPage={setCurrentPage} />;
            case 'dashboard':
            default:
                return <Dashboard setCurrentPage={setCurrentPage} />;
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-8 font-sans">
            {renderContent()}
        </div>
    );
};

export default App;
