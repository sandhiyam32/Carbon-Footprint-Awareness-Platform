from django.contrib import admin
from .models import User, CarbonEntry, Goal, Badge, Article, Quiz, ForumPost, EcoChallenge

admin.site.register(User)
admin.site.register(CarbonEntry)
admin.site.register(Goal)
admin.site.register(Badge)
admin.site.register(Article)
admin.site.register(Quiz)
admin.site.register(ForumPost)
admin.site.register(EcoChallenge)
