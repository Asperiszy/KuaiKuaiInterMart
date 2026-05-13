from django.urls import path
from .views import OrderTrackingView

urlpatterns = [
    path('<int:order_id>/', OrderTrackingView.as_view(), name='order-tracking'),
]
