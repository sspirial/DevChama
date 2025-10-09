from django.contrib import admin
from .models import Chama, Membership, Contribution, Task, Reward

@admin.register(Chama)
class ChamaAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'creator', 'created_at')


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'chama', 'member_role', 'joined_date')


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'chama', 'type', 'points_awarded', 'date')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'chama', 'assigned_to', 'status', 'due_date')


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'chama', 'points', 'payout', 'date_distributed')
