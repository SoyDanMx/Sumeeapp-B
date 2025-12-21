#!/usr/bin/env python3
"""
Script de prueba para verificar conexión con API Syscom y Supabase
"""
import os
import sys
import requests
from pathlib import Path

# Cargar variables de entorno manualmente
env_file = Path(__file__).parent.parent / '.env.local'
if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ[key] = value

SYSCOM_CLIENT_ID = os.environ.get('SYSCOM_CLIENT_ID')
SYSCOM_CLIENT_SECRET = os.environ.get('SYSCOM_CLIENT_SECRET')
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

print("=" * 80)
print("TEST DE CONEXIÓN SYSCOM + SUPABASE")
print("=" * 80)
print()

# Test 1: Verificar variables de entorno
print("1️⃣  Verificando variables de entorno...")
if all([SYSCOM_CLIENT_ID, SYSCOM_CLIENT_SECRET, SUPABASE_URL, SUPABASE_KEY]):
    print("   ✅ Todas las variables están presentes")
    print(f"   - SYSCOM_CLIENT_ID: {SYSCOM_CLIENT_ID[:20]}...")
    print(f"   - SUPABASE_URL: {SUPABASE_URL}")
else:
    print("   ❌ Faltan variables de entorno")
    sys.exit(1)

print()

# Test 2: Obtener token de Syscom
print("2️⃣  Obteniendo token de acceso de Syscom...")
try:
    response = requests.post(
        "https://developers.syscom.mx/oauth/token",
        data={
            'client_id': SYSCOM_CLIENT_ID,
            'client_secret': SYSCOM_CLIENT_SECRET,
            'grant_type': 'client_credentials'
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        timeout=30
    )
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        print(f"   ✅ Token obtenido: {access_token[:30]}...")
    else:
        print(f"   ❌ Error {response.status_code}: {response.text}")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Excepción: {e}")
    sys.exit(1)

print()

# Test 3: Buscar un producto en Syscom API
print("3️⃣  Buscando producto de prueba en API Syscom...")
try:
    response = requests.get(
        "https://developers.syscom.mx/api/v1/productos",
        params={'busqueda': 'camara', 'pagina': 1},
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        total = data.get('cantidad', 0)
        productos = data.get('productos', [])
        print(f"   ✅ Encontrados {total} productos")
        if productos:
            primer_producto = productos[0]
            print(f"   - Ejemplo: {primer_producto.get('titulo', 'N/A')}")
            print(f"   - Precio: ${primer_producto.get('precios', {}).get('precio_lista', 'N/A')}")
    else:
        print(f"   ❌ Error {response.status_code}: {response.text}")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Excepción: {e}")
    sys.exit(1)

print()

# Test 4: Conectar a Supabase
print("4️⃣  Conectando a Supabase...")
try:
    from supabase import create_client, Client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Contar productos con precio 0
    response = supabase.table('marketplace_products').select(
        'id', count='exact'
    ).eq('price', 0).execute()
    
    total_sin_precio = response.count if hasattr(response, 'count') else 0
    print(f"   ✅ Conectado a Supabase")
    print(f"   - Productos con precio 0: {total_sin_precio}")
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

print()
print("=" * 80)
print("✅ TODAS LAS PRUEBAS PASARON")
print("=" * 80)
print()
print("Puedes proceder con la actualización de precios.")

