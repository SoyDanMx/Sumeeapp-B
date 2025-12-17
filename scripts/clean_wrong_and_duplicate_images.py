"""
Script para limpiar imágenes erróneas y duplicadas.
Elimina:
1. URLs genéricas/erróneas que aparecen en múltiples productos (como "E.jpg", "R.jpg")
2. Duplicados dentro del mismo producto
3. URLs de Supabase Storage antiguas que ya no se usan
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from collections import Counter

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# URLs erróneas conocidas (códigos muy cortos que son genéricos)
WRONG_IMAGE_PATTERNS = [
    r'imagenes/[A-Z]\.jpg$',  # Códigos de una sola letra como E.jpg, R.jpg
    r'imagenes/[A-Z]{1,2}\.jpg$',  # Códigos de 1-2 letras
]

# URLs de Supabase Storage antiguas que ya no se usan
OLD_STORAGE_PATTERNS = [
    'supabase.co/storage/v1/object/public/marketplace-images/',
]

def is_wrong_image_url(url: str) -> bool:
    """Verifica si una URL es errónea según los patrones conocidos."""
    import re
    
    # Verificar patrones erróneos
    for pattern in WRONG_IMAGE_PATTERNS:
        if re.search(pattern, url):
            return True
    
    # Verificar URLs de storage antiguas
    for pattern in OLD_STORAGE_PATTERNS:
        if pattern in url:
            return True
    
    return False

def get_product_code_from_title(title: str, description: str = '') -> str:
    """Intenta extraer el código del producto del título o descripción."""
    import re
    
    text = title + ' ' + description
    
    # Buscar código alfanumérico al inicio del título (formato común: "CODIGO-123 - Descripción")
    code_match = re.search(r'^([A-Z]{2,6}-?\d{1,4}[A-Z]?)\s*-', text)
    if code_match:
        return code_match.group(1).replace('-', '')
    
    # Buscar código alfanumérico como "SK4", "ROTI-20A", "RMAX-7NX", etc.
    code_match = re.search(r'\b([A-Z]{2,6}-?\d{1,4}[A-Z]?)\b', text)
    if code_match:
        return code_match.group(1).replace('-', '')
    
    # Buscar código de 5-6 dígitos
    code_match = re.search(r'\b(\d{5,6})\b', text)
    if code_match:
        return code_match.group(1)
    
    return None

def clean_product_images(images: list, title: str = '', description: str = '') -> list:
    """Limpia las imágenes de un producto: elimina duplicados y URLs erróneas.
    Si todas las imágenes son erróneas, intenta construir la URL correcta."""
    if not images:
        return []
    
    # Eliminar espacios y vacíos
    cleaned = [img.strip() for img in images if img and img.strip()]
    
    # Separar imágenes válidas y erróneas
    valid_images = [img for img in cleaned if not is_wrong_image_url(img)]
    wrong_images = [img for img in cleaned if is_wrong_image_url(img)]
    
    # Si todas las imágenes son erróneas, intentar construir la URL correcta
    if not valid_images and wrong_images and title:
        product_code = get_product_code_from_title(title, description)
        if product_code:
            # Construir URL de Truper
            truper_url = f"https://www.truper.com/media/import/imagenes/{product_code}.jpg"
            # Solo agregar si es diferente a las erróneas
            if truper_url not in wrong_images:
                valid_images.append(truper_url)
    
    # Eliminar duplicados manteniendo el orden
    seen = set()
    result = []
    for img in valid_images:
        if img not in seen:
            result.append(img)
            seen.add(img)
    
    return result

def main():
    dry_run = '--execute' not in sys.argv
    auto_confirm = '--yes' in sys.argv or '-y' in sys.argv
    
    if dry_run:
        print("=" * 60)
        print("🔍 ANÁLISIS Y LIMPIEZA DE IMÁGENES ERRÓNEAS Y DUPLICADAS")
        print("=" * 60)
        print("\n⚠️  MODO DRY RUN - No se realizarán cambios")
        print("   Usa --execute para aplicar los cambios\n")
    else:
        print("=" * 60)
        print("🔄 LIMPIEZA DE IMÁGENES ERRÓNEAS Y DUPLICADAS")
        print("=" * 60)
        print("\n⚠️  MODO EJECUCIÓN - Se realizarán cambios en la BD\n")
    
    # Obtener todos los productos activos
    print("🔍 Obteniendo productos...")
    all_products = []
    page_size = 1000
    offset = 0
    
    while True:
        response = supabase.table('marketplace_products').select('id, title, description, images').eq('status', 'active').range(offset, offset + page_size - 1).execute()
        batch = response.data
        
        if not batch:
            break
        
        all_products.extend(batch)
        offset += page_size
        
        if len(batch) < page_size:
            break
    
    print(f"✅ {len(all_products)} productos encontrados\n")
    
    # Analizar y limpiar
    products_to_update = []
    stats = {
        'total_products': len(all_products),
        'products_with_images': 0,
        'products_needing_cleanup': 0,
        'images_removed': 0,
        'wrong_urls_removed': 0,
        'duplicates_removed': 0,
    }
    
    print("🔍 Analizando productos...\n")
    
    for product in all_products:
        original_images = product.get('images') or []
        if not original_images:
            continue
        
        stats['products_with_images'] += 1
        
        title = product.get('title', '')
        description = product.get('description', '')
        cleaned_images = clean_product_images(original_images, title, description)
        
        if cleaned_images != original_images:
            stats['products_needing_cleanup'] += 1
            stats['images_removed'] += len(original_images) - len(cleaned_images)
            
            # Contar qué tipo de limpieza se hizo
            wrong_urls = [img for img in original_images if is_wrong_image_url(img)]
            stats['wrong_urls_removed'] += len(wrong_urls)
            
            duplicates = len(original_images) - len(set(original_images))
            stats['duplicates_removed'] += duplicates
            
            removed_images = [img for img in original_images if img not in cleaned_images]
            added_images = [img for img in cleaned_images if img not in original_images]
            
            products_to_update.append({
                'id': product['id'],
                'title': product.get('title', 'Sin título'),
                'original_images': original_images,
                'cleaned_images': cleaned_images,
                'removed_images': removed_images,
                'added_images': added_images,
            })
    
    # Mostrar estadísticas
    print("📊 ESTADÍSTICAS:")
    print(f"   Total productos: {stats['total_products']}")
    print(f"   Productos con imágenes: {stats['products_with_images']}")
    print(f"   Productos que necesitan limpieza: {stats['products_needing_cleanup']}")
    print(f"   Imágenes removidas: {stats['images_removed']}")
    print(f"   URLs erróneas removidas: {stats['wrong_urls_removed']}")
    print(f"   Duplicados removidos: {stats['duplicates_removed']}\n")
    
    # Mostrar ejemplos
    if products_to_update:
        print("📋 EJEMPLOS DE PRODUCTOS A LIMPIAR (primeros 10):")
        for i, item in enumerate(products_to_update[:10], 1):
            print(f"\n{i}. {item['title'][:60]}...")
            print(f"   ID: {item['id']}")
            print(f"   Antes: {len(item['original_images'])} imágenes - {item['original_images']}")
            print(f"   Después: {len(item['cleaned_images'])} imágenes - {item['cleaned_images']}")
            if item['removed_images']:
                print(f"   ❌ Removidas: {item['removed_images']}")
            if item['added_images']:
                print(f"   ✅ Agregadas: {item['added_images']}")
    
    # Aplicar cambios si no es dry run
    if products_to_update and not dry_run:
        if not auto_confirm:
            confirmation = input(f"\n¿Deseas limpiar {stats['products_needing_cleanup']} productos? (s/N): ").lower()
        else:
            confirmation = 's'
        
        if confirmation == 's':
            print("\n🔄 Actualizando productos...\n")
            updated_count = 0
            error_count = 0
            
            for item in products_to_update:
                try:
                    response = supabase.table('marketplace_products').update({
                        'images': item['cleaned_images']
                    }).eq('id', item['id']).execute()
                    
                    if response.data:
                        updated_count += 1
                        if updated_count % 100 == 0:
                            print(f"   ✅ {updated_count} productos actualizados...")
                    else:
                        error_count += 1
                except Exception as e:
                    error_count += 1
                    print(f"   ❌ Error actualizando {item['id']}: {e}")
            
            print(f"\n✅ Limpieza completada:")
            print(f"   Productos actualizados: {updated_count}")
            print(f"   Errores: {error_count}")
        else:
            print("\n❌ Operación cancelada")
    elif products_to_update and dry_run:
        print("\n💡 Para aplicar los cambios, ejecuta:")
        print("   python3 scripts/clean_wrong_and_duplicate_images.py --execute")
    
    print("\n" + "=" * 60)
    print("✅ ANÁLISIS COMPLETADO")
    print("=" * 60)

if __name__ == "__main__":
    main()

