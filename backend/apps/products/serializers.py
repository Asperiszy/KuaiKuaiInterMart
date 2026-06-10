from rest_framework import serializers
from .models import Product, Category, RegionalPrice, ProductReview


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class RegionalPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegionalPrice
        fields = ['region', 'currency', 'price', 'updated_at']


class ProductReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'base_price_usd', 'image',
                  'image_url','origin_country', 'stock', 'is_active']


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    regional_prices = RegionalPriceSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'base_price_usd',
                  'image', 'image_url', 'origin_country', 'stock', 'is_active',
                  'regional_prices', 'reviews', 'avg_rating', 'created_at']

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)
