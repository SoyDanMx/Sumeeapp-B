#!/usr/bin/env python3
"""
Script para actualizar precios de productos desde un archivo CSV
El CSV debe tener columnas: sku, precio (y opcionalmente precio_original)

Uso:
    python3 scripts/update_prices_from_csv.py --file productos.csv --execute
"""

import os
import sys
import csv
import argparse
from typing import Dict, List, Optional
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    print("❌ Error: Se requiere supabase-py")
    print("   Instalar con: pip install supabase")
    sys.exit(1)

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno no configuradas")
    print("   Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY")
    print("   Asegúrate de tener un archivo .env.local en la raíz del proyecto")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_csv(file_path: str) -> List[Dict]:
    """
    Parsea el archivo CSV y retorna una lista de diccionarios
    
    Formatos esperados:
    1. sku, precio
    2. sku, precio, precio_original
    3. SKU, Precio (con mayúsculas)
    """
    products = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Detectar delimitador (coma o punto y coma)
            sample = f.read(1024)
            f.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.DictReader(f, delimiter=delimiter)
            
            # Normalizar nombres de columnas (case-insensitive)
            fieldnames = [field.lower().strip() for field in reader.fieldnames]
            reader.fieldnames = fieldnames
            
            # Buscar columnas de SKU y precio
            sku_col = None
            price_col = None
            original_price_col = None
            
            for col in fieldnames:
                if 'sku' in col:
                    sku_col = col
                elif 'precio' in col and 'original' not in col and 'lista' not in col:
                    price_col = col
                elif 'original' in col or 'lista' in col:
                    original_price_col = col
            
            if not sku_col:
                print("❌ Error: No se encontró columna 'sku' en el CSV")
                print(f"   Columnas encontradas: {', '.join(fieldnames)}")
                sys.exit(1)
            
            if not price_col:
                print("❌ Error: No se encontró columna 'precio' en el CSV")
                print(f"   Columnas encontradas: {', '.join(fieldnames)}")
                sys.exit(1)
            
            print(f"✅ Columnas detectadas:")
            print(f"   SKU: {sku_col}")
            print(f"   Precio: {price_col}")
            if original_price_col:
                print(f"   Precio Original: {original_price_col}")
            print()
            
            for row_num, row in enumerate(reader, start=2):  # Empezar en 2 (después del header)
                sku = row.get(sku_col, '').strip()
                price_str = row.get(price_col, '').strip()
                original_price_str = row.get(original_price_col, '').strip() if original_price_col else None
                
                # Validar SKU
                if not sku:
                    print(f"⚠️  Fila {row_num}: SKU vacío, omitiendo...")
                    continue
                
                # Validar y convertir precio
                try:
                    # Limpiar precio (remover $, comas, espacios)
                    price_clean = price_str.replace('$', '').replace(',', '').replace(' ', '')
                    price = float(price_clean)
                    
                    if price <= 0:
                        print(f"⚠️  Fila {row_num}: Precio inválido ({price_str}), omitiendo...")
                        continue
                except (ValueError, AttributeError):
                    print(f"⚠️  Fila {row_num}: Precio inválido ({price_str}), omitiendo...")
                    continue
                
                # Validar y convertir precio original (si existe)
                original_price = None
                if original_price_str:
                    try:
                        original_price_clean = original_price_str.replace('$', '').replace(',', '').replace(' ', '')
                        original_price = float(original_price_clean)
                        
                        if original_price <= 0 or original_price <= price:
                            original_price = None  # Solo usar si es mayor que el precio principal
                    except (ValueError, AttributeError):
                        pass  # Ignorar si no se puede parsear
                
                products.append({
                    'sku': sku,
                    'price': price,
                    'original_price': original_price,
                    'row': row_num
                })
        
        return products
    
    except FileNotFoundError:
        print(f"❌ Error: Archivo no encontrado: {file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error leyendo CSV: {e}")
        sys.exit(1)

def update_prices_from_csv(file_path: str, execute: bool = False):
    """
    Actualiza precios desde un archivo CSV
    
    Args:
        file_path: Ruta al archivo CSV
        execute: Si es True, actualiza la BD. Si es False, solo muestra resultados
    """
    print("=" * 80)
    print("ACTUALIZACIÓN DE PRECIOS DESDE CSV")
    print("=" * 80)
    print()
    
    if not execute:
        print("⚠️  MODO DRY-RUN: No se actualizará la base de datos")
        print("   Usa --execute para aplicar cambios")
        print()
    
    # Parsear CSV
    print(f"📄 Leyendo archivo: {file_path}")
    products_csv = parse_csv(file_path)
    
    if not products_csv:
        print("❌ No se encontraron productos válidos en el CSV")
        return
    
    print(f"✅ Encontrados {len(products_csv)} productos en el CSV")
    print()
    
    # Obtener todos los productos de la BD con SKU para crear un índice
    print("🔍 Obteniendo productos de la base de datos...")
    try:
        response = supabase.table('marketplace_products').select('id,sku,price,title').not_.is_('sku', 'null').execute()
        db_products = response.data if response.data else []
        
        # Crear índice por SKU para búsqueda rápida
        sku_index: Dict[str, Dict] = {}
        for product in db_products:
            sku = product.get('sku')
            if sku:
                # Normalizar SKU (mayúsculas, sin espacios)
                sku_normalized = str(sku).upper().strip()
                # Permitir múltiples productos con el mismo SKU (tomar el primero o el más reciente)
                if sku_normalized not in sku_index:
                    sku_index[sku_normalized] = product
                else:
                    # Si hay duplicados, preferir el que tiene precio 0 o el más reciente
                    existing = sku_index[sku_normalized]
                    if product.get('price', 0) == 0 and existing.get('price', 0) > 0:
                        sku_index[sku_normalized] = product
        
        print(f"✅ Encontrados {len(sku_index)} productos únicos con SKU en la BD")
        print()
        
    except Exception as e:
        print(f"❌ Error obteniendo productos de la BD: {e}")
        return
    
    # Procesar productos del CSV
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
        
        # Normalizar SKU para búsqueda
        sku_normalized = sku.upper().strip()
        
        # Buscar producto en BD
        db_product = sku_index.get(sku_normalized)
        
        if not db_product:
            not_found += 1
            if idx <= 10:
                print(f"  ⚠️  [{row_num}] SKU '{sku}' no encontrado en BD")
            continue
        
        product_id = db_product['id']
        current_price = db_product.get('price', 0)
        product_title = db_product.get('title', 'N/A')[:50]
        
        # Mostrar información
        if idx <= 10:
            print(f"  [{row_num}] {product_title}...")
            print(f"      SKU: {sku}")
            print(f"      Precio actual: ${current_price:,.2f} → Nuevo: ${new_price:,.2f}")
            if new_original_price:
                print(f"      Precio original: ${new_original_price:,.2f}")
        
        # Verificar si necesita actualización
        if current_price == new_price and not new_original_price:
            skipped += 1
            if idx <= 10:
                print(f"      ⏭️  Sin cambios, omitiendo")
            continue
        
        if execute:
            try:
                update_data: Dict = {
                    "price": new_price,
                }
                
                if new_original_price:
                    update_data["original_price"] = new_original_price
                elif current_price == 0:
                    # Si el precio actual es 0, no establecer original_price
                    pass
                
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Actualizar precios desde CSV')
    parser.add_argument('--file', type=str, required=True, help='Ruta al archivo CSV')
    parser.add_argument('--execute', action='store_true', help='Aplicar cambios a la base de datos')
    
    args = parser.parse_args()
    
    update_prices_from_csv(args.file, execute=args.execute)

