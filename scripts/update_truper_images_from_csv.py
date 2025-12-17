#!/usr/bin/env python3
"""
Script para actualizar URLs de imágenes de productos TRUPER desde el CSV
Construye URLs directas usando el código del producto: https://www.truper.com/media/import/imagenes/{codigo}.jpg
"""

import os
import sys
import csv
from dotenv import load_dotenv
from supabase import create_client

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_KEY no encontradas")
    sys.exit(1)

# Inicializar cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Ruta del CSV
CSV_PATH = 'data/truper_catalog_full.csv'

# Formatos de URL de Truper (probar ambos)
TRUPER_IMAGE_URL_BY_CODE = "https://www.truper.com/media/import/imagenes/{codigo}.jpg"
TRUPER_IMAGE_URL_BY_CLAVE = "https://www.truper.com/media/import/imagenes/{clave}.jpg"


def read_csv_codes():
    """Lee los códigos del CSV"""
    codes = {}
    
    if not os.path.exists(CSV_PATH):
        print(f"❌ Error: Archivo CSV no encontrado en {CSV_PATH}")
        return codes
    
    print(f"📖 Leyendo CSV: {CSV_PATH}\n")
    
    with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
        # Saltar primera línea (título) y leer headers
        if len(lines) < 2:
            print("❌ Error: CSV no tiene suficientes líneas")
            return codes
        
        headers_line = lines[1]
        headers = [h.strip() for h in headers_line.split(',')]
        
        # Buscar índice de columna "código"
        codigo_idx = None
        clave_idx = None
        for i, header in enumerate(headers):
            header_lower = header.lower()
            if 'código' in header_lower or ('codigo' in header_lower and 'sat' not in header_lower):
                codigo_idx = i
            if 'clave' in header_lower:
                clave_idx = i
        
        if codigo_idx is None:
            print("❌ Error: No se encontró columna 'código' en el CSV")
            return codes
        
        print(f"✅ Columna código encontrada en índice {codigo_idx}")
        if clave_idx is not None:
            print(f"✅ Columna clave encontrada en índice {clave_idx}")
        
        # Leer datos
        processed = 0
        for line_num, line in enumerate(lines[2:], start=3):  # Saltar título y headers
            parts = line.split(',')
            
            if len(parts) <= codigo_idx:
                continue
            
            codigo = parts[codigo_idx].strip().strip('"')
            clave = parts[clave_idx].strip().strip('"') if clave_idx and len(parts) > clave_idx else None
            
            if codigo and codigo.isdigit():
                codes[codigo] = {
                    'codigo': codigo,
                    'clave': clave,
                    'url_by_code': TRUPER_IMAGE_URL_BY_CODE.format(codigo=codigo),
                    'url_by_clave': TRUPER_IMAGE_URL_BY_CLAVE.format(clave=clave) if clave else None,
                }
                processed += 1
        
        print(f"✅ {processed} códigos leídos del CSV\n")
    
    return codes


