"""
Script exhaustivo para analizar productos sin imágenes.
Identifica patrones y mejora estrategias de extracción de códigos.
"""

import os
import csv
import re
from collections import Counter, defaultdict
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

CSV_PATH = 'data/truper_catalog_full.csv'

def read_csv_codes():
    """Lee el CSV completo."""
    codes_by_code = {}
    codes_by_clave = {}
    descripcion_to_codes = defaultdict(list)
    
    if not os.path.exists(CSV_PATH):
        return codes_by_code, codes_by_clave, descripcion_to_codes
    
    with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
        if len(lines) < 2:
            return codes_by_code, codes_by_clave, descripcion_to_codes
        
        headers_line = lines[1]
        headers_row = list(csv.reader([headers_line]))[0]
        headers_lower = [h.lower() for h in headers_row]
        
        codigo_idx = headers_lower.index('código') if 'código' in headers_lower else -1
        clave_idx = headers_lower.index('clave') if 'clave' in headers_lower else -1
        descripcion_idx = headers_lower.index('descripción') if 'descripción' in headers_lower else -1
        
        if codigo_idx == -1:
            return codes_by_code, codes_by_clave, descripcion_to_codes
        
        for line in lines[2:]:
            try:
                row = list(csv.reader([line]))[0]
                if len(row) <= codigo_idx:
                    continue
                
                codigo = row[codigo_idx].strip().strip('"')
                clave = row[clave_idx].strip().strip('"') if clave_idx != -1 and len(row) > clave_idx else None
                descripcion = row[descripcion_idx].strip().strip('"') if descripcion_idx != -1 and len(row) > descripcion_idx else None
                
                if codigo and codigo.isdigit():
                    data = {
                        'codigo': codigo,
                        'clave': clave,
                        'descripcion': descripcion,
                    }
                    
                    codes_by_code[codigo] = data
                    if clave:
                        codes_by_clave[clave.upper()] = data
                    
                    # Indexar por palabras clave de descripción
                    if descripcion:
                        words = re.findall(r'\b\w+\b', descripcion.upper())
                        for word in words:
                            if len(word) > 4:  # Palabras significativas
                                descripcion_to_codes[word].append(data)
            except:
                continue
    
    return codes_by_code, codes_by_clave, descripcion_to_codes

def extract_all_possible_codes(title: str, description: str = '') -> list:
    """Extrae todos los posibles códigos/claves del título y descripción."""
    text = title + ' ' + description
    text_upper = text.upper()
    
    codes_found = []
    
    # 1. Clave con guión al inicio
    match = re.search(r'^([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})(?:\s*-|\s+|$)', text_upper)
    if match:
        codes_found.append(('clave_inicio', match.group(1)))
    
    # 2. Clave con guión en cualquier parte
    matches = re.findall(r'\b([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})\b', text_upper)
    for match in matches:
        if match not in [c[1] for c in codes_found]:
            codes_found.append(('clave_medio', match))
    
    # 3. Clave sin guión
    matches = re.findall(r'\b([A-Z]{2,6}\d{1,4}[A-Z]{0,2})\b', text_upper)
    for match in matches:
        if match not in [c[1] for c in codes_found]:
            codes_found.append(('clave_sin_guion', match))
    
    # 4. Código numérico (5-6 dígitos)
    matches = re.findall(r'\b(\d{5,6})\b', text)
    for match in matches:
        if match not in [c[1] for c in codes_found]:
            codes_found.append(('codigo_numerico', match))
    
    # 5. Código numérico (4 dígitos) - menos común pero posible
    matches = re.findall(r'\b(\d{4})\b', text)
    for match in matches:
        if match not in [c[1] for c in codes_found]:
            codes_found.append(('codigo_4digitos', match))
    
    return codes_found

