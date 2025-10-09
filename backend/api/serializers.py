from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Chama, Membership, Contribution, Task, Reward

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class ChamaSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)

    class Meta:
        model = Chama
        fields = ('id', 'title', 'description', 'creator', 'created_at')


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ('user', 'chama', 'member_role', 'joined_date')


class ContributionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Contribution
        fields = ('id', 'user', 'chama', 'type', 'amount', 'metadata', 'points_awarded', 'date')


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = ('id', 'chama', 'assigned_to', 'title', 'description', 'status', 'due_date', 'created_at')


class RewardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Reward
        fields = ('id', 'user', 'chama', 'points', 'payout', 'date_distributed')
