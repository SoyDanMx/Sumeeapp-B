#!/usr/bin/env python3
"""
Script para verificar y corregir precios erróneos en la base de datos
Detecta precios que fueron incorrectamente convertidos de USD a MXN
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno no configuradas")
    print("Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

def check_price_issues():
    """Verifica precios sospechosos en la base de datos"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("🔍 Verificando precios en la base de datos...\n")
    
    # 1. Productos con external_code (Syscom) - deberían tener precios en USD (relativamente bajos)
    print("📊 Productos de Syscom (con external_code):")
    syscom_response = supabase.table('marketplace_products')\
        .select('id, title, price, external_code, sku')\
        .not_('external_code', 'is', None)\
        .eq('status', 'active')\
        .gt('price', 0)\
        .order('price', desc=True)\
        .limit(20)
    
    syscom_products = syscom_response.execute()
    
    if syscom_products.data and len(syscom_products.data) > 0:
        print(f"   Total productos Syscom activos: {len(syscom_products.data)}")
        print("\n   Top 10 precios más altos (Syscom - deberían estar en USD):")
        for idx, product in enumerate(syscom_products.data[:10], 1):
            price = float(product.get('price', 0))
            # Si el precio es > 10,000, probablemente está en MXN cuando debería estar en USD
            is_suspicious = price > 10000
            status = "⚠️ SOSPECHOSO" if is_suspicious else "✅ OK"
            print(f"   {idx}. {status} ${price:,.2f} - {product.get('title', '')[:60]}")
            if product.get('sku'):
                print(f"      SKU: {product.get('sku')}")
    else:
        print("   No se encontraron productos de Syscom")
    
    print("\n" + "="*80 + "\n")
    
    # 2. Productos sin external_code (Truper/otros) - deberían tener precios en MXN
    print("📊 Productos NO-Syscom (sin external_code):")
    non_syscom_response = supabase.table('marketplace_products')\
        .select('id, title, price, external_code, sku')\
        .is_('external_code', None)\
        .eq('status', 'active')\
        .gt('price', 0)\
        .order('price', desc=True)\
        .limit(20)
    
    non_syscom_products = non_syscom_response.execute()
    
    if non_syscom_products.data and len(non_syscom_products.data) > 0:
        print(f"   Total productos NO-Syscom activos: {len(non_syscom_products.data)}")
        print("\n   Top 10 precios más altos (NO-Syscom - deberían estar en MXN):")
        for idx, product in enumerate(non_syscom_products.data[:10], 1):
            price = float(product.get('price', 0))
            # Si el precio es > 100,000, probablemente fue convertido incorrectamente
            is_suspicious = price > 100000
            status = "⚠️ SOSPECHOSO" if is_suspicious else "✅ OK"
            print(f"   {idx}. {status} ${price:,.2f} - {product.get('title', '')[:60]}")
            if product.get('sku'):
                print(f"      SKU: {product.get('sku')}")
    else:
        print("   No se encontraron productos NO-Syscom")
    
    print("\n" + "="*80 + "\n")
    
    # 3. Análisis de precios sospechosos
    print("🔍 Análisis de precios sospechosos:\n")
    
    # Productos NO-Syscom con precios > 50,000 (probablemente convertidos incorrectamente)
    suspicious_response = supabase.table('marketplace_products')\
        .select('id, title, price, external_code')\
        .is_('external_code', None)\
        .eq('status', 'active')\
        .gt('price', 50000)
    
    suspicious_non_syscom = suspicious_response.execute()
    
    if suspicious_non_syscom.data and len(suspicious_non_syscom.data) > 0:
        print(f"   ⚠️ Encontrados {len(suspicious_non_syscom.data)} productos NO-Syscom con precio > $50,000")
        print("   Estos probablemente fueron convertidos incorrectamente de USD a MXN")
        print("\n   Ejemplos:")
        for product in suspicious_non_syscom.data[:5]:
            price = float(product.get('price', 0))
            # Estimar el precio original dividiendo por ~17.5 (tasa de cambio)
            estimated_original = price / 17.5
            print(f"   - ${price:,.2f} → Probable precio original: ${estimated_original:,.2f}")
            print(f"     {product.get('title', '')[:60]}")
    else:
        print("   ✅ No se encontraron productos NO-Syscom con precios sospechosos")
    
    print("\n" + "="*80 + "\n")
    
    # 4. Estadísticas generales
    print("📈 Estadísticas generales:\n")
    
    all_products_response = supabase.table('marketplace_products')\
        .select('price, external_code')\
        .eq('status', 'active')\
        .gt('price', 0)
    
    all_products = all_products_response.execute()
    
    if all_products.data and len(all_products.data) > 0:
        prices = [float(p.get('price', 0)) for p in all_products.data]
        syscom_prices = [float(p.get('price', 0)) for p in all_products.data if p.get('external_code')]
        non_syscom_prices = [float(p.get('price', 0)) for p in all_products.data if not p.get('external_code')]
        
        print(f"   Total productos activos con precio > 0: {len(prices)}")
        print(f"   - Productos Syscom: {len(syscom_prices)}")
        print(f"   - Productos NO-Syscom: {len(non_syscom_prices)}")
        
        if prices:
            print(f"\n   Precio promedio general: ${sum(prices)/len(prices):,.2f}")
            print(f"   Precio máximo: ${max(prices):,.2f}")
            print(f"   Precio mínimo: ${min(prices):,.2f}")
        
        if syscom_prices:
            print(f"\n   Precio promedio Syscom: ${sum(syscom_prices)/len(syscom_prices):,.2f}")
            print(f"   Precio máximo Syscom: ${max(syscom_prices):,.2f}")
        
        if non_syscom_prices:
            print(f"\n   Precio promedio NO-Syscom: ${sum(non_syscom_prices)/len(non_syscom_prices):,.2f}")
            print(f"   Precio máximo NO-Syscom: ${max(non_syscom_prices):,.2f}")

if __name__ == "__main__":
    try:
        check_price_issues()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

