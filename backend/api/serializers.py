from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import (User, CarbonEntry, Goal, Badge, Article,
                     Quiz, ForumPost, ForumComment, EcoChallenge, ChallengeParticipation)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        tokens = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'is_admin', 'created_at']
        read_only_fields = ['id', 'created_at']


class CarbonEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CarbonEntry
        fields = '__all__'
        read_only_fields = ['user', 'month', 'year', 'date',
                            'transport_emission', 'electricity_emission',
                            'water_emission', 'food_emission', 'waste_emission', 'total_emission']


class GoalSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['user']

    def get_progress_percent(self, obj):
        if obj.target_emission == 0:
            return 0
        reduction = obj.current_emission - obj.target_emission
        baseline = obj.current_emission if obj.current_emission > 0 else 1
        return min(100, max(0, round((1 - obj.target_emission / baseline) * 100)))


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ['author']

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username if obj.author else 'Admin'


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'question', 'option_a', 'option_b', 'option_c', 'option_d']


class QuizAnswerSerializer(serializers.Serializer):
    quiz_id = serializers.IntegerField()
    answer = serializers.CharField(max_length=1)


class ForumCommentSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = ForumComment
        fields = '__all__'
        read_only_fields = ['user']

    def get_username(self, obj):
        return obj.user.username


class ForumPostSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    comments = ForumCommentSerializer(many=True, read_only=True)

    class Meta:
        model = ForumPost
        fields = '__all__'
        read_only_fields = ['user', 'likes']

    def get_username(self, obj):
        return obj.user.username

    def get_comment_count(self, obj):
        return obj.comments.count()


class EcoChallengeSerializer(serializers.ModelSerializer):
    is_joined = serializers.SerializerMethodField()

    class Meta:
        model = EcoChallenge
        fields = '__all__'

    def get_is_joined(self, obj):
        request = self.context.get('request')
        if request:
            return ChallengeParticipation.objects.filter(user=request.user, challenge=obj).exists()
        return False


class LeaderboardSerializer(serializers.ModelSerializer):
    total_reduction = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'total_reduction', 'points']

    def get_total_reduction(self, obj):
        entries = obj.carbon_entries.all()
        if entries.count() < 2:
            return 0
        latest = entries.first().total_emission
        oldest = entries.last().total_emission
        return round(max(0, oldest - latest), 2)

    def get_points(self, obj):
        from django.db.models import Sum
        return obj.challenges.filter(completed=True).aggregate(
            total=Sum('points_earned'))['total'] or 0


class DashboardSerializer(serializers.Serializer):
    current_emission = serializers.FloatField()
    last_month_emission = serializers.FloatField()
    yearly_emission = serializers.FloatField()
    monthly_trend = serializers.ListField()
    category_breakdown = serializers.DictField()
    national_avg = serializers.FloatField()
    global_avg = serializers.FloatField()
    reduction_percent = serializers.FloatField()