def update_product_images(codes):
    """Actualiza las URLs de imágenes en la base de datos"""
    print("🔄 Actualizando URLs de imágenes en la base de datos...\n")
    
    # Obtener todos los productos TRUPER
    print("📥 Obteniendo productos TRUPER de la base de datos...")
    response = supabase.table('marketplace_products').select('id, title, images').eq('status', 'active').limit(10000).execute()
    
    products = response.data if response.data else []
    print(f"✅ {len(products)} productos encontrados\n")
    
    updated = 0
    not_found = 0
    errors = 0
    
    # Extraer códigos de los productos (del título o de alguna otra forma)
    # Asumimos que el código está en algún lugar del título o en la clave del producto
    for product in products:
        product_id = product.get('id')
        title = product.get('title', '')
        current_images = product.get('images', [])
        
        # Intentar encontrar el código en el título o en la clave del producto
        # Buscar patrones como "100048" o "PET-15X"
        import re
        
        # Buscar código numérico (6 dígitos típicamente)
        codigo_match = re.search(r'\b(\d{6})\b', title)
        if not codigo_match:
            # Buscar clave (formato como PET-15X)
            clave_match = re.search(r'\b([A-Z]{2,4}-\d+[A-Z]?)\b', title)
            if clave_match:
                clave = clave_match.group(1)
                # Buscar código por clave en el diccionario
                codigo = None
                for code, data in codes.items():
                    if data.get('clave') == clave:
                        codigo = code
                        break
            else:
                codigo = None
        else:
            codigo = codigo_match.group(1)
        
        if codigo and codigo in codes:
            new_url = codes[codigo]['url']
            
            # Actualizar solo si la imagen actual es local o está vacía
            should_update = False
            if not current_images or len(current_images) == 0:
                should_update = True
            elif current_images and len(current_images) > 0:
                # Si la imagen actual es local (empieza con /images), actualizar
                first_image = current_images[0] if isinstance(current_images, list) else current_images
                if isinstance(first_image, str) and (first_image.startswith('/images') or first_image.startswith('public/')):
                    should_update = True
            
            if should_update:
                try:
                    # Actualizar con nueva URL
                    new_images = [new_url]
                    
                    supabase.table('marketplace_products').update({
                        'images': new_images
                    }).eq('id', product_id).execute()
                    
                    updated += 1
                    if updated % 100 == 0:
                        print(f"  ✅ {updated} productos actualizados...")
                except Exception as e:
                    errors += 1
                    if errors <= 5:  # Mostrar solo primeros 5 errores
                        print(f"  ⚠️ Error actualizando producto {product_id}: {e}")
            else:
                not_found += 1
        else:
            not_found += 1
    
    print(f"\n✅ Actualización completada:")
    print(f"  - Productos actualizados: {updated}")
    print(f"  - Productos sin código encontrado: {not_found}")
    print(f"  - Errores: {errors}")
    
    return updated


