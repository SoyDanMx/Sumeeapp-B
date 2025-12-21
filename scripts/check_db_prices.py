#!/usr/bin/env python3
"""
Script para verificar precios en la base de datos
Identifica productos con precio 0 o precios sospechosamente bajos
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_prices():
    print("=" * 80)
    print("VERIFICACIÓN DE PRECIOS EN BASE DE DATOS")
    print("=" * 80)
    print()
    
    # Productos con precio 0
    print("🔍 Buscando productos con precio = 0...")
    try:
        zero_price_response = supabase.table('marketplace_products').select('id,title,price,external_code,sku,category_id').eq('price', 0).limit(100).execute()
        zero_price_products = zero_price_response.data or []
        print(f"✅ Encontrados {len(zero_price_products)} productos con precio = 0")
        
        if zero_price_products:
            print("\n📋 Primeros 10 productos con precio 0:")
            for idx, product in enumerate(zero_price_products[:10], 1):
                print(f"  {idx}. {product.get('title', 'Sin título')[:60]}")
                print(f"     ID: {product.get('id')}")
                print(f"     External Code: {product.get('external_code', 'N/A')}")
                print(f"     SKU: {product.get('sku', 'N/A')}")
                print()
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Productos con precios sospechosamente bajos (< $100 MXN)
    print("\n🔍 Buscando productos con precio < $100 MXN (posible error de conversión)...")
    try:
        low_price_response = supabase.table('marketplace_products').select('id,title,price,external_code,sku').lt('price', 100).gt('price', 0).limit(50).execute()
        low_price_products = low_price_response.data or []
        print(f"✅ Encontrados {len(low_price_products)} productos con precio < $100")
        
        if low_price_products:
            print("\n📋 Primeros 10 productos con precio < $100:")
            for idx, product in enumerate(low_price_products[:10], 1):
                price = product.get('price', 0)
                print(f"  {idx}. {product.get('title', 'Sin título')[:60]}")
                print(f"     Precio: ${price}")
                print(f"     External Code: {product.get('external_code', 'N/A')}")
                print(f"     SKU: {product.get('sku', 'N/A')}")
                print()
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Estadísticas generales
    print("\n📊 Estadísticas generales:")
    try:
        total_response = supabase.table('marketplace_products').select('id', count='exact').execute()
        total_products = total_response.count or 0
        
        with_price_response = supabase.table('marketplace_products').select('id', count='exact').gt('price', 0).execute()
        with_price = with_price_response.count or 0
        
        without_price = total_products - with_price
        
        print(f"   Total productos: {total_products}")
        print(f"   Con precio > 0: {with_price} ({with_price/total_products*100:.1f}%)")
        print(f"   Sin precio (0): {without_price} ({without_price/total_products*100:.1f}%)")
    except Exception as e:
        print(f"❌ Error obteniendo estadísticas: {e}")
    
    print("\n" + "=" * 80)
    print("✅ Verificación completada")
    print("=" * 80)

if __name__ == "__main__":
    check_prices()

