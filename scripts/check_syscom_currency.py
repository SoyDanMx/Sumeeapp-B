#!/usr/bin/env python3
"""
Script para verificar la respuesta de la API de Syscom y determinar la moneda
"""
import os
import sys
import requests
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

SYSCOM_CLIENT_ID = os.environ.get('SYSCOM_CLIENT_ID')
SYSCOM_CLIENT_SECRET = os.environ.get('SYSCOM_CLIENT_SECRET')

print("=" * 80)
print("VERIFICACIÓN DE API SYSCOM - MONEDA")
print("=" * 80)
print()

# Obtener token
print("1️⃣ Obteniendo token...")
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
        print(f"   ✅ Token obtenido")
    else:
        print(f"   ❌ Error: {response.status_code}")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Excepción: {e}")
    sys.exit(1)

print()
print("2️⃣ Consultando producto específico (Rotomartillo - 244548)...")

# Consultar el rotomartillo que muestra precio incorrecto
product_id = "244548"

try:
    response = requests.get(
        f"https://developers.syscom.mx/api/v1/productos/{product_id}",
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"   ✅ Producto encontrado")
        print()
        print("📦 DATOS DEL PRODUCTO:")
        print(f"   Título: {data.get('titulo', 'N/A')[:60]}...")
        print(f"   Producto ID: {data.get('producto_id', 'N/A')}")
        print()
        
        print("💰 PRECIOS:")
        precios = data.get('precios', {})
        
        for key, value in precios.items():
            print(f"   {key}: {value}")
        
        print()
        print("🔍 INFORMACIÓN DE MONEDA:")
        
        # Buscar cualquier referencia a moneda en la respuesta
        import json
        full_response = json.dumps(data, indent=2)
        
        if 'moneda' in full_response.lower():
            print("   ✅ Se encontró campo 'moneda'")
            # Buscar el campo específico
            for key in data.keys():
                if 'moneda' in key.lower():
                    print(f"      {key}: {data[key]}")
        
        if 'currency' in full_response.lower():
            print("   ✅ Se encontró campo 'currency'")
            for key in data.keys():
                if 'currency' in key.lower():
                    print(f"      {key}: {data[key]}")
        
        if 'usd' in full_response.lower():
            print("   ℹ️  Se encontró referencia a 'USD' en la respuesta")
        
        if 'mxn' in full_response.lower():
            print("   ℹ️  Se encontró referencia a 'MXN' en la respuesta")
            
        if 'moneda' not in full_response.lower() and 'currency' not in full_response.lower():
            print("   ⚠️  NO se encontró información de moneda en la respuesta")
            print()
            print("   💡 ANÁLISIS DEL PRECIO:")
            precio_lista = precios.get('precio_lista', 0)
            precio_especial = precios.get('precio_especial', 0)
            precio_1 = precios.get('precio_1', 0)
            
            precio_final = precio_especial or precio_1 or precio_lista
            
            if precio_final > 1000:
                print(f"      El precio ${precio_final:.2f} parece estar en MXN (>$1000)")
                print("      Productos típicos de Syscom en USD raramente superan $1000")
            elif precio_final > 100:
                print(f"      El precio ${precio_final:.2f} es ambiguo (podría ser USD o MXN)")
            else:
                print(f"      El precio ${precio_final:.2f} parece estar en USD (<$100)")
                
    else:
        print(f"   ❌ Error: {response.status_code}")
        
except Exception as e:
    print(f"   ❌ Excepción: {e}")

print()
print("=" * 80)
print("3️⃣ Consultando producto con precio bajo (para comparación)...")

# Consultar un producto con precio bajo
product_id_low = "231530"  # Interruptor - $236.88

try:
    response = requests.get(
        f"https://developers.syscom.mx/api/v1/productos/{product_id_low}",
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"   ✅ Producto encontrado")
        print(f"   Título: {data.get('titulo', 'N/A')[:60]}...")
        print()
        print("💰 PRECIOS:")
        precios = data.get('precios', {})
        
        for key, value in precios.items():
            print(f"   {key}: {value}")
            
except Exception as e:
    print(f"   ❌ Excepción: {e}")

print()
print("=" * 80)
print("CONCLUSIÓN")
print("=" * 80)
print()
print("La API de Syscom probablemente retorna precios en MXN")
print("Los precios altos (>$1000) definitivamente son MXN")
print("Los precios bajos (<$500) podrían ser USD o MXN - necesitamos confirmar")

