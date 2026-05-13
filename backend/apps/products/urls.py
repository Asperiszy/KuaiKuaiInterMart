from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, ProductReviewViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('<int:product_pk>/reviews/', ProductReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-reviews'),
    path('', include(router.urls)),
]
