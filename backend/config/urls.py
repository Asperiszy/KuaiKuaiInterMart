from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # App APIs
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/logistics/', include('apps.logistics.urls')),
    path('api/payments/', include('apps.payments.urls')),
 ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
