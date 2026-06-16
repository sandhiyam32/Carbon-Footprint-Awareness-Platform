from django.db import models
from django.db.models import Sum, Avg
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import date, timedelta
import io

from .models import (User, CarbonEntry, Goal, Badge, Article,
                     Quiz, ForumPost, ForumComment, EcoChallenge, ChallengeParticipation)
from .serializers import (RegisterSerializer, LoginSerializer, UserSerializer,
                           CarbonEntrySerializer, GoalSerializer, BadgeSerializer,
                           ArticleSerializer, QuizSerializer, QuizAnswerSerializer,
                           ForumPostSerializer, ForumCommentSerializer,
                           EcoChallengeSerializer, LeaderboardSerializer)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        from rest_framework_simplejwt.tokens import RefreshToken
        tokens = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        entries = CarbonEntry.objects.filter(user=user).order_by('-year', '-month')

        current = entries.filter(month=today.month, year=today.year).first()
        current_emission = current.total_emission if current else 0

        last_month = today.replace(day=1) - timedelta(days=1)
        prev = entries.filter(month=last_month.month, year=last_month.year).first()
        last_emission = prev.total_emission if prev else 0

        yearly = entries.filter(year=today.year).aggregate(total=Sum('total_emission'))['total'] or 0

        trend = list(entries[:6].values('month', 'year', 'total_emission',
                                         'transport_emission', 'electricity_emission',
                                         'food_emission', 'waste_emission'))

        category_breakdown = {
            'transport': current.transport_emission if current else 0,
            'electricity': current.electricity_emission if current else 0,
            'water': current.water_emission if current else 0,
            'food': current.food_emission if current else 0,
            'waste': current.waste_emission if current else 0,
        }

        reduction = 0
        if last_emission > 0:
            reduction = round((last_emission - current_emission) / last_emission * 100, 1)

        return Response({
            'current_emission': round(current_emission, 2),
            'last_month_emission': round(last_emission, 2),
            'yearly_emission': round(yearly, 2),
            'monthly_trend': trend,
            'category_breakdown': category_breakdown,
            'national_avg': 400,
            'global_avg': 333,
            'reduction_percent': reduction,
        })


class CarbonEntryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CarbonEntrySerializer

    def get_queryset(self):
        return CarbonEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        today = date.today()
        serializer.save(user=self.request.user, month=today.month, year=today.year)
        self._check_badges(self.request.user)

    def perform_update(self, serializer):
        today = date.today()
        serializer.save(user=self.request.user, month=today.month, year=today.year)
        self._check_badges(self.request.user)

    def _check_badges(self, user):
        count = CarbonEntry.objects.filter(user=user).count()
        badge_map = {
            1: ('First Entry', 'Logged your first carbon entry!', '🌱'),
            5: ('Consistent Tracker', 'Logged 5 entries!', '📊'),
            12: ('Year Warrior', 'Tracked a full year!', '🏆'),
        }
        if count in badge_map:
            name, desc, icon = badge_map[count]
            Badge.objects.get_or_create(user=user, name=name, defaults={'description': desc, 'icon': icon})


class GoalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = GoalSerializer

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        entry = CarbonEntry.objects.filter(user=user, month=today.month, year=today.year).first()

        recommendations = []
        if not entry:
            return Response([{'category': 'general', 'tip': 'Log your first carbon entry to get personalized recommendations!', 'impact': 'high', 'icon': '📝'}])

        if entry.car_km > 200:
            recommendations.append({'category': 'transport', 'tip': 'You drive a lot. Try carpooling or switching to public transport to cut emissions by up to 70%.', 'impact': 'high', 'icon': '🚌'})
        if entry.flight_hours > 2:
            recommendations.append({'category': 'transport', 'tip': 'Consider reducing flights. One long-haul flight can emit as much CO₂ as months of driving.', 'impact': 'high', 'icon': '✈️'})
        if entry.electricity_kwh > 300:
            recommendations.append({'category': 'energy', 'tip': 'Your electricity usage is high. Switch to LED bulbs and unplug idle devices to save up to 30%.', 'impact': 'medium', 'icon': '💡'})
        if entry.food_type == 'non_vegetarian':
            recommendations.append({'category': 'food', 'tip': 'Reducing meat consumption even 2 days/week can cut food-related emissions by 20%.', 'impact': 'medium', 'icon': '🥗'})
        if entry.recycling_percent < 30:
            recommendations.append({'category': 'waste', 'tip': 'Increase recycling. Recycling 50% of household waste can save 1,200 lbs of CO₂ annually.', 'impact': 'medium', 'icon': '♻️'})
        if entry.water_liters > 5000:
            recommendations.append({'category': 'water', 'tip': 'Reduce water usage by fixing leaks and taking shorter showers to lower water-related emissions.', 'impact': 'low', 'icon': '💧'})

        if not recommendations:
            recommendations.append({'category': 'general', 'tip': 'Great job! Your footprint is low. Keep it up and inspire others in the community!', 'impact': 'low', 'icon': '🌟'})

        return Response(recommendations)


class BadgeView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BadgeSerializer

    def get_queryset(self):
        return Badge.objects.filter(user=self.request.user)


class ArticleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        return Article.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class QuizView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()


class QuizAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuizAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz = Quiz.objects.get(id=serializer.validated_data['quiz_id'])
        correct = quiz.correct_option == serializer.validated_data['answer']
        return Response({
            'correct': correct,
            'correct_option': quiz.correct_option,
            'explanation': quiz.explanation,
        })


class ForumPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ForumPostSerializer
    queryset = ForumPost.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        post.likes += 1
        post.save()
        return Response({'likes': post.likes})

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        post = self.get_object()
        comment = ForumComment.objects.create(
            post=post, user=request.user,
            content=request.data.get('content', '')
        )
        return Response(ForumCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class EcoChallengeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EcoChallengeSerializer
    queryset = EcoChallenge.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        challenge = self.get_object()
        participation, created = ChallengeParticipation.objects.get_or_create(
            user=request.user, challenge=challenge
        )
        if not created:
            return Response({'detail': 'Already joined'}, status=400)
        return Response({'detail': 'Joined successfully!'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        challenge = self.get_object()
        participation = ChallengeParticipation.objects.filter(
            user=request.user, challenge=challenge
        ).first()
        if not participation:
            return Response({'detail': 'Not joined'}, status=400)
        participation.completed = True
        participation.points_earned = challenge.points
        participation.save()
        Badge.objects.get_or_create(
            user=request.user, name=f'Challenge: {challenge.title}',
            defaults={'description': f'Completed the {challenge.title} challenge!', 'icon': '🌿'}
        )
        return Response({'detail': 'Challenge completed! Badge earned!'})


class LeaderboardView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeaderboardSerializer

    def get_queryset(self):
        return User.objects.filter(carbon_entries__isnull=False).distinct()


class ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        user = request.user
        today = date.today()

        if period == 'monthly':
            entries = CarbonEntry.objects.filter(user=user, year=today.year)
        else:
            entries = CarbonEntry.objects.filter(user=user)

        data = entries.values('month', 'year', 'total_emission',
                              'transport_emission', 'electricity_emission',
                              'food_emission', 'waste_emission', 'water_emission')

        total = entries.aggregate(t=Sum('total_emission'))['t'] or 0
        avg = total / entries.count() if entries.count() > 0 else 0

        return Response({
            'entries': list(data),
            'total': round(total, 2),
            'average': round(avg, 2),
            'period': period,
            'generated_at': today.isoformat(),
        })


# Admin Views
class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Forbidden'}, status=403)
        return Response({
            'total_users': User.objects.count(),
            'total_entries': CarbonEntry.objects.count(),
            'total_articles': Article.objects.count(),
            'total_challenges': EcoChallenge.objects.count(),
            'total_posts': ForumPost.objects.count(),
            'avg_emission': round(CarbonEntry.objects.aggregate(avg=Avg('total_emission'))['avg'] or 0, 2),
        })


class AdminUsersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        if not self.request.user.is_staff:
            return User.objects.none()
        return User.objects.all()