def analyze_patterns(products_without_images, codes_by_code, codes_by_clave, descripcion_to_codes):
    """Analiza patrones en productos sin imágenes."""
    
    print("=" * 60)
    print("🔍 ANÁLISIS DE PATRONES")
    print("=" * 60)
    print()
    
    # Estadísticas generales
    total = len(products_without_images)
    print(f"📊 Total productos sin imágenes: {total}\n")
    
    # Análisis de títulos
    title_patterns = Counter()
    title_lengths = []
    has_code_pattern = 0
    has_clave_pattern = 0
    has_numeric_pattern = 0
    no_pattern = 0
    
    # Análisis de códigos encontrados
    codes_found_by_type = defaultdict(int)
    codes_matched_in_csv = defaultdict(int)
    codes_not_in_csv = defaultdict(int)
    
    # Categorías de productos
    categories = Counter()
    
    # Palabras clave comunes
    common_words = Counter()
    
    for product in products_without_images:
        title = product.get('title', '')
        description = product.get('description', '')
        
        title_lengths.append(len(title))
        
        # Analizar patrones en título
        if re.search(r'[A-Z]{2,6}-\d', title.upper()):
            has_clave_pattern += 1
        elif re.search(r'\d{4,6}', title):
            has_numeric_pattern += 1
        elif re.search(r'[A-Z]{2,6}\d', title.upper()):
            has_code_pattern += 1
        else:
            no_pattern += 1
        
        # Extraer posibles códigos
        possible_codes = extract_all_possible_codes(title, description)
        
        for code_type, code_value in possible_codes:
            codes_found_by_type[code_type] += 1
            
            # Verificar si está en CSV
            matched = False
            if code_type.startswith('clave'):
                # Intentar con y sin guión
                clave_variations = [code_value, code_value.replace('-', ''), code_value.replace('', '-')]
                for var in clave_variations:
                    if var.upper() in codes_by_clave:
                        codes_matched_in_csv[code_type] += 1
                        matched = True
                        break
            elif code_type.startswith('codigo'):
                if code_value in codes_by_code:
                    codes_matched_in_csv[code_type] += 1
                    matched = True
            
            if not matched:
                codes_not_in_csv[code_type] += 1
        
        # Extraer palabras clave
        words = re.findall(r'\b\w{4,}\b', title.upper())
        for word in words:
            common_words[word] += 1
    
    # Mostrar estadísticas
    print("📊 ESTADÍSTICAS DE TÍTULOS:")
    print(f"   Longitud promedio: {sum(title_lengths) / len(title_lengths):.1f} caracteres")
    print(f"   Con patrón de clave (ABC-123): {has_clave_pattern}")
    print(f"   Con patrón numérico (1234-123456): {has_numeric_pattern}")
    print(f"   Con patrón alfanumérico (ABC123): {has_code_pattern}")
    print(f"   Sin patrón identificable: {no_pattern}")
    
    print("\n📊 CÓDIGOS ENCONTRADOS:")
    for code_type, count in sorted(codes_found_by_type.items(), key=lambda x: x[1], reverse=True):
        matched = codes_matched_in_csv.get(code_type, 0)
        not_matched = codes_not_in_csv.get(code_type, 0)
        print(f"   {code_type}: {count} encontrados ({matched} en CSV, {not_matched} no en CSV)")
    
    print("\n📊 PALABRAS CLAVE MÁS COMUNES:")
    for word, count in common_words.most_common(20):
        print(f"   {word}: {count} veces")
    
    # Analizar productos específicos
    print("\n" + "=" * 60)
    print("📋 ANÁLISIS DE PRODUCTOS ESPECÍFICOS")
    print("=" * 60)
    print()
    
    # Productos con patrones pero sin match en CSV
    products_with_patterns_no_match = []
    products_without_patterns = []
    
    for product in products_without_images[:100]:  # Analizar primeros 100
        title = product.get('title', '')
        description = product.get('description', '')
        possible_codes = extract_all_possible_codes(title, description)
        
        if possible_codes:
            # Verificar si alguno está en CSV
            found_in_csv = False
            for code_type, code_value in possible_codes:
                if code_type.startswith('clave'):
                    if code_value.upper() in codes_by_clave or code_value.replace('-', '').upper() in codes_by_clave:
                        found_in_csv = True
                        break
                elif code_type.startswith('codigo'):
                    if code_value in codes_by_code:
                        found_in_csv = True
                        break
            
            if not found_in_csv:
                products_with_patterns_no_match.append({
                    'title': title,
                    'codes': possible_codes,
                })
        else:
            products_without_patterns.append({
                'title': title,
            })
    
    print(f"📊 Productos con patrones pero NO en CSV: {len(products_with_patterns_no_match)}")
    print(f"📊 Productos sin patrones identificables: {len(products_without_patterns)}\n")
    
    print("📋 EJEMPLOS - Productos con patrones pero no en CSV (primeros 10):")
    for i, item in enumerate(products_with_patterns_no_match[:10], 1):
        print(f"\n{i}. {item['title'][:70]}")
        print(f"   Códigos encontrados: {item['codes']}")
    
    print("\n📋 EJEMPLOS - Productos sin patrones (primeros 10):")
    for i, item in enumerate(products_without_patterns[:10], 1):
        print(f"\n{i}. {item['title'][:70]}")
    
    # Recomendaciones
    print("\n" + "=" * 60)
    print("💡 RECOMENDACIONES")
    print("=" * 60)
    print()
    
    recommendations = []
    
    if codes_not_in_csv.get('clave_inicio', 0) > 0:
        recommendations.append(f"• {codes_not_in_csv['clave_inicio']} claves al inicio no están en CSV - verificar formato")
    
    if codes_not_in_csv.get('codigo_numerico', 0) > 0:
        recommendations.append(f"• {codes_not_in_csv['codigo_numerico']} códigos numéricos no están en CSV - pueden ser de otras marcas")
    
    if no_pattern > total * 0.3:
        recommendations.append(f"• {no_pattern} productos ({no_pattern/total*100:.1f}%) sin patrones - pueden necesitar búsqueda manual")
    
    if products_with_patterns_no_match:
        recommendations.append(f"• {len(products_with_patterns_no_match)} productos tienen patrones pero no coinciden en CSV - verificar variaciones de formato")
    
    for rec in recommendations:
        print(rec)
    
    print("\n" + "=" * 60)
    print("✅ ANÁLISIS COMPLETADO")
    print("=" * 60)

