from rest_framework import serializers
from .models import LogisticsTracking, TrackingEvent


class TrackingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingEvent
        fields = ['description', 'location', 'timestamp']


class LogisticsSerializer(serializers.ModelSerializer):
    events = TrackingEventSerializer(many=True, read_only=True)

    class Meta:
        model = LogisticsTracking
        fields = ['tracking_number', 'carrier', 'status', 'estimated_delivery',
                  'current_location', 'events', 'updated_at']