def update_product_images_by_key(codes):
    """Actualiza las URLs de imágenes extrayendo el código del título o imagen actual"""
    print("🔄 Actualizando URLs de imágenes extrayendo código del título/imagen...\n")
    
    # Crear mapeos: clave -> código y código -> datos completos
    clave_to_codigo = {}
    codigo_to_data = {}
    for codigo, data in codes.items():
        codigo_to_data[codigo] = data
        if data.get('clave'):
            clave_to_codigo[data['clave']] = codigo
    
    print(f"✅ Mapeos creados:")
    print(f"   - {len(clave_to_codigo)} claves -> códigos")
    print(f"   - {len(codigo_to_data)} códigos -> datos completos\n")
    
    # Obtener todos los productos TRUPER
    print("📥 Obteniendo productos TRUPER de la base de datos...")
    response = supabase.table('marketplace_products').select('id, title, images').eq('status', 'active').limit(20000).execute()
    
    products = response.data if response.data else []
    print(f"✅ {len(products)} productos encontrados\n")
    
    updated = 0
    not_found = 0
    errors = 0
    already_updated = 0
    
    import re
    
    for product in products:
        product_id = product.get('id')
        title = product.get('title', '')
        current_images = product.get('images', [])
        
        # Extraer código del título o de la imagen actual
        codigo = None
        
        # Método 1: Extraer de imagen actual si es local
        if current_images and len(current_images) > 0:
            first_image = current_images[0] if isinstance(current_images, list) else current_images
            if isinstance(first_image, str):
                # Si ya tiene URL de Truper, extraer código
                truper_match = re.search(r'truper\.com/media/import/imagenes/(\d+)\.jpg', first_image)
                if truper_match:
                    codigo = truper_match.group(1)
                    already_updated += 1
                # Si es imagen local, extraer identificador
                elif '/truper/' in first_image:
                    local_match = re.search(r'/truper/([^/]+)\.(jpg|webp|png)', first_image)
                    if local_match:
                        identifier = local_match.group(1)
                        # Buscar por clave
                        if identifier in clave_to_codigo:
                            codigo = clave_to_codigo[identifier]
                        # O si es directamente un código numérico
                        elif identifier.isdigit():
                            codigo = identifier
        
        # Método 2: Extraer código numérico del título
        if not codigo:
            title_match = re.search(r'\b(\d{5,7})\b', title)
            if title_match:
                potential_codigo = title_match.group(1)
                if potential_codigo in codigo_to_url:
                    codigo = potential_codigo
        
        # Método 3: Buscar clave en el título
        if not codigo:
            for clave, cod in clave_to_codigo.items():
                if clave in title:
                    codigo = cod
                    break
        
        if codigo and codigo in codigo_to_data:
            data = codigo_to_data[codigo]
            # Priorizar URL por clave (funciona mejor), luego por código
            new_url = None
            if data.get('url_by_clave'):
                # Verificar si la URL por clave funciona
                try:
                    import requests
                    response = requests.head(data['url_by_clave'], timeout=3, allow_redirects=True)
                    if response.status_code == 200:
                        new_url = data['url_by_clave']
                except:
                    pass
            
            # Si no funciona por clave, usar por código
            if not new_url:
                new_url = data.get('url_by_code')
            
            # Verificar si ya tiene URL de Truper correcta
            has_correct_truper_url = False
            if current_images and len(current_images) > 0:
                first_image = current_images[0] if isinstance(current_images, list) else current_images
                if isinstance(first_image, str) and new_url in first_image:
                    has_correct_truper_url = True
            
            # Actualizar solo si no tiene la URL correcta de Truper
            should_update = False
            if has_correct_truper_url:
                # Ya tiene la URL correcta, no actualizar
                pass
            elif not current_images or len(current_images) == 0:
                should_update = True
            elif current_images and len(current_images) > 0:
                first_image = current_images[0] if isinstance(current_images, list) else current_images
                if isinstance(first_image, str):
                    # Actualizar si es imagen local o tiene URL diferente
                    if (first_image.startswith('/images') or 
                        first_image.startswith('public/') or 
                        ('truper.com' in first_image and new_url not in first_image)):
                        should_update = True
            
            # Opcional: Verificar que la URL funciona antes de actualizar
            # (comentado para velocidad, descomentar si se necesita validación)
            # if should_update and not verify_image_url(new_url):
            #     should_update = False
            #     not_found += 1
            
            if should_update:
                try:
                    new_images = [new_url]
                    
                    supabase.table('marketplace_products').update({
                        'images': new_images
                    }).eq('id', product_id).execute()
                    
                    updated += 1
                    if updated % 100 == 0:
                        print(f"  ✅ {updated} productos actualizados...")
                except Exception as e:
                    errors += 1
                    if errors <= 5:
                        print(f"  ⚠️ Error actualizando producto {product_id}: {e}")
        else:
            not_found += 1
    
    print(f"\n✅ Actualización completada:")
    print(f"  - Productos actualizados: {updated}")
    print(f"  - Ya tenían URL de Truper: {already_updated}")
    print(f"  - Productos sin código encontrado: {not_found}")
    print(f"  - Errores: {errors}")
    
    return updated


def main():
    import sys
    
    print("=" * 60)
    print("🖼️  ACTUALIZACIÓN DE IMÁGENES TRUPER DESDE CSV")
    print("=" * 60)
    print()
    
    # Leer códigos del CSV
    codes = read_csv_codes()
    
    if not codes:
        print("❌ No se pudieron leer códigos del CSV")
        return
    
    print(f"📊 Total de códigos únicos: {len(codes)}")
    print(f"📋 Ejemplos de URLs generadas:")
    for i, (codigo, data) in enumerate(list(codes.items())[:5], 1):
        url_preview = data.get('url_by_clave') or data.get('url_by_code', 'N/A')
        print(f"  {i}. Código {codigo} (clave: {data.get('clave', 'N/A')}): {url_preview}")
    print()
    
    # Si se pasa --yes como argumento, ejecutar sin confirmación
    auto_confirm = '--yes' in sys.argv or '-y' in sys.argv
    
    if not auto_confirm:
        response = input("¿Deseas continuar con la actualización? (s/n): ")
        if response.lower() != 's':
            print("❌ Actualización cancelada")
            return
    
    # Actualizar productos usando el campo 'key'
    updated = update_product_images_by_key(codes)
    
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)


if __name__ == '__main__':
    main()

