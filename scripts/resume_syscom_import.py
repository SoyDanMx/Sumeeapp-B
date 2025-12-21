#!/usr/bin/env python3
"""
Script para reanudar la importación de productos de Syscom desde donde se quedó.
Útil cuando el script principal falla por timeout o interrupciones.
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Categorías y sus IDs de Syscom
CATEGORIAS = {
    '22': {'nombre': 'Videovigilancia', 'total_paginas': 137},
    '26': {'nombre': 'Redes e IT', 'total_paginas': 144},
    '30': {'nombre': 'Energía / Herramientas', 'total_paginas': 107},
}

def check_import_status():
    """Verifica cuántos productos se han importado de cada categoría"""
    cat_response = supabase.table('marketplace_categories').select('id').eq('slug', 'sistemas').single().execute()
    
    if not cat_response.data:
        print("❌ Categoría 'sistemas' no encontrada")
        return
    
    categoria_id = cat_response.data['id']
    
    print("=" * 80)
    print("ESTADO DE IMPORTACIÓN DE PRODUCTOS SYSCOM")
    print("=" * 80)
    print()
    
    total_importados = 0
    
    for cat_id, cat_info in CATEGORIAS.items():
        # Contar productos con external_code que empiecen con números típicos de Syscom
        # (Los IDs de Syscom son numéricos)
        count_response = supabase.table('marketplace_products').select('id', count='exact').eq('category_id', categoria_id).not_.is_('external_code', 'null').execute()
        
        # Estimación: asumimos distribución uniforme (no perfecto pero útil)
        estimated = count_response.count // 3  # Dividir entre 3 categorías
        
        print(f"📦 {cat_info['nombre']} (ID: {cat_id}):")
        print(f"   Productos estimados importados: ~{estimated}")
        print(f"   Páginas totales: {cat_info['total_paginas']}")
        print(f"   Productos por página: ~60")
        print(f"   Total esperado: ~{cat_info['total_paginas'] * 60}")
        print()
        
        total_importados += estimated
    
    # Contar total real
    total_real = supabase.table('marketplace_products').select('id', count='exact').eq('category_id', categoria_id).not_.is_('external_code', 'null').execute()
    
    print("=" * 80)
    print(f"📊 Total de productos Syscom importados: {total_real.count}")
    print(f"📊 Total esperado: ~23,145")
    print(f"📊 Progreso: {(total_real.count / 23145) * 100:.1f}%")
    print("=" * 80)
    print()
    
    if total_real.count < 23145:
        print("💡 Para continuar la importación:")
        print("   python3 scripts/import_all_syscom_products.py --execute")
        print()
        print("💡 Para importar solo una categoría específica:")
        print("   python3 scripts/import_all_syscom_products.py --execute --category 22  # Videovigilancia")
        print("   python3 scripts/import_all_syscom_products.py --execute --category 26  # Redes e IT")
        print("   python3 scripts/import_all_syscom_products.py --execute --category 30  # Energía")

if __name__ == "__main__":
    check_import_status()

