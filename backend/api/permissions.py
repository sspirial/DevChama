from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Membership


def is_chama_member(user, chama):
    if not user or not user.is_authenticated:
        return False
    if chama.creator_id == user.id:
        return True
    return Membership.objects.filter(user=user, chama=chama).exists()


def is_chama_admin(user, chama):
    if not user or not user.is_authenticated:
        return False
    if chama.creator_id == user.id:
        return True
    return Membership.objects.filter(
        user=user,
        chama=chama,
        member_role=Membership.ADMIN,
    ).exists()


class IsChamaMemberOrReadOnly(BasePermission):
    """Allow read access to chama members, write access to chama admins/creator."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return is_chama_member(request.user, obj)
        return is_chama_admin(request.user, obj)


class IsRelatedChamaMember(BasePermission):
    """Check membership against obj.chama relation."""

    def has_object_permission(self, request, view, obj):
        chama = getattr(obj, 'chama', None)
        if chama is None:
            return False
        if request.method in SAFE_METHODS:
            return is_chama_member(request.user, chama)
        return is_chama_admin(request.user, chama)


class IsMembershipOwnerOrAdmin(BasePermission):
    """Allow membership deletion by self or chama admin/creator."""

    def has_object_permission(self, request, view, obj):
        chama = obj.chama
        if request.user == obj.user:
            return True
        return is_chama_admin(request.user, chama)
