import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.products.models import Product, Category

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@globalmart.com',
        password='testpass123'
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


@pytest.fixture
def product(db):
    category = Category.objects.create(name='Electronics', slug='electronics')
    return Product.objects.create(
        name='Test Product',
        base_price_usd=29.99,
        stock=50,
        category=category,
        is_active=True
    )


# ── Order Tests ───────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_order_authenticated(auth_client, product):
    """Authenticated user can create an order"""
    response = auth_client.post('/api/orders/', {
        'shipping_address': '123 Test Street, Bangkok, Thailand',
        'currency': 'USD',
        'items': [{'product_id': product.id, 'quantity': 2}]
    }, format='json')
    assert response.status_code == 201
    assert response.data['status'] == 'pending'


@pytest.mark.django_db
def test_create_order_unauthenticated(client, product):
    """Unauthenticated user cannot create an order"""
    response = client.post('/api/orders/', {
        'shipping_address': '123 Test Street',
        'items': [{'product_id': product.id, 'quantity': 1}]
    }, format='json')
    assert response.status_code == 401


@pytest.mark.django_db
def test_order_list_authenticated(auth_client, product):
    """Authenticated user can view their orders"""
    # Create an order first
    auth_client.post('/api/orders/', {
        'shipping_address': '123 Test Street',
        'items': [{'product_id': product.id, 'quantity': 1}]
    }, format='json')
    response = auth_client.get('/api/orders/')
    assert response.status_code == 200
    assert len(response.data) >= 1


@pytest.mark.django_db
def test_order_list_unauthenticated(client):
    """Unauthenticated user cannot view orders"""
    response = client.get('/api/orders/')
    assert response.status_code == 401


@pytest.mark.django_db
def test_order_total_calculated(auth_client, product):
    """Order total is correctly calculated from items"""
    response = auth_client.post('/api/orders/', {
        'shipping_address': '123 Test Street',
        'items': [{'product_id': product.id, 'quantity': 2}]
    }, format='json')
    assert response.status_code == 201
    # 2 × $29.99 = $59.98
    assert float(response.data['total_amount']) == 59.98


# ── Payment Tests ─────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_simulate_payment(auth_client, product):
    """Payment simulation marks order as paid"""
    order_response = auth_client.post('/api/orders/', {
        'shipping_address': '123 Test Street',
        'items': [{'product_id': product.id, 'quantity': 1}]
    }, format='json')
    order_id = order_response.data['id']

    payment_response = auth_client.post(
        f'/api/payments/simulate/{order_id}/',
        {'method': 'credit_card'},
        format='json'
    )
    assert payment_response.status_code == 200
    assert payment_response.data['status'] == 'completed'


@pytest.mark.django_db
def test_payment_generates_transaction_id(auth_client, product):
    """Payment simulation generates a transaction ID"""
    order_response = auth_client.post('/api/orders/', {
        'shipping_address': '123 Test Street',
        'items': [{'product_id': product.id, 'quantity': 1}]
    }, format='json')
    order_id = order_response.data['id']

    payment_response = auth_client.post(
        f'/api/payments/simulate/{order_id}/',
        {'method': 'alipay'},
        format='json'
    )
    assert payment_response.status_code == 200
    assert payment_response.data['transaction_id'].startswith('SIM-')


@pytest.mark.django_db
def test_payment_unauthenticated(client, product):
    """Unauthenticated user cannot simulate payment"""
    response = client.post('/api/payments/simulate/1/', {'method': 'credit_card'})
    assert response.status_code == 401
