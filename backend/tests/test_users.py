import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@globalmart.com',
        password='testpass123',
        country='Thailand'
    )


@pytest.fixture
def auth_client(client, user):
    response = client.post('/api/auth/token/', {
        'email': 'test@globalmart.com',
        'password': 'testpass123'
    })
    token = response.data.get('access')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


@pytest.mark.django_db
def test_register_success(client):
    response = client.post('/api/users/register/', {
        'username': 'newuser',
        'email': 'newuser@globalmart.com',
        'password': 'newpass123',
        'password2': 'newpass123',
        'country': 'Thailand'
    })
    assert response.status_code == 201


@pytest.mark.django_db
def test_register_password_mismatch(client):
    response = client.post('/api/users/register/', {
        'username': 'newuser',
        'email': 'newuser@globalmart.com',
        'password': 'newpass123',
        'password2': 'wrongpass',
        'country': 'Thailand'
    })
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_duplicate_email(client, user):
    response = client.post('/api/users/register/', {
        'username': 'anotheruser',
        'email': 'test@globalmart.com',
        'password': 'newpass123',
        'password2': 'newpass123',
    })
    assert response.status_code == 400


@pytest.mark.django_db
def test_login_success(client, user):
    response = client.post('/api/auth/token/', {
        'email': 'test@globalmart.com',
        'password': 'testpass123'
    })
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data


@pytest.mark.django_db
def test_login_wrong_password(client, user):
    response = client.post('/api/auth/token/', {
        'email': 'test@globalmart.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401 or response.status_code == 400


@pytest.mark.django_db
def test_login_wrong_email(client):
    response = client.post('/api/auth/token/', {
        'email': 'nobody@globalmart.com',
        'password': 'testpass123'
    })
    assert response.status_code == 401 or response.status_code == 400


@pytest.mark.django_db
def test_get_profile_authenticated(auth_client):
    response = auth_client.get('/api/users/profile/')
    assert response.status_code == 200
    assert 'email' in response.data


@pytest.mark.django_db
def test_get_profile_unauthenticated(client):
    response = client.get('/api/users/profile/')
    assert response.status_code == 401


@pytest.mark.django_db
def test_update_profile(auth_client):
    response = auth_client.patch('/api/users/profile/', {
        'preferred_currency': 'THB'
    })
    assert response.status_code == 200
    assert response.data['preferred_currency'] == 'THB'
