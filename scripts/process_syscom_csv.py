#!/usr/bin/env python3
"""
Script para procesar CSV de Syscom y actualizar precios por SKU en la base de datos
Busca automáticamente archivos CSV en el directorio data/

Uso:
    python3 scripts/process_syscom_csv.py --file data/productos.csv --execute
    python3 scripts/process_syscom_csv.py --auto --execute  # Busca CSV en data/
"""

import os
import sys
import csv
import argparse
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    print("❌ Error: Se requiere supabase-py")
    print("   Instalar con: pip install supabase")
    sys.exit(1)

# Cargar variables de entorno
# Intentar múltiples ubicaciones y métodos
env_files = ['.env.local', '.env']
env_loaded = False

for env_file in env_files:
    try:
        env_path = Path(__file__).parent.parent / env_file
        if env_path.exists():
            load_dotenv(env_path, override=True)
            env_loaded = True
            print(f"✅ Variables cargadas desde: {env_file}")
            break
    except Exception as e:
        continue

# También intentar cargar desde la ruta absoluta
if not env_loaded:
    try:
        env_local_path = Path(__file__).parent.parent / '.env.local'
        if env_local_path.exists():
            load_dotenv(env_local_path, override=True)
            env_loaded = True
            print(f"✅ Variables cargadas desde: .env.local (ruta absoluta)")
    except Exception:
        pass

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("=" * 80)
    print("❌ ERROR: Variables de entorno no configuradas")
    print("=" * 80)
    print()
    print("📋 REQUISITOS:")
    print("   - NEXT_PUBLIC_SUPABASE_URL")
    print("   - SUPABASE_SERVICE_ROLE_KEY")
    print()
    print("💡 OPCIONES PARA CONFIGURAR:")
    print()
    print("1. Exportar en la terminal (temporal):")
    print("   export NEXT_PUBLIC_SUPABASE_URL='tu_url'")
    print("   export SUPABASE_SERVICE_ROLE_KEY='tu_key'")
    print()
    print("2. Verificar .env.local:")
    print("   Asegúrate de que .env.local contiene:")
    print("   NEXT_PUBLIC_SUPABASE_URL=tu_url")
    print("   SUPABASE_SERVICE_ROLE_KEY=tu_key")
    print()
    print("3. Verificar variables actuales:")
    print("   echo $NEXT_PUBLIC_SUPABASE_URL")
    print("   echo $SUPABASE_SERVICE_ROLE_KEY")
    print()
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Directorio de datos
DATA_DIR = Path(__file__).parent.parent / "data"


def detect_encoding(file_path: str) -> str:
    """
    Detecta la codificación del archivo probando múltiples codificaciones comunes
    """
    encodings_to_try = ['utf-8', 'latin-1', 'windows-1252', 'iso-8859-1', 'cp1252', 'utf-8-sig']
    
    for encoding in encodings_to_try:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                # Intentar leer las primeras líneas
                for i, line in enumerate(f):
                    if i >= 5:  # Leer primeras 5 líneas
                        break
                print(f"📝 Codificación detectada: {encoding}")
                return encoding
        except (UnicodeDecodeError, UnicodeError):
            continue
        except Exception:
            continue
    
    # Si ninguna funciona, usar utf-8 con manejo de errores
    print(f"⚠️  No se pudo detectar codificación, usando utf-8 con manejo de errores")
    return 'utf-8'


