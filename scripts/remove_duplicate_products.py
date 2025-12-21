#!/usr/bin/env python3
"""
Script para identificar y eliminar productos duplicados por SKU y external_code
Mantiene el producto más reciente o el que tenga mejor información
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict
from typing import Dict, List

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def score_product(product: Dict) -> int:
    """
    Calcula un score para determinar qué producto mantener.
    Mayor score = mejor producto para mantener
    """
    score = 0
    
    # Preferir productos con precio > 0
    if product.get('price', 0) > 0:
        score += 100
    
    # Preferir productos con más imágenes
    images = product.get('images', [])
    if isinstance(images, list):
        score += len(images) * 10
    
    # Preferir productos con descripción más larga
    description = product.get('description', '')
    if description:
        score += min(len(description) // 10, 50)
    
    # Preferir productos más recientes (timestamp más alto)
    created_at = product.get('created_at', '')
    if created_at:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            score += int(dt.timestamp())
        except:
            pass
    
    return score


def find_duplicates_by_sku() -> Dict[str, List[Dict]]:
    """Encuentra productos duplicados por SKU"""
    print("🔍 Buscando duplicados por SKU...")
    
    response = supabase.table('marketplace_products').select(
        'id,title,sku,external_code,price,images,description,created_at,status'
    ).not_.is_('sku', 'null').neq('sku', '').eq('status', 'active').execute()
    
    productos = response.data
    print(f"   Total productos con SKU: {len(productos)}")
    
    # Agrupar por SKU normalizado
    sku_groups = defaultdict(list)
    for producto in productos:
        sku = str(producto.get('sku', '')).strip().upper()
        if sku:
            sku_groups[sku].append(producto)
    
    # Filtrar solo los que tienen duplicados
    duplicados = {sku: prods for sku, prods in sku_groups.items() if len(prods) > 1}
    
    print(f"   SKUs con duplicados: {len(duplicados)}")
    return duplicados


def find_duplicates_by_external_code() -> Dict[str, List[Dict]]:
    """Encuentra productos duplicados por external_code"""
    print("🔍 Buscando duplicados por external_code...")
    
    response = supabase.table('marketplace_products').select(
        'id,title,sku,external_code,price,images,description,created_at,status'
    ).not_.is_('external_code', 'null').neq('external_code', '').eq('status', 'active').execute()
    
    productos = response.data
    print(f"   Total productos con external_code: {len(productos)}")
    
    # Agrupar por external_code normalizado
    code_groups = defaultdict(list)
    for producto in productos:
        external_code = str(producto.get('external_code', '')).strip()
        if external_code:
            code_groups[external_code].append(producto)
    
    # Filtrar solo los que tienen duplicados
    duplicados = {code: prods for code, prods in code_groups.items() if len(prods) > 1}
    
    print(f"   External codes con duplicados: {len(duplicados)}")
    return duplicados


def remove_duplicates(duplicados: Dict[str, List[Dict]], by_field: str, execute: bool = False):
    """Elimina productos duplicados, manteniendo el mejor"""
    print(f"\n{'🔴 ELIMINANDO' if execute else '🔍 IDENTIFICANDO'} duplicados por {by_field}...")
    print("=" * 80)
    
    to_delete = []
    to_keep = []
    
    for key, productos in duplicados.items():
        # Ordenar por score (mejor primero)
        productos_sorted = sorted(productos, key=score_product, reverse=True)
        
        # Mantener el primero (mejor)
        keep_product = productos_sorted[0]
        to_keep.append(keep_product)
        
        # Marcar los demás para eliminar
        for dup_product in productos_sorted[1:]:
            to_delete.append({
                'id': dup_product['id'],
                'title': dup_product.get('title', 'N/A')[:50],
                'key': key,
                'keep_id': keep_product['id'],
                'keep_title': keep_product.get('title', 'N/A')[:50]
            })
    
    print(f"\n📊 RESUMEN:")
    print(f"   Total grupos duplicados: {len(duplicados)}")
    print(f"   Productos a mantener: {len(to_keep)}")
    print(f"   Productos a eliminar: {len(to_delete)}")
    
    if to_delete:
        print(f"\n📋 PRODUCTOS A ELIMINAR (primeros 10):")
        for i, dup in enumerate(to_delete[:10], 1):
            print(f"\n{i}. {by_field}: {dup['key']}")
            print(f"   ❌ Eliminar: {dup['id']} - {dup['title']}")
            print(f"   ✅ Mantener: {dup['keep_id']} - {dup['keep_title']}")
    
    if execute and to_delete:
        print(f"\n🗑️  Eliminando {len(to_delete)} productos duplicados...")
        deleted_count = 0
        error_count = 0
        
        for dup in to_delete:
            try:
                # Soft delete: cambiar status a 'deleted'
                result = supabase.table('marketplace_products').update({
                    'status': 'deleted'
                }).eq('id', dup['id']).execute()
                
                if result.data:
                    deleted_count += 1
                    print(f"   ✅ Eliminado: {dup['id']} - {dup['title'][:40]}...")
                else:
                    error_count += 1
                    print(f"   ❌ Error eliminando: {dup['id']}")
            except Exception as e:
                error_count += 1
                print(f"   ❌ Error: {dup['id']} - {str(e)[:100]}")
        
        print(f"\n✅ Eliminados: {deleted_count}")
        print(f"❌ Errores: {error_count}")
    
    return len(to_delete)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Eliminar productos duplicados')
    parser.add_argument('--execute', action='store_true', help='Ejecutar eliminación (por defecto es dry-run)')
    parser.add_argument('--by-sku', action='store_true', help='Buscar duplicados por SKU')
    parser.add_argument('--by-external-code', action='store_true', help='Buscar duplicados por external_code')
    args = parser.parse_args()
    
    if not args.execute:
        print("⚠️  Modo DRY RUN - No se realizarán cambios")
        print("💡 Usa --execute para eliminar duplicados")
        print()
    
    total_deleted = 0
    
    # Por defecto, buscar por ambos campos
    if not args.by_sku and not args.by_external_code:
        args.by_sku = True
        args.by_external_code = True
    
    if args.by_sku:
        print("\n" + "=" * 80)
        print("DUPLICADOS POR SKU")
        print("=" * 80)
        duplicados_sku = find_duplicates_by_sku()
        if duplicados_sku:
            total_deleted += remove_duplicates(duplicados_sku, 'SKU', args.execute)
        else:
            print("✅ No se encontraron duplicados por SKU")
    
    if args.by_external_code:
        print("\n" + "=" * 80)
        print("DUPLICADOS POR EXTERNAL_CODE")
        print("=" * 80)
        duplicados_external = find_duplicates_by_external_code()
        if duplicados_external:
            total_deleted += remove_duplicates(duplicados_external, 'external_code', args.execute)
        else:
            print("✅ No se encontraron duplicados por external_code")
    
    print("\n" + "=" * 80)
    print("RESUMEN FINAL")
    print("=" * 80)
    print(f"Total productos duplicados encontrados: {total_deleted}")
    if not args.execute:
        print("\n💡 Para ejecutar la eliminación:")
        print("   python3 scripts/remove_duplicate_products.py --execute")


if __name__ == "__main__":
    main()

