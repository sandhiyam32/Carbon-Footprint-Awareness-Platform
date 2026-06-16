from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    bio = models.TextField(blank=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class CarbonEntry(models.Model):
    FOOD_CHOICES = [
        ('vegan', 'Vegan'),
        ('vegetarian', 'Vegetarian'),
        ('non_vegetarian', 'Non-Vegetarian'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carbon_entries')
    date = models.DateField(auto_now_add=True)
    month = models.IntegerField()
    year = models.IntegerField()

    # Transportation (kg CO2/month)
    car_km = models.FloatField(default=0)
    bike_km = models.FloatField(default=0)
    bus_km = models.FloatField(default=0)
    train_km = models.FloatField(default=0)
    flight_hours = models.FloatField(default=0)

    # Utilities
    electricity_kwh = models.FloatField(default=0)
    water_liters = models.FloatField(default=0)

    # Food & Waste
    food_type = models.CharField(max_length=20, choices=FOOD_CHOICES, default='non_vegetarian')
    waste_kg = models.FloatField(default=0)
    recycling_percent = models.FloatField(default=0)

    # Calculated totals
    transport_emission = models.FloatField(default=0)
    electricity_emission = models.FloatField(default=0)
    water_emission = models.FloatField(default=0)
    food_emission = models.FloatField(default=0)
    waste_emission = models.FloatField(default=0)
    total_emission = models.FloatField(default=0)

    class Meta:
        ordering = ['-year', '-month']
        unique_together = ['user', 'month', 'year']

    def calculate_emissions(self):
        self.transport_emission = (
            self.car_km * 0.21 +
            self.bike_km * 0.0 +
            self.bus_km * 0.089 +
            self.train_km * 0.041 +
            self.flight_hours * 90
        )
        self.electricity_emission = self.electricity_kwh * 0.233
        self.water_emission = self.water_liters * 0.0003
        food_factors = {'vegan': 55, 'vegetarian': 110, 'non_vegetarian': 220}
        self.food_emission = food_factors.get(self.food_type, 220)
        waste_factor = max(0.1, 1 - self.recycling_percent / 100)
        self.waste_emission = self.waste_kg * 0.5 * waste_factor
        self.total_emission = (
            self.transport_emission + self.electricity_emission +
            self.water_emission + self.food_emission + self.waste_emission
        )

    def save(self, *args, **kwargs):
        self.calculate_emissions()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.month}/{self.year}"


class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    target_emission = models.FloatField()
    current_emission = models.FloatField(default=0)
    deadline = models.DateField()
    achieved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Badge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10, default='🏆')
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class Article(models.Model):
    title = models.CharField(max_length=300)
    content = models.TextField()
    category = models.CharField(max_length=100)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image_url = models.URLField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Quiz(models.Model):
    question = models.TextField()
    option_a = models.CharField(max_length=200)
    option_b = models.CharField(max_length=200)
    option_c = models.CharField(max_length=200)
    option_d = models.CharField(max_length=200)
    correct_option = models.CharField(max_length=1)
    explanation = models.TextField()

    def __str__(self):
        return self.question[:60]


class ForumPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=300)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ForumComment(models.Model):
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username}"


class EcoChallenge(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    points = models.IntegerField(default=10)
    duration_days = models.IntegerField(default=7)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ChallengeParticipation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenges')
    challenge = models.ForeignKey(EcoChallenge, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'challenge']
