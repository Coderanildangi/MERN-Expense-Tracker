// src/components/Dashboard.jsx
import React from "react";
import { LayoutDashboardIcon, PieChartIcon, UsersIcon } from "./Icons";

const Dashboard = ({ setCurrentPage }) => {
    return (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
            <header className="mb-10 text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-500 flex items-center justify-center mb-3">
                    <LayoutDashboardIcon className="w-10 h-12 mr-3 text-emerald-600 animate-pulse" />
                    SpendWise
                </h1>
                <p className="text-lg text-amber-400 italic animate-bounce">
                    "Track. Split. Simplify you finances"
                </p>
            </header>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button
                    onClick={() => setCurrentPage("tracker")}
                    className="bg-emerald-600 text-white p-8 rounded-xl shadow-xl hover:bg-emerald-700 transform hover:scale-[1.02] transition duration-300 flex flex-col items-center justify-center h-56"
                >
                    <PieChartIcon className="w-12 h-12 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">1. Expense Tracker</h2>
                    <p className="text-sm opacity-90">
                        Log, categorize, and monitor your income and expenses.
                    </p>
                </button>

                <button
                    onClick={() => setCurrentPage("splitter")}
                    className="bg-indigo-600 text-white p-8 rounded-xl shadow-xl hover:bg-indigo-700 transform hover:scale-[1.02] transition duration-300 flex flex-col items-center justify-center h-56"
                >
                    <UsersIcon className="w-12 h-12 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">2. Expense Splitter</h2>
                    <p className="text-sm opacity-90">
                        Split bills and debts among groups.
                    </p>
                </button>
            </div>

            <footer className="mt-12 text-center text-gray-400 text-sm">
                © 2025 Anil Dangi. All rights reserved.
            </footer>
        </div>
    );
};

export default Dashboard;
