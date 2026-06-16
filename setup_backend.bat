@echo off
echo ========================================
echo  Carbon Footprint Platform - Backend Setup
echo ========================================

cd backend

echo Installing Python dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo Creating superuser (admin/admin123)...
python manage.py shell -c "from api.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@ecotrack.com', 'admin123')"

echo Seeding sample data...
python manage.py shell -c "
from api.models import Quiz, EcoChallenge, Article, User

# Seed Quizzes
quizzes = [
    {'question': 'Which transport produces most CO2 per km?', 'option_a': 'Electric car', 'option_b': 'Commercial flight', 'option_c': 'Diesel car', 'option_d': 'Bus', 'correct_option': 'b', 'explanation': 'Commercial flights emit ~255g CO2/km per passenger.'},
    {'question': 'How much CO2 does a tree absorb per year?', 'option_a': '5 kg', 'option_b': '10 kg', 'option_c': '22 kg', 'option_d': '50 kg', 'correct_option': 'c', 'explanation': 'A mature tree absorbs about 22 kg of CO2 per year.'},
    {'question': 'What % of global emissions comes from food production?', 'option_a': '10%', 'option_b': '26%', 'option_c': '40%', 'option_d': '15%', 'correct_option': 'b', 'explanation': 'Food production accounts for ~26% of global greenhouse gas emissions.'},
]
for q in quizzes:
    Quiz.objects.get_or_create(question=q['question'], defaults=q)

# Seed Challenges
challenges = [
    {'title': 'No-Car Week', 'description': 'Use only public transport, cycling, or walking for 7 days.', 'points': 50, 'duration_days': 7},
    {'title': 'Zero Waste Day', 'description': 'Produce zero non-recyclable waste for an entire day.', 'points': 30, 'duration_days': 1},
    {'title': 'Vegan for a Week', 'description': 'Adopt a fully plant-based diet for 7 days.', 'points': 40, 'duration_days': 7},
    {'title': 'Energy Saver', 'description': 'Reduce your electricity consumption by 20% this month.', 'points': 60, 'duration_days': 30},
]
for c in challenges:
    EcoChallenge.objects.get_or_create(title=c['title'], defaults=c)

admin = User.objects.filter(username='admin').first()
if admin:
    articles = [
        {'title': 'Understanding Your Carbon Footprint', 'content': 'Your carbon footprint is the total greenhouse gas emissions caused by your actions. The average person generates about 4 tons of CO2 per year.', 'category': 'Climate Change', 'author': admin},
        {'title': '10 Simple Ways to Go Green at Home', 'content': 'Switch to LED lighting, fix leaky faucets, compost food scraps, use energy-efficient appliances, and plant native trees.', 'category': 'Sustainable Living', 'author': admin},
    ]
    for a in articles:
        Article.objects.get_or_create(title=a['title'], defaults=a)

print('Seed data created successfully!')
"

echo.
echo ========================================
echo  Backend ready! Run: python manage.py runserver
echo ========================================
