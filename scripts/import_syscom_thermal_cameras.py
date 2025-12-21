#!/usr/bin/env python3
"""
Script para importar cámaras termográficas desde la API de Syscom
a la base de datos del marketplace.
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

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_KEY no configuradas")
    sys.exit(1)

if not SYSCOM_CLIENT_ID or not SYSCOM_CLIENT_SECRET:
    print("❌ Error: Variables de entorno SYSCOM_CLIENT_ID y SYSCOM_CLIENT_SECRET no configuradas")
    print("💡 Obtén tus credenciales en: https://developers.syscom.mx/")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# URLs de la API de Syscom
SYSCOM_OAUTH_URL = "https://developers.syscom.mx/oauth/token"
SYSCOM_API_BASE = "https://developers.syscom.mx/api/v1"

# Cache de token
access_token = None
token_expiry = 0


def get_access_token() -> str:
    """Obtiene un token de acceso válido"""
    global access_token, token_expiry
    
    # Verificar si el token aún es válido (con margen de 1 hora)
    if access_token and token_expiry > (time.time() * 1000) - 3600000:
        return access_token
    
    print("🔐 Obteniendo token de acceso de Syscom...")
    
    # Syscom usa application/x-www-form-urlencoded, NO JSON
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
        print(f"   Respuesta: {response.text}")
        sys.exit(1)
    
    data = response.json()
    access_token = data["access_token"]
    token_expiry = (time.time() * 1000) + (data["expires_in"] * 1000)
    
    print("✅ Token obtenido exitosamente")
    return access_token


def search_thermal_cameras() -> List[Dict]:
    """Busca cámaras termográficas en Syscom"""
    token = get_access_token()
    
    search_terms = [
        "termografica",
        "cámara térmica",
        "thermal camera",
        "flir",
        "infrared camera"
    ]
    
    all_products = []
    seen_ids = set()
    
    print("\n🔍 Buscando cámaras termográficas en Syscom...\n")
    
    for term in search_terms:
        print(f"Buscando: '{term}'...")
        
        try:
            response = requests.get(
                f"{SYSCOM_API_BASE}/productos",
                params={"busqueda": term},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            
            if response.status_code != 200:
                print(f"  ⚠️  Error: {response.status_code}")
                continue
            
            data = response.json()
            products = data.get("productos", [])
            
            for product in products:
                product_id = product.get("producto_id")
                if product_id and product_id not in seen_ids:
                    all_products.append(product)
                    seen_ids.add(product_id)
            
            print(f"  ✅ Encontrados {len(products)} productos")
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
    
    print(f"\n📊 Total de productos únicos encontrados: {len(all_products)}\n")
    
    return all_products


def map_syscom_to_marketplace(syscom_product: Dict) -> Optional[Dict]:
    """Mapea un producto de Syscom al formato del marketplace"""
    # Obtener ID de categoría sistemas
    cat_response = supabase.table('marketplace_categories').select('id').eq('slug', 'sistemas').single().execute()
    
    if not cat_response.data:
        print("❌ Error: Categoría 'sistemas' no encontrada")
        return None
    
    categoria_id = cat_response.data['id']
    
    # Extraer imágenes
    imagenes = []
    if syscom_product.get("img_portada"):
        imagenes.append(syscom_product["img_portada"])
    if syscom_product.get("imagenes"):
        for img in syscom_product["imagenes"]:
            if img.get("url") and img["url"] not in imagenes:
                imagenes.append(img["url"])
    
    # Determinar precio (usar precio_especial si existe, sino precio_lista)
    precio_data = syscom_product.get("precio", {})
    precio = precio_data.get("precio_especial") or precio_data.get("precio_lista") or 0
    
    # Crear descripción
    descripcion = syscom_product.get("descripcion", "")
    caracteristicas = syscom_product.get("caracteristicas", [])
    if caracteristicas:
        descripcion += "\n\nCaracterísticas:\n" + "\n".join(f"- {c}" for c in caracteristicas)
    
    return {
        "seller_id": None,  # Producto oficial de Sumee
        "title": syscom_product.get("titulo", ""),
        "description": descripcion,
        "price": float(precio),
        "original_price": precio_data.get("precio_lista") if precio_data.get("precio_especial") else None,
        "condition": "nuevo",
        "category_id": categoria_id,
        "images": imagenes if imagenes else None,
        "location_city": "CDMX",
        "location_zone": "Entrega Inmediata",
        "status": "active",
        "contact_phone": "5636741156",
        "external_code": str(syscom_product.get("producto_id")),  # Código de Syscom
        "sku": syscom_product.get("modelo"),  # Modelo como SKU
    }


def import_products(products: List[Dict], dry_run: bool = True):
    """Importa productos a la base de datos"""
    print("=" * 80)
    print("IMPORTACIÓN DE PRODUCTOS")
    print("=" * 80)
    print(f"Modo: {'DRY RUN (no se guardarán cambios)' if dry_run else 'PRODUCCIÓN'}")
    print()
    
    imported = 0
    skipped = 0
    errors = 0
    
    for idx, syscom_product in enumerate(products, 1):
        producto_id = syscom_product.get("producto_id")
        titulo = syscom_product.get("titulo", "Sin título")[:60]
        
        print(f"[{idx}/{len(products)}] {titulo}...")
        
        # Verificar si ya existe por external_code
        if producto_id:
            existing = supabase.table('marketplace_products').select('id').eq('external_code', str(producto_id)).execute()
            if existing.data:
                print(f"  ⏭️  Ya existe (external_code: {producto_id})")
                skipped += 1
                continue
        
        # Mapear producto
        marketplace_product = map_syscom_to_marketplace(syscom_product)
        
        if not marketplace_product:
            print(f"  ❌ Error mapeando producto")
            errors += 1
            continue
        
        if dry_run:
            print(f"  ✅ Se importaría: ${marketplace_product['price']}")
            print(f"     Imágenes: {len(marketplace_product.get('images', []))}")
            imported += 1
        else:
            # Insertar en base de datos
            try:
                result = supabase.table('marketplace_products').insert(marketplace_product).execute()
                if result.data:
                    print(f"  ✅ Importado exitosamente")
                    imported += 1
                else:
                    print(f"  ❌ Error al insertar")
                    errors += 1
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                errors += 1
        
        print()
    
    print("=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    print(f"✅ Importados: {imported}")
    print(f"⏭️  Omitidos: {skipped}")
    print(f"❌ Errores: {errors}")
    print("=" * 80)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Importar cámaras termográficas de Syscom')
    parser.add_argument('--execute', action='store_true', help='Ejecutar importación (por defecto es dry-run)')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("IMPORTADOR DE CÁMARAS TERMOGRÁFICAS DESDE SYSCOM")
    print("=" * 80)
    print()
    
    # Buscar productos
    products = search_thermal_cameras()
    
    if not products:
        print("❌ No se encontraron productos")
        sys.exit(1)
    
    # Mostrar productos encontrados
    print("=" * 80)
    print("PRODUCTOS ENCONTRADOS:")
    print("=" * 80)
    for idx, product in enumerate(products[:10], 1):
        print(f"\n{idx}. {product.get('titulo', 'Sin título')}")
        print(f"   ID: {product.get('producto_id')}")
        print(f"   Marca: {product.get('marca', 'N/A')}")
        precio = product.get('precio', {})
        print(f"   Precio: ${precio.get('precio_especial') or precio.get('precio_lista', 0)}")
        print(f"   Stock: {product.get('total_existencia', 0)}")
        print(f"   Link: {product.get('link', 'N/A')}")
    
    if len(products) > 10:
        print(f"\n... y {len(products) - 10} productos más")
    
    print("\n" + "=" * 80)
    
    # Importar productos
    import_products(products, dry_run=not args.execute)
    
    if not args.execute:
        print("\n💡 Para ejecutar la importación real, usa: --execute")

