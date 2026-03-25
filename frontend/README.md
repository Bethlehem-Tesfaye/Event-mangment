# Event Management System — Frontend

The frontend for the Event Management System provides a responsive, type-safe interface for creating, editing, and browsing events. It integrates closely with the backend API to handle authentication, drafts, publishing workflows, and categorized listings.

## Tech Stack

- **React** with **TypeScript**
- **TanStack React Query** for server-state management
- **Axios** for API communication
- **Vite** for fast development and builds

## Key Features

- 🔐 Authentication flows (Signup, Login)
- 📝 Create, edit, and delete events
- 🧑‍🏫 Manage speakers, ticket types, and categories
- 📂 Filter and browse events by category
- ⚡ Optimistic updates and caching via React Query

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn

### Installation

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the `client` directory and add:

```bash
VITE_BACKEND_URL=http://localhost:5000
```

> This should point to the running backend API.

### Run the App

Start the development server:

```bash
npm run dev
```

The app will be available at the local Vite development URL (usually `http://localhost:5173`).

## Development Notes

- Server data fetching, caching, and mutations are handled via **TanStack React Query**.
- API errors and loading states are centralized for consistent UX.
- TypeScript types are shared across components to ensure end-to-end type safety.

## Build

To create a production build:

```bash
npm run build
```

The optimized output will be generated in the `dist/` directory.
