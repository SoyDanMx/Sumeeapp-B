"""
Script mejorado para resolver productos sin imágenes usando el CSV de Truper.
Busca códigos/claves en el CSV y asigna imágenes correspondientes.
"""

import os
import sys
import csv
import re
import requests
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

LOCAL_IMAGES_DIR = Path('public/images/marketplace/truper')
LOCAL_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

CSV_PATH = 'data/truper_catalog_full.csv'
TRUPER_IMAGE_URL_TEMPLATE = "https://www.truper.com/media/import/imagenes/{codigo}.jpg"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def read_csv_codes():
    """Lee el CSV y crea mapeos de código/clave a URLs."""
    codes_by_code = {}  # código -> datos
    codes_by_clave = {}  # clave -> datos
    title_to_code = defaultdict(list)  # palabras del título -> códigos
    
    if not os.path.exists(CSV_PATH):
        print(f"❌ Error: CSV no encontrado en {CSV_PATH}")
        return codes_by_code, codes_by_clave, title_to_code
    
    print(f"📖 Leyendo CSV: {CSV_PATH}\n")
    
    with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
        # Saltar primera línea (título del archivo)
        if len(lines) < 2:
            print("❌ CSV no tiene suficientes líneas")
            return codes_by_code, codes_by_clave, title_to_code
        
        # Leer headers de la segunda línea
        headers_line = lines[1]
        headers_row = list(csv.reader([headers_line]))[0]
        headers = [h.strip().strip('"') for h in headers_row]
        headers_lower = [h.lower() for h in headers]
        
        codigo_idx = headers_lower.index('código') if 'código' in headers_lower else -1
        clave_idx = headers_lower.index('clave') if 'clave' in headers_lower else -1
        descripcion_idx = headers_lower.index('descripción') if 'descripción' in headers_lower else -1
        
        if codigo_idx == -1:
            print("❌ Columna 'código' no encontrada")
            return codes_by_code, codes_by_clave, title_to_code
        
        print(f"✅ Headers encontrados: código={codigo_idx}, clave={clave_idx}, descripción={descripcion_idx}\n")
        
        # Leer datos usando csv.reader para manejar comas dentro de comillas
        processed = 0
        for line in lines[2:]:  # Saltar título y headers
            try:
                row = next(csv.reader([line]))
                if len(row) <= codigo_idx:
                    continue
                
                codigo = row[codigo_idx].strip().strip('"')
                clave = row[clave_idx].strip().strip('"') if clave_idx != -1 and len(row) > clave_idx else None
                descripcion = row[descripcion_idx].strip().strip('"') if descripcion_idx != -1 and len(row) > descripcion_idx else None
                
                if codigo and codigo.isdigit():
                    data = {
                        'codigo': codigo,
                        'clave': clave,
                        'url': TRUPER_IMAGE_URL_TEMPLATE.format(codigo=codigo),
                    }
                    
                    codes_by_code[codigo] = data
                    if clave:
                        codes_by_clave[clave.upper()] = data
                    
                    # Indexar por palabras clave del título/descripción
                    if descripcion:
                        words = re.findall(r'\b\w+\b', descripcion.upper())
                        for word in words:
                            if len(word) > 3:  # Solo palabras significativas
                                title_to_code[word].append(data)
                    
                    processed += 1
            except Exception as e:
                continue
        
        print(f"✅ {processed} códigos leídos del CSV\n")
    
    return codes_by_code, codes_by_clave, title_to_code

def find_code_in_title(title: str, codes_by_code: dict, codes_by_clave: dict) -> dict:
    """Busca código/clave en el título del producto."""
    title_upper = title.upper()
    
    # PRIORIDAD 1: Buscar clave con guión al inicio (formato: "RMAX-7NX -" o "RMAX-7NX ")
    # Patrón mejorado: captura letras después de números también
    clave_match = re.search(r'^([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})(?:\s*-|\s+|$)', title_upper)
    if clave_match:
        clave = clave_match.group(1).upper()
        if clave in codes_by_clave:
            return codes_by_clave[clave]
    
    # PRIORIDAD 2: Buscar clave con guión en cualquier parte (patrón mejorado)
    clave_match = re.search(r'\b([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})\b', title_upper)
    if clave_match:
        clave = clave_match.group(1).upper()
        if clave in codes_by_clave:
            return codes_by_clave[clave]
    
    # PRIORIDAD 3: Buscar clave sin guión y agregar guión
    clave_match = re.search(r'\b([A-Z]{2,6})(\d{1,4})([A-Z]{0,2})\b', title_upper)
    if clave_match:
        parte1, parte2, parte3 = clave_match.groups()
        clave_con_guion = f"{parte1}-{parte2}{parte3}".upper()
        if clave_con_guion in codes_by_clave:
            return codes_by_clave[clave_con_guion]
    
    # PRIORIDAD 4: Buscar código numérico (5-6 dígitos)
    code_match = re.search(r'\b(\d{5,6})\b', title)
    if code_match:
        codigo = code_match.group(1)
        if codigo in codes_by_code:
            return codes_by_code[codigo]
    
    return None

