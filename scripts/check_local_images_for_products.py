"""
Verifica si los productos sin imágenes tienen imágenes locales disponibles
que no están siendo asignadas correctamente.
"""

import os
import re
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

LOCAL_IMAGES_DIR = Path('public/images/marketplace/truper')

def get_all_local_images():
    """Obtiene todas las imágenes locales disponibles."""
    if not LOCAL_IMAGES_DIR.exists():
        return {}
    
    images = {}
    for img_file in LOCAL_IMAGES_DIR.glob('*.jpg'):
        filename = img_file.stem.upper()  # Sin extensión, en mayúsculas
        images[filename] = f"/images/marketplace/truper/{img_file.name}"
    
    return images

def extract_possible_identifiers(title: str, description: str = '') -> list:
    """Extrae todos los posibles identificadores del título/descripción."""
    text = title + ' ' + description
    text_upper = text.upper()
    
    identifiers = []
    
    # 1. Clave con guión (formato: ABC-123X)
    matches = re.findall(r'\b([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})\b', text_upper)
    for match in matches:
        identifiers.append(match)
        # También sin guión
        identifiers.append(match.replace('-', ''))
    
    # 2. Código numérico (4-6 dígitos)
    matches = re.findall(r'\b(\d{4,6})\b', text)
    for match in matches:
        identifiers.append(match)
    
    # 3. Patrón alfanumérico sin guión
    matches = re.findall(r'\b([A-Z]{2,6}\d{1,4}[A-Z]{0,2})\b', text_upper)
    for match in matches:
        identifiers.append(match)
    
    # 4. Buscar códigos en formato "M-1234" o "T-6FF"
    matches = re.findall(r'\b([A-Z]-\d{1,4}[A-Z]{0,2})\b', text_upper)
    for match in matches:
        identifiers.append(match)
        identifiers.append(match.replace('-', ''))
    
    return list(set(identifiers))  # Eliminar duplicados

