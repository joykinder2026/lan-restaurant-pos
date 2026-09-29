# LAN Restaurant POS Setup

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Environment values:

```env
PORT=4000
JWT_SECRET=lan_restaurant_pos_secret_2026
DB_PATH=../database/lan_restaurant_pos.db
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Default login

Username: `admin`
Password: `admin123`

## Production build

```bash
cd frontend
npm run build
```
