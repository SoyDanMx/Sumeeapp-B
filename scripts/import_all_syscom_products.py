#!/usr/bin/env python3
"""
Script para importar TODOS los productos de Syscom de categorías relevantes
a la base de datos del marketplace en la categoría "sistemas".
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

# Rate limit: 60 peticiones por minuto = 1 por segundo
RATE_LIMIT_DELAY = 1.1  # 1.1 segundos entre peticiones para estar seguros


def get_access_token() -> str:
    """Obtiene un token de acceso válido"""
    global access_token, token_expiry
    
    # Verificar si el token aún es válido (con margen de 1 hora)
    if access_token and token_expiry > (time.time() * 1000) - 3600000:
        return access_token
    
    print("🔐 Obteniendo token de acceso de Syscom...")
    
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


def get_all_products_from_category(categoria_id: str, categoria_nombre: str, start_page: int = 1) -> List[Dict]:
    """Obtiene TODOS los productos de una categoría, paginando si es necesario"""
    token = get_access_token()
    all_products = []
    
    print(f"\n📦 Obteniendo productos de categoría: {categoria_nombre} (ID: {categoria_id})...")
    
    # Primera petición para obtener el total (con reintentos)
    max_retries = 3
    retry_count = 0
    response = None
    
    while retry_count < max_retries:
        try:
            response = requests.get(
                f"{SYSCOM_API_BASE}/productos",
                params={"categoria": categoria_id},
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=60  # Aumentar timeout
            )
            break
        except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
            retry_count += 1
            if retry_count < max_retries:
                wait_time = retry_count * 5
                print(f"  ⚠️  Timeout en primera petición, reintentando en {wait_time}s... (intento {retry_count}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"  ❌ Error después de {max_retries} intentos")
                return []
    
    if not response:
        print(f"  ❌ No se pudo obtener productos de la categoría")
        return []
    
    if response.status_code != 200:
        print(f"  ⚠️  Error: {response.status_code}")
        print(f"     {response.text[:200]}")
        return []
    
    data = response.json()
    productos = data.get("productos", [])
    # El campo 'todo' puede venir como False o número, usar cantidad si está disponible
    total_productos = data.get("todo") or data.get("cantidad") or len(productos)
    if total_productos is False or total_productos is None:
        total_productos = len(productos)
    total_paginas = data.get("paginas", 1)
    if total_paginas is False or total_paginas is None:
        # Calcular páginas basado en cantidad de productos (60 por página típicamente)
        total_paginas = max(1, (len(productos) + 59) // 60)
    
    print(f"  📊 Total de productos: {total_productos}")
    print(f"  📄 Total de páginas: {total_paginas}")
    print(f"  ✅ Productos en página 1: {len(productos)}")
    
    all_products.extend(productos)
    
    # Paginar si hay más páginas (empezar desde start_page si se especificó)
    if total_paginas > 1:
        start = max(2, start_page)  # Empezar desde start_page o página 2
        for pagina in range(start, total_paginas + 1):
            time.sleep(RATE_LIMIT_DELAY)  # Respetar rate limit
            
            print(f"  📄 Obteniendo página {pagina}/{total_paginas}...")
            
            # Reintentos para manejar timeouts
            max_retries = 5  # Aumentar a 5 reintentos
            retry_count = 0
            response = None
            success = False
            
            while retry_count < max_retries:
                try:
                    response = requests.get(
                        f"{SYSCOM_API_BASE}/productos",
                        params={
                            "categoria": categoria_id,
                            "pagina": pagina,
                        },
                        headers={
                            "Authorization": f"Bearer {token}",
                            "Content-Type": "application/json",
                        },
                        timeout=90  # Aumentar timeout a 90 segundos
                    )
                    if response.status_code == 200:
                        success = True
                        break  # Éxito, salir del bucle de reintentos
                    else:
                        print(f"     ⚠️  Error HTTP {response.status_code} en página {pagina}")
                        retry_count += 1
                        if retry_count < max_retries:
                            time.sleep(3)
                except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
                    retry_count += 1
                    if retry_count < max_retries:
                        wait_time = retry_count * 3  # Esperar 3, 6, 9, 12 segundos
                        print(f"     ⚠️  Timeout en página {pagina}, reintentando en {wait_time}s... (intento {retry_count}/{max_retries})")
                        time.sleep(wait_time)
                    else:
                        print(f"     ❌ Error después de {max_retries} intentos en página {pagina}, saltando...")
                        break  # Saltar esta página y continuar
            
            if success and response:
                data = response.json()
                productos = data.get("productos", [])
                all_products.extend(productos)
                print(f"     ✅ {len(productos)} productos obtenidos")
            else:
                print(f"     ⚠️  No se pudo obtener la página {pagina}, continuando con la siguiente...")
    
    print(f"  ✅ Total obtenido: {len(all_products)} productos")
    return all_products


# Cache global para category_id (evitar consultas repetidas)
_cached_category_id = None

def get_category_id():
    """Obtiene el ID de categoría sistemas (con caché)"""
    global _cached_category_id
    if _cached_category_id is None:
        try:
            cat_response = supabase.table('marketplace_categories').select('id').eq('slug', 'sistemas').single().execute()
            if cat_response.data:
                _cached_category_id = cat_response.data['id']
            else:
                print("❌ Error: Categoría 'sistemas' no encontrada")
                return None
        except Exception as e:
            print(f"❌ Error obteniendo categoría: {e}")
            return None
    return _cached_category_id

def map_syscom_to_marketplace(syscom_product: Dict, categoria_id: str) -> Optional[Dict]:
    """Mapea un producto de Syscom al formato del marketplace"""
    # categoria_id se pasa como parámetro para evitar consultas repetidas
    
    if not categoria_id:
        return None
    
    # Extraer imágenes
    imagenes = []
    if syscom_product.get("img_portada"):
        imagenes.append(syscom_product["img_portada"])
    if syscom_product.get("imagenes"):
        for img in syscom_product.get("imagenes", []):
            if isinstance(img, dict) and img.get("url"):
                if img["url"] not in imagenes:
                    imagenes.append(img["url"])
            elif isinstance(img, str) and img not in imagenes:
                imagenes.append(img)
    
    # Determinar precio - manejar diferentes estructuras
    precio_data = syscom_product.get("precio")
    precio = 0
    precio_lista = None
    precio_especial = None
    
    if precio_data is None:
        # Si no hay precio en el listado, intentar obtenerlo del detalle individual
        producto_id = syscom_product.get("producto_id")
        if producto_id:
            try:
                token = get_access_token()
                detail_response = requests.get(
                    f"{SYSCOM_API_BASE}/productos/{producto_id}",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    timeout=30
                )
                if detail_response.status_code == 200:
                    detail_data = detail_response.json()
                    precio_data = detail_data.get("precio")
                    time.sleep(0.5)  # Rate limit
            except Exception as e:
                # Si falla, continuar sin precio
                pass
    
    if precio_data:
        if isinstance(precio_data, dict):
            # Estructura: { precio_lista, precio_especial, precio_descuento }
            precio_lista = precio_data.get("precio_lista")
            precio_especial = precio_data.get("precio_especial") or precio_data.get("precio_descuento")
            
            # PRIORIDAD: precio_especial es el precio principal (precio con descuento)
            # MEJORADO: Validar que precio_especial sea > 0 antes de usarlo
            # Si precio_especial es 0 o None, usar precio_lista o precio_1 como fallback
            precio_1 = precio_data.get('precio_1') or precio_data.get('precio_descuento')
            
            # Intentar obtener precio válido (> 0) en orden de prioridad
            precio = 0
            if precio_especial and float(precio_especial) > 0:
                # precio_especial válido y > 0
                precio = float(precio_especial)
            elif precio_1 and float(precio_1) > 0:
                # Fallback a precio_1 si precio_especial no está disponible
                precio = float(precio_1)
            elif precio_lista and float(precio_lista) > 0:
                # Fallback a precio_lista
                precio = float(precio_lista)
            
            # Si todos los precios son 0 o None, retornar None para omitir el producto
            if precio == 0:
                return None
        elif isinstance(precio_data, (int, float)):
            # Precio directo (número)
            precio = float(precio_data)
            precio_lista = precio
    
    # Si aún no hay precio válido, retornar None para omitir el producto
    if precio == 0:
        return None  # Omitir productos sin precio válido
    
    # Crear descripción
    descripcion = syscom_product.get("descripcion", "")
    caracteristicas = syscom_product.get("caracteristicas", [])
    if caracteristicas:
        descripcion += "\n\nCaracterísticas:\n" + "\n".join(f"- {c}" for c in caracteristicas)
    
    # Obtener SKU/modelo
    sku = syscom_product.get("modelo") or syscom_product.get("sku") or None
    
    # Determinar original_price:
    # - Si hay precio_especial Y precio_lista, entonces precio_lista es el original (precio sin descuento)
    # - Si solo hay precio_lista (sin precio_especial), no hay original_price
    original_price = None
    if precio_especial and precio_lista and precio_especial > 0 and precio_lista > 0:
        # Hay descuento: precio_especial es el precio final, precio_lista es el original
        if precio_especial < precio_lista:
            original_price = float(precio_lista)
        elif precio_especial == precio_lista:
            # Si son iguales, no hay descuento real
            original_price = None
        else:
            # precio_especial > precio_lista (caso raro, pero manejarlo)
            original_price = None
    
    return {
        "seller_id": None,  # Producto oficial de Sumee
        "title": syscom_product.get("titulo", ""),
        "description": descripcion or syscom_product.get("titulo", ""),
        "price": float(precio),
        "original_price": float(original_price) if original_price else None,
        "condition": "nuevo",
        "category_id": categoria_id,
        "images": imagenes if imagenes else None,
        "location_city": "CDMX",
        "location_zone": "Entrega Inmediata",
        "status": "active",
        "contact_phone": "5636741156",
        "external_code": str(syscom_product.get("producto_id")),  # Código de Syscom
        "sku": sku,  # Modelo como SKU
    }


def import_products(products: List[Dict], dry_run: bool = True):
    """Importa productos a la base de datos"""
    print("\n" + "=" * 80)
    print("IMPORTACIÓN DE PRODUCTOS")
    print("=" * 80)
    print(f"Modo: {'DRY RUN (no se guardarán cambios)' if dry_run else 'PRODUCCIÓN'}")
    print()
    
    imported = 0
    skipped = 0
    errors = 0
    
    # Obtener category_id una sola vez
    categoria_id = get_category_id()
    if not categoria_id:
        print("❌ No se pudo obtener el ID de categoría")
        return
    
    # Verificar si existe la columna external_code
    try:
        # Intentar una consulta simple para verificar si existe la columna
        test_query = supabase.table('marketplace_products').select('id').limit(1).execute()
    except Exception as e:
        if 'external_code' in str(e):
            print("❌ Error: La columna 'external_code' no existe en la tabla marketplace_products")
            print("💡 Ejecuta primero la migración: supabase/migrations/20250121_add_external_code_to_products.sql")
            return
    
    # Obtener todos los external_codes y SKUs existentes en batch (más eficiente)
    print("🔍 Verificando productos existentes...")
    existing_codes = set()
    existing_skus = set()
    try:
        # Obtener external_codes
        existing_response = supabase.table('marketplace_products').select('external_code,sku').not_.is_('external_code', 'null').execute()
        if existing_response.data:
            for prod in existing_response.data:
                external_code = prod.get('external_code')
                sku = prod.get('sku')
                if external_code:
                    existing_codes.add(str(external_code))
                if sku:
                    existing_skus.add(str(sku).strip().upper())
        print(f"   ✅ {len(existing_codes)} productos con external_code encontrados en BD")
        print(f"   ✅ {len(existing_skus)} SKUs únicos encontrados en BD")
    except Exception as e:
        print(f"   ⚠️  Error obteniendo códigos existentes: {e}")
        print("   Continuando sin verificación de duplicados...")
    
    for idx, syscom_product in enumerate(products, 1):
        producto_id = syscom_product.get("producto_id")
        titulo = syscom_product.get("titulo", "Sin título")[:60]
        modelo = syscom_product.get("modelo", "").strip()
        
        if idx % 100 == 0:
            print(f"\n📊 Progreso: {idx}/{len(products)} productos procesados...")
            print(f"   ✅ Importados: {imported} | ⏭️  Omitidos: {skipped} | ❌ Errores: {errors}\n")
        
        # Verificar si ya existe por external_code (usando set en memoria)
        if producto_id:
            if str(producto_id) in existing_codes:
                skipped += 1
                continue
        
        # Verificar si ya existe por SKU (modelo de Syscom se usa como SKU)
        if modelo:
            modelo_normalized = modelo.strip().upper()
            if modelo_normalized in existing_skus:
                skipped += 1
                continue
        
        # Mapear producto
        marketplace_product = map_syscom_to_marketplace(syscom_product, categoria_id)
        
        if not marketplace_product:
            # Producto omitido (sin precio válido o error en mapeo)
            skipped += 1
            if idx <= 10:  # Log primeros productos omitidos
                print(f"  ⏭️  Omitido: {titulo[:50]} (sin precio válido)")
            continue
        
        # Validar que el precio sea > 0 antes de importar
        if marketplace_product.get('price', 0) <= 0:
            skipped += 1
            if idx <= 10:
                print(f"  ⏭️  Omitido: {titulo[:50]} (precio = 0 o inválido)")
            continue
        
        if dry_run:
            imported += 1
            # Agregar a existing_codes y existing_skus para evitar duplicados en dry-run
            if producto_id:
                existing_codes.add(str(producto_id))
            if modelo:
                modelo_normalized = modelo.strip().upper()
                existing_skus.add(modelo_normalized)
        else:
            # Acumular productos para insertar en batch
            if 'batch_buffer' not in locals():
                batch_buffer = []
            
            batch_buffer.append(marketplace_product)
            
            # Insertar cuando el buffer alcanza el tamaño del lote o es el último producto
            if len(batch_buffer) >= 50 or idx == len(products):
                max_retries = 3
                retry_count = 0
                batch_success = False
                
                while retry_count < max_retries and not batch_success:
                    try:
                        result = supabase.table('marketplace_products').insert(batch_buffer).execute()
                        if result.data:
                            batch_imported = len(result.data)
                            imported += batch_imported
                            # Agregar a existing_codes y existing_skus
                            for prod in batch_buffer:
                                if prod.get('external_code'):
                                    existing_codes.add(str(prod['external_code']))
                                if prod.get('sku'):
                                    existing_skus.add(str(prod['sku']).strip().upper())
                            batch_success = True
                            batch_buffer = []  # Limpiar buffer
                        else:
                            errors += len(batch_buffer)
                            batch_success = True
                            batch_buffer = []
                    except Exception as e:
                        retry_count += 1
                        error_msg = str(e)
                        
                        # Si es error de conexión, reintentar
                        if any(keyword in error_msg.lower() for keyword in ['timeout', 'connection', 'connect', 'network', 'nodename']):
                            if retry_count < max_retries:
                                wait_time = retry_count * 3
                                if idx % 100 == 0:
                                    print(f"  ⚠️  Error de conexión en lote, reintentando en {wait_time}s...")
                                time.sleep(wait_time)
                            else:
                                # Si falla después de reintentos, insertar uno por uno
                                print(f"  ⚠️  Lote falló, insertando individualmente...")
                                for single_product in batch_buffer:
                                    try:
                                        single_result = supabase.table('marketplace_products').insert(single_product).execute()
                                        if single_result.data:
                                            imported += 1
                                            if single_product.get('external_code'):
                                                existing_codes.add(str(single_product['external_code']))
                                        else:
                                            errors += 1
                                    except:
                                        errors += 1
                                batch_buffer = []
                                batch_success = True
                        else:
                            # Otro tipo de error
                            errors += len(batch_buffer)
                            batch_buffer = []
                            batch_success = True
                            if idx <= 10:
                                print(f"  ❌ Error en lote: {error_msg[:100]}")
    
    print("\n" + "=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    print(f"✅ Importados: {imported}")
    print(f"⏭️  Omitidos: {skipped}")
    print(f"❌ Errores: {errors}")
    print("=" * 80)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Importar TODOS los productos de Syscom de categorías relevantes')
    parser.add_argument('--execute', action='store_true', help='Ejecutar importación (por defecto es dry-run)')
    parser.add_argument('--category', type=str, help='Importar solo una categoría específica (ID)')
    parser.add_argument('--start-page', type=int, default=1, help='Página inicial para reanudar importación (default: 1)')
    parser.add_argument('--save-progress', action='store_true', help='Guardar progreso en archivo para poder reanudar')
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("IMPORTADOR COMPLETO DE PRODUCTOS SYSCOM")
    print("=" * 80)
    print()
    
    # Categorías relevantes para sistemas
    categorias = [
        {'id': '22', 'nombre': 'Videovigilancia'},
        {'id': '26', 'nombre': 'Redes e IT'},
        {'id': '30', 'nombre': 'Energía / Herramientas'},
    ]
    
    # Si se especifica una categoría, filtrar
    if args.category:
        categorias = [c for c in categorias if c['id'] == args.category]
        if not categorias:
            print(f"❌ Categoría {args.category} no encontrada")
            sys.exit(1)
    
    all_products = []
    
    # Obtener productos de cada categoría
    for cat in categorias:
        productos = get_all_products_from_category(cat['id'], cat['nombre'], args.start_page)
        all_products.extend(productos)
        
        # Respetar rate limit entre categorías
        if cat != categorias[-1]:  # No esperar después de la última
            time.sleep(RATE_LIMIT_DELAY)
    
    # Eliminar duplicados por producto_id
    seen_ids = set()
    unique_products = []
    for product in all_products:
        producto_id = product.get("producto_id")
        if producto_id and producto_id not in seen_ids:
            seen_ids.add(producto_id)
            unique_products.append(product)
    
    print(f"\n📊 Total de productos únicos obtenidos: {len(unique_products)}")
    print(f"   (De {len(all_products)} productos totales, {len(all_products) - len(unique_products)} duplicados eliminados)")
    
    if not unique_products:
        print("❌ No se encontraron productos")
        sys.exit(1)
    
    # Importar productos
    import_products(unique_products, dry_run=not args.execute)
    
    if not args.execute:
        print("\n💡 Para ejecutar la importación real, usa: --execute")

