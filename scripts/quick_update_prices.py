#!/usr/bin/env python3
"""
Script optimizado para actualizar precios desde API Syscom en batches
Versión rápida y eficiente con mejor manejo de errores
"""
import os
import sys
import time
import requests
from pathlib import Path
from supabase import create_client, Client

# Cargar variables de entorno
env_file = Path(__file__).parent.parent / '.env.local'
if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip().strip('"').strip("'")

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SYSCOM_CLIENT_ID = os.environ.get('SYSCOM_CLIENT_ID')
SYSCOM_CLIENT_SECRET = os.environ.get('SYSCOM_CLIENT_SECRET')

if not all([SUPABASE_URL, SUPABASE_KEY, SYSCOM_CLIENT_ID, SYSCOM_CLIENT_SECRET]):
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_syscom_token():
    """Obtener token de acceso de Syscom"""
    try:
        response = requests.post(
            "https://developers.syscom.mx/oauth/token",
            data={
                'client_id': SYSCOM_CLIENT_ID,
                'client_secret': SYSCOM_CLIENT_SECRET,
                'grant_type': 'client_credentials'
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            print(f"❌ Error obteniendo token: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Excepción obteniendo token: {e}")
        return None

def get_product_price_from_syscom(product_id, access_token):
    """Obtener precio de un producto específico desde Syscom API"""
    try:
        response = requests.get(
            f"https://developers.syscom.mx/api/v1/productos/{product_id}",
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            precios = data.get('precios', {})
            
            # Priorizar precio_especial > precio_1 > precio_lista
            precio_especial = precios.get('precio_especial')
            precio_1 = precios.get('precio_1')
            precio_lista = precios.get('precio_lista')
            
            if precio_especial and float(precio_especial) > 0:
                return float(precio_especial)
            elif precio_1 and float(precio_1) > 0:
                return float(precio_1)
            elif precio_lista and float(precio_lista) > 0:
                return float(precio_lista)
        
        return None
    except Exception as e:
        return None

def update_prices_batch(limit=1000):
    """Actualizar precios en batches"""
    print("=" * 80)
    print("ACTUALIZACIÓN RÁPIDA DE PRECIOS - SYSCOM API")
    print("=" * 80)
    print()
    
    # Obtener token
    print("🔑 Obteniendo token de acceso...")
    access_token = get_syscom_token()
    if not access_token:
        print("❌ No se pudo obtener el token. Abortando.")
        return
    print("✅ Token obtenido")
    print()
    
    # Obtener productos con precio 0 que tengan external_code
    print(f"🔍 Buscando productos con precio 0 (límite: {limit})...")
    try:
        response = supabase.table('marketplace_products').select(
            'id,title,external_code'
        ).eq('price', 0).not_.is_('external_code', 'null').limit(limit).execute()
        
        productos = response.data
        if not productos:
            print("✅ No hay productos con precio 0 que tengan external_code")
            return
        
        print(f"📦 Encontrados {len(productos)} productos para actualizar")
        print()
        
    except Exception as e:
        print(f"❌ Error consultando base de datos: {e}")
        return
    
    # Procesar productos
    updated = 0
    failed = 0
    no_price = 0
    
    print("🚀 Iniciando actualización...")
    print()
    
    for idx, producto in enumerate(productos, 1):
        external_code = producto.get('external_code')
        product_id = producto.get('id')
        title = producto.get('title', '')[:50]
        
        # Mostrar progreso cada 50 productos
        if idx % 50 == 0:
            print(f"📊 Progreso: {idx}/{len(productos)} | ✅ {updated} | ❌ {failed} | ⚠️  {no_price}")
        
        # Obtener precio desde Syscom
        price = get_product_price_from_syscom(external_code, access_token)
        
        if price and price > 0:
            try:
                # Actualizar en Supabase
                supabase.table('marketplace_products').update({
                    'price': price,
                    'updated_at': 'now()'
                }).eq('id', product_id).execute()
                
                updated += 1
                if idx % 10 == 0:  # Mostrar solo cada 10 actualizaciones exitosas
                    print(f"   ✅ {title}... → ${price:.2f}")
            except Exception as e:
                failed += 1
                print(f"   ❌ Error actualizando {title}... : {e}")
        else:
            no_price += 1
        
        # Rate limiting: 60 requests/min = 1 request/sec
        if idx % 50 == 0:
            time.sleep(1)
    
    # Resumen final
    print()
    print("=" * 80)
    print("RESUMEN")
    print("=" * 80)
    print(f"✅ Actualizados: {updated}")
    print(f"❌ Errores: {failed}")
    print(f"⚠️  Sin precio: {no_price}")
    print(f"📊 Total procesados: {len(productos)}")
    print()
    
    if updated > 0:
        print(f"🎉 Se actualizaron {updated} productos con precios válidos")
    else:
        print("⚠️  No se pudo actualizar ningún producto")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Actualizar precios desde Syscom API')
    parser.add_argument('--limit', type=int, default=1000, help='Límite de productos a procesar')
    args = parser.parse_args()
    
    update_prices_batch(limit=args.limit)

