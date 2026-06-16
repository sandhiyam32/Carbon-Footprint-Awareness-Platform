# Carbon Footprint Awareness Platform

A full-stack web application to track, understand, and reduce personal carbon emissions.

## Tech Stack
- **Frontend**: React.js + Recharts + React Router
- **Backend**: Django REST Framework + JWT Auth
- **Database**: SQLite (zero config)

---

## Setup & Run

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Or just run: `setup_backend.bat`

**Default Admin:** `admin` / `admin123`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Or just run: `setup_frontend.bat`

### 3. Start Both Together
Run: `start.bat`

---

## Access
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## Features

| Feature | Status |
|---------|--------|
| User Registration & Login (JWT) | ✅ |
| Carbon Footprint Calculator | ✅ |
| Dashboard with Charts | ✅ |
| Personalized Recommendations | ✅ |
| Goal Setting & Tracking | ✅ |
| Badge & Achievement System | ✅ |
| Education Hub (Articles + Quizzes) | ✅ |
| Community Forum | ✅ |
| Eco-Challenges | ✅ |
| Leaderboard | ✅ |
| Reports & Analytics | ✅ |
| Admin Panel | ✅ |
| Responsive Mobile UI | ✅ |

---

## Carbon Emission Factors Used
| Category | Factor |
|----------|--------|
| Car | 0.21 kg CO₂/km |
| Bus | 0.089 kg CO₂/km |
| Train | 0.041 kg CO₂/km |
| Flight | 90 kg CO₂/hour |
| Electricity | 0.233 kg CO₂/kWh |
| Water | 0.0003 kg CO₂/liter |
| Food (Vegan) | 55 kg CO₂/month |
| Food (Vegetarian) | 110 kg CO₂/month |
| Food (Non-Veg) | 220 kg CO₂/month |
