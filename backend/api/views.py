from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Chama, Membership, Contribution, Task, Reward
from .serializers import (
    ChamaSerializer, MembershipSerializer, ContributionSerializer,
    TaskSerializer, RewardSerializer, UserSerializer
)

User = get_user_model()


class ChamaViewSet(viewsets.ModelViewSet):
    queryset = Chama.objects.all().order_by('-created_at')
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class MembershipViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, chama_pk=None):
        chama = get_object_or_404(Chama, pk=chama_pk)
        memberships = chama.memberships.select_related('user')
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)

    def create(self, request, chama_pk=None):
        chama = get_object_or_404(Chama, pk=chama_pk)
        # prevent duplicate
        Membership.objects.get_or_create(user=request.user, chama=chama)
        return Response({'status': 'joined'}, status=status.HTTP_201_CREATED)

    def destroy(self, request, chama_pk=None, pk=None):
        # pk is user id
        chama = get_object_or_404(Chama, pk=chama_pk)
        member = get_object_or_404(Membership, chama=chama, user__id=pk)
        # allow self or chama creator
        if request.user == member.user or request.user == chama.creator:
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)


class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all().order_by('-date')
    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


class RewardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Reward.objects.all().order_by('-date_distributed')
    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated]
