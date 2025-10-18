from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model

from api.models import Chama, Membership


User = get_user_model()


class MembershipTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.creator = User.objects.create_user(username='owner', password='pass12345')
        self.member = User.objects.create_user(username='member', password='pass12345')
        self.chama = Chama.objects.create(title='DevCoop', description='Test chama', creator=self.creator)

    def test_member_cannot_join_twice(self):
        url = reverse('chama-members', kwargs={'chama_pk': self.chama.pk})
        self.client.force_authenticate(user=self.member)
        response_first = self.client.post(url)
        self.assertEqual(response_first.status_code, 201)
        response_second = self.client.post(url)
        self.assertEqual(response_second.status_code, 400)
        self.assertEqual(Membership.objects.filter(chama=self.chama, user=self.member).count(), 1)

    def test_admin_can_promote_member(self):
        Membership.objects.create(user=self.member, chama=self.chama)
        url = reverse('chama-member-manage', kwargs={'chama_pk': self.chama.pk, 'pk': self.member.pk})
        self.client.force_authenticate(user=self.creator)
        response = self.client.patch(url, {'member_role': Membership.ADMIN}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['member_role'], Membership.ADMIN)

    def test_member_can_leave_but_creator_cannot(self):
        Membership.objects.create(user=self.member, chama=self.chama)
        leave_url = reverse('chama-member-leave', kwargs={'chama_pk': self.chama.pk})
        # Member can leave
        self.client.force_authenticate(user=self.member)
        response = self.client.delete(leave_url)
        self.assertEqual(response.status_code, 204)
        # Creator cannot leave
        self.client.force_authenticate(user=self.creator)
        response_creator = self.client.delete(leave_url)
        self.assertEqual(response_creator.status_code, 400)
