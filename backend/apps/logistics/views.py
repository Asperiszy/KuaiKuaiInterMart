from rest_framework import generics, permissions
from .models import LogisticsTracking
from .serializers import LogisticsSerializer


class OrderTrackingView(generics.RetrieveAPIView):
    serializer_class = LogisticsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return LogisticsTracking.objects.get(order_id=self.kwargs['order_id'])
