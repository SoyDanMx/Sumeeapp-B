#!/usr/bin/env python3
"""
Script para verificar los precios de productos Syscom
"""
import os
import sys
from pathlib import Path

# Cargar variables de entorno
env_file = Path(__file__).parent.parent / '.env.local'
if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip().strip('"').strip("'")

from supabase import create_client, Client

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("VERIFICACIÓN DE PRECIOS SYSCOM")
print("=" * 80)
print()

# Obtener productos de ejemplo de Syscom
print("📊 Productos de Syscom (con external_code):")
response = supabase.table('marketplace_products').select(
    'id,title,price,external_code'
).eq('status', 'active').gt('price', 0).not_.is_('external_code', 'null').limit(10).execute()

print(f"   Mostrando {len(response.data)} productos de ejemplo:")
print()

for product in response.data:
    title = product['title'][:60]
    price = product['price']
    code = product['external_code']
    print(f"   • {title}...")
    print(f"     Precio en BD: ${price:.2f}")
    print(f"     External Code: {code}")
    print()

print("=" * 80)
print("ANÁLISIS")
print("=" * 80)
print()
print("Si los precios son < $100 USD, probablemente están en USD")
print("Si los precios son > $1000 MXN, probablemente están en MXN")
print()
print("Tasa aproximada: 1 USD = ~20 MXN")