def main():
    print("=" * 60)
    print("🔍 ANÁLISIS EXHAUSTIVO DE PRODUCTOS SIN IMÁGENES")
    print("=" * 60)
    print()
    
    # Leer CSV
    print("📖 Leyendo CSV de Truper...")
    codes_by_code, codes_by_clave, descripcion_to_codes = read_csv_codes()
    print(f"✅ {len(codes_by_code)} códigos leídos del CSV\n")
    
    # Obtener productos sin imágenes
    print("🔍 Obteniendo productos sin imágenes...")
    all_products = []
    offset = 0
    page_size = 1000
    
    while True:
        response = supabase.table('marketplace_products').select(
            'id, title, description, images, category_id'
        ).eq('status', 'active').range(offset, offset + page_size - 1).execute()
        
        batch = response.data
        if not batch:
            break
        
        all_products.extend(batch)
        offset += page_size
        
        if len(batch) < page_size:
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
                    from pathlib import Path
                    local_path = Path('public') / img.lstrip('/')
                    if local_path.exists():
                        valid_images.append(img)
        
        if not valid_images:
            products_without_images.append(product)
    
    print(f"✅ {len(products_without_images)} productos sin imágenes encontrados\n")
    
    # Analizar patrones
    analyze_patterns(products_without_images, codes_by_code, codes_by_clave, descripcion_to_codes)

if __name__ == "__main__":
    main()


