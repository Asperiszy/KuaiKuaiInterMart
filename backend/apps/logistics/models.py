from django.db import models


class LogisticsTracking(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('dispatched', 'Dispatched'),
        ('in_transit', 'In Transit'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed Delivery'),
    ]

    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='tracking')
    tracking_number = models.CharField(max_length=100, unique=True)
    carrier = models.CharField(max_length=100)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='processing')
    estimated_delivery = models.DateField(null=True, blank=True)
    current_location = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.tracking_number} — {self.status}'


class TrackingEvent(models.Model):
    tracking = models.ForeignKey(LogisticsTracking, on_delete=models.CASCADE, related_name='events')
    description = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ['-timestamp']
