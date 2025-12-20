"""
Script directo para verificar imágenes duplicadas en la base de datos.
Consulta directamente y muestra ejemplos reales.
"""

import os
from dotenv import load_dotenv
from supabase import create_client
from collections import Counter

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔍 Consultando productos con imágenes...\n")

# Obtener una muestra de productos
response = supabase.table('marketplace_products').select('id, title, images').eq('status', 'active').limit(100).execute()
products = response.data

print(f"✅ Analizando {len(products)} productos...\n")

# Buscar duplicados
duplicates_found = []
all_image_urls = []

for product in products:
    images = product.get('images') or []
    if not images:
        continue
    
    # Verificar duplicados en el mismo producto
    image_counts = Counter(images)
    duplicates = {img: count for img, count in image_counts.items() if count > 1}
    
    if duplicates:
        duplicates_found.append({
            'id': product['id'],
            'title': product.get('title', 'Sin título'),
            'images': images,
            'duplicates': duplicates,
        })
    
    all_image_urls.extend(images)

print(f"📊 Productos con imágenes duplicadas en el mismo producto: {len(duplicates_found)}\n")

if duplicates_found:
    print("📋 EJEMPLOS DE PRODUCTOS CON DUPLICADOS:")
    for i, item in enumerate(duplicates_found[:10], 1):
        print(f"\n{i}. {item['title'][:70]}")
        print(f"   ID: {item['id']}")
        print(f"   Total imágenes: {len(item['images'])}")
        print(f"   Duplicados: {item['duplicates']}")
        print(f"   Todas las URLs: {item['images']}")
else:
    print("✅ No se encontraron duplicados exactos en el mismo producto\n")

# Buscar URLs que aparecen en múltiples productos (posible error)
print("\n🔍 Buscando URLs que aparecen en múltiples productos...\n")
image_url_counts = Counter(all_image_urls)
repeated_urls = {url: count for url, count in image_url_counts.items() if count > 1}

if repeated_urls:
    print(f"📊 URLs que aparecen en múltiples productos: {len(repeated_urls)}\n")
    print("📋 Top 10 URLs más repetidas:")
    sorted_repeated = sorted(repeated_urls.items(), key=lambda x: x[1], reverse=True)
    for i, (url, count) in enumerate(sorted_repeated[:10], 1):
        print(f"{i}. Aparece {count} veces: {url}")
else:
    print("✅ No se encontraron URLs repetidas entre productos\n")

# Buscar productos con múltiples imágenes de códigos diferentes
print("\n🔍 Buscando productos con imágenes de códigos diferentes...\n")
import re

products_with_different_codes = []
for product in products:
    images = product.get('images') or []
    if len(images) < 2:
        continue
    
    codes = []
    for img_url in images:
        if 'truper.com/media/import/imagenes/' in img_url:
            match = re.search(r'imagenes/(\d{5,6})\.jpg', img_url)
            if match:
                codes.append(match.group(1))
    
    if len(set(codes)) > 1:
        products_with_different_codes.append({
            'id': product['id'],
            'title': product.get('title', 'Sin título'),
            'images': images,
            'codes': codes,
        })

if products_with_different_codes:
    print(f"📊 Productos con imágenes de códigos diferentes: {len(products_with_different_codes)}\n")
    print("📋 Primeros 10 ejemplos:")
    for i, item in enumerate(products_with_different_codes[:10], 1):
        print(f"\n{i}. {item['title'][:70]}")
        print(f"   Códigos encontrados: {set(item['codes'])}")
        print(f"   URLs: {item['images']}")
else:
    print("✅ No se encontraron productos con códigos diferentes\n")

print("\n" + "=" * 60)
print("✅ ANÁLISIS COMPLETADO")
print("=" * 60)


