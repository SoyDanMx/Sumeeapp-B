#!/usr/bin/env python3
"""
Script para verificar productos de videovigilancia en categoría Sistemas
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
print("PRODUCTOS DE VIDEOVIGILANCIA EN SISTEMAS")
print("=" * 80)
print()

# Obtener categoría de sistemas
print("1️⃣ Buscando categoría 'Sistemas e Informática'...")
response_cat = supabase.table('marketplace_categories').select(
    'id,name,slug'
).eq('slug', 'sistemas').execute()

if response_cat.data:
    cat = response_cat.data[0]
    print(f"   ✅ Encontrada: {cat['name']} (slug: {cat['slug']}, id: {cat['id']})")
    category_id = cat['id']
    
    print()
    print("2️⃣ Contando productos de videovigilancia...")
    
    # Buscar productos con palabras clave de videovigilancia
    keywords = ['cámara', 'camara', 'domo', 'bala', 'nvr', 'dvr', 'video', 'cctv', 'vigilancia']
    
    total_videovigilancia = 0
    con_precio = 0
    sin_precio = 0
    
    for keyword in keywords:
        response = supabase.table('marketplace_products').select(
            'id,title,price', count='exact'
        ).eq('category_id', category_id).eq('status', 'active').or_(
            f'title.ilike.%{keyword}%,description.ilike.%{keyword}%'
        ).execute()
        
        if response.data:
            count = len(response.data)
            with_price = len([p for p in response.data if p.get('price', 0) > 0])
            without_price = count - with_price
            
            print(f"   🔍 '{keyword}': {count} productos ({with_price} con precio, {without_price} sin precio)")
    
    print()
    print("3️⃣ Contando TODOS los productos de Sistemas...")
    
    # Total productos en Sistemas
    response_total = supabase.table('marketplace_products').select(
        'id', count='exact'
    ).eq('category_id', category_id).eq('status', 'active').execute()
    total_sistemas = response_total.count if hasattr(response_total, 'count') else 0
    print(f"   📊 Total en Sistemas: {total_sistemas}")
    
    # Productos con precio > 0
    response_with_price = supabase.table('marketplace_products').select(
        'id', count='exact'
    ).eq('category_id', category_id).eq('status', 'active').gt('price', 0).execute()
    with_price_total = response_with_price.count if hasattr(response_with_price, 'count') else 0
    print(f"   💰 Con precio > 0: {with_price_total}")
    
    # Productos con precio = 0
    sin_precio_total = total_sistemas - with_price_total
    print(f"   ⚠️  Con precio = 0: {sin_precio_total}")
    
    print()
    print("4️⃣ Muestreo de productos de videovigilancia (con precio > 0):")
    
    # Buscar productos de cámaras específicamente
    response_camaras = supabase.table('marketplace_products').select(
        'id,title,price,external_code'
    ).eq('category_id', category_id).eq('status', 'active').gt('price', 0).or_(
        'title.ilike.%cámara%,title.ilike.%camara%,title.ilike.%domo%,title.ilike.%bala%'
    ).limit(15).execute()
    
    print(f"   Encontrados: {len(response_camaras.data)} productos de cámaras")
    print()
    for i, product in enumerate(response_camaras.data, 1):
        title = product['title'][:70]
        price = product['price']
        is_syscom = "🔧" if product.get('external_code') else "🔨"
        print(f"   {i}. {is_syscom} {title}...")
        print(f"       Precio: ${price:.2f} USD")
        print()
    
    print("=" * 80)
    print("ANÁLISIS")
    print("=" * 80)
    print(f"Total productos en Sistemas: {total_sistemas}")
    print(f"Productos visibles (precio > 0): {with_price_total}")
    print(f"Productos ocultos (precio = 0): {sin_precio_total}")
    print(f"Porcentaje visible: {(with_price_total/total_sistemas*100):.1f}%" if total_sistemas > 0 else "N/A")
    print()
    
    if sin_precio_total > 0:
        print(f"⚠️  HAY {sin_precio_total} PRODUCTOS CON PRECIO 0 OCULTOS")
        print()
        print("💡 SOLUCIÓN RECOMENDADA:")
        print(f"   python3 scripts/quick_update_prices.py --limit {min(sin_precio_total, 5000)}")
        print()
        print("   Esto actualizará los precios desde la API de Syscom")
else:
    print("   ❌ No se encontró categoría 'Sistemas'")

