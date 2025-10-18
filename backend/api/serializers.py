from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Chama, Membership, Contribution, Task, Reward

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id', 'username', 'email')


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
        read_only_fields = ('user', 'chama', 'joined_date')


class ContributionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = Contribution
        fields = ('id', 'user', 'chama', 'type', 'amount', 'metadata', 'points_awarded', 'date')
        read_only_fields = ('points_awarded', 'date')

    def validate(self, attrs):
        contrib_type = attrs.get('type')
        amount = attrs.get('amount')
        if contrib_type == 'money':
            if amount is None:
                raise serializers.ValidationError({'amount': 'Amount is required for money contributions.'})
            if amount <= 0:
                raise serializers.ValidationError({'amount': 'Amount must be greater than zero.'})
        if contrib_type in ('time', 'other') and amount is not None and amount < 0:
            raise serializers.ValidationError({'amount': 'Amount cannot be negative.'})
        return attrs


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Task
        fields = (
            'id', 'chama', 'assigned_to', 'assigned_to_user_id', 'title',
            'description', 'status', 'due_date', 'created_at'
        )
        read_only_fields = ('created_at',)

    def validate(self, attrs):
        chama = attrs.get('chama') or getattr(self.instance, 'chama', None)
        assigned_user = attrs.get('assigned_to_user_id')
        status_value = attrs.get('status') or getattr(self.instance, 'status', None)

        if assigned_user and chama and not Membership.objects.filter(user=assigned_user, chama=chama).exists() and chama.creator_id != assigned_user.id:
            raise serializers.ValidationError({'assigned_to_user_id': 'Assigned user must be a member of the chama.'})

        valid_status = dict(Task.STATUS_CHOICES)
        if status_value and status_value not in valid_status:
            raise serializers.ValidationError({'status': 'Invalid status specified.'})

        return attrs

    def create(self, validated_data):
        assigned_user = validated_data.pop('assigned_to_user_id', None)
        task = super().create(validated_data)
        if assigned_user:
            task.assigned_to = assigned_user
            task.save(update_fields=['assigned_to'])
        return task

    def update(self, instance, validated_data):
        assigned_user = validated_data.pop('assigned_to_user_id', None)
        task = super().update(instance, validated_data)
        if assigned_user is not None:
            task.assigned_to = assigned_user
            task.save(update_fields=['assigned_to'])
        return task


class RewardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Reward
        fields = ('id', 'user', 'chama', 'points', 'payout', 'date_distributed')
