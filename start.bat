@echo off
echo Starting Carbon Footprint Platform...

start cmd /k "cd /d %~dp0backend && python manage.py runserver"
timeout /t 3
start cmd /k "cd /d %~dp0frontend && npm start"

echo Both servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
