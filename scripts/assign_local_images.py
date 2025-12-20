"""
Script mejorado para asignar imágenes locales a productos sin imágenes.
Usa regex mejorado y búsqueda más inteligente.
"""

import os
import re
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

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
        filename = img_file.stem.upper()
        images[filename] = f"/images/marketplace/truper/{img_file.name}"
    
    return images

def find_best_image_match(title: str, description: str, local_images: dict) -> str:
    """Encuentra la mejor coincidencia de imagen local para un producto."""
    text = title + ' ' + (description or '')
    text_upper = text.upper()
    
    # Estrategia 1: Buscar clave completa con guión (mejorado)
    # Patrón mejorado: captura hasta 2 letras al final
    clave_patterns = [
        r'^([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})(?:\s*-|\s+|$)',  # Al inicio
        r'\b([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})\b',  # En cualquier parte
    ]
    
    for pattern in clave_patterns:
        match = re.search(pattern, text_upper)
        if match:
            clave = match.group(1).upper()
            
            # Buscar coincidencia exacta
            if clave in local_images:
                return local_images[clave]
            
            # Buscar variaciones
            variations = [
                clave.replace('-', ''),
                f"INT-{clave}",
                f"CB-{clave}",
                f"REP-{clave}",
                f"CJ-{clave}",
            ]
            
            for var in variations:
                if var in local_images:
                    return local_images[var]
            
            # Buscar coincidencia parcial (contiene la clave)
            for img_name, img_path in local_images.items():
                if clave in img_name or img_name in clave:
                    # Preferir coincidencias más largas
                    if len(clave) >= 6 and clave in img_name:
                        return img_path
    
    # Estrategia 2: Buscar código numérico
    code_match = re.search(r'\b(\d{4,6})\b', text)
    if code_match:
        code = code_match.group(1)
        
        # Buscar imágenes que contengan el código
        for img_name, img_path in local_images.items():
            if code in img_name:
                return img_path
    
    # Estrategia 3: Buscar por palabras clave del título
    # Extraer palabras significativas
    words = re.findall(r'\b([A-Z]{3,6})\b', text_upper)
    for word in words:
        if word in ['TRUPER', 'EXPERT', 'PRO', 'INDUSTRIAL']:
            continue  # Ignorar palabras genéricas
        
        # Buscar imágenes que contengan la palabra
        for img_name, img_path in local_images.items():
            if word in img_name and len(word) >= 4:
                return img_path
    
    return None

def main():
    import sys
    
    dry_run = '--execute' not in sys.argv
    
    print("=" * 60)
    print("🖼️  ASIGNAR IMÁGENES LOCALES A PRODUCTOS SIN IMÁGENES")
    print("=" * 60)
    print()
    
    if dry_run:
        print("⚠️  MODO DRY RUN - No se realizarán cambios\n")
    else:
        print("⚠️  MODO EJECUCIÓN - Se realizarán cambios\n")
    
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
    
    # Buscar imágenes para cada producto
    print("🔍 Buscando imágenes locales para cada producto...\n")
    
    products_to_update = []
    stats = {
        'found': 0,
        'not_found': 0,
    }
    
    for i, product in enumerate(products_without_images, 1):
        if i % 100 == 0:
            print(f"   Procesados {i}/{len(products_without_images)}...")
        
        title = product.get('title', '')
        description = product.get('description', '')
        
        matched_image = find_best_image_match(title, description, local_images)
        
        if matched_image:
            products_to_update.append({
                'id': product['id'],
                'title': title[:60],
                'image': matched_image,
            })
            stats['found'] += 1
        else:
            stats['not_found'] += 1
    
    # Mostrar resultados
    print("\n" + "=" * 60)
    print("📊 RESULTADOS")
    print("=" * 60)
    print()
    
    print(f"✅ Productos con imágenes encontradas: {stats['found']}")
    print(f"❌ Productos sin imágenes: {stats['not_found']}")
    print(f"📁 Total productos a actualizar: {len(products_to_update)}")
    
    # Mostrar ejemplos
    if products_to_update:
        print("\n📋 EJEMPLOS DE PRODUCTOS A ACTUALIZAR (primeros 20):")
        for i, item in enumerate(products_to_update[:20], 1):
            print(f"{i}. {item['title']}...")
            print(f"   → {item['image']}")
    
    # Aplicar cambios
    if products_to_update and not dry_run:
        auto_confirm = '--yes' in sys.argv or '-y' in sys.argv
        if not auto_confirm:
            confirmation = input(f"\n¿Deseas actualizar {len(products_to_update)} productos? (s/N): ").lower()
        else:
            confirmation = 's'
        
        if confirmation == 's':
            print("\n🔄 Actualizando productos...\n")
            updated = 0
            errors = 0
            
            for item in products_to_update:
                try:
                    response = supabase.table('marketplace_products').update({
                        'images': [item['image']]
                    }).eq('id', item['id']).execute()
                    
                    if response.data:
                        updated += 1
                        if updated % 50 == 0:
                            print(f"   ✅ {updated} productos actualizados...")
                    else:
                        errors += 1
                except Exception as e:
                    errors += 1
                    print(f"   ❌ Error actualizando {item['id']}: {e}")
            
            print(f"\n✅ Completado: {updated} actualizados, {errors} errores")
        else:
            print("\n❌ Operación cancelada")
    elif products_to_update and dry_run:
        print("\n💡 Para aplicar los cambios, ejecuta:")
        print("   python3 scripts/assign_local_images.py --execute --yes")
    
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)

if __name__ == "__main__":
    main()


