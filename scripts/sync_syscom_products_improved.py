#!/usr/bin/env python3
"""
Script mejorado para sincronizar productos desde la API de Syscom
Basado en las mejores prácticas de import_all_syscom_products.py
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Dict, Optional, List

# Load environment variables
load_dotenv('.env.local')

# Configuration
SYSCOM_CLIENT_ID = os.getenv("SYSCOM_CLIENT_ID")
SYSCOM_CLIENT_SECRET = os.getenv("SYSCOM_CLIENT_SECRET")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SYSCOM_CLIENT_ID or not SYSCOM_CLIENT_SECRET:
    print("❌ Error: Missing Syscom Credentials.")
    print("Please add SYSCOM_CLIENT_ID and SYSCOM_CLIENT_SECRET to your .env.local file.")
    sys.exit(1)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase Credentials.")
    sys.exit(1)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Syscom API Config
BASE_URL = "https://developers.syscom.mx/api/v1"
TOKEN_URL = "https://developers.syscom.mx/oauth/token"
RATE_LIMIT_DELAY = 1.1  # Respeta límite de 60 req/min

# Cache de token
access_token = None
token_expiry = 0

# Mapping Syscom Categories (ID) to Sumee Subcategory Slugs
SYSCOM_MAP = {
    "22": "videovigilancia",
    "26": "redes", 
    "65811": "redes",  # Cableado estructurado -> redes
    "25": "radiocomunicacion",
    "30": "energia-solar",
    "37": "control-acceso",
    "32": "domotica",
}

SISTEMAS_CATEGORY_SLUG = "sistemas"

# Cache de categoría
_cached_category_id = None
_cached_subcategory_map = {}


def get_access_token():
    """Obtiene token de acceso con caché"""
    global access_token, token_expiry
    
    # Verificar si el token aún es válido (con margen de 1 hora)
    if access_token and token_expiry > (time.time() * 1000) - 3600000:
        return access_token
    
    print("🔑 Authenticating with Syscom...")
    data = {
        "client_id": SYSCOM_CLIENT_ID,
        "client_secret": SYSCOM_CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    try:
        res = requests.post(TOKEN_URL, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
        res.raise_for_status()
        token_data = res.json()
        access_token = token_data["access_token"]
        token_expiry = (time.time() * 1000) + (token_data["expires_in"] * 1000)
        print("✅ Authentication successful!")
        return access_token
    except Exception as e:
        print(f"❌ Auth failed: {e}")
        if res:
            print(res.text)
        sys.exit(1)


def get_sistemas_uuid():
    """Fetch the UUID for the 'sistemas' category from Supabase (con caché)"""
    global _cached_category_id
    if _cached_category_id is None:
        try:
            res = supabase.table("marketplace_categories").select("id").eq("slug", SISTEMAS_CATEGORY_SLUG).single().execute()
            if res.data:
                _cached_category_id = res.data['id']
            else:
                print(f"❌ Error: 'sistemas' category not found in DB")
                return None
        except Exception as e:
            print(f"❌ Error fetching 'sistemas' category: {e}")
            return None
    return _cached_category_id


def get_subcategory_map(sistemas_uuid):
    """Returns a dict of slug -> uuid for subcategories of sistemas (con caché)"""
    global _cached_subcategory_map
    if _cached_subcategory_map:
        return _cached_subcategory_map
        
    mapping = {}
    if not sistemas_uuid:
        return mapping
        
    try:
        res = supabase.table("marketplace_subcategories").select("id, slug").eq("category_id", sistemas_uuid).execute()
        if res.data:
            for item in res.data:
                mapping[item['slug']] = item['id']
            _cached_subcategory_map = mapping
    except Exception as e:
        print(f"❌ Error fetching subcategories: {e}")
    return mapping


def get_valid_seller_id():
    """Returns the official Sumee Marketplace seller ID"""
    return "0ad1a921-8b5e-4fa4-a5ac-6bb5299bdae8"


def map_syscom_product(p: Dict, sistemas_uuid: str, subcat_uuid: str, seller_id: str) -> Optional[Dict]:
    """
    Mapea un producto de Syscom al formato del marketplace
    Usa la misma lógica que import_all_syscom_products.py
    """
    # Title
    title = p.get('titulo') or p.get('nombre') or "Producto Syscom"
    if not title or len(title.strip()) == 0:
        return None
    
    # Description
    brand = p.get('marca', 'Genérico')
    model = p.get('modelo', 'S/M')
    desc_text = p.get('descripcion') or ""
    caracteristicas = p.get('caracteristicas', [])
    
    description = f"Marca: {brand}. Modelo: {model}."
    if desc_text:
        description += f"\n\n{desc_text}"
    if caracteristicas:
        description += "\n\nCaracterísticas:\n" + "\n".join(f"- {c}" for c in caracteristicas)
    
    # Images
    imagenes = []
    if p.get('img_portada'):
        imagenes.append(p.get('img_portada'))
    if p.get('imagenes'):
        for img in p.get('imagenes', []):
            if isinstance(img, dict) and img.get('url'):
                if img['url'] not in imagenes:
                    imagenes.append(img['url'])
            elif isinstance(img, str) and img not in imagenes:
                imagenes.append(img)
    
    # Price handling (MEJORADO - misma lógica que import_all_syscom_products.py)
    precios = p.get('precios', {})
    precio_lista = None
    precio_especial = None
    
    if isinstance(precios, dict):
        precio_lista = precios.get('precio_lista')
        precio_especial = precios.get('precio_especial') or precios.get('precio_descuento')
    
    # PRIORIDAD: precio_especial es el precio principal
    if precio_especial and float(precio_especial) > 0:
        price = float(precio_especial)
    elif precio_lista and float(precio_lista) > 0:
        price = float(precio_lista)
    else:
        price = 0  # "Consultar precio"
    
    # original_price solo si hay descuento
    original_price = None
    if precio_especial and precio_lista and float(precio_especial) > 0 and float(precio_lista) > 0:
        if float(precio_especial) < float(precio_lista):
            original_price = float(precio_lista)
    
    # External code y SKU (CRÍTICO - faltaba en el código original)
    external_code = str(p.get('producto_id') or p.get('id', ''))
    sku = p.get('modelo') or p.get('sku') or None
    
    if not external_code:
        print(f"  ⚠️  Producto sin external_code, omitiendo: {title[:50]}")
        return None
    
    payload = {
        "title": title[:150],
        "description": description[:2000] if len(description) > 2000 else description,
        "price": price,
        "original_price": original_price,
        "condition": "nuevo",
        "category_id": sistemas_uuid,
        "subcategory_id": subcat_uuid,
        "seller_id": seller_id,
        "images": imagenes if imagenes else [],
        "status": "active",
        "location_city": "CDMX",
        "location_zone": "Bodega Central",
        "external_code": external_code,  # ✅ AGREGADO
        "sku": sku,  # ✅ AGREGADO
    }
    
    return payload


def sync_products(token: str, sistemas_uuid: str, subcat_map: Dict, seller_id: str, max_pages: int = 100):
    """
    Sincroniza productos desde Syscom
    MEJORADO: Procesa todas las páginas disponibles, busca duplicados por external_code
    """
    headers = {"Authorization": f"Bearer {token}"}
    
    total_synced = 0
    total_updated = 0
    total_skipped = 0
    total_errors = 0
    
    # Obtener external_codes existentes en batch (optimización)
    print("🔍 Obteniendo productos existentes para evitar duplicados...")
    try:
        existing_response = supabase.table("marketplace_products").select("external_code").eq("category_id", sistemas_uuid).not_.is_("external_code", "null").execute()
        existing_codes = {str(item['external_code']) for item in (existing_response.data or [])}
        print(f"✅ Encontrados {len(existing_codes)} productos existentes")
    except Exception as e:
        print(f"⚠️  No se pudieron obtener productos existentes: {e}")
        existing_codes = set()
    
    for syscom_id, sumee_slug in SYSCOM_MAP.items():
        if sumee_slug not in subcat_map:
            print(f"⚠️  Skipping Syscom ID {syscom_id} because '{sumee_slug}' subcategory not found in DB.")
            continue
            
        subcat_uuid = subcat_map[sumee_slug]
        print(f"\n📡 Fetching products for Syscom ID {syscom_id} -> '{sumee_slug}'...")
        
        page = 1
        total_pages = 1  # Se actualizará con la primera respuesta
        
        while page <= total_pages and page <= max_pages:
            try:
                print(f"   Reading page {page}/{total_pages}...")
                url = f"{BASE_URL}/productos"
                params = {"categoria": syscom_id, "pagina": page}

                res = requests.get(url, headers=headers, params=params, timeout=60)
                res.raise_for_status()
                
                data = res.json()
                products = data.get('productos', [])
                total_in_cat = data.get('cantidad', 0)
                total_pages = data.get('paginas', 1)  # ✅ Actualizar total de páginas
                
                if not products:
                    print("   No products found on this page. Stopping category.")
                    break

                print(f"   Found {len(products)} products (Total in Syscom: {total_in_cat}, Pages: {total_pages}). Syncing...")
                
                for p in products:
                    # Mapear producto
                    payload = map_syscom_product(p, sistemas_uuid, subcat_uuid, seller_id)
                    
                    if not payload:
                        total_skipped += 1
                        continue
                    
                    external_code = payload['external_code']
                    title = payload['title']
                    price = payload['price']
                    
                    # Verificar si ya existe por external_code (MEJORADO)
                    if external_code in existing_codes:
                        # UPDATE existing product
                        try:
                            existing = supabase.table("marketplace_products").select("id,price").eq("external_code", external_code).single().execute()
                            if existing.data:
                                existing_id = existing.data['id']
                                # Solo actualizar si el precio cambió o es 0
                                if existing.data.get('price', 0) != price or price > 0:
                                    supabase.table("marketplace_products").update({
                                        "price": price,
                                        "original_price": payload.get('original_price'),
                                        "seller_id": seller_id,
                                        "images": payload['images'],
                                    }).eq("id", existing_id).execute()
                                    total_updated += 1
                                    if page <= 3:  # Solo mostrar primeros productos
                                        print(f"     ~ Updated: {title[:30]}... -> ${price}")
                                else:
                                    total_skipped += 1
                        except Exception as update_err:
                            print(f"     ❌ Update Failed: {update_err}")
                            total_errors += 1
                    else:
                        # INSERT new product
                        try:
                            supabase.table("marketplace_products").insert(payload).execute()
                            existing_codes.add(external_code)  # Agregar a cache
                            total_synced += 1
                            if page <= 3:  # Solo mostrar primeros productos
                                print(f"     + Inserted: {title[:30]}... ${price}")
                        except Exception as insert_err:
                            print(f"     ❌ Insert Failed: {insert_err}")
                            total_errors += 1
                    
                    time.sleep(0.01)  # Pequeño delay entre productos
                
                page += 1
                time.sleep(RATE_LIMIT_DELAY)  # ✅ Rate limiting mejorado
                
            except Exception as e:
                print(f"❌ Error syncing page {page} of ID {syscom_id}: {e}")
                import traceback
                traceback.print_exc()
                break

    print(f"\n✅ Sync Complete.")
    print(f"   ✅ Nuevos productos: {total_synced}")
    print(f"   🔄 Actualizados: {total_updated}")
    print(f"   ⏭️  Omitidos: {total_skipped}")
    print(f"   ❌ Errores: {total_errors}")
    print(f"   📊 Total procesado: {total_synced + total_updated + total_skipped}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Sincronizar productos de Syscom')
    parser.add_argument('--max-pages', type=int, default=100, help='Máximo de páginas por categoría')
    parser.add_argument('--category', type=str, help='Sincronizar solo una categoría específica (ID de Syscom)')
    args = parser.parse_args()
    
    token = get_access_token()
    sistemas_uuid = get_sistemas_uuid()
    
    if not sistemas_uuid:
        print("❌ 'sistemas' category not found in Supabase. Run migrations first.")
        sys.exit(1)
        
    subcat_map = get_subcategory_map(sistemas_uuid)
    print(f"📋 Subcategorías encontradas: {list(subcat_map.keys())}")
    
    if not subcat_map:
        print("⚠️  No se encontraron subcategorías. Verifica la base de datos.")
    
    seller_id = get_valid_seller_id()
    print(f"👤 Using Seller ID: {seller_id}")
    
    # Filtrar categorías si se especifica
    syscom_map = SYSCOM_MAP
    if args.category:
        if args.category in SYSCOM_MAP:
            syscom_map = {args.category: SYSCOM_MAP[args.category]}
        else:
            print(f"❌ Categoría {args.category} no encontrada en el mapeo")
            sys.exit(1)
    
    sync_products(token, sistemas_uuid, subcat_map, seller_id, max_pages=args.max_pages)


if __name__ == "__main__":
    main()

