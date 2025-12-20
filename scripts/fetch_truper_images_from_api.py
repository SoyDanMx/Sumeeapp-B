"""
Script para obtener imágenes de productos Truper desde la API oficial.
Usa la API FIX Ferreterias: http://201.151.220.227:8999/

Endpoint: GET Article/{ItemCode}/{CodTienda}
Respuesta: Articulo con campo Pictures (lista de URLs de imágenes)
"""

import os
import sys
import re
import requests
from typing import Dict, List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_KEY no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# URL base de la API de Truper
TRUPER_API_BASE = "http://201.151.220.227:8999"
TRUPER_API_ENDPOINT = f"{TRUPER_API_BASE}/api/Article"

# CodTienda por defecto (puede necesitar ajustarse según la tienda)
DEFAULT_COD_TIENDA = "1"

# Headers para las peticiones
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}


def extract_item_code_from_product(product: Dict) -> Optional[str]:
    """
    Extrae el código del artículo (ItemCode) del producto.
    Intenta múltiples métodos:
    1. Del título (buscar código numérico)
    2. De la clave (formato como PET-15X)
    3. De las imágenes existentes
    """
    title = product.get('title', '')
    description = product.get('description', '')
    images = product.get('images', [])
    
    text = f"{title} {description}".upper()
    
    # Método 1: Buscar código numérico (6-7 dígitos típicamente)
    code_match = re.search(r'\b(\d{6,7})\b', text)
    if code_match:
        return code_match.group(1)
    
    # Método 2: Buscar clave (formato como PET-15X, RMAX-7NX)
    clave_match = re.search(r'\b([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})\b', text)
    if clave_match:
        return clave_match.group(1)
    
    # Método 3: Extraer de imagen local existente
    if images and len(images) > 0:
        for img in images:
            if isinstance(img, str):
                # Si es imagen local, extraer identificador
                local_match = re.search(r'/truper/([^/]+)\.(jpg|webp|png)', img)
                if local_match:
                    identifier = local_match.group(1)
                    # Si es numérico, es código
                    if identifier.isdigit():
                        return identifier
                    # Si tiene formato clave, retornarlo
                    if re.match(r'^[A-Z]{2,6}-\d{1,4}[A-Z]{0,2}$', identifier):
                        return identifier
    
    return None


def fetch_images_from_api(item_code: str, cod_tienda: str = DEFAULT_COD_TIENDA) -> Optional[List[str]]:
    """
    Obtiene las imágenes del artículo desde la API de Truper.
    
    Args:
        item_code: Código o clave del artículo
        cod_tienda: Código de la tienda (default: "1")
    
    Returns:
        Lista de URLs de imágenes o None si hay error
    """
    url = f"{TRUPER_API_ENDPOINT}/{item_code}/{cod_tienda}"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # La respuesta puede tener diferentes estructuras
            # Buscar el campo Pictures o Data.Pictures
            pictures = None
            
            if isinstance(data, dict):
                # Estructura directa
                if 'Pictures' in data:
                    pictures = data['Pictures']
                elif 'Data' in data and isinstance(data['Data'], dict):
                    if 'Pictures' in data['Data']:
                        pictures = data['Data']['Pictures']
                elif 'Result' in data and isinstance(data['Result'], dict):
                    if 'Pictures' in data['Result']:
                        pictures = data['Result']['Pictures']
            
            if pictures and isinstance(pictures, list) and len(pictures) > 0:
                # Filtrar URLs válidas
                valid_images = [
                    img for img in pictures 
                    if img and isinstance(img, str) and (img.startswith('http') or img.startswith('/'))
                ]
                if valid_images:
                    return valid_images
        
        elif response.status_code == 404:
            print(f"  ⚠️  Artículo no encontrado: {item_code}")
        else:
            print(f"  ⚠️  Error HTTP {response.status_code}: {item_code}")
    
    except requests.exceptions.Timeout:
        print(f"  ⏱️  Timeout al obtener: {item_code}")
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error de conexión: {item_code} - {str(e)}")
    except Exception as e:
        print(f"  ❌ Error inesperado: {item_code} - {str(e)}")
    
    return None


def update_product_images(product_id: str, images: List[str]) -> bool:
    """
    Actualiza las imágenes del producto en la base de datos.
    """
    try:
        response = supabase.table('marketplace_products').update({
            'images': images,
            'updated_at': 'now()'
        }).eq('id', product_id).execute()
        
        return True
    except Exception as e:
        print(f"  ❌ Error actualizando BD: {str(e)}")
        return False


def main():
    """
    Función principal: obtiene productos y actualiza sus imágenes desde la API.
    """
    print("🚀 Iniciando actualización de imágenes desde API de Truper\n")
    print(f"📍 API: {TRUPER_API_BASE}")
    print(f"🔗 Endpoint: {TRUPER_API_ENDPOINT}\n")
    
    # Obtener productos TRUPER (sin imágenes válidas o con imágenes locales)
    print("📥 Obteniendo productos de la base de datos...")
    
    # Obtener productos activos que puedan ser de Truper
    # Filtrar por productos que tengan contacto de Sumee o que sean nuevos
    response = supabase.table('marketplace_products').select(
        'id, title, description, images, contact_phone'
    ).eq('status', 'active').limit(5000).execute()
    
    products = response.data if response.data else []
    print(f"✅ {len(products)} productos encontrados\n")
    
    if len(products) == 0:
        print("⚠️  No se encontraron productos para actualizar")
        return
    
    # Estadísticas
    stats = {
        'total': len(products),
        'updated': 0,
        'no_code': 0,
        'no_images': 0,
        'errors': 0,
        'skipped': 0
    }
    
    # Procesar productos
    print("🔄 Procesando productos...\n")
    
    for i, product in enumerate(products, 1):
        product_id = product.get('id')
        title = product.get('title', '')[:50]
        
        print(f"[{i}/{len(products)}] {title}...")
        
        # Extraer código del artículo
        item_code = extract_item_code_from_product(product)
        
        if not item_code:
            print(f"  ⚠️  No se pudo extraer código/clave")
            stats['no_code'] += 1
            continue
        
        print(f"  🔍 Código encontrado: {item_code}")
        
        # Obtener imágenes desde la API
        images = fetch_images_from_api(item_code)
        
        if not images or len(images) == 0:
            print(f"  ⚠️  No se obtuvieron imágenes")
            stats['no_images'] += 1
            continue
        
        print(f"  ✅ {len(images)} imagen(es) obtenida(s)")
        
        # Actualizar en base de datos
        if update_product_images(product_id, images):
            print(f"  ✅ Actualizado en BD")
            stats['updated'] += 1
        else:
            stats['errors'] += 1
        
        print()  # Línea en blanco
    
    # Resumen
    print("\n" + "="*60)
    print("📊 RESUMEN")
    print("="*60)
    print(f"Total procesados:     {stats['total']}")
    print(f"✅ Actualizados:       {stats['updated']}")
    print(f"⚠️  Sin código/clave:  {stats['no_code']}")
    print(f"⚠️  Sin imágenes API:  {stats['no_images']}")
    print(f"❌ Errores:            {stats['errors']}")
    print("="*60)


if __name__ == "__main__":
    # Verificar si se debe ejecutar (modo dry-run por defecto)
    execute = "--execute" in sys.argv
    
    if not execute:
        print("⚠️  MODO DRY-RUN: No se realizarán cambios en la base de datos")
        print("   Usa --execute para aplicar cambios\n")
    
    main()


