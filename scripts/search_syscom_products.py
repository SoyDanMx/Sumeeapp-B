#!/usr/bin/env python3
"""
Script para buscar productos de Syscom en la categoría sistemas
y verificar si hay cámaras termográficas disponibles.
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_KEY no configuradas")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def search_syscom_in_sistemas():
    """Busca productos de Syscom en la categoría sistemas"""
    print("=" * 80)
    print("BÚSQUEDA DE PRODUCTOS SYSCOM EN CATEGORÍA SISTEMAS")
    print("=" * 80)
    print()
    
    # Obtener ID de categoría sistemas
    cat_response = supabase.table('marketplace_categories').select('*').eq('slug', 'sistemas').single().execute()
    
    if not cat_response.data:
        print("❌ Error: No se encontró la categoría 'sistemas'")
        return
    
    cat_id = cat_response.data['id']
    print(f"✅ Categoría sistemas encontrada: {cat_id}")
    print()
    
    # Contar total de productos en sistemas
    count_response = supabase.table('marketplace_products').select('*', count='exact').eq('category_id', cat_id).eq('status', 'active').execute()
    total_products = count_response.count or 0
    print(f"📊 Total de productos en sistemas: {total_products}")
    print()
    
    # Buscar productos que mencionen Syscom
    print("🔍 Buscando productos que mencionen 'Syscom'...")
    syscom_response = supabase.table('marketplace_products').select('id,title,description,price,images').eq('category_id', cat_id).eq('status', 'active').or_('title.ilike.%syscom%,description.ilike.%syscom%').limit(20).execute()
    
    syscom_products = syscom_response.data or []
    print(f"✅ Encontrados {len(syscom_products)} productos que mencionan Syscom")
    print()
    
    if syscom_products:
        print("=" * 80)
        print("PRODUCTOS SYSCOM ENCONTRADOS:")
        print("=" * 80)
        for idx, product in enumerate(syscom_products[:10], 1):
            print(f"\n{idx}. {product['title'][:80]}")
            print(f"   Precio: ${product['price']}")
            print(f"   ID: {product['id']}")
            if product.get('images'):
                print(f"   Imágenes: {len(product['images'])} disponible(s)")
    
    # Buscar específicamente cámaras termográficas
    print("\n" + "=" * 80)
    print("BÚSQUEDA ESPECÍFICA DE CÁMARAS TERMOGRÁFICAS:")
    print("=" * 80)
    print()
    
    thermal_terms = [
        'termografica',
        'termográfica', 
        'thermal',
        'cámara térmica',
        'camara termica',
        'flir',
        'hikvision thermal',
        'thermal camera'
    ]
    
    thermal_products = []
    seen_ids = set()
    
    for term in thermal_terms:
        print(f"Buscando: '{term}'...")
        # Buscar en título
        title_results = supabase.table('marketplace_products').select('id,title,price').eq('category_id', cat_id).eq('status', 'active').ilike('title', f'%{term}%').limit(10).execute()
        # Buscar en descripción
        desc_results = supabase.table('marketplace_products').select('id,title,price').eq('category_id', cat_id).eq('status', 'active').ilike('description', f'%{term}%').limit(10).execute()
        
        results = []
        for item in (title_results.data or []):
            if item['id'] not in seen_ids:
                results.append(item)
                seen_ids.add(item['id'])
        for item in (desc_results.data or []):
            if item['id'] not in seen_ids:
                results.append(item)
                seen_ids.add(item['id'])
        
        if results:
            print(f"  ✅ Encontrados {len(results)} productos")
            thermal_products.extend(results)
        else:
            print(f"  ❌ No encontrados")
    
    print()
    print("=" * 80)
    print(f"RESUMEN:")
    print("=" * 80)
    print(f"📊 Total productos en sistemas: {total_products}")
    print(f"🏢 Productos Syscom encontrados: {len(syscom_products)}")
    print(f"📷 Cámaras termográficas encontradas: {len(thermal_products)}")
    print()
    
    if len(thermal_products) == 0:
        print("❌ CONCLUSIÓN: No hay cámaras termográficas en la base de datos")
        print()
        print("💡 RECOMENDACIONES:")
        print("1. Verificar en Syscom web si tienen cámaras termográficas:")
        print("   https://www.syscom.mx/search?q=termografica")
        print("   https://www.syscom.mx/search?q=camara+termica")
        print()
        print("2. Si existen en Syscom pero no en la base de datos:")
        print("   - Verificar si hay un proceso de importación de Syscom")
        print("   - Contactar a Syscom para obtener catálogo de productos")
        print("   - Crear script de importación si tienen API disponible")
        print()
        print("3. Si no existen en Syscom:")
        print("   - Buscar proveedores alternativos")
        print("   - Agregar productos manualmente si son específicos")
    else:
        print("✅ Cámaras termográficas encontradas:")
        for idx, product in enumerate(thermal_products[:5], 1):
            print(f"  {idx}. {product['title'][:70]}")

if __name__ == "__main__":
    search_syscom_in_sistemas()

