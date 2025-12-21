#!/usr/bin/env python3
"""
Script para buscar cámaras termográficas en la base de datos del marketplace
y verificar si hay productos de Syscom relacionados.
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_KEY no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Términos de búsqueda para cámaras termográficas
SEARCH_TERMS = [
    "termografica",
    "termográfica",
    "thermal",
    "cámara térmica",
    "camara termica",
    "infrarroja",
    "infrared",
    "flir",
    "hikvision thermal",
    "thermal camera",
    "cámara termográfica",
    "termografía"
]

def search_thermal_cameras():
    """Busca productos relacionados con cámaras termográficas"""
    print("🔍 Buscando cámaras termográficas en el marketplace...\n")
    
    all_results = []
    
    for term in SEARCH_TERMS:
        print(f"Buscando: '{term}'...")
        
        # Buscar en título
        response_title = supabase.table('marketplace_products').select('*').ilike('title', f'%{term}%').eq('status', 'active').limit(50).execute()
        
        # Buscar en descripción
        response_desc = supabase.table('marketplace_products').select('*').ilike('description', f'%{term}%').eq('status', 'active').limit(50).execute()
        
        # Combinar resultados
        results = []
        seen_ids = set()
        
        for item in (response_title.data or []):
            if item['id'] not in seen_ids:
                results.append(item)
                seen_ids.add(item['id'])
        
        for item in (response_desc.data or []):
            if item['id'] not in seen_ids:
                results.append(item)
                seen_ids.add(item['id'])
        
        if results:
            print(f"  ✅ Encontrados {len(results)} productos con '{term}'")
            all_results.extend(results)
        else:
            print(f"  ❌ No se encontraron productos con '{term}'")
    
    # Eliminar duplicados
    unique_results = {}
    for item in all_results:
        if item['id'] not in unique_results:
            unique_results[item['id']] = item
    
    print(f"\n📊 Total de productos únicos encontrados: {len(unique_results)}\n")
    
    if unique_results:
        print("=" * 80)
        print("PRODUCTOS ENCONTRADOS:")
        print("=" * 80)
        
        for idx, (product_id, product) in enumerate(unique_results.items(), 1):
            print(f"\n{idx}. {product['title']}")
            print(f"   ID: {product['id']}")
            print(f"   Precio: ${product['price']}")
            print(f"   Categoría: {product['category_id']}")
            print(f"   Descripción: {product['description'][:100]}..." if len(product.get('description', '')) > 100 else f"   Descripción: {product.get('description', 'N/A')}")
            if product.get('images'):
                print(f"   Imágenes: {len(product['images'])} disponible(s)")
            print(f"   URL: https://sumee.app/marketplace/{product['id']}")
    else:
        print("❌ No se encontraron cámaras termográficas en la base de datos actual.")
        print("\n💡 Recomendaciones:")
        print("1. Verificar si Syscom tiene estos productos en su catálogo web")
        print("2. Crear un script de importación desde Syscom si tienen API disponible")
        print("3. Agregar productos manualmente si son productos específicos")
    
    return list(unique_results.values())

def check_syscom_products():
    """Verifica si hay productos de Syscom en la base de datos"""
    print("\n" + "=" * 80)
    print("VERIFICANDO PRODUCTOS DE SYSCOM:")
    print("=" * 80)
    
    # Buscar productos que mencionen Syscom
    response = supabase.table('marketplace_products').select('*').or_('title.ilike.%syscom%,description.ilike.%syscom%').eq('status', 'active').limit(20).execute()
    
    if response.data:
        print(f"\n✅ Encontrados {len(response.data)} productos relacionados con Syscom:")
        for product in response.data[:5]:  # Mostrar solo los primeros 5
            print(f"  - {product['title']}")
    else:
        print("\n❌ No se encontraron productos explícitamente marcados como Syscom")
    
    return response.data if response.data else []

if __name__ == "__main__":
    print("=" * 80)
    print("BÚSQUEDA DE CÁMARAS TERMOGRÁFICAS EN MARKETPLACE")
    print("=" * 80)
    print()
    
    # Buscar cámaras termográficas
    thermal_products = search_thermal_cameras()
    
    # Verificar productos de Syscom
    syscom_products = check_syscom_products()
    
    print("\n" + "=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    print(f"📷 Cámaras termográficas encontradas: {len(thermal_products)}")
    print(f"🏢 Productos Syscom encontrados: {len(syscom_products)}")
    
    if len(thermal_products) == 0:
        print("\n💡 PRÓXIMOS PASOS:")
        print("1. Verificar en Syscom web si tienen cámaras termográficas:")
        print("   https://www.syscom.mx/search?q=termografica")
        print("2. Si existen en Syscom pero no en la API, contactar soporte técnico de Syscom")
        print("3. Considerar agregar productos manualmente si son específicos")
        print("4. Revisar si hay una categoría específica en Syscom para estos productos")

