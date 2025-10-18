from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model

from api.models import Chama, Membership
from api.serializers import ContributionSerializer, TaskSerializer


User = get_user_model()


class ValidationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.creator = User.objects.create_user(username='boss', password='pass12345')
        self.member = User.objects.create_user(username='worker', password='pass12345')
        self.outsider = User.objects.create_user(username='outsider', password='pass12345')
        self.chama = Chama.objects.create(title='Build Team', description='Project', creator=self.creator)
        Membership.objects.create(user=self.member, chama=self.chama)

    def test_contribution_money_requires_amount(self):
        serializer = ContributionSerializer(data={
            'chama': self.chama.pk,
            'type': 'money',
            'amount': None,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('amount', serializer.errors)

    def test_task_creation_requires_admin(self):
        url = reverse('task-list')
        payload = {
            'chama': self.chama.pk,
            'title': 'Finish API',
            'description': 'Complete endpoints',
            'status': 'open',
            'due_date': timezone.now().date(),
        }
        self.client.force_authenticate(user=self.member)
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 403)

    def test_admin_cannot_assign_task_to_non_member(self):
        url = reverse('task-list')
        payload = {
            'chama': self.chama.pk,
            'title': 'Review PRs',
            'description': 'Check submissions',
            'status': 'open',
            'due_date': timezone.now().date(),
            'assigned_to_user_id': self.outsider.pk,
        }
        self.client.force_authenticate(user=self.creator)
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('assigned_to_user_id', response.data)

    def test_admin_can_assign_task_to_member(self):
        url = reverse('task-list')
        payload = {
            'chama': self.chama.pk,
            'title': 'Write Docs',
            'description': 'Document APIs',
            'status': 'open',
            'due_date': timezone.now().date(),
            'assigned_to_user_id': self.member.pk,
        }
        self.client.force_authenticate(user=self.creator)
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['assigned_to']['id'], self.member.pk)
