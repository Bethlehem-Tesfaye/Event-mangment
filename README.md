# Event Management System

A full-stack web application for managing events, including features for creating and updating event details, managing speakers, tickets, and categories. Users can save events as drafts, publish them, and view categorized listings.

## Tech Stack

### **Backend**: 
- Node.js, Express.js, PostgreSQL,
- Zod for request validation,
- JWT for authentication
### **Frontend**:
- React with typescript,
- TanStack React Query for state and server data management
- Axios for API communication


## Features

- 🔐 User authentication (Signup, Login)
- 📝 Create, edit, and delete events
- 🧾 Draft vs published event handling
- 🧑‍🏫 Manage speakers, ticket types, and event categories
- 🗃️ Soft deletion for speakers, tickets, and categories
- 💾 Auto-saving drafts while editing
- 📂 Filter events by category
- 🧪 Backend validation and clean API responses

## Folder Structure

- `server/`: Backend code (Express + PostgreSQL)
- `client/`: Frontend code (React + tanstack react query)

## Installation

> ⚠️ Make sure PostgreSQL is installed and running before you begin.

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/event-management-system.git
   cd event-management-system
### Backend setup 
    cd server
    npm install
    DATABASE_URL=your_postgres_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5000
    NODE_ENV=development
    npm run dev
    
### Frontend Setup

  Navigate to the frontend folder:

bash
Edit
cd ../client
Install dependencies:

```bash
cd ../server
npm install
```

Create a .env file and add the following environment variable:

```bash
VITE_BACKEND_URL=http://localhost:5000
```
Start the development server:

```bash
npm run dev
