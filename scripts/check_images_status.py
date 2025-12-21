#!/usr/bin/env python3
"""
Script para verificar el estado de las imágenes de productos en el marketplace
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
print("ESTADO DE IMÁGENES DE PRODUCTOS")
print("=" * 80)
print()

# 1. Productos con precio > 0
print("📊 Productos con precio > 0:")
response = supabase.table('marketplace_products').select(
    'id,external_code,images', count='exact'
).eq('status', 'active').gt('price', 0).execute()

total_con_precio = response.count if hasattr(response, 'count') else len(response.data)
con_external_code = 0
con_images = 0
con_ambos = 0
sin_ninguno = 0

for product in response.data[:100]:  # Limitar a 100 para análisis
    has_external = product.get('external_code') is not None
    has_images = product.get('images') and len(product.get('images', [])) > 0
    
    if has_external:
        con_external_code += 1
    if has_images:
        con_images += 1
    if has_external and has_images:
        con_ambos += 1
    if not has_external and not has_images:
        sin_ninguno += 1

print(f"   Total: {total_con_precio}")
print(f"   Con external_code: {con_external_code}")
print(f"   Con images: {con_images}")
print(f"   Con ambos: {con_ambos}")
print(f"   Sin ninguno: {sin_ninguno}")
print()

# 2. Productos de Syscom (con external_code)
print("🔧 Productos de Syscom (con external_code):")
response_syscom = supabase.table('marketplace_products').select(
    'id,title,external_code,price', count='exact'
).eq('status', 'active').gt('price', 0).not_.is_('external_code', 'null').limit(5).execute()

print(f"   Total con external_code y precio > 0: {response_syscom.count if hasattr(response_syscom, 'count') else len(response_syscom.data)}")
print(f"   Ejemplos:")
for product in response_syscom.data:
    title = product['title'][:50]
    price = product['price']
    code = product['external_code']
    print(f"     - {title}... (${price}) [Code: {code}]")
print()

# 3. Productos sin external_code ni images
print("⚠️  Productos sin external_code ni images (precio > 0):")
response_sin = supabase.table('marketplace_products').select(
    'id,title,price', count='exact'
).eq('status', 'active').gt('price', 0).is_('external_code', 'null').execute()

total_sin_code = response_sin.count if hasattr(response_sin, 'count') else 0
productos_sin_images = 0

for product in response_sin.data[:100]:
    if not product.get('images') or len(product.get('images', [])) == 0:
        productos_sin_images += 1

print(f"   Sin external_code: {total_sin_code}")
print(f"   Sin external_code ni images (de muestra): {productos_sin_images}/100")
print()

print("=" * 80)
print("✅ ANÁLISIS COMPLETADO")
print("=" * 80)

