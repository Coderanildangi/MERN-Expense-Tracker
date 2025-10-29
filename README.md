# MERN-Expense-Tracker

💰 Overview

The MERN Expense Tracker is a full-stack web application designed to help users manage their personal finances by tracking income and expenses in real-time. It provides a clean dashboard displaying the current balance, total income, total expenses, and a breakdown of spending by category.

This project is built using the MERN stack, demonstrating a decoupled architecture where the React frontend communicates with a RESTful API built with Node.js and Express, which in turn interacts with a MongoDB cloud database.

🛠️ Tech Stack

Layer

Technology

Purpose

Frontend (R)

React (with Hooks)

User Interface and Category Visualization

Backend (E & N)

Express & Node.js

Handles API requests (Routing, CRUD logic)

Database (M)

MongoDB Atlas

Cloud-hosted NoSQL data storage

Styling

Tailwind CSS (via React setup)

Utility-first styling for a responsive and modern UI

🚀 Getting Started

Follow these steps to set up and run the Expense Tracker on your local machine.

Prerequisites

You need the following installed:

Node.js (v14+) & npm (comes with Node)

MongoDB Atlas Account (for a free cloud database)

A code editor (like VS Code)

Step 1: Backend Setup (Server & Database)

Clone the Repository (or recreate the file structure described in the chat history) and navigate to the root directory: expense-tracker-mern/.

Install Dependencies:

npm install express mongoose cors dotenv


Configure Database Connection (.env file):
Create a file named .env in the root directory and replace the placeholders with your actual MongoDB Atlas connection string.

# Your updated MONGO_URI from the .env file
MONGO_URI=mongodb+srv://YOUR_ATLAS_USERNAME:YOUR_ATLAS_PASSWORD@cluster0.abcde.mongodb.net/expense-db?retryWrites=true&w=majority
PORT=5000


Start the Backend Server:
In your terminal, from the root directory, run:

node server.js


You should see confirmation messages that MongoDB is connected and the server is running on http://localhost:5000. Keep this terminal window open.

Step 2: Frontend Setup (React Client)

Navigate to the client directory:

cd client


Install Frontend Dependencies:

npm install lucide-react


Start the React Client:
In a new terminal window, run:

npm start


This launches the application in your web browser, usually at http://localhost:3000.

📌 API Endpoints

The React frontend interacts with the following REST endpoints defined in the server.js file:

HTTP Method

Endpoint

Description

GET

/api/transactions

Retrieves all transactions, sorted newest first.

POST

/api/transactions

Creates a new transaction (sends description, amount, category, type).

DELETE

/api/transactions/:id

Deletes a transaction using its MongoDB ID.

📂 Project Structure

The project follows a standard decoupled MERN structure:

expense-tracker-mern/
├── client/                     # React Frontend
│   └── src/
│       └── App.jsx             # Main React Component & Logic
├── models/                     # Mongoose Schemas (Database structure)
│   └── Transaction.js          # Transaction data model
├── server.js                   # Express Server (DB connection, API routes)
└── .env                        # Environment variables (DB credentials)
