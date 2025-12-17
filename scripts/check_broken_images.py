"""
Script para verificar cuántos productos tienen URLs de imágenes rotas.
Verifica la accesibilidad de las URLs de imágenes haciendo requests HTTP.
"""

import os
import sys
import time
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict
import concurrent.futures
import requests
from urllib.parse import urlparse

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Timeout para requests (en segundos)
REQUEST_TIMEOUT = 5

# Headers para simular un navegador
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def check_image_url(url: str) -> tuple[bool, int, str]:
    """
    Verifica si una URL de imagen es accesible.
    Retorna: (is_accessible, status_code, error_message)
    """
    try:
        response = requests.head(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        
        # Algunos servidores no permiten HEAD, intentar GET solo para el header
        if response.status_code == 405:  # Method Not Allowed
            response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, stream=True)
            response.close()
        
        if response.status_code == 200:
            # Verificar que el content-type sea una imagen
            content_type = response.headers.get('content-type', '').lower()
            if 'image' in content_type:
                return (True, response.status_code, '')
            else:
                return (False, response.status_code, f'No es imagen (content-type: {content_type})')
        else:
            return (False, response.status_code, f'HTTP {response.status_code}')
    
    except requests.exceptions.Timeout:
        return (False, 0, 'Timeout')
    except requests.exceptions.ConnectionError:
        return (False, 0, 'Connection Error')
    except requests.exceptions.RequestException as e:
        return (False, 0, str(e))
    except Exception as e:
        return (False, 0, f'Error: {str(e)}')

def check_images_batch(urls: list) -> dict:
    """
    Verifica un lote de URLs en paralelo.
    Retorna un diccionario con los resultados.
    """
    results = {}
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(check_image_url, url): url for url in urls}
        
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                is_accessible, status_code, error = future.result()
                results[url] = {
                    'accessible': is_accessible,
                    'status_code': status_code,
                    'error': error,
                }
            except Exception as e:
                results[url] = {
                    'accessible': False,
                    'status_code': 0,
                    'error': f'Exception: {str(e)}',
                }
    
    return results

def main():
    print("=" * 60)
    print("🔍 ANÁLISIS DE IMÁGENES ROTAS")
    print("=" * 60)
    print("\n⚠️  Este proceso puede tardar varios minutos...\n")
    
    # Obtener todos los productos activos con imágenes
    print("🔍 Obteniendo productos con imágenes...")
    all_products = []
    page_size = 1000
    offset = 0
    
    while True:
        response = supabase.table('marketplace_products').select('id, title, images').eq('status', 'active').range(offset, offset + page_size - 1).execute()
        batch = response.data
        
        if not batch:
            break
        
        # Filtrar solo productos con imágenes
        products_with_images = [p for p in batch if p.get('images')]
        all_products.extend(products_with_images)
        
        offset += page_size
        
        if len(batch) < page_size:
            break
    
    print(f"✅ {len(all_products)} productos con imágenes encontrados\n")
    
    # Recopilar todas las URLs únicas
    all_image_urls = set()
    product_urls_map = defaultdict(list)  # URL -> lista de productos que la usan
    
    for product in all_products:
        images = product.get('images') or []
        product_id = product['id']
        
        for img_url in images:
            if img_url and img_url.strip():
                img_url = img_url.strip()
                all_image_urls.add(img_url)
                product_urls_map[img_url].append({
                    'id': product_id,
                    'title': product.get('title', 'Sin título'),
                })
    
    print(f"📊 Total de URLs únicas a verificar: {len(all_image_urls)}\n")
    
    # Verificar URLs en lotes
    print("🔍 Verificando accesibilidad de URLs...")
    print("   (Esto puede tardar varios minutos)\n")
    
    url_list = list(all_image_urls)
    batch_size = 50
    total_batches = (len(url_list) + batch_size - 1) // batch_size
    
    url_results = {}
    broken_urls = []
    accessible_urls = []
    
    for i in range(0, len(url_list), batch_size):
        batch = url_list[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        print(f"   Verificando lote {batch_num}/{total_batches} ({len(batch)} URLs)...", end=' ', flush=True)
        
        batch_results = check_images_batch(batch)
        url_results.update(batch_results)
        
        # Contar resultados del lote
        batch_broken = sum(1 for r in batch_results.values() if not r['accessible'])
        batch_ok = sum(1 for r in batch_results.values() if r['accessible'])
        
        print(f"✅ {batch_ok} OK, ❌ {batch_broken} rotas")
        
        # Pequeña pausa para no sobrecargar los servidores
        time.sleep(0.5)
    
    # Analizar resultados
    for url, result in url_results.items():
        if result['accessible']:
            accessible_urls.append(url)
        else:
            broken_urls.append({
                'url': url,
                'status_code': result['status_code'],
                'error': result['error'],
                'products': product_urls_map[url],
            })
    
    # Contar productos afectados
    products_with_broken_images = set()
    for broken in broken_urls:
        for product in broken['products']:
            products_with_broken_images.add(product['id'])
    
    # Mostrar estadísticas
    print("\n" + "=" * 60)
    print("📊 RESULTADOS")
    print("=" * 60)
    print(f"\n✅ URLs accesibles: {len(accessible_urls)}")
    print(f"❌ URLs rotas: {len(broken_urls)}")
    print(f"📦 Productos afectados: {len(products_with_broken_images)}")
    print(f"📊 Porcentaje de URLs rotas: {(len(broken_urls) / len(all_image_urls) * 100):.2f}%")
    
    # Mostrar ejemplos de URLs rotas
    if broken_urls:
        print("\n" + "=" * 60)
        print("❌ EJEMPLOS DE URLs ROTAS (primeros 20)")
        print("=" * 60)
        
        # Agrupar por tipo de error
        error_types = defaultdict(list)
        for broken in broken_urls:
            error_key = broken['error'] or f"HTTP {broken['status_code']}"
            error_types[error_key].append(broken)
        
        print("\n📋 Agrupadas por tipo de error:\n")
        for error_type, urls in sorted(error_types.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
            print(f"   {error_type}: {len(urls)} URLs")
            for broken in urls[:3]:
                print(f"      - {broken['url']}")
                print(f"        Afecta {len(broken['products'])} productos")
                if broken['products']:
                    print(f"        Ejemplo: {broken['products'][0]['title'][:60]}...")
            print()
        
        # Mostrar productos más afectados
        product_broken_count = defaultdict(int)
        for broken in broken_urls:
            for product in broken['products']:
                product_broken_count[product['id']] += 1
        
        top_affected = sorted(product_broken_count.items(), key=lambda x: x[1], reverse=True)[:10]
        
        print("\n📦 PRODUCTOS MÁS AFECTADOS (con más imágenes rotas):")
        for product_id, count in top_affected:
            # Encontrar el producto
            product = next((p for p in all_products if p['id'] == product_id), None)
            if product:
                print(f"   {count} imágenes rotas: {product.get('title', 'Sin título')[:70]}")
    
    print("\n" + "=" * 60)
    print("✅ ANÁLISIS COMPLETADO")
    print("=" * 60)
    
    # Guardar resultados en archivo si se solicita
    if '--save' in sys.argv:
        import json
        output_file = 'broken_images_report.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'total_urls': len(all_image_urls),
                'accessible_urls': len(accessible_urls),
                'broken_urls_count': len(broken_urls),
                'products_affected': len(products_with_broken_images),
                'broken_urls': broken_urls[:100],  # Limitar a 100 para no hacer el archivo muy grande
            }, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Resultados guardados en: {output_file}")

if __name__ == "__main__":
    main()

