"""
Import Amazon products CSV into GlobalMart database.

Usage:
    python import_amazon.py

Place amazon-products.csv in the same folder as this script (backend/).
"""

import os
import sys
import csv
import json
import django

csv.field_size_limit(10 * 1024 * 1024)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Product, Category, RegionalPrice

CSV_FILE = os.path.join(os.path.dirname(__file__), 'amazon-products.csv')

# Exchange rates for regional price simulation
EXCHANGE_RATES = {
    'EU':  ('EUR', 0.92),
    'CN':  ('CNY', 7.10),
    'SEA': ('THB', 35.5),
    'UK':  ('GBP', 0.79),
}

def get_or_create_category(name):
    if not name:
        name = 'General'
    slug = name.lower().replace(' ', '-').replace('&', 'and')[:50]
    cat, _ = Category.objects.get_or_create(
        slug=slug,
        defaults={'name': name[:100]}
    )
    return cat

def parse_price(value):
    try:
        price = float(value)
        if price <= 0:
            return None
        return round(price, 2)
    except (ValueError, TypeError):
        return None

def parse_categories(raw):
    try:
        cats = json.loads(raw.replace("'", '"'))
        if isinstance(cats, list) and cats:
            return cats[0]
    except Exception:
        pass
    return 'General'

def run():
    if not os.path.exists(CSV_FILE):
        print(f'❌ CSV not found at: {CSV_FILE}')
        print('Make sure amazon-products.csv is inside your backend/ folder.')
        sys.exit(1)

    created_count = 0
    skipped_count = 0
    limit = None   # Import first 100 products — change to None for all

    with open(CSV_FILE, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if limit and i >= limit:
                break

            # ── Price ──────────────────────────────────────────────────────
            price = parse_price(row.get('final_price') or row.get('initial_price'))
            if not price:
                price = 9.99

            # ── Title ──────────────────────────────────────────────────────
            title = (row.get('title') or '').strip()[:255]
            if not title:
                skipped_count += 1
                continue

            # ── Category ───────────────────────────────────────────────────
            raw_cat = parse_categories(row.get('categories', ''))
            category = get_or_create_category(raw_cat)

            # ── Description ────────────────────────────────────────────────
            description = (row.get('description') or '').strip()[:2000]

            # ── Country ────────────────────────────────────────────────────
            country = (row.get('country_of_origin') or '').strip()[:100]
            if not country:
                country = 'USA'

            # ── Image ──────────────────────────────────────────────────────
            # We store the URL as a note — image upload handled separately
            image_url = (row.get('image_url') or '').strip()

            # ── Create product ─────────────────────────────────────────────
            product, created = Product.objects.get_or_create(
                name=title,
                defaults={
                    'description': description,
                    'category': category,
                    'base_price_usd': price,
                    'stock': 50,
                    'origin_country': country,
                    'is_active': True,
                }
            )

            if created:
                # Add regional prices
                RegionalPrice.objects.get_or_create(
                    product=product, region='US',
                    defaults={'currency': 'USD', 'price': price}
                )
                for region, (currency, rate) in EXCHANGE_RATES.items():
                    RegionalPrice.objects.get_or_create(
                        product=product, region=region,
                        defaults={'currency': currency, 'price': round(price * rate, 2)}
                    )
                created_count += 1
                print(f'✅ [{i+1}] {title[:60]}')
            else:
                skipped_count += 1

    print(f'\n🎉 Done!')
    print(f'   Created : {created_count} products')
    print(f'   Skipped : {skipped_count} (duplicates or missing data)')
    print(f'\nVisit http://127.0.0.1:8000/api/products/ to see them!')

if __name__ == '__main__':
    run()
