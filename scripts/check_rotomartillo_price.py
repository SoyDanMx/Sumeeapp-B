#!/usr/bin/env python3
"""
Script para verificar el precio específico de este producto
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
print("VERIFICACIÓN DE PRECIO - ROTOMARTILLO")
print("=" * 80)
print()

# SKU del producto visible
sku = "DCJ-Z2060-IAM"

print(f"🔍 Buscando producto con SKU: {sku}")
response = supabase.table('marketplace_products').select(
    'id,title,price,original_price,external_code,sku,category_id'
).eq('sku', sku).execute()

if response.data:
    product = response.data[0]
    print(f"   ✅ Encontrado: {product['title'][:60]}...")
    print()
    print("📊 DATOS EN BASE DE DATOS:")
    print(f"   Precio: ${product['price']:.2f}")
    print(f"   Precio original: ${product.get('original_price', 'N/A')}")
    print(f"   External code: {product.get('external_code', 'N/A')}")
    print(f"   SKU: {product.get('sku', 'N/A')}")
    print(f"   Category ID: {product.get('category_id', 'N/A')}")
    print()
    
    # Determinar si es Syscom
    has_external = product.get('external_code') is not None
    print(f"   Es producto Syscom: {'✅ SÍ' if has_external else '❌ NO'}")
    print()
    
    if has_external:
        print("⚠️  PROBLEMA DETECTADO:")
        print("   - El producto tiene external_code (Syscom)")
        print("   - El sistema está convirtiendo USD → MXN")
        print(f"   - Precio en BD: ${product['price']:.2f}")
        print(f"   - Con tasa ~20: ${product['price'] * 20:.2f} MXN")
        print()
        print("🔍 PERO... ¿el precio está en USD o MXN?")
        print()
        
        # Verificar si el precio parece estar en USD o MXN
        if product['price'] > 1000:
            print("   💡 El precio ${:.2f} parece estar en MXN (muy alto para USD)".format(product['price']))
            print("   ❌ El sistema lo está convirtiendo INCORRECTAMENTE")
        else:
            print("   💡 El precio ${:.2f} parece estar en USD (rango normal)".format(product['price']))
            print("   ✅ La conversión es correcta")
    else:
        print("✅ Producto NO es de Syscom")
        print("   El precio NO se convierte (se muestra tal cual)")
        
    print()
    print("=" * 80)
    print("ANÁLISIS")
    print("=" * 80)
    
    # Buscar más productos similares
    print()
    print("🔍 Revisando otros 10 productos de Syscom...")
    response_sample = supabase.table('marketplace_products').select(
        'title,price,external_code'
    ).not_.is_('external_code', 'null').eq('status', 'active').gt('price', 0).limit(10).execute()
    
    print()
    print("Muestra de precios de Syscom:")
    for p in response_sample.data:
        title = p['title'][:50]
        price = p['price']
        currency = "MXN" if price > 1000 else "USD"
        print(f"   ${price:>10.2f} ({currency}) - {title}...")
        
else:
    print("   ❌ Producto no encontrado")

