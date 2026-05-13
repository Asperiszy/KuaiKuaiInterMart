from rest_framework import serializers, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
import uuid
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'method', 'status', 'amount', 'currency',
                  'transaction_id', 'paid_at', 'created_at']
        read_only_fields = ['id', 'status', 'transaction_id', 'paid_at', 'created_at']


class SimulatePaymentView(APIView):
    """Simulated payment endpoint — no real gateway."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        from apps.orders.models import Order
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'method': request.data.get('method', 'credit_card'),
                'amount': order.total_amount,
                'currency': order.currency,
            }
        )

        # Simulate success
        payment.status = 'completed'
        payment.transaction_id = f'SIM-{uuid.uuid4().hex[:12].upper()}'
        payment.paid_at = timezone.now()
        payment.save()

        order.status = 'paid'
        order.save(update_fields=['status'])

        return Response(PaymentSerializer(payment).data)
