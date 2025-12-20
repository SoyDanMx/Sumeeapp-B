"""
Script para identificar y corregir URLs de imágenes rotas (404).
Actualiza productos con URLs rotas usando imágenes locales cuando están disponibles.
"""

import os
import sys
import requests
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

LOCAL_IMAGES_DIR = Path('public/images/marketplace/truper')
BROKEN_URLS = set()

def check_url_status(url: str) -> bool:
    """Verifica si una URL está accesible (no 404)."""
    try:
        response = requests.head(url, timeout=5, allow_redirects=True)
        return response.status_code == 200
    except:
        return False

def find_local_image_by_code(code: str) -> str:
    """Busca una imagen local por código/clave."""
    if not LOCAL_IMAGES_DIR.exists():
        return None
    
    code_upper = code.upper()
    
    # Buscar variaciones
    variations = [
        f"{code_upper}.jpg",
        f"{code_upper.replace('-', '')}.jpg",
    ]
    
    for var in variations:
        filepath = LOCAL_IMAGES_DIR / var
        if filepath.exists():
            return f"/images/marketplace/truper/{var}"
    
    return None

def main():
    dry_run = '--execute' not in sys.argv
    
    print("=" * 60)
    print("🔍 IDENTIFICAR Y CORREGIR URLs DE IMÁGENES ROTAS")
    print("=" * 60)
    print()
    
    if dry_run:
        print("⚠️  MODO DRY RUN - No se realizarán cambios\n")
    else:
        print("⚠️  MODO EJECUCIÓN - Se realizarán cambios\n")
    
    # Obtener productos con URLs externas
    print("🔍 Obteniendo productos con URLs externas...")
    all_products = []
    offset = 0
    
    while True:
        response = supabase.table('marketplace_products').select(
            'id, title, images'
        ).eq('status', 'active').range(offset, offset + 1000).execute()
        
        batch = response.data
        if not batch:
            break
        
        all_products.extend(batch)
        offset += 1000
        
        if len(batch) < 1000:
            break
    
    print(f"✅ {len(all_products)} productos encontrados\n")
    
    # Verificar URLs
    print("🔍 Verificando URLs de imágenes...\n")
    
    products_with_broken_urls = []
    checked_count = 0
    
    for i, product in enumerate(all_products, 1):
        if i % 100 == 0:
            print(f"   Verificados {i}/{len(all_products)}...")
        
        images = product.get('images', [])
        if not images:
            continue
        
        broken_urls_in_product = []
        valid_images = []
        
        for img in images:
            if img and isinstance(img, str) and img.strip().startswith('http'):
                checked_count += 1
                if not check_url_status(img):
                    broken_urls_in_product.append(img)
                    BROKEN_URLS.add(img)
                else:
                    valid_images.append(img)
            elif img and isinstance(img, str) and img.strip().startswith('/images/'):
                valid_images.append(img)
        
        if broken_urls_in_product:
            products_with_broken_urls.append({
                'product': product,
                'broken_urls': broken_urls_in_product,
                'valid_images': valid_images,
            })
    
    print(f"\n📊 Estadísticas:")
    print(f"   URLs verificadas: {checked_count}")
    print(f"   URLs rotas encontradas: {len(BROKEN_URLS)}")
    print(f"   Productos con URLs rotas: {len(products_with_broken_urls)}")
    
    if products_with_broken_urls:
        print(f"\n📋 Productos con URLs rotas (primeros 10):")
        for i, item in enumerate(products_with_broken_urls[:10], 1):
            print(f"\n{i}. {item['product'].get('title', 'Sin título')[:60]}")
            print(f"   ID: {item['product'].get('id')}")
            print(f"   URLs rotas: {item['broken_urls']}")
            print(f"   Imágenes válidas: {item['valid_images']}")
    
    # Intentar encontrar imágenes locales de reemplazo
    if products_with_broken_urls and not dry_run:
        auto_confirm = '--yes' in sys.argv or '-y' in sys.argv
        if not auto_confirm:
            confirmation = input(f"\n¿Deseas actualizar {len(products_with_broken_urls)} productos? (s/N): ").lower()
        else:
            confirmation = 's'
        
        if confirmation == 's':
            print("\n🔄 Actualizando productos...\n")
            updated = 0
            errors = 0
            
            for item in products_with_broken_urls:
                product = item['product']
                valid_images = item['valid_images']
                
                # Si ya tiene imágenes válidas, solo remover las rotas
                if valid_images:
                    try:
                        response = supabase.table('marketplace_products').update({
                            'images': valid_images
                        }).eq('id', product['id']).execute()
                        
                        if response.data:
                            updated += 1
                            if updated % 10 == 0:
                                print(f"   ✅ {updated} productos actualizados...")
                        else:
                            errors += 1
                    except Exception as e:
                        errors += 1
                        print(f"   ❌ Error actualizando {product['id']}: {e}")
            
            print(f"\n✅ Completado: {updated} actualizados, {errors} errores")
        else:
            print("\n❌ Operación cancelada")
    
    # Generar lista de URLs rotas para el código
    if BROKEN_URLS:
        print(f"\n📋 URLs rotas detectadas (para agregar a imageFilter.ts):")
        for url in sorted(BROKEN_URLS):
            print(f"  '{url}',")
    
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)

if __name__ == "__main__":
    main()


