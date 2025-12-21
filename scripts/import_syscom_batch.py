#!/usr/bin/env python3
"""
Script optimizado para importar productos de Syscom en lotes (batch)
para mejorar el rendimiento y reducir errores de conexión.
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict, Optional

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SYSCOM_CLIENT_ID = os.environ.get('SYSCOM_CLIENT_ID')
SYSCOM_CLIENT_SECRET = os.environ.get('SYSCOM_CLIENT_SECRET')

if not all([SUPABASE_URL, SUPABASE_KEY, SYSCOM_CLIENT_ID, SYSCOM_CLIENT_SECRET]):
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SYSCOM_OAUTH_URL = "https://developers.syscom.mx/oauth/token"
SYSCOM_API_BASE = "https://developers.syscom.mx/api/v1"
RATE_LIMIT_DELAY = 1.1
BATCH_SIZE = 50  # Insertar productos en lotes de 50

access_token = None
token_expiry = 0
_cached_category_id = None

def get_access_token() -> str:
    global access_token, token_expiry
    if access_token and token_expiry > (time.time() * 1000) - 3600000:
        return access_token
    
    print("🔐 Obteniendo token de acceso...")
    response = requests.post(
        SYSCOM_OAUTH_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": SYSCOM_CLIENT_ID,
            "client_secret": SYSCOM_CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    
    if response.status_code != 200:
        print(f"❌ Error obteniendo token: {response.status_code}")
        sys.exit(1)
    
    data = response.json()
    access_token = data["access_token"]
    token_expiry = (time.time() * 1000) + (data["expires_in"] * 1000)
    return access_token

def get_category_id():
    global _cached_category_id
    if _cached_category_id is None:
        try:
            cat_response = supabase.table('marketplace_categories').select('id').eq('slug', 'sistemas').single().execute()
            if cat_response.data:
                _cached_category_id = cat_response.data['id']
            else:
                return None
        except Exception as e:
            print(f"❌ Error obteniendo categoría: {e}")
            return None
    return _cached_category_id

def map_product(syscom_product: Dict, categoria_id: str) -> Optional[Dict]:
    if not categoria_id:
        return None
    
    imagenes = []
    if syscom_product.get("img_portada"):
        imagenes.append(syscom_product["img_portada"])
    if syscom_product.get("imagenes"):
        for img in syscom_product.get("imagenes", []):
            if isinstance(img, dict) and img.get("url") and img["url"] not in imagenes:
                imagenes.append(img["url"])
            elif isinstance(img, str) and img not in imagenes:
                imagenes.append(img)
    
    precio_data = syscom_product.get("precio", {}) or {}
    precio = 0
    if isinstance(precio_data, dict):
        precio = precio_data.get("precio_especial") or precio_data.get("precio_lista") or 0
    elif isinstance(precio_data, (int, float)):
        precio = precio_data
    
    descripcion = syscom_product.get("descripcion", "")
    caracteristicas = syscom_product.get("caracteristicas", [])
    if caracteristicas:
        descripcion += "\n\nCaracterísticas:\n" + "\n".join(f"- {c}" for c in caracteristicas)
    
    return {
        "seller_id": None,
        "title": syscom_product.get("titulo", ""),
        "description": descripcion or syscom_product.get("titulo", ""),
        "price": float(precio),
        "original_price": float(precio_data.get("precio_lista", precio)) if isinstance(precio_data, dict) and precio_data.get("precio_especial") else None,
        "condition": "nuevo",
        "category_id": categoria_id,
        "images": imagenes if imagenes else None,
        "location_city": "CDMX",
        "location_zone": "Entrega Inmediata",
        "status": "active",
        "contact_phone": "5636741156",
        "external_code": str(syscom_product.get("producto_id")),
        "sku": syscom_product.get("modelo") or syscom_product.get("sku") or None,
    }

def import_batch(products_batch: List[Dict], categoria_id: str, existing_codes: set) -> tuple[int, int, int]:
    """Importa un lote de productos. Retorna (importados, omitidos, errores)"""
    imported = 0
    skipped = 0
    errors = 0
    
    # Filtrar productos que ya existen
    new_products = []
    for product in products_batch:
        producto_id = product.get("producto_id")
        if producto_id and str(producto_id) in existing_codes:
            skipped += 1
        else:
            mapped = map_product(product, categoria_id)
            if mapped:
                new_products.append(mapped)
                if producto_id:
                    existing_codes.add(str(producto_id))
            else:
                errors += 1
    
    # Insertar en batch
    if new_products:
        max_retries = 3
        retry_count = 0
        while retry_count < max_retries:
            try:
                result = supabase.table('marketplace_products').insert(new_products).execute()
                if result.data:
                    imported = len(result.data)
                break
            except Exception as e:
                retry_count += 1
                if retry_count < max_retries:
                    time.sleep(retry_count * 2)
                else:
                    errors += len(new_products)
                    print(f"  ⚠️  Error insertando lote: {str(e)[:100]}")
    
    return imported, skipped, errors

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Importar productos Syscom en lotes')
    parser.add_argument('--execute', action='store_true')
    parser.add_argument('--category', type=str)
    args = parser.parse_args()
    
    print("=" * 80)
    print("IMPORTADOR OPTIMIZADO DE PRODUCTOS SYSCOM (BATCH)")
    print("=" * 80)
    print()
    
    categoria_id = get_category_id()
    if not categoria_id:
        print("❌ No se pudo obtener categoría")
        sys.exit(1)
    
    # Obtener códigos existentes
    print("🔍 Cargando productos existentes...")
    existing_codes = set()
    try:
        response = supabase.table('marketplace_products').select('external_code').not_.is_('external_code', 'null').execute()
        if response.data:
            existing_codes = {str(c.get('external_code')) for c in response.data if c.get('external_code')}
        print(f"   ✅ {len(existing_codes)} productos existentes")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
    
    # Obtener productos de Syscom (simplificado - usar el script principal para obtener)
    print("\n💡 Este script está optimizado para importación en lotes.")
    print("💡 Usa el script principal para obtener productos de Syscom:")
    print("   python3 scripts/import_all_syscom_products.py --execute")

