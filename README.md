# lan-restaurant-pos

A full-stack restaurant POS and inventory management application built with Node.js + Express + SQLite for the backend, and React + Vite for the frontend.

## Features

- User authentication and role-based access control
- Store management
- Menu and category management
- Inventory and material tracking
- Table management
- POS order creation and checkout
- Daily orders and dashboard summary
- SQLite database with seed data

## Stack

- Backend: Node.js, Express, SQLite3, JWT, bcryptjs
- Frontend: React, Vite, Axios, React Router

## Quick start

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the frontend URL printed by Vite and log in with:

- username: admin
- password: admin123

## Default admin user

- Store: demo-store
- Role: owner
- Username: admin
- Password: admin123

## Repository structure

- `backend/` – API server and database logic
- `frontend/` – React app
- `database/` – SQLite database file

## Download ZIP

Use the GitHub “Code” button to download the repository as a ZIP archive.
