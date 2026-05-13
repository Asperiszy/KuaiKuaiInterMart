from django.contrib import admin
from .models import Product, Category, RegionalPrice, ProductReview


class RegionalPriceInline(admin.TabularInline):
    model = RegionalPrice
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'base_price_usd', 'stock', 'origin_country', 'is_active']
    list_filter = ['category', 'is_active', 'origin_country']
    search_fields = ['name', 'description']
    inlines = [RegionalPriceInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
