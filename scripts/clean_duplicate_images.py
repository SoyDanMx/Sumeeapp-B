"""
Script para limpiar URLs de imágenes duplicadas en productos del marketplace.
Analiza productos con imágenes duplicadas y las elimina, manteniendo solo una instancia única.
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict, Set
from collections import Counter

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

def analyze_duplicate_images(supabase: Client, limit: int = None):
    """
    Analiza productos con imágenes duplicadas en el array de imágenes.
    """
    print("🔍 Analizando productos con imágenes duplicadas...\n")
    
    try:
        # Obtener todos los productos activos (sin límite por defecto)
        query = supabase.table('marketplace_products').select('id, title, images').eq('status', 'active')
        
        # Obtener todos los productos en lotes si es necesario
        all_products = []
        page_size = 1000
        offset = 0
        
        while True:
            batch_query = query.range(offset, offset + page_size - 1)
            response = batch_query.execute()
            batch_products = response.data
            
            if not batch_products:
                break
            
            all_products.extend(batch_products)
            offset += page_size
            
            if limit and len(all_products) >= limit:
                all_products = all_products[:limit]
                break
            
            if len(batch_products) < page_size:
                break
        
        products = all_products
        print(f"✅ {len(products)} productos encontrados\n")
        
        products_with_duplicates = []
        duplicate_stats = {
            'total_duplicates': 0,
            'products_with_duplicates': 0,
            'total_images_before': 0,
            'total_images_after': 0,
        }
        
        for product in products:
            images: List[str] = product.get('images') or []
            if not images:
                continue
            
            # Limpiar espacios en blanco y normalizar URLs
            images = [img.strip() for img in images if img and img.strip()]
            
            if not images:
                continue
            
            # Contar duplicados exactos
            image_counts = Counter(images)
            duplicates = {img: count for img, count in image_counts.items() if count > 1}
            
            # También detectar URLs muy similares (con variaciones menores)
            similar_duplicates = {}
            for i, img1 in enumerate(images):
                for j, img2 in enumerate(images[i+1:], i+1):
                    # Normalizar URLs para comparación
                    img1_norm = img1.lower().replace(' ', '').replace('%20', '')
                    img2_norm = img2.lower().replace(' ', '').replace('%20', '')
                    
                    # Detectar URLs casi idénticas (diferencia solo en mayúsculas, espacios, etc)
                    if img1_norm == img2_norm and img1 != img2:
                        if img1 not in similar_duplicates:
                            similar_duplicates[img1] = [img2]
                        else:
                            similar_duplicates[img1].append(img2)
            
            if duplicates or similar_duplicates:
                products_with_duplicates.append({
                    'id': product['id'],
                    'title': product.get('title', 'Sin título'),
                    'images': images,
                    'duplicates': duplicates,
                    'similar_duplicates': similar_duplicates,
                    'unique_images': list(dict.fromkeys(images)),  # Mantener orden, eliminar duplicados
                })
                duplicate_stats['products_with_duplicates'] += 1
                duplicate_stats['total_duplicates'] += sum(count - 1 for count in duplicates.values())
                duplicate_stats['total_images_before'] += len(images)
                duplicate_stats['total_images_after'] += len(set(images))
        
        return products_with_duplicates, duplicate_stats
        
    except Exception as e:
        print(f"❌ Error al analizar productos: {e}")
        return [], {}

def clean_duplicate_images(supabase: Client, products_with_duplicates: List[Dict], dry_run: bool = True):
    """
    Limpia las imágenes duplicadas de los productos.
    Mantiene solo una instancia de cada URL única, preservando el orden.
    """
    if dry_run:
        print("\n🔍 MODO DRY RUN - No se realizarán cambios\n")
    else:
        print("\n🔄 Limpiando imágenes duplicadas...\n")
    
    cleaned_count = 0
    error_count = 0
    
    for product_data in products_with_duplicates:
        product_id = product_data['id']
        original_images = product_data['images']
        unique_images = product_data['unique_images']
        
        # Mantener el orden original, pero solo la primera ocurrencia
        # Normalizar para detectar duplicados similares también
        seen = set()
        seen_normalized = set()
        cleaned_images = []
        
        for img in original_images:
            if not img or not img.strip():
                continue
            
            img_clean = img.strip()
            img_normalized = img_clean.lower().replace(' ', '').replace('%20', '')
            
            # Si ya vimos esta URL (exacta o normalizada), saltarla
            if img_clean not in seen and img_normalized not in seen_normalized:
                cleaned_images.append(img_clean)
                seen.add(img_clean)
                seen_normalized.add(img_normalized)
        
        if len(cleaned_images) != len(original_images):
            print(f"📦 Producto: {product_data['title'][:60]}...")
            print(f"   Antes: {len(original_images)} imágenes")
            print(f"   Después: {len(cleaned_images)} imágenes")
            print(f"   Duplicados eliminados: {len(original_images) - len(cleaned_images)}")
            
            if not dry_run:
                try:
                    update_response = supabase.table('marketplace_products').update(
                        {'images': cleaned_images}
                    ).eq('id', product_id).execute()
                    
                    if update_response.data:
                        cleaned_count += 1
                        print(f"   ✅ Actualizado\n")
                    else:
                        error_count += 1
                        print(f"   ❌ Error al actualizar\n")
                except Exception as e:
                    error_count += 1
                    print(f"   ❌ Error: {e}\n")
            else:
                print(f"   [DRY RUN] Se actualizaría\n")
    
    return cleaned_count, error_count

def analyze_wrong_images(supabase: Client):
    """
    Analiza productos con posibles imágenes erróneas.
    Busca patrones como:
    - Imágenes que no corresponden al código del producto
    - URLs que no siguen el patrón esperado
    - Imágenes con códigos diferentes en la URL vs título/descripción
    - Múltiples imágenes con códigos diferentes (posible error)
    """
    print("\n🔍 Analizando posibles imágenes erróneas...\n")
    
    try:
        # Obtener todos los productos en lotes
        query = supabase.table('marketplace_products').select('id, title, description, images').eq('status', 'active')
        
        all_products = []
        page_size = 1000
        offset = 0
        
        while True:
            batch_query = query.range(offset, offset + page_size - 1)
            response = batch_query.execute()
            batch_products = response.data
            
            if not batch_products:
                break
            
            all_products.extend(batch_products)
            offset += page_size
            
            if len(batch_products) < page_size:
                break
        
        products = all_products
        
        wrong_images = []
        
        for product in products:
            images: List[str] = product.get('images') or []
            title = product.get('title', '')
            description = product.get('description', '')
            
            if not images:
                continue
            
            # Buscar código en título/descripción
            import re
            code_match = re.search(r'\b(\d{5,6})\b', title + ' ' + description)
            product_code = code_match.group(1) if code_match else None
            
            # Verificar cada imagen
            url_codes = []
            for img_url in images:
                if 'truper.com/media/import/imagenes/' in img_url:
                    # Extraer código de la URL
                    url_code_match = re.search(r'imagenes/(\d{5,6})\.jpg', img_url)
                    url_code = url_code_match.group(1) if url_code_match else None
                    if url_code:
                        url_codes.append(url_code)
                    
                    # Si hay código en el producto pero no coincide con la URL
                    if product_code and url_code and product_code != url_code:
                        wrong_images.append({
                            'id': product['id'],
                            'title': title[:60],
                            'product_code': product_code,
                            'image_url': img_url,
                            'url_code': url_code,
                            'issue': 'Código no coincide',
                        })
            
            # Si hay múltiples imágenes con códigos diferentes, puede ser un error
            if len(set(url_codes)) > 1 and product_code:
                # Verificar si alguno coincide con el código del producto
                if product_code not in url_codes:
                    wrong_images.append({
                        'id': product['id'],
                        'title': title[:60],
                        'product_code': product_code,
                        'image_urls': images,
                        'url_codes': url_codes,
                        'issue': 'Múltiples códigos diferentes y ninguno coincide',
                    })
        
        return wrong_images
        
    except Exception as e:
        print(f"❌ Error al analizar imágenes erróneas: {e}")
        return []

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas.")
        return
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Verificar si es dry run
    dry_run = '--execute' not in sys.argv
    
    if dry_run:
        print("=" * 60)
        print("🔍 ANÁLISIS DE IMÁGENES DUPLICADAS Y ERRÓNEAS")
        print("=" * 60)
        print("\n⚠️  MODO DRY RUN - No se realizarán cambios")
        print("   Usa --execute para aplicar los cambios\n")
    else:
        print("=" * 60)
        print("🔄 LIMPIEZA DE IMÁGENES DUPLICADAS Y ERRÓNEAS")
        print("=" * 60)
        print("\n⚠️  MODO EJECUCIÓN - Se realizarán cambios en la BD\n")
    
    # 1. Analizar duplicados
    products_with_duplicates, stats = analyze_duplicate_images(supabase)
    
    if products_with_duplicates:
        print(f"\n📊 ESTADÍSTICAS DE DUPLICADOS:")
        print(f"   Productos con duplicados: {stats['products_with_duplicates']}")
        print(f"   Total de duplicados: {stats['total_duplicates']}")
        print(f"   Imágenes antes: {stats['total_images_before']}")
        print(f"   Imágenes después: {stats['total_images_after']}")
        print(f"   Espacio ahorrado: {stats['total_images_before'] - stats['total_images_after']} imágenes\n")
        
        # Mostrar algunos ejemplos
        print("📋 EJEMPLOS DE PRODUCTOS CON DUPLICADOS (primeros 10):")
        for i, product_data in enumerate(products_with_duplicates[:10], 1):
            print(f"\n{i}. {product_data['title'][:60]}...")
            print(f"   ID: {product_data['id']}")
            print(f"   Imágenes originales: {len(product_data['images'])}")
            print(f"   Imágenes únicas: {len(product_data['unique_images'])}")
            if product_data['duplicates']:
                print(f"   Duplicados exactos: {product_data['duplicates']}")
            if product_data.get('similar_duplicates'):
                print(f"   Duplicados similares: {product_data['similar_duplicates']}")
            print(f"   URLs: {product_data['images']}")
    else:
        print("✅ No se encontraron productos con imágenes duplicadas\n")
    
    # 2. Analizar imágenes erróneas
    wrong_images = analyze_wrong_images(supabase)
    
    if wrong_images:
        print(f"\n⚠️  PRODUCTOS CON POSIBLES IMÁGENES ERRÓNEAS: {len(wrong_images)}")
        print("\n📋 EJEMPLOS (primeros 5):")
        for i, item in enumerate(wrong_images[:5], 1):
            print(f"\n{i}. {item['title']}...")
            print(f"   Código en producto: {item['product_code']}")
            print(f"   Código en URL: {item['url_code']}")
            print(f"   URL: {item['image_url']}")
    else:
        print("\n✅ No se encontraron productos con imágenes erróneas obvias\n")
    
    # 3. Limpiar duplicados si no es dry run
    if products_with_duplicates and not dry_run:
        confirmation = input(f"\n¿Deseas limpiar {stats['products_with_duplicates']} productos con imágenes duplicadas? (s/N): ").lower()
        if confirmation == 's':
            cleaned_count, error_count = clean_duplicate_images(supabase, products_with_duplicates, dry_run=False)
            print(f"\n✅ Limpieza completada:")
            print(f"   Productos actualizados: {cleaned_count}")
            print(f"   Errores: {error_count}")
        else:
            print("\n❌ Operación cancelada")
    elif products_with_duplicates and dry_run:
        print("\n💡 Para aplicar los cambios, ejecuta:")
        print("   python scripts/clean_duplicate_images.py --execute")
    
    print("\n" + "=" * 60)
    print("✅ ANÁLISIS COMPLETADO")
    print("=" * 60)

if __name__ == "__main__":
    main()