def detect_csv_format(file_path: str) -> Dict:
    """
    Detecta el formato del CSV y retorna información sobre las columnas
    """
    print("🔍 Analizando formato del CSV...")
    
    # Detectar codificación primero
    encoding = detect_encoding(file_path)
    
    try:
        with open(file_path, 'r', encoding=encoding, errors='replace') as f:
            # Leer primeras líneas para análisis
            sample_lines = [f.readline() for _ in range(5)]
            f.seek(0)
            
            # Detectar delimitador
            sniffer = csv.Sniffer()
            sample = ''.join(sample_lines)
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.DictReader(f, delimiter=delimiter)
            fieldnames = [field.strip() for field in reader.fieldnames]
            
            # Normalizar nombres de columnas (case-insensitive)
            fieldnames_lower = [f.lower() for f in fieldnames]
            
            # Buscar columnas relevantes
            sku_col = None
            price_col = None
            original_price_col = None
            model_col = None
            title_col = None
            
            # Mapeo de posibles nombres de columnas
            # IMPORTANTE: "Variant SKU" tiene prioridad sobre "Handle" para SKU
            sku_keywords = ['variant sku', 'sku', 'codigo', 'código', 'modelo', 'id', 'producto_id', 'artículo']
            price_keywords = ['variant price', 'precio', 'price', 'precio_venta', 'precio_final', 'precio_especial']
            original_price_keywords = ['variant compare at price', 'precio_original', 'precio_lista', 'precio_antes', 'original_price', 'precio_normal', 'compare at price']
            model_keywords = ['modelo', 'model', 'handle']  # Handle puede ser modelo, pero no SKU principal
            title_keywords = ['title', 'titulo', 'título', 'nombre', 'descripcion', 'descripción']
            
            # Buscar "Variant SKU" primero (prioridad para formato Shopify)
            for i, field in enumerate(fieldnames_lower):
                if field == 'variant sku' or field == 'variant_sku':
                    sku_col = fieldnames[i]
                    break
            
            for i, field in enumerate(fieldnames_lower):
                # SKU
                if not sku_col and any(kw in field for kw in sku_keywords):
                    sku_col = fieldnames[i]
                
                # Precio
                if not price_col and any(kw in field for kw in price_keywords):
                    if 'original' not in field and 'lista' not in field and 'antes' not in field:
                        price_col = fieldnames[i]
                
                # Precio original
                if not original_price_col and any(kw in field for kw in original_price_keywords):
                    original_price_col = fieldnames[i]
                
                # Modelo
                if not model_col and any(kw in field for kw in model_keywords):
                    if field != sku_col:
                        model_col = fieldnames[i]
                
                # Título
                if not title_col and any(kw in field for kw in title_keywords):
                    title_col = fieldnames[i]
            
            return {
                'delimiter': delimiter,
                'fieldnames': fieldnames,
                'sku_col': sku_col,
                'price_col': price_col,
                'original_price_col': original_price_col,
                'model_col': model_col,
                'title_col': title_col,
            }
    
    except Exception as e:
        print(f"❌ Error analizando CSV: {e}")
        return {}


def parse_csv(file_path: str, format_info: Dict) -> List[Dict]:
    """
    Parsea el CSV usando la información de formato detectada
    """
    products = []
    
    # Detectar codificación
    encoding = detect_encoding(file_path)
    
    try:
        with open(file_path, 'r', encoding=encoding, errors='replace') as f:
            reader = csv.DictReader(f, delimiter=format_info['delimiter'])
            
            for row_num, row in enumerate(reader, start=2):
                # Obtener valores
                sku = None
                price = None
                original_price = None
                model = None
                title = None
                
                # SKU
                if format_info['sku_col']:
                    sku = row.get(format_info['sku_col'], '').strip()
                
                # Si no hay SKU, intentar con modelo
                if not sku and format_info['model_col']:
                    sku = row.get(format_info['model_col'], '').strip()
                
                # Precio
                if format_info['price_col']:
                    price_str = row.get(format_info['price_col'], '').strip()
                    if price_str:
                        try:
                            price_clean = price_str.replace('$', '').replace(',', '').replace(' ', '').replace('MXN', '').replace('USD', '')
                            price = float(price_clean)
                        except (ValueError, AttributeError):
                            pass
                
                # Precio original
                if format_info['original_price_col']:
                    original_price_str = row.get(format_info['original_price_col'], '').strip()
                    if original_price_str:
                        try:
                            original_price_clean = original_price_str.replace('$', '').replace(',', '').replace(' ', '').replace('MXN', '').replace('USD', '')
                            original_price = float(original_price_clean)
                            if original_price <= price or original_price <= 0:
                                original_price = None
                        except (ValueError, AttributeError):
                            pass
                
                # Modelo (para referencia)
                if format_info['model_col']:
                    model = row.get(format_info['model_col'], '').strip()
                
                # Título (para referencia)
                if format_info['title_col']:
                    title = row.get(format_info['title_col'], '').strip()
                
                # Validar que tengamos SKU y precio
                if not sku:
                    if row_num <= 5:
                        print(f"⚠️  Fila {row_num}: SKU vacío, omitiendo...")
                    continue
                
                if not price or price <= 0:
                    if row_num <= 5:
                        print(f"⚠️  Fila {row_num}: Precio inválido, omitiendo...")
                    continue
                
                products.append({
                    'sku': sku,
                    'price': price,
                    'original_price': original_price,
                    'model': model,
                    'title': title,
                    'row': row_num
                })
        
        return products
    
    except Exception as e:
        print(f"❌ Error parseando CSV: {e}")
        import traceback
        traceback.print_exc()
        return []


def find_csv_files() -> List[Path]:
    """
    Busca archivos CSV en el directorio data/
    """
    csv_files = []
    
    if not DATA_DIR.exists():
        return csv_files
    
    for file in DATA_DIR.glob("*.csv"):
        csv_files.append(file)
    
    return sorted(csv_files)


