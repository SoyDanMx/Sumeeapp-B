#!/usr/bin/env python3
"""
Script para obtener URLs de imágenes del banco de contenido digital de Truper
Busca imágenes por código de producto en: https://www.truper.com/BancoContenidoDigital/
"""

import os
import sys
import csv
import re
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client
from typing import Dict, Optional
import time

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_KEY no encontradas")
    sys.exit(1)

# Inicializar cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# URLs del banco de Truper
TRUPER_BANK_BASE = "https://www.truper.com/BancoContenidoDigital/index.php"
TRUPER_BANK_SEARCH = f"{TRUPER_BANK_BASE}?r=site/search"
TRUPER_DIRECT_IMAGE_PATTERN = "https://www.truper.com/media/import/imagenes/{codigo}.jpg"


def search_image_in_bank(codigo: str, clave: Optional[str] = None) -> Optional[str]:
    """
    Busca una imagen en el banco de contenido digital de Truper
    Retorna la URL de la imagen si se encuentra
    """
    # Primero intentar URL directa (método más rápido)
    direct_url = TRUPER_DIRECT_IMAGE_PATTERN.format(codigo=codigo)
    
    try:
        response = requests.head(direct_url, timeout=5, allow_redirects=True)
        if response.status_code == 200:
            return direct_url
    except:
        pass
    
    # Si no funciona, intentar búsqueda en el banco
    search_terms = [codigo]
    if clave:
        search_terms.append(clave)
    
    for term in search_terms:
        try:
            params = {'r': 'site/search', 'q': term}
            response = requests.get(TRUPER_BANK_BASE, params=params, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Buscar imágenes en el HTML
                # Las imágenes del banco suelen estar en elementos específicos
                img_tags = soup.find_all('img', src=re.compile(r'\.(jpg|png|webp)', re.I))
                
                for img in img_tags:
                    src = img.get('src', '')
                    if src and codigo in src:
                        # Construir URL completa si es relativa
                        if src.startswith('http'):
                            return src
                        elif src.startswith('/'):
                            return f"https://www.truper.com{src}"
                        else:
                            return f"https://www.truper.com/BancoContenidoDigital/{src}"
                
                # Buscar enlaces de descarga
                download_links = soup.find_all('a', href=re.compile(r'\.(jpg|png|webp)', re.I))
                for link in download_links:
                    href = link.get('href', '')
                    if href and codigo in href:
                        if href.startswith('http'):
                            return href
                        elif href.startswith('/'):
                            return f"https://www.truper.com{href}"
        except Exception as e:
            if '--verbose' in sys.argv:
                print(f"  ⚠️ Error buscando {term}: {e}")
            continue
    
    return None


def read_csv_codes():
    """Lee los códigos del CSV"""
    codes = {}
    CSV_PATH = 'data/truper_catalog_full.csv'
    
    if not os.path.exists(CSV_PATH):
        print(f"❌ Error: Archivo CSV no encontrado en {CSV_PATH}")
        return codes
    
    print(f"📖 Leyendo CSV: {CSV_PATH}\n")
    
    with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
        if len(lines) < 2:
            return codes
        
        headers_line = lines[1]
        headers = [h.strip() for h in headers_line.split(',')]
        
        codigo_idx = None
        clave_idx = None
        for i, header in enumerate(headers):
            header_lower = header.lower()
            if 'código' in header_lower or ('codigo' in header_lower and 'sat' not in header_lower):
                codigo_idx = i
            if 'clave' in header_lower:
                clave_idx = i
        
        if codigo_idx is None:
            return codes
        
        for line in lines[2:]:
            parts = line.split(',')
            if len(parts) <= codigo_idx:
                continue
            
            codigo = parts[codigo_idx].strip().strip('"')
            clave = parts[clave_idx].strip().strip('"') if clave_idx and len(parts) > clave_idx else None
            
            if codigo and codigo.isdigit():
                codes[codigo] = {
                    'codigo': codigo,
                    'clave': clave,
                }
    
    return codes


def update_images_from_bank(codes: Dict, limit: Optional[int] = None):
    """
    Actualiza imágenes buscándolas en el banco de Truper
    """
    print("🔄 Actualizando imágenes desde banco de contenido digital de Truper...\n")
    
    # Crear mapeo clave -> código
    clave_to_codigo = {}
    for codigo, data in codes.items():
        if data.get('clave'):
            clave_to_codigo[data['clave']] = codigo
    
    # Obtener productos
    print("📥 Obteniendo productos TRUPER...")
    response = supabase.table('marketplace_products').select('id, title, images').eq('status', 'active').limit(limit or 20000).execute()
    
    products = response.data if response.data else []
    print(f"✅ {len(products)} productos encontrados\n")
    
    updated = 0
    not_found = 0
    errors = 0
    already_has_url = 0
    
    import re
    
    for i, product in enumerate(products, 1):
        product_id = product.get('id')
        title = product.get('title', '')
        current_images = product.get('images', [])
        
        # Extraer código/clave de la imagen actual o título
        codigo = None
        clave = None
        
        # Método 1: De imagen local actual
        if current_images and len(current_images) > 0:
            first_image = current_images[0] if isinstance(current_images, list) else current_images
            if isinstance(first_image, str):
                # Si ya tiene URL de Truper, extraer código
                truper_match = re.search(r'truper\.com.*?/(\d+)\.jpg', first_image)
                if truper_match:
                    codigo = truper_match.group(1)
                    already_has_url += 1
                # Si es imagen local, extraer identificador
                elif '/truper/' in first_image:
                    local_match = re.search(r'/truper/([^/]+)\.(jpg|webp|png)', first_image)
                    if local_match:
                        identifier = local_match.group(1)
                        if identifier in clave_to_codigo:
                            codigo = clave_to_codigo[identifier]
                            clave = identifier
                        elif identifier.isdigit():
                            codigo = identifier
        
        # Método 2: Extraer código del título
        if not codigo:
            title_match = re.search(r'\b(\d{5,7})\b', title)
            if title_match:
                potential_codigo = title_match.group(1)
                if potential_codigo in codes:
                    codigo = potential_codigo
        
        # Método 3: Buscar clave en título
        if not codigo:
            for clave_val, cod in clave_to_codigo.items():
                if clave_val in title:
                    codigo = cod
                    clave = clave_val
                    break
        
        if codigo:
            # Buscar imagen en el banco
            image_url = search_image_in_bank(codigo, clave)
            
            if image_url:
                # Verificar si necesita actualización
                needs_update = True
                if current_images and len(current_images) > 0:
                    first_image = current_images[0] if isinstance(current_images, list) else current_images
                    if isinstance(first_image, str) and image_url in first_image:
                        needs_update = False
                
                if needs_update:
                    try:
                        supabase.table('marketplace_products').update({
                            'images': [image_url]
                        }).eq('id', product_id).execute()
                        
                        updated += 1
                        if updated % 50 == 0:
                            print(f"  ✅ {updated} productos actualizados...")
                        
                        # Rate limiting: esperar un poco para no saturar el servidor
                        time.sleep(0.1)
                    except Exception as e:
                        errors += 1
                        if errors <= 5:
                            print(f"  ⚠️ Error actualizando {product_id}: {e}")
            else:
                not_found += 1
        else:
            not_found += 1
    
    print(f"\n✅ Actualización completada:")
    print(f"  - Productos actualizados: {updated}")
    print(f"  - Ya tenían URL correcta: {already_has_url}")
    print(f"  - Productos sin código/imagen encontrada: {not_found}")
    print(f"  - Errores: {errors}")


def main():
    import sys
    
    print("=" * 60)
    print("🖼️  OBTENCIÓN DE IMÁGENES DESDE BANCO DE CONTENIDO DIGITAL TRUPER")
    print("=" * 60)
    print()
    
    # Leer códigos del CSV
    codes = read_csv_codes()
    
    if not codes:
        print("❌ No se pudieron leer códigos del CSV")
        return
    
    print(f"📊 Total de códigos únicos: {len(codes)}")
    print(f"📋 Ejemplos:")
    for i, (codigo, data) in enumerate(list(codes.items())[:3], 1):
        print(f"  {i}. Código {codigo} (clave: {data.get('clave', 'N/A')})")
    print()
    
    # Verificar si hay límite
    limit = None
    if '--limit' in sys.argv:
        idx = sys.argv.index('--limit')
        if idx + 1 < len(sys.argv):
            limit = int(sys.argv[idx + 1])
    
    # Actualizar imágenes
    update_images_from_bank(codes, limit)
    
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)


if __name__ == '__main__':
    main()

