from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'currency', 'total_amount',
                  'shipping_address', 'notes', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'total_amount', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.Serializer):
    """Handles cart → order conversion."""
    shipping_address = serializers.CharField()
    currency = serializers.CharField(max_length=3, default='USD')
    notes = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField()   # [{product_id, quantity}]
    )

    def create(self, validated_data):
        from apps.products.models import Product
        user = self.context['request'].user
        items_data = validated_data.pop('items')

        order = Order.objects.create(user=user, **validated_data)
        for item in items_data:
            product = Product.objects.get(id=item['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                unit_price=product.base_price_usd,
            )
        order.recalculate_total()
        return order