def update_prices_from_csv(file_path: str, execute: bool = False):
    """
    Procesa CSV y actualiza precios en la base de datos
    """
    print("=" * 80)
    print("PROCESAMIENTO DE CSV DE SYSCOM")
    print("=" * 80)
    print()
    
    if not execute:
        print("⚠️  MODO DRY-RUN: No se actualizará la base de datos")
        print("   Usa --execute para aplicar cambios")
        print()
    
    # Detectar formato
    format_info = detect_csv_format(file_path)
    
    if not format_info.get('sku_col') or not format_info.get('price_col'):
        print("❌ Error: No se pudieron detectar las columnas SKU y Precio")
        print(f"   Columnas encontradas: {', '.join(format_info.get('fieldnames', []))}")
        return
    
    print("✅ Formato detectado:")
    print(f"   Delimitador: '{format_info['delimiter']}'")
    print(f"   SKU: {format_info['sku_col']}")
    print(f"   Precio: {format_info['price_col']}")
    if format_info.get('original_price_col'):
        print(f"   Precio Original: {format_info['original_price_col']}")
    if format_info.get('model_col'):
        print(f"   Modelo: {format_info['model_col']}")
    if format_info.get('title_col'):
        print(f"   Título: {format_info['title_col']}")
    print()
    
    # Parsear CSV
    print(f"📄 Procesando archivo: {file_path}")
    products_csv = parse_csv(file_path, format_info)
    
    if not products_csv:
        print("❌ No se encontraron productos válidos en el CSV")
        return
    
    print(f"✅ Encontrados {len(products_csv)} productos válidos en el CSV")
    print()
    
    # Obtener productos de la BD
    print("🔍 Obteniendo productos de la base de datos...")
    try:
        # Obtener TODOS los productos (no solo los que tienen SKU)
        # Esto nos permite buscar por múltiples campos
        all_products = []
        page_size = 1000
        offset = 0
        
        while True:
            response = supabase.table('marketplace_products').select('id,sku,price,title,external_code').range(offset, offset + page_size - 1).execute()
            page_products = response.data if response.data else []
            if not page_products:
                break
            all_products.extend(page_products)
            offset += page_size
            if len(page_products) < page_size:
                break
        
        db_products = all_products
        
        # Crear índices por SKU, external_code y título (para búsqueda flexible)
        sku_index: Dict[str, Dict] = {}
        external_code_index: Dict[str, Dict] = {}
        title_index: Dict[str, List[Dict]] = {}  # Lista porque puede haber múltiples productos con mismo título
        
        for product in db_products:
            # Índice por SKU
            sku = product.get('sku')
            if sku:
                sku_normalized = str(sku).upper().strip()
                if sku_normalized not in sku_index:
                    sku_index[sku_normalized] = product
                else:
                    # Preferir producto con precio 0 o más reciente
                    existing = sku_index[sku_normalized]
                    if product.get('price', 0) == 0 and existing.get('price', 0) > 0:
                        sku_index[sku_normalized] = product
            
            # Índice por external_code
            external_code = product.get('external_code')
            if external_code:
                ext_code_normalized = str(external_code).upper().strip()
                if ext_code_normalized not in external_code_index:
                    external_code_index[ext_code_normalized] = product
            
            # Índice por título (normalizado, para búsqueda parcial)
            title = product.get('title', '')
            if title:
                title_normalized = title.upper().strip()
                # Extraer palabras clave del título (primeras 3-4 palabras)
                title_words = title_normalized.split()[:4]
                title_key = ' '.join(title_words)
                if title_key not in title_index:
                    title_index[title_key] = []
                title_index[title_key].append(product)
        
        print(f"✅ Encontrados {len(db_products)} productos totales en la BD")
        print(f"✅ Índice por SKU: {len(sku_index)} productos")
        print(f"✅ Índice por external_code: {len(external_code_index)} productos")
        print(f"✅ Índice por título: {len(title_index)} grupos")
        print()
        
    except Exception as e:
        print(f"❌ Error obteniendo productos de la BD: {e}")
        return
    
    # Procesar productos
    updated = 0
    not_found = 0
    errors = 0
    skipped = 0
    
    print("📊 Procesando productos...")
    print()
    
    for idx, csv_product in enumerate(products_csv, 1):
        sku = csv_product['sku']
        new_price = csv_product['price']
        new_original_price = csv_product['original_price']
        row_num = csv_product['row']
        
        sku_normalized = sku.upper().strip()
        db_product = sku_index.get(sku_normalized)
        
        # Si no se encuentra por SKU, intentar buscar por external_code
        if not db_product:
            db_product = external_code_index.get(sku_normalized)
        
        # Si aún no se encuentra, intentar buscar por título (usando el título del CSV si está disponible)
        if not db_product and csv_product.get('title'):
            csv_title = csv_product['title'].upper().strip()
            title_words = csv_title.split()[:4]
            title_key = ' '.join(title_words)
            
            # Buscar en el índice de títulos
            if title_key in title_index:
                # Si hay múltiples productos con el mismo título, preferir el que tiene precio 0
                candidates = title_index[title_key]
                for candidate in candidates:
                    if candidate.get('price', 0) == 0:
                        db_product = candidate
                        break
                # Si no hay con precio 0, tomar el primero
                if not db_product and candidates:
                    db_product = candidates[0]
        
        if not db_product:
            not_found += 1
            if idx <= 10:
                print(f"  ⚠️  [{row_num}] SKU '{sku}' no encontrado en BD")
            continue
        
        product_id = db_product['id']
        current_price = db_product.get('price', 0)
        product_title = db_product.get('title', 'N/A')[:50]
        
        if idx <= 10:
            print(f"  [{row_num}] {product_title}...")
            print(f"      SKU: {sku}")
            print(f"      Precio actual: ${current_price:,.2f} → Nuevo: ${new_price:,.2f}")
            if new_original_price:
                print(f"      Precio original: ${new_original_price:,.2f}")
        
        if current_price == new_price and not new_original_price:
            skipped += 1
            if idx <= 10:
                print(f"      ⏭️  Sin cambios, omitiendo")
            continue
        
        if execute:
            try:
                update_data: Dict = {"price": new_price}
                if new_original_price:
                    update_data["original_price"] = new_original_price
                
                supabase.table('marketplace_products').update(update_data).eq('id', product_id).execute()
                updated += 1
                
                if idx <= 10:
                    print(f"      ✅ Actualizado")
            except Exception as e:
                errors += 1
                if idx <= 10:
                    print(f"      ❌ Error: {str(e)[:100]}")
        else:
            updated += 1
            if idx <= 10:
                print(f"      📝 (No actualizado - modo dry-run)")
        
        if idx % 50 == 0:
            print(f"\n📊 Progreso: {idx}/{len(products_csv)} productos procesados...")
            print(f"   ✅ Actualizados: {updated} | ⚠️  No encontrados: {not_found} | ❌ Errores: {errors} | ⏭️  Omitidos: {skipped}\n")
    
    print("\n" + "=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    print(f"✅ Actualizados: {updated}")
    print(f"⚠️  No encontrados (SKU no existe en BD): {not_found}")
    print(f"❌ Errores: {errors}")
    print(f"⏭️  Omitidos (sin cambios): {skipped}")
    print()
    
    if not_found > 0:
        print(f"💡 {not_found} productos del CSV no se encontraron en la BD.")
        print("   Verifica que los SKUs en el CSV coincidan con los de la BD.")
        print()
    
    if not execute:
        print("💡 Para aplicar cambios, ejecuta con --execute")
    else:
        print("✅ Cambios aplicados a la base de datos")


def main():
    parser = argparse.ArgumentParser(description='Procesar CSV de Syscom y actualizar precios')
    parser.add_argument('--file', type=str, help='Ruta al archivo CSV')
    parser.add_argument('--auto', action='store_true', help='Buscar CSV automáticamente en data/')
    parser.add_argument('--execute', action='store_true', help='Aplicar cambios a la base de datos')
    
    args = parser.parse_args()
    
    if args.auto:
        # Buscar CSV en data/
        csv_files = find_csv_files()
        
        if not csv_files:
            print("❌ No se encontraron archivos CSV en data/")
            print(f"   Directorio: {DATA_DIR}")
            print()
            print("💡 Guarda tu CSV en:")
            print(f"   {DATA_DIR}/productos.csv")
            print(f"   {DATA_DIR}/syscom_productos.csv")
            print(f"   {DATA_DIR}/precios.csv")
            return
        
        if len(csv_files) == 1:
            print(f"✅ Archivo CSV encontrado: {csv_files[0].name}")
            print()
            update_prices_from_csv(str(csv_files[0]), execute=args.execute)
        else:
            print("📁 Múltiples archivos CSV encontrados:")
            for i, csv_file in enumerate(csv_files, 1):
                print(f"   {i}. {csv_file.name}")
            print()
            choice = input("Selecciona el número del archivo a procesar: ")
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(csv_files):
                    update_prices_from_csv(str(csv_files[idx]), execute=args.execute)
                else:
                    print("❌ Selección inválida")
            except ValueError:
                print("❌ Entrada inválida")
    
    elif args.file:
        if not os.path.exists(args.file):
            print(f"❌ Archivo no encontrado: {args.file}")
            return
        
        update_prices_from_csv(args.file, execute=args.execute)
    
    else:
        print("❌ Debes especificar --file o --auto")
        print()
        print("Ejemplos:")
        print("  python3 scripts/process_syscom_csv.py --file data/productos.csv")
        print("  python3 scripts/process_syscom_csv.py --auto")
        print("  python3 scripts/process_syscom_csv.py --auto --execute")


if __name__ == "__main__":
    main()