def download_image_from_truper(code: str, clave: str = None) -> str:
    """Descarga imagen de Truper si no existe localmente.
    Intenta con código y clave."""
    code_upper = code.upper()
    
    # Intentar primero con clave si está disponible
    if clave:
        clave_upper = clave.upper()
        filename_by_clave = f"{clave_upper}.jpg"
        filepath_by_clave = LOCAL_IMAGES_DIR / filename_by_clave
        
        if filepath_by_clave.exists():
            return f"/images/marketplace/truper/{filename_by_clave}"
        
        # Intentar descargar por clave
        url_by_clave = f"https://www.truper.com/media/import/imagenes/{clave_upper}.jpg"
        try:
            response = requests.get(url_by_clave, headers=HEADERS, timeout=5, stream=True)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '').lower()
                if 'image' in content_type:
                    with open(filepath_by_clave, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    return f"/images/marketplace/truper/{filename_by_clave}"
        except:
            pass
    
    # Intentar con código
    filename = f"{code_upper}.jpg"
    filepath = LOCAL_IMAGES_DIR / filename
    
    if filepath.exists():
        return f"/images/marketplace/truper/{filename}"
    
    url = TRUPER_IMAGE_URL_TEMPLATE.format(codigo=code_upper)
    try:
        response = requests.get(url, headers=HEADERS, timeout=5, stream=True)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '').lower()
            if 'image' in content_type:
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                return f"/images/marketplace/truper/{filename}"
    except:
        pass
    
    return None

