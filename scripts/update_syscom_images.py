#!/usr/bin/env python3
"""
Script para actualizar las imágenes de productos Syscom en la base de datos
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
print("ACTUALIZACIÓN DE IMÁGENES SYSCOM")
print("=" * 80)
print()

# Obtener productos de Syscom sin imágenes o con imágenes vacías
print("🔍 Buscando productos Syscom sin imágenes...")

response = supabase.table('marketplace_products').select(
    'id,external_code,images,title'
).eq('status', 'active').gt('price', 0).not_.is_('external_code', 'null').limit(1000).execute()

productos_a_actualizar = []

for product in response.data:
    external_code = product.get('external_code')
    images = product.get('images', [])
    
    # Si no tiene imágenes o está vacío, agregar a la lista
    if not images or len(images) == 0:
        productos_a_actualizar.append({
            'id': product['id'],
            'external_code': external_code,
            'title': product['title'][:50]
        })

print(f"📊 Encontrados {len(productos_a_actualizar)} productos sin imágenes")
print()

if len(productos_a_actualizar) == 0:
    print("✅ No hay productos para actualizar")
    sys.exit(0)

# Mostrar ejemplos
print("Ejemplos de productos a actualizar:")
for i, p in enumerate(productos_a_actualizar[:5], 1):
    print(f"   {i}. {p['title']}... [Code: {p['external_code']}]")
print()

# Preguntar confirmación
confirmacion = input("¿Actualizar imágenes de estos productos? (s/n): ")
if confirmacion.lower() != 's':
    print("❌ Actualización cancelada")
    sys.exit(0)

print()
print("🚀 Iniciando actualización...")
print()

# Actualizar en lotes de 100
updated = 0
failed = 0
batch_size = 100

for i in range(0, len(productos_a_actualizar), batch_size):
    batch = productos_a_actualizar[i:i + batch_size]
    
    for producto in batch:
        external_code = producto['external_code']
        product_id = producto['id']
        
        # Generar URL de imagen de Syscom
        image_url = f"https://ftp3.syscom.mx/IMG/img_prod/{external_code}.jpg"
        
        try:
            # Actualizar en Supabase
            supabase.table('marketplace_products').update({
                'images': [image_url],
                'updated_at': 'now()'
            }).eq('id', product_id).execute()
            
            updated += 1
            if updated % 50 == 0:
                print(f"   ✅ Actualizados: {updated}/{len(productos_a_actualizar)}")
        except Exception as e:
            failed += 1
            if failed <= 5:  # Mostrar solo los primeros 5 errores
                print(f"   ❌ Error actualizando {producto['title']}...: {e}")

print()
print("=" * 80)
print("RESUMEN")
print("=" * 80)
print(f"✅ Actualizados: {updated}")
print(f"❌ Errores: {failed}")
print(f"📊 Total procesados: {len(productos_a_actualizar)}")
print()

if updated > 0:
    print(f"🎉 Se actualizaron {updated} productos con URLs de imágenes Syscom")
else:
    print("⚠️  No se pudo actualizar ningún producto")

