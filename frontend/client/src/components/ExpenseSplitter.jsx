import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    UsersIcon,
    LayoutDashboardIcon,
    PlusIcon,
    IndianRupee,
    Trash2Icon,
    CalendarIcon,
} from "./Icons";

const API_URL = "http://localhost:5000/api";

const ExpenseSplitter = ({ setCurrentPage }) => {

    // Expense Splitter states.
    const [members, setMembers] = useState([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expensePayer, setExpensePayer] = useState('');

    // Helper function to format currency.
    const formatCurrency = useCallback((amount) => {
        // Ensure negative amounts display correctly with the currency sign
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    }, []);

    // Data fetching from API.
    const fetchMembersAndExpense = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch members.
            const memberResponse = await fetch(`${API_URL}/members`);
            const membersData = await memberResponse.json();
            if (!memberResponse.ok) {
                throw new Error(membersData.error || 'Failed to fetch members');
            }

            const fetchedMembers = membersData.data;
            setMembers(fetchedMembers);

            // Set default payer if members exist
            if (fetchedMembers.length > 0) {
                setExpensePayer(fetchedMembers[0].name);
            }
            else {
                setExpensePayer('');
            }

            // Fetch expenses.
            const expenseResponse = await fetch(`${API_URL}/expenses`);
            const expensesData = await expenseResponse.json();
            if (!expenseResponse.ok) {
                throw new Error(expensesData.error || 'Failed to fetch expenses');
            }

            setExpenses(expensesData.data);
        } catch (err) {
            console.error('API fetch error: ', err);
            setError('Error fetching data from server.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembersAndExpense();
    }, [fetchMembersAndExpense]);

    // Add new member.
    const handleAddMember = async (e) => {
        e.preventDefault();
        const name = newMemberName.trim();
        if (!name) return;

        // Check for duplicate member names.
        if (members.some(member => member.name.toLowerCase() === name.toLowerCase())) {
            alert('Member with this name already exists.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add member');
            }

            // Refresh members list.
            setMembers(prevMembers => [...prevMembers, data.data]);
            setNewMemberName('');

            // If this is the first member, set as default payer.
            if (members.length === 0) {
                setExpensePayer(name);
            }
        } catch (err) {
            console.error('Add member error: ', err);
            alert('Error adding member. Please try again.');
        }
    };

    // Delete member.
    const handleDeleteMember = async (memberToRemove) => {
        if (members.length <= 1) {
            alert("Cannot remove the last member.");
            return;
        }

        // The member object contains the ID needed for the backend
        const memberId = memberToRemove._id;
        const memberName = memberToRemove.name;

        // Optimistically remove, then revert on error
        const originalMembers = members;
        setMembers(prev => prev.filter(m => m._id !== memberId));

        // Also update payer if the removed member was the payer
        if (expensePayer === memberName) {
            const nextPayer = members.find(m => m._id !== memberId)?.name || '';
            setExpensePayer(nextPayer);
        }

        // Clean up associated expenses (This is complex and ideally handled by the backend)
        // For simplicity here, we'll only clean up expenses where the deleted member was the payer.
        // A full solution would also require updating expenses where the member was a *participant*.
        // Since your current frontend logic assumes all members are participants, the safer bet is:
        setExpenses(prev => prev.filter(exp => exp.payer !== memberName));
        // Note: The logic for participants needing to be removed from an expense should be handled
        // carefully, but your current split logic assumes ALL current members.
        try {
            const response = await fetch(`${API_URL}/members/${memberId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete member');
            }
        } catch (err) {
            console.error('Delete member error: ', err);
            alert('Error deleting member. Please try again.');
            setMembers(originalMembers); // Revert on error
            fetchMembersAndExpense(); // Refresh data
        }
    };

    // Add new expense and split logic goes here...
    const handleAddExpense = async (e) => {
        e.preventDefault();

        const amount = parseFloat(expenseAmount);
        if (!expenseDescription.trim() || isNaN(amount) || amount <= 0 || !expensePayer) {
            alert('Please provide valid expense details.');
            return;
        }

        // Prepare data for backend
        const expenseData = {
            description: expenseDescription.trim(),
            amount,
            payer: expensePayer,
            participants: members.map(m => m.name) // All current members are participants
        };

        try {
            const response = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expenseData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add expense');
            }

            // Refresh expenses list.
            setExpenses(prevExpenses => [...prevExpenses, data.data]);
            setExpenseDescription('');
            setExpenseAmount('');
        } catch (err) {
            console.error('Add expense error: ', err);
            alert('Error adding expense. Please try again.');
        }
    };

    // Delete expense.
    const handleDeleteExpense = async (expenseId) => {
        // Optimistically remove, then revert on error
        const originalExpenses = expenses;
        setExpenses(prev => prev.filter(exp => exp._id !== expenseId));
        try {
            const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete expense');
            }
        } catch (err) {
            console.error('Delete expense error: ', err);
            alert('Error deleting expense. Please try again.');
            setExpenses(originalExpenses); // Revert on error
        }
    };

    //Calculate balances. (Who owes whom and how much)
    const balances = useMemo(() => {

        const memberNames = members.map(m => m.name);
        const initialBalances = memberNames.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

        const netBalances = expenses.reduce((acc, exp) => {
            if (memberNames.length === 0) return acc;  // Avoid division by zero

            const splitAmount = exp.amount / memberNames.length;
            acc[exp.payer] = (acc[exp.payer] || 0) + exp.amount;
            memberNames.forEach(name => {
                acc[name] -= splitAmount;
            });
            return acc;
        }, initialBalances);

        return netBalances;
    }, [members, expenses]);

    //UI Rendering logic goes here...
    const BalancesSummary = () => {
        // Filtering logic remains the same
        const positiveBalances = Object.entries(balances)
            .filter(([, amount]) => amount > 0.01)
            .sort(([, a], [, b]) => b - a);

        const negativeBalances = Object.entries(balances)
            .filter(([, amount]) => amount < -0.01)
            .sort(([, a], [, b]) => a - b);

        if (members.length < 2) return <p className="text-gray-500 italic">Add at least two members and some expenses to see the settlement.</p>;
        if (positiveBalances.length === 0 && negativeBalances.length === 0) return <p className="text-green-600 font-medium">All settled up! 🎉</p>;

        // ... rest of the BalancesSummary JSX ...
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-700">Net Balances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Owed To Them (Positive Balance) */}
                    <div className="p-4 bg-green-100 border border-green-200 rounded-xl shadow-inner">
                        <h4 className="font-semibold text-green-700 flex items-center mb-2"><PlusIcon className="w-5 h-5 mr-1" /> People Who Are Owed</h4>
                        <ul className="space-y-1 text-sm">
                            {positiveBalances.map(([member, amount]) => (
                                <li key={member} className="flex justify-between">
                                    <span className="font-medium text-gray-700">{member} is owed:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* They Owe (Negative Balance) */}
                    <div className="p-4 bg-red-100 border border-red-200 rounded-xl shadow-inner">
                        <h4 className="font-semibold text-red-700 flex items-center mb-2">
                            <IndianRupee className="w-5 h-5 mr-1" /> People Who Owe</h4>
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

    // Main component return JSX.
    // Show loading or error state
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl font-medium text-indigo-600">Loading data...</p></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl font-medium text-red-600">Error: {error}</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-8 font-inter">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 flex items-center">
                            <UsersIcon className="w-8 h-8 mr-3 text-indigo-600" />
                            Expense Splitter
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 italic">
                            Keep calm and split the bill.
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Members List */}
                    <div className="md:col-span-1 p-5 border border-blue-200 rounded-xl shadow-lg bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Group Members ({members.length})</h2>
                        <form onSubmit={handleAddMember} className="flex space-x-2 mb-4">
                            <input
                                type="text"
                                placeholder="Add Member Name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className="flex-1 min-w-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
                            />
                            <button type="submit" className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </form>


                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {members.map(member => (
                                <li key={member._id} className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                                    <span className="font-medium text-gray-800">{member.name}</span>
                                    <button
                                        onClick={() => handleDeleteMember(member)}
                                        disabled={members.length === 1}
                                        className="text-red-400 hover:text-red-600 disabled:text-gray-300 transition"
                                        aria-label={`Remove ${member.name}`}
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
                                <IndianRupee className="w-6 h-6 mr-2" /> Log New Expense (Split Equally)
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
                                            <option key={member._id} value={member.name}>Paid by: {member.name}</option>
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
                                        <li key={exp._id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-md">
                                            <div>
                                                <p className="font-semibold text-gray-800">{exp.description}</p>
                                                <div className="flex items-center text-sm text-gray-500 space-x-2">
                                                    <p>Paid by <span className="font-medium text-indigo-500">{exp.payer}</span></p>
                                                    {/* Date Display Logic */}
                                                    <div className="text-xs text-gray-400 flex items-center mr-2 p-3">
                                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                                        {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="font-bold text-lg text-red-600">{formatCurrency(exp.amount)}</span>
                                                <button
                                                    onClick={() => handleDeleteExpense(exp._id)}
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
        </div>
    );
};

export default ExpenseSplitter;