def main():
    dry_run = '--execute' not in sys.argv
    
    print("=" * 60)
    print("🔍 RESOLVER PRODUCTOS SIN IMÁGENES (USANDO CSV)")
    print("=" * 60)
    
    if dry_run:
        print("\n⚠️  MODO DRY RUN - No se realizarán cambios\n")
    else:
        print("\n⚠️  MODO EJECUCIÓN - Se realizarán cambios\n")
    
    # Leer CSV
    codes_by_code, codes_by_clave, title_to_code = read_csv_codes()
    
    if not codes_by_code:
        print("❌ No se pudieron leer códigos del CSV")
        return
    
    # Obtener productos sin imágenes
    print("🔍 Obteniendo productos sin imágenes...")
    all_products = []
    offset = 0
    page_size = 1000
    
    while True:
        response = supabase.table('marketplace_products').select(
            'id, title, description, images'
        ).eq('status', 'active').range(offset, offset + page_size - 1).execute()
        
        batch = response.data
        if not batch:
            break
        
        all_products.extend(batch)
        offset += page_size
        
        if len(batch) < page_size:
            break
    
    print(f"✅ {len(all_products)} productos encontrados\n")
    
    # Identificar productos sin imágenes válidas
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
    
    print(f"❌ Productos sin imágenes válidas: {len(products_without_images)}\n")
    
    if not products_without_images:
        print("✅ Todos los productos tienen imágenes!")
        return
    
    # Buscar imágenes para estos productos
    print("🔍 Buscando imágenes usando CSV...\n")
    
    products_to_update = []
    stats = {
        'found_by_code': 0,
        'found_by_clave': 0,
        'downloaded': 0,
        'already_local': 0,
        'not_found': 0,
    }
    
    # Debug: verificar algunas claves conocidas
    print(f"🔍 Debug: Total claves en diccionario: {len(codes_by_clave)}")
    print(f"🔍 Debug: RMAX-7NX existe: {'RMAX-7NX' in codes_by_clave}")
    print(f"🔍 Debug: MADE-6NX existe: {'MADE-6NX' in codes_by_clave}\n")
    
    test_titles = [
        'RMAX-7NX - Rotomartillo SDS Max 6kg',
        'MADE-6NX - Martillo demoledor',
        'TALI-20P - Taladro Inalámbrico',
    ]
    print("🔍 Verificando búsqueda de claves (debug):")
    for test_title in test_titles:
        code_data = find_code_in_title(test_title, codes_by_code, codes_by_clave)
        if code_data:
            print(f"   ✅ '{test_title[:40]}...' -> {code_data['codigo']}")
        else:
            # Intentar búsqueda manual
            title_upper = test_title.upper()
            import re
            match = re.search(r'([A-Z]{2,6}-\d{1,4}[A-Z]?)', title_upper)
            if match:
                clave_found = match.group(1)
                exists = clave_found in codes_by_clave
                print(f"   ⚠️  '{test_title[:40]}...' -> Clave encontrada: {clave_found}, Existe: {exists}")
            else:
                print(f"   ❌ '{test_title[:40]}...' -> No encontrado")
    print()
    
    for i, product in enumerate(products_without_images, 1):
        if i % 100 == 0:
            print(f"   Procesados {i}/{len(products_without_images)}...")
        
        title = product.get('title', '')
        code_data = find_code_in_title(title, codes_by_code, codes_by_clave)
        
        if code_data:
            codigo = code_data['codigo']
            clave = code_data.get('clave')
            
            # Intentar descargar o usar local
            if not dry_run:
                local_path = download_image_from_truper(codigo, clave)
                if local_path:
                    products_to_update.append({
                        'id': product['id'],
                        'title': title[:60],
                        'code': codigo,
                        'image': local_path,
                    })
                    stats['downloaded'] += 1
                    if Path('public/images/marketplace/truper').exists() and (LOCAL_IMAGES_DIR / f"{codigo}.jpg").exists():
                        stats['already_local'] += 1
                    else:
                        stats['found_by_code'] += 1
                else:
                    stats['not_found'] += 1
            else:
                # Dry run
                potential_path = f"/images/marketplace/truper/{codigo}.jpg"
                filepath = LOCAL_IMAGES_DIR / f"{codigo}.jpg"
                
                if filepath.exists():
                    stats['already_local'] += 1
                else:
                    stats['found_by_code'] += 1
                
                products_to_update.append({
                    'id': product['id'],
                    'title': title[:60],
                    'code': codigo,
                    'clave': clave,
                    'image': potential_path,
                })
        else:
            stats['not_found'] += 1
    
    # Mostrar estadísticas
    print("\n" + "=" * 60)
    print("📊 ESTADÍSTICAS")
    print("=" * 60)
    print(f"\nTotal productos sin imágenes: {len(products_without_images)}")
    print(f"Imágenes encontradas por código: {stats['found_by_code']}")
    print(f"Ya existían localmente: {stats['already_local']}")
    print(f"Descargadas: {stats['downloaded']}")
    print(f"No encontradas: {stats['not_found']}")
    print(f"Productos a actualizar: {len(products_to_update)}")
    
    # Mostrar ejemplos
    if products_to_update:
        print("\n📋 EJEMPLOS (primeros 20):")
        for i, item in enumerate(products_to_update[:20], 1):
            clave_info = f" (clave: {item.get('clave', 'N/A')})" if item.get('clave') else ""
            print(f"{i}. {item['title']}... -> {item['image']}{clave_info}")
    
    # Aplicar cambios
    if products_to_update and not dry_run:
        auto_confirm = '--yes' in sys.argv or '-y' in sys.argv
        if not auto_confirm:
            confirmation = input(f"\n¿Actualizar {len(products_to_update)} productos? (s/N): ").lower()
        else:
            confirmation = 's'
        
        if confirmation == 's':
            print("\n🔄 Actualizando...\n")
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
                            print(f"   ✅ {updated} actualizados...")
                    else:
                        errors += 1
                except Exception as e:
                    errors += 1
            
            print(f"\n✅ Completado: {updated} actualizados, {errors} errores")
        else:
            print("\n❌ Cancelado")
    elif products_to_update and dry_run:
        print("\n💡 Para aplicar: python3 scripts/fix_all_products_without_images.py --execute --yes")
    
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)

if __name__ == "__main__":
    main()

