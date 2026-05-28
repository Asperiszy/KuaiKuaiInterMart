"""
Integration Tests — KuaiKuaiInterMart
Tests complete end-to-end user flows across multiple API endpoints.

Run with: pytest tests/test_integration.py -v
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.products.models import Product, Category, RegionalPrice

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def category(db):
    return Category.objects.create(name='Electronics', slug='electronics')


@pytest.fixture
def product(db, category):
    p = Product.objects.create(
        name='Wireless Headphones',
        description='Noise cancelling headphones',
        category=category,
        base_price_usd=49.99,
        stock=100,
        origin_country='China',
        is_active=True
    )
    RegionalPrice.objects.create(product=p, region='US', currency='USD', price=49.99)
    RegionalPrice.objects.create(product=p, region='EU', currency='EUR', price=45.99)
    RegionalPrice.objects.create(product=p, region='CN', currency='CNY', price=354.99)
    RegionalPrice.objects.create(product=p, region='SEA', currency='THB', price=1774.65)
    return p


@pytest.fixture
def product2(db, category):
    return Product.objects.create(
        name='Mechanical Keyboard',
        description='RGB keyboard',
        category=category,
        base_price_usd=89.99,
        stock=50,
        origin_country='Taiwan',
        is_active=True
    )


# ══════════════════════════════════════════════════════════════════════════════
# FLOW 1: Complete User Registration → Login → Profile Flow
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
def test_flow_register_login_profile(client):
    """
    Integration Flow 1:
    Register → Login → Get Profile → Update Profile
    """
    # Step 1: Register
    register = client.post('/api/users/register/', {
        'username': 'flowuser',
        'email': 'flow@globalmart.com',
        'password': 'flowpass123',
        'password2': 'flowpass123',
        'country': 'Thailand'
    })
    assert register.status_code == 201, f"Registration failed: {register.data}"

    # Step 2: Login
    login = client.post('/api/auth/token/', {
        'email': 'flow@globalmart.com',
        'password': 'flowpass123'
    })
    assert login.status_code == 200, f"Login failed: {login.data}"
    assert 'access' in login.data
    token = login.data['access']

    # Step 3: Authenticate client
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # Step 4: Get profile
    profile = client.get('/api/users/profile/')
    assert profile.status_code == 200
    assert profile.data['email'] == 'flow@globalmart.com'

    # Step 5: Update profile
    update = client.patch('/api/users/profile/', {'preferred_currency': 'THB'})
    assert update.status_code == 200
    assert update.data['preferred_currency'] == 'THB'


# ══════════════════════════════════════════════════════════════════════════════
# FLOW 2: Complete Product Browse → Search → Detail Flow
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
def test_flow_browse_search_detail(client, product, product2):
    """
    Integration Flow 2:
    Browse Products → Search → View Detail → Check Regional Prices
    """
    # Step 1: Browse all products
    browse = client.get('/api/products/')
    assert browse.status_code == 200
    assert browse.data['count'] >= 2

    # Step 2: Search for specific product
    search = client.get('/api/products/?search=Wireless')
    assert search.status_code == 200
    assert search.data['count'] >= 1
    assert search.data['results'][0]['name'] == 'Wireless Headphones'

    # Step 3: View product detail
    product_id = search.data['results'][0]['id']
    detail = client.get(f'/api/products/{product_id}/')
    assert detail.status_code == 200
    assert detail.data['name'] == 'Wireless Headphones'
    assert detail.data['base_price_usd'] == '49.99'

    # Step 4: Check regional prices exist
    assert len(detail.data['regional_prices']) == 4
    regions = [rp['region'] for rp in detail.data['regional_prices']]
    assert 'US' in regions
    assert 'EU' in regions
    assert 'CN' in regions
    assert 'SEA' in regions


# ══════════════════════════════════════════════════════════════════════════════
# FLOW 3: Complete Shopping Cart → Order → Payment Flow
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
def test_flow_order_and_payment(client, product, product2):
    """
    Integration Flow 3:
    Register → Login → Browse → Create Order → Simulate Payment → Check Order Status
    """
    # Step 1: Register and login
    client.post('/api/users/register/', {
        'username': 'shopuser',
        'email': 'shop@globalmart.com',
        'password': 'shoppass123',
        'password2': 'shoppass123',
        'country': 'Thailand'
    })
    login = client.post('/api/auth/token/', {
        'email': 'shop@globalmart.com',
        'password': 'shoppass123'
    })
    token = login.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # Step 2: Browse products
    browse = client.get('/api/products/')
    assert browse.status_code == 200

    # Step 3: Create order with 2 products
    order = client.post('/api/orders/', {
        'shipping_address': '123 Sukhumvit Road, Bangkok, Thailand',
        'currency': 'USD',
        'items': [
            {'product_id': product.id, 'quantity': 2},
            {'product_id': product2.id, 'quantity': 1},
        ]
    }, format='json')
    assert order.status_code == 201
    assert order.data['status'] == 'pending'

    # Step 4: Verify order total (2 × $49.99 + 1 × $89.99 = $189.97)
    expected_total = round(49.99 * 2 + 89.99 * 1, 2)
    assert float(order.data['total_amount']) == expected_total

    order_id = order.data['id']

    # Step 5: Simulate payment
    payment = client.post(f'/api/payments/simulate/{order_id}/', {
        'method': 'credit_card'
    }, format='json')
    assert payment.status_code == 200
    assert payment.data['status'] == 'completed'
    assert payment.data['transaction_id'].startswith('SIM-')

    # Step 6: Verify order appears in order history
    orders = client.get('/api/orders/')
    assert orders.status_code == 200
    order_ids = [o['id'] for o in orders.data['results']]
    assert order_id in order_ids


# ══════════════════════════════════════════════════════════════════════════════
# FLOW 4: Multiple Payment Methods Flow
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
def test_flow_multiple_payment_methods(client, product):
    """
    Integration Flow 4:
    Test all 4 payment methods work correctly
    """
    # Register and login
    client.post('/api/users/register/', {
        'username': 'payuser',
        'email': 'pay@globalmart.com',
        'password': 'paypass123',
        'password2': 'paypass123',
    })
    login = client.post('/api/auth/token/', {
        'email': 'pay@globalmart.com',
        'password': 'paypass123'
    })
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')

    methods = ['credit_card', 'paypal', 'alipay', 'wechat_pay']

    for method in methods:
        # Create new order for each payment method
        order = client.post('/api/orders/', {
            'shipping_address': '123 Test Street',
            'items': [{'product_id': product.id, 'quantity': 1}]
        }, format='json')
        assert order.status_code == 201

        # Simulate payment with each method
        payment = client.post(f'/api/payments/simulate/{order.data["id"]}/', {
            'method': method
        }, format='json')
        assert payment.status_code == 200, f"Payment failed for method: {method}"
        assert payment.data['status'] == 'completed'


# ══════════════════════════════════════════════════════════════════════════════
# FLOW 5: Security & Authentication Integration Flow
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
def test_flow_security_checks(client, product):
    """
    Integration Flow 5:
    Verify protected endpoints reject unauthenticated requests
    """
    # Unauthenticated requests to protected endpoints
    endpoints = [
        ('GET', '/api/users/profile/'),
        ('GET', '/api/orders/'),
        ('POST', '/api/orders/'),
        ('POST', '/api/payments/simulate/1/'),
    ]

    for method, url in endpoints:
        if method == 'GET':
            response = client.get(url)
        else:
            response = client.post(url, {}, format='json')
        assert response.status_code == 401, \
            f"Expected 401 for {method} {url}, got {response.status_code}"


# ══════════════════════════════════════════════════════════════════════════════
# FLOW 6: Product Review Flow
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
def test_flow_product_review(client, product):
    """
    Integration Flow 6:
    Register → Login → Browse Product → Add Review → Verify Review Appears
    """
    # Register and login
    client.post('/api/users/register/', {
        'username': 'reviewer',
        'email': 'reviewer@globalmart.com',
        'password': 'reviewpass123',
        'password2': 'reviewpass123',
    })
    login = client.post('/api/auth/token/', {
        'email': 'reviewer@globalmart.com',
        'password': 'reviewpass123'
    })
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')

    # Add review
    review = client.post(f'/api/products/{product.id}/reviews/', {
        'rating': 5,
        'comment': 'Excellent product! Fast delivery.'
    })
    assert review.status_code == 201
    assert review.data['rating'] == 5

    # Verify review appears in product detail
    detail = client.get(f'/api/products/{product.id}/')
    assert detail.status_code == 200
    assert len(detail.data['reviews']) == 1
    assert detail.data['reviews'][0]['comment'] == 'Excellent product! Fast delivery.'
    assert detail.data['avg_rating'] == 5.0


# ══════════════════════════════════════════════════════════════════════════════
# FLOW 7: Token Refresh Flow
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
def test_flow_token_refresh(client):
    """
    Integration Flow 7:
    Login → Get refresh token → Use refresh token to get new access token
    """
    # Register and login
    client.post('/api/users/register/', {
        'username': 'tokenuser',
        'email': 'token@globalmart.com',
        'password': 'tokenpass123',
        'password2': 'tokenpass123',
    })
    login = client.post('/api/auth/token/', {
        'email': 'token@globalmart.com',
        'password': 'tokenpass123'
    })
    assert login.status_code == 200
    refresh_token = login.data['refresh']

    # Use refresh token to get new access token
    refresh = client.post('/api/auth/token/refresh/', {
        'refresh': refresh_token
    })
    assert refresh.status_code == 200
    assert 'access' in refresh.data
