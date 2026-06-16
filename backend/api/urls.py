from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('carbon-entries', views.CarbonEntryViewSet, basename='carbon-entry')
router.register('goals', views.GoalViewSet, basename='goal')
router.register('articles', views.ArticleViewSet, basename='article')
router.register('forum', views.ForumPostViewSet, basename='forum')
router.register('challenges', views.EcoChallengeViewSet, basename='challenge')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('dashboard/', views.DashboardView.as_view()),
    path('recommendations/', views.RecommendationsView.as_view()),
    path('badges/', views.BadgeView.as_view()),
    path('quizzes/', views.QuizView.as_view()),
    path('quizzes/answer/', views.QuizAnswerView.as_view()),
    path('leaderboard/', views.LeaderboardView.as_view()),
    path('reports/', views.ReportView.as_view()),
    path('admin/stats/', views.AdminStatsView.as_view()),
    path('admin/users/', views.AdminUsersView.as_view()),
    path('', include(router.urls)),
]
