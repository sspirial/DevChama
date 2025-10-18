from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChamaViewSet, ContributionViewSet, TaskViewSet, RewardViewSet,
    MembershipViewSet, RegisterView, ProfileView, MyChamasView
)

router = DefaultRouter()
router.register(r'chamas', ChamaViewSet, basename='chama')
router.register(r'contributions', ContributionViewSet, basename='contribution')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'rewards', RewardViewSet, basename='reward')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('me/chamas/', MyChamasView.as_view(), name='my-chamas'),
    path('chamas/<int:chama_pk>/members/', MembershipViewSet.as_view({'get': 'list', 'post': 'create'}), name='chama-members'),
    path('chamas/<int:chama_pk>/members/<int:pk>/', MembershipViewSet.as_view({'patch': 'partial_update', 'delete': 'destroy'}), name='chama-member-manage'),
    path('chamas/<int:chama_pk>/members/me/', MembershipViewSet.as_view({'delete': 'leave'}), name='chama-member-leave'),
]
