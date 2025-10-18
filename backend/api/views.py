from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import Chama, Membership, Contribution, Task, Reward
from .serializers import (
    ChamaSerializer, MembershipSerializer, ContributionSerializer,
    TaskSerializer, RewardSerializer, UserSerializer,
    RegisterSerializer, ProfileSerializer
)
from .permissions import (
    IsChamaMemberOrReadOnly,
    IsRelatedChamaMember,
    IsMembershipOwnerOrAdmin,
    is_chama_member,
    is_chama_admin,
)

User = get_user_model()


class ChamaViewSet(viewsets.ModelViewSet):
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated, IsChamaMemberOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Chama.objects.none()
        return Chama.objects.filter(
            Q(creator=user) | Q(memberships__user=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class MembershipViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, chama_pk=None):
        chama = get_object_or_404(Chama, pk=chama_pk)
        if not is_chama_member(request.user, chama):
            return Response({'detail': 'Not a member of this chama.'}, status=status.HTTP_403_FORBIDDEN)
        memberships = chama.memberships.select_related('user')
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)

    def create(self, request, chama_pk=None):
        chama = get_object_or_404(Chama, pk=chama_pk)
        member_role = request.data.get('member_role', Membership.MEMBER)
        valid_roles = dict(Membership.MEMBER_ROLES)
        if member_role not in valid_roles:
            return Response({'member_role': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)

        target_user = request.user
        user_id = request.data.get('user_id')
        if user_id:
            if str(user_id) != str(request.user.id) and not is_chama_admin(request.user, chama):
                return Response({'detail': 'Only chama admins can add other members.'}, status=status.HTTP_403_FORBIDDEN)
            target_user = get_object_or_404(User, pk=user_id)

        if member_role != Membership.MEMBER and not is_chama_admin(request.user, chama):
            return Response({'detail': 'Only chama admins can assign elevated roles.'}, status=status.HTTP_403_FORBIDDEN)

        if is_chama_member(target_user, chama):
            return Response({'detail': 'Already a member.'}, status=status.HTTP_400_BAD_REQUEST)

        membership = Membership.objects.create(user=target_user, chama=chama, member_role=member_role)
        serializer = MembershipSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, chama_pk=None, pk=None):
        chama = get_object_or_404(Chama, pk=chama_pk)
        membership = get_object_or_404(Membership, chama=chama, user__id=pk)
        if not is_chama_admin(request.user, chama):
            return Response({'detail': 'Only chama admins can update member roles.'}, status=status.HTTP_403_FORBIDDEN)

        member_role = request.data.get('member_role')
        if member_role not in dict(Membership.MEMBER_ROLES):
            return Response({'member_role': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)

        membership.member_role = member_role
        membership.save(update_fields=['member_role'])
        serializer = MembershipSerializer(membership)
        return Response(serializer.data)

    def destroy(self, request, chama_pk=None, pk=None):
        chama = get_object_or_404(Chama, pk=chama_pk)
        member = get_object_or_404(Membership, chama=chama, user__id=pk)
        self.check_object_permissions(request, member)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def leave(self, request, chama_pk=None):
        chama = get_object_or_404(Chama, pk=chama_pk)
        if chama.creator_id == request.user.id:
            return Response({'detail': 'Creators cannot leave their own chama. Transfer ownership first.'}, status=status.HTTP_400_BAD_REQUEST)
        membership = get_object_or_404(Membership, chama=chama, user=request.user)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def check_object_permissions(self, request, obj):
        for permission in [IsMembershipOwnerOrAdmin()]:
            if not permission.has_object_permission(request, self, obj):
                self.permission_denied(request, message='Not authorized to modify membership.')


class ContributionViewSet(viewsets.ModelViewSet):
    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated, IsRelatedChamaMember]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Contribution.objects.none()
        return Contribution.objects.filter(
            Q(chama__creator=user) | Q(chama__memberships__user=user)
        ).distinct().order_by('-date')

    def perform_create(self, serializer):
        chama = serializer.validated_data['chama']
        if not is_chama_member(self.request.user, chama):
            raise PermissionDenied('Join the chama before contributing.')
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsRelatedChamaMember]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()
        return Task.objects.filter(
            Q(chama__creator=user) | Q(chama__memberships__user=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        chama = serializer.validated_data['chama']
        if not is_chama_admin(self.request.user, chama):
            raise PermissionDenied('Only chama admins can create tasks.')
        serializer.save()


class RewardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated, IsRelatedChamaMember]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Reward.objects.none()
        return Reward.objects.filter(
            Q(chama__creator=user) | Q(chama__memberships__user=user)
        ).distinct().order_by('-date_distributed')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class MyChamasView(generics.ListAPIView):
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chama.objects.filter(
            Q(creator=user) | Q(memberships__user=user)
        ).distinct().order_by('-created_at')
