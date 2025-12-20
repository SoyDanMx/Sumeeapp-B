"""
Script rápido para verificar imágenes rotas con muestra representativa.
"""

import os
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict
import requests

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def quick_check_url(url: str) -> tuple[bool, str]:
    """Verificación rápida de URL."""
    try:
        response = requests.head(url, headers=HEADERS, timeout=3, allow_redirects=True)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '').lower()
            return ('image' in content_type, f'HTTP {response.status_code}')
        return (False, f'HTTP {response.status_code}')
    except Exception as e:
        return (False, str(e)[:50])

def main():
    print("=" * 60)
    print("🔍 ANÁLISIS RÁPIDO DE IMÁGENES ROTAS")
    print("=" * 60)
    print()
    
    # Obtener muestra de productos
    print("🔍 Obteniendo muestra de productos...")
    response = supabase.table('marketplace_products').select('id, title, images').eq('status', 'active').limit(5000).execute()
    products = [p for p in response.data if p.get('images')]
    
    print(f"✅ Analizando {len(products)} productos\n")
    
    # Recopilar URLs únicas
    all_urls = set()
    url_to_products = defaultdict(list)
    
    for product in products:
        for img_url in product.get('images', []):
            if img_url and img_url.strip():
                img_url = img_url.strip()
                all_urls.add(img_url)
                url_to_products[img_url].append(product['id'])
    
    print(f"📊 URLs únicas encontradas: {len(all_urls)}\n")
    
    # Verificar muestra de URLs (primeras 200)
    print("🔍 Verificando muestra de 200 URLs...")
    sample_urls = list(all_urls)[:200]
    
    broken_count = 0
    ok_count = 0
    broken_urls = []
    error_types = defaultdict(int)
    
    for i, url in enumerate(sample_urls, 1):
        is_ok, error = quick_check_url(url)
        
        if is_ok:
            ok_count += 1
        else:
            broken_count += 1
            broken_urls.append({
                'url': url,
                'error': error,
                'products_count': len(url_to_products[url]),
            })
            error_types[error] += 1
        
        if i % 50 == 0:
            print(f"   Verificadas {i}/200... ({ok_count} OK, {broken_count} rotas)")
    
    # Calcular estimación
    broken_percentage = (broken_count / len(sample_urls)) * 100
    estimated_broken_total = int((broken_percentage / 100) * len(all_urls))
    
    print(f"\n✅ Verificadas: {len(sample_urls)} URLs")
    print(f"   OK: {ok_count}")
    print(f"   Rotas: {broken_count} ({broken_percentage:.1f}%)")
    print(f"\n📊 ESTIMACIÓN TOTAL:")
    print(f"   URLs totales: {len(all_urls)}")
    print(f"   Estimación de URLs rotas: ~{estimated_broken_total} ({broken_percentage:.1f}%)")
    
    # Contar productos afectados en la muestra
    products_with_broken = set()
    for broken in broken_urls:
        for product_id in url_to_products[broken['url']]:
            products_with_broken.add(product_id)
    
    estimated_products_affected = int((len(products_with_broken) / len(products)) * len(products))
    
    print(f"   Productos con imágenes rotas (muestra): {len(products_with_broken)}")
    print(f"   Estimación total productos afectados: ~{estimated_products_affected}")
    
    # Mostrar tipos de errores
    print(f"\n📋 TIPOS DE ERRORES ENCONTRADOS:")
    for error, count in sorted(error_types.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"   {error}: {count} URLs")
    
    # Mostrar ejemplos
    print(f"\n❌ EJEMPLOS DE URLs ROTAS (primeros 10):")
    for i, broken in enumerate(broken_urls[:10], 1):
        print(f"\n{i}. {broken['url']}")
        print(f"   Error: {broken['error']}")
        print(f"   Afecta {broken['products_count']} productos")
    
    print("\n" + "=" * 60)
    print("✅ ANÁLISIS COMPLETADO")
    print("=" * 60)
    print("\n💡 Para análisis completo de todas las URLs, ejecuta:")
    print("   python3 scripts/check_broken_images.py")

if __name__ == "__main__":
    main()


