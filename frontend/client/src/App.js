// src/App.jsx
import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import ExpenseTracker from "./components/ExpenseTracker";
//import ExpenseSplitterView from "./components/ExpenseSplitterView";

const App = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 p-6">
      {currentPage === "dashboard" && <Dashboard setCurrentPage={setCurrentPage} />}
      {currentPage === "tracker" && <ExpenseTracker setCurrentPage={setCurrentPage} />}
      {/* {currentPage === "splitter" && <ExpenseSplitterView setCurrentPage={setCurrentPage} />} */}
    </main>
  );
};

export default App;
