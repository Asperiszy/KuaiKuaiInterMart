from django.urls import path
from .views import SimulatePaymentView

urlpatterns = [
    path('simulate/<int:order_id>/', SimulatePaymentView.as_view(), name='simulate-payment'),
]
