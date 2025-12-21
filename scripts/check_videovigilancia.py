#!/usr/bin/env python3
"""
Script para verificar productos de videovigilancia
"""
import os
import sys
from pathlib import Path

# Cargar variables de entorno
env_file = Path(__file__).parent.parent / '.env.local'
if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip().strip('"').strip("'")

from supabase import create_client, Client

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("PRODUCTOS DE VIDEOVIGILANCIA")
print("=" * 80)
print()

# Obtener categoría de videovigilancia
print("1️⃣ Buscando categoría 'Videovigilancia'...")
response_cat = supabase.table('marketplace_categories').select(
    'id,name,slug'
).ilike('name', '%videovigilancia%').execute()

if response_cat.data:
    for cat in response_cat.data:
        print(f"   ✅ Encontrada: {cat['name']} (slug: {cat['slug']}, id: {cat['id']})")
        category_id = cat['id']
        
        # Contar productos en esta categoría
        print()
        print("2️⃣ Contando productos...")
        
        # Total productos
        response_total = supabase.table('marketplace_products').select(
            'id', count='exact'
        ).eq('category_id', category_id).execute()
        total = response_total.count if hasattr(response_total, 'count') else 0
        print(f"   📊 Total productos: {total}")
        
        # Productos activos
        response_active = supabase.table('marketplace_products').select(
            'id', count='exact'
        ).eq('category_id', category_id).eq('status', 'active').execute()
        active = response_active.count if hasattr(response_active, 'count') else 0
        print(f"   ✅ Productos activos: {active}")
        
        # Productos con precio > 0
        response_with_price = supabase.table('marketplace_products').select(
            'id', count='exact'
        ).eq('category_id', category_id).eq('status', 'active').gt('price', 0).execute()
        with_price = response_with_price.count if hasattr(response_with_price, 'count') else 0
        print(f"   💰 Con precio > 0: {with_price}")
        
        # Productos con precio = 0
        response_no_price = supabase.table('marketplace_products').select(
            'id', count='exact'
        ).eq('category_id', category_id).eq('status', 'active').eq('price', 0).execute()
        no_price = response_no_price.count if hasattr(response_no_price, 'count') else 0
        print(f"   ⚠️  Con precio = 0: {no_price}")
        
        # Productos con external_code (Syscom)
        response_syscom = supabase.table('marketplace_products').select(
            'id', count='exact'
        ).eq('category_id', category_id).eq('status', 'active').not_.is_('external_code', 'null').execute()
        syscom = response_syscom.count if hasattr(response_syscom, 'count') else 0
        print(f"   🔧 De Syscom (external_code): {syscom}")
        
        # Productos de Truper/otros
        truper = active - syscom
        print(f"   🔨 De Truper/otros: {truper}")
        
        print()
        print("3️⃣ Ejemplos de productos (con precio > 0):")
        response_examples = supabase.table('marketplace_products').select(
            'id,title,price,external_code,images'
        ).eq('category_id', category_id).eq('status', 'active').gt('price', 0).limit(10).execute()
        
        for i, product in enumerate(response_examples.data, 1):
            title = product['title'][:60]
            price = product['price']
            has_code = "✅" if product.get('external_code') else "❌"
            has_images = "🖼️" if product.get('images') and len(product.get('images', [])) > 0 else "📷"
            print(f"   {i}. {has_code} {has_images} {title}... (${price:.2f})")
        
        print()
        print("=" * 80)
        print("ANÁLISIS")
        print("=" * 80)
        print(f"Total de productos visibles en marketplace: {with_price}")
        print(f"Productos ocultos (precio 0): {no_price}")
        print(f"Porcentaje visible: {(with_price/active*100):.1f}%" if active > 0 else "N/A")
        
        if no_price > 0:
            print()
            print(f"⚠️  HAY {no_price} PRODUCTOS CON PRECIO 0 QUE NO SE MUESTRAN")
            print("   Estos productos están ocultos por el filtro .gt('price', 0)")
            print()
            print("💡 SOLUCIÓN:")
            print(f"   - Actualizar precios desde API Syscom: python3 scripts/quick_update_prices.py --limit {no_price}")
else:
    print("   ❌ No se encontró categoría 'Videovigilancia'")
    print()
    print("Buscando categorías similares...")
    response_similar = supabase.table('marketplace_categories').select(
        'id,name,slug'
    ).execute()
    
    print("Categorías disponibles:")
    for cat in response_similar.data:
        print(f"   - {cat['name']} (slug: {cat['slug']})")

