from django.contrib import admin
from .models import LogisticsTracking, TrackingEvent


class TrackingEventInline(admin.TabularInline):
    model = TrackingEvent
    extra = 1


@admin.register(LogisticsTracking)
class LogisticsAdmin(admin.ModelAdmin):
    list_display = ['tracking_number', 'carrier', 'status', 'estimated_delivery']
    inlines = [TrackingEventInline]