def main():
    print("=" * 60)
    print("🔍 VERIFICACIÓN DE IMÁGENES LOCALES PARA PRODUCTOS SIN IMÁGENES")
    print("=" * 60)
    print()
    
    # Obtener todas las imágenes locales
    print("📁 Escaneando imágenes locales...")
    local_images = get_all_local_images()
    print(f"✅ {len(local_images)} imágenes locales encontradas\n")
    
    # Obtener productos sin imágenes
    print("🔍 Obteniendo productos sin imágenes...")
    all_products = []
    offset = 0
    
    while True:
        response = supabase.table('marketplace_products').select(
            'id, title, description, images'
        ).eq('status', 'active').range(offset, offset + 1000).execute()
        
        batch = response.data
        if not batch:
            break
        
        all_products.extend(batch)
        offset += 1000
        
        if len(batch) < 1000:
            break
    
    # Filtrar productos sin imágenes válidas
    products_without_images = []
    for product in all_products:
        images = product.get('images') or []
        valid_images = []
        
        for img in images:
            if img and img.strip():
                img = img.strip()
                if img.startswith('http'):
                    valid_images.append(img)
                elif img.startswith('/images/'):
                    local_path = Path('public') / img.lstrip('/')
                    if local_path.exists():
                        valid_images.append(img)
        
        if not valid_images:
            products_without_images.append(product)
    
    print(f"✅ {len(products_without_images)} productos sin imágenes encontrados\n")
    
    # Analizar cada producto
    print("🔍 Analizando productos y buscando imágenes locales correspondientes...\n")
    
    products_with_local_match = []
    products_without_local_match = []
    matches_found = defaultdict(list)
    
    for i, product in enumerate(products_without_images, 1):
        if i % 100 == 0:
            print(f"   Procesados {i}/{len(products_without_images)}...")
        
        title = product.get('title', '')
        description = product.get('description', '')
        
        # Extraer posibles identificadores
        identifiers = extract_possible_identifiers(title, description)
        
        # Buscar coincidencias en imágenes locales
        matched_images = []
        matched_identifiers = []
        
        for identifier in identifiers:
            # Buscar coincidencia exacta
            if identifier in local_images:
                matched_images.append(local_images[identifier])
                matched_identifiers.append(identifier)
            else:
                # Buscar coincidencia parcial (contiene el identificador)
                for img_name, img_path in local_images.items():
                    if identifier in img_name or img_name in identifier:
                        matched_images.append(img_path)
                        matched_identifiers.append(f"{identifier} -> {img_name}")
                        break
        
        if matched_images:
            unique_images = list(set(matched_images))
            products_with_local_match.append({
                'product': product,
                'title': title,
                'matched_images': unique_images,
                'matched_identifiers': matched_identifiers,
            })
            matches_found['total'] = matches_found.get('total', 0) + len(unique_images)
        else:
            products_without_local_match.append({
                'product': product,
                'title': title,
                'identifiers': identifiers,
            })
    
    # Mostrar resultados
    print("\n" + "=" * 60)
    print("📊 RESULTADOS")
    print("=" * 60)
    print()
    
    print(f"✅ Productos con imágenes locales disponibles: {len(products_with_local_match)}")
    print(f"❌ Productos sin imágenes locales: {len(products_without_local_match)}")
    print(f"📁 Total imágenes locales encontradas para asignar: {matches_found['total']}")
    
    # Mostrar ejemplos de productos con imágenes locales disponibles
    if products_with_local_match:
        print("\n" + "=" * 60)
        print("✅ PRODUCTOS CON IMÁGENES LOCALES DISPONIBLES (primeros 20)")
        print("=" * 60)
        print()
        
        for i, item in enumerate(products_with_local_match[:20], 1):
            print(f"{i}. {item['title'][:70]}")
            print(f"   Identificadores encontrados: {', '.join(item['matched_identifiers'][:3])}")
            print(f"   Imágenes disponibles: {', '.join(item['matched_images'][:2])}")
            print()
    
    # Mostrar ejemplos de productos sin imágenes locales
    if products_without_local_match:
        print("\n" + "=" * 60)
        print("❌ PRODUCTOS SIN IMÁGENES LOCALES (primeros 20)")
        print("=" * 60)
        print()
        
        for i, item in enumerate(products_without_local_match[:20], 1):
            print(f"{i}. {item['title'][:70]}")
            if item['identifiers']:
                print(f"   Identificadores intentados: {', '.join(item['identifiers'][:5])}")
            print()
    
    # Análisis de imágenes locales sin usar
    print("\n" + "=" * 60)
    print("📁 ANÁLISIS DE IMÁGENES LOCALES")
    print("=" * 60)
    print()
    
    # Obtener todas las imágenes asignadas en la BD
    assigned_images = set()
    for product in all_products:
        images = product.get('images') or []
        for img in images:
            if img and img.startswith('/images/marketplace/truper/'):
                img_name = Path(img).stem.upper()
                assigned_images.add(img_name)
    
    unassigned_images = []
    for img_name, img_path in local_images.items():
        if img_name not in assigned_images:
            unassigned_images.append(img_name)
    
    print(f"📊 Total imágenes locales: {len(local_images)}")
    print(f"✅ Imágenes asignadas en BD: {len(assigned_images)}")
    print(f"📁 Imágenes locales sin asignar: {len(unassigned_images)}")
    
    if unassigned_images:
        print(f"\n📋 Ejemplos de imágenes sin asignar (primeros 30):")
        for i, img_name in enumerate(unassigned_images[:30], 1):
            print(f"   {i}. {img_name}")
    
    # Recomendaciones
    print("\n" + "=" * 60)
    print("💡 RECOMENDACIONES")
    print("=" * 60)
    print()
    
    if products_with_local_match:
        print(f"✅ {len(products_with_local_match)} productos pueden ser actualizados con imágenes locales existentes")
        print(f"   Ejecutar: python3 scripts/assign_local_images.py --execute --yes")
    
    if unassigned_images:
        print(f"📁 {len(unassigned_images)} imágenes locales están sin asignar")
        print(f"   Pueden ser asignadas manualmente o mediante búsqueda mejorada")
    
    if products_without_local_match:
        print(f"❌ {len(products_without_local_match)} productos necesitan:")
        print(f"   - Descargar imágenes desde Truper")
        print(f"   - Usar imágenes placeholder")
        print(f"   - Búsqueda manual en banco de imágenes")
    
    print("\n" + "=" * 60)
    print("✅ VERIFICACIÓN COMPLETADA")
    print("=" * 60)

if __name__ == "__main__":
    main()

