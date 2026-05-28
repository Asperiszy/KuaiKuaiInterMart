import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.products.models import Product, Category, RegionalPrice

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
    RegionalPrice.objects.create(product=p, region='EU', currency='EUR', price=45.99)
    RegionalPrice.objects.create(product=p, region='CN', currency='CNY', price=354.99)
    return p


# ── Product List Tests ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_product_list(client, product):
    """Product list returns all active products"""
    response = client.get('/api/products/')
    assert response.status_code == 200
    assert response.data['count'] >= 1


@pytest.mark.django_db
def test_product_list_no_auth_required(client, product):
    """Product list is accessible without authentication"""
    response = client.get('/api/products/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_product_search(client, product):
    """Product search returns matching results"""
    response = client.get('/api/products/?search=Wireless')
    assert response.status_code == 200
    assert response.data['count'] >= 1


@pytest.mark.django_db
def test_product_search_no_results(client, product):
    """Product search returns empty for non-matching query"""
    response = client.get('/api/products/?search=xyznotaproduct')
    assert response.status_code == 200
    assert response.data['count'] == 0


# ── Product Detail Tests ──────────────────────────────────────────────────────

@pytest.mark.django_db
def test_product_detail(client, product):
    """Product detail returns full product info"""
    response = client.get(f'/api/products/{product.id}/')
    assert response.status_code == 200
    assert response.data['name'] == 'Wireless Headphones'
    assert response.data['base_price_usd'] == '49.99'


@pytest.mark.django_db
def test_product_detail_regional_prices(client, product):
    """Product detail includes regional prices"""
    response = client.get(f'/api/products/{product.id}/')
    assert response.status_code == 200
    assert len(response.data['regional_prices']) == 2


@pytest.mark.django_db
def test_product_detail_not_found(client):
    """Non-existent product returns 404"""
    response = client.get('/api/products/99999/')
    assert response.status_code == 404


# ── Category Tests ────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_category_list(client, category):
    """Category list returns all categories"""
    response = client.get('/api/products/categories/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_product_filter_by_category(client, product, category):
    """Products can be filtered by category"""
    response = client.get(f'/api/products/?category={category.id}')
    assert response.status_code == 200
    assert response.data['count'] >= 1


# ── Review Tests ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_add_review_authenticated(auth_client, product):
    """Authenticated user can add a review"""
    response = auth_client.post(f'/api/products/{product.id}/reviews/', {
        'rating': 5,
        'comment': 'Great product!'
    })
    assert response.status_code == 201


@pytest.mark.django_db
def test_add_review_unauthenticated(client, product):
    """Unauthenticated user cannot add a review"""
    response = client.post(f'/api/products/{product.id}/reviews/', {
        'rating': 5,
        'comment': 'Great product!'
    })
    assert response.status_code == 401
