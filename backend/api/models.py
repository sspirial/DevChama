from django.db import models
from django.conf import settings


class Chama(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_chamas')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Membership(models.Model):
    MEMBER = 'Member'
    ADMIN = 'Admin'
    TREASURER = 'Treasurer'

    MEMBER_ROLES = [
        (MEMBER, 'Member'),
        (ADMIN, 'Admin'),
        (TREASURER, 'Treasurer'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE, related_name='memberships')
    member_role = models.CharField(max_length=20, choices=MEMBER_ROLES, default=MEMBER)
    joined_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'chama')


class Contribution(models.Model):
    TYPE_CHOICES = [
        ('code', 'Code'),
        ('time', 'Time'),
        ('money', 'Money'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE, related_name='contributions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    points_awarded = models.IntegerField(default=0)
    date = models.DateTimeField(auto_now_add=True)


class Task(models.Model):
    STATUS_OPEN = 'open'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'

    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_DONE, 'Done'),
    ]

    chama = models.ForeignKey(Chama, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Reward(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE, related_name='rewards')
    points = models.IntegerField()
    payout = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    date_distributed = models.DateTimeField(auto_now_add=True)
