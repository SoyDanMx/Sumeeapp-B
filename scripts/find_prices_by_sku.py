#!/usr/bin/env python3
"""
Script para buscar precios por SKU en múltiples fuentes web
y actualizar la base de datos con precios encontrados
"""

import os
import sys
import time
import re
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Dict, Optional, List
from datetime import datetime
from urllib.parse import quote_plus

# Intentar importar BeautifulSoup
try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("⚠️  BeautifulSoup4 no instalado. Instalar con: pip3 install beautifulsoup4 lxml")

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SYSCOM_CLIENT_ID = os.environ.get('SYSCOM_CLIENT_ID')
SYSCOM_CLIENT_SECRET = os.environ.get('SYSCOM_CLIENT_SECRET')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Headers para simular navegador
BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

def get_price_from_cyberpuerta(sku: str, title: str = "") -> Optional[Dict]:
    """Busca precio en Cyberpuerta.mx por SKU"""
    try:
        # Construir URL de búsqueda
        search_query = sku if sku else title
        search_url = f"https://www.cyberpuerta.mx/index.php?cl=search&searchparam={quote_plus(search_query)}"
        
        response = requests.get(search_url, headers=BROWSER_HEADERS, timeout=15)
        
        if response.status_code != 200:
            return None
        
        if not HAS_BS4:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar productos en los resultados
        products = soup.find_all('div', class_=re.compile(r'product|item', re.I))
        
        best_match = None
        best_price = None
        best_original_price = None
        
        for product in products[:5]:  # Revisar primeros 5 resultados
            # Buscar título del producto
            title_elem = product.find(['h2', 'h3', 'a'], class_=re.compile(r'title|name|product', re.I))
            if not title_elem:
                title_elem = product.find('a', href=re.compile(r'/producto/'))
            
            if not title_elem:
                continue
            
            product_title = title_elem.get_text(strip=True).upper()
            sku_upper = sku.upper()
            
            # Verificar si el SKU está en el título o en el link
            if sku_upper not in product_title:
                continue
            
            # Buscar precio
            price_elem = product.find(['span', 'div', 'p'], class_=re.compile(r'price|precio', re.I))
            if not price_elem:
                # Buscar por atributos data
                price_elem = product.find(attrs={'data-price': True})
            
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                # Extraer número del precio
                price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
                if price_match:
                    try:
                        price = float(price_match.group().replace(',', ''))
                        if price > 0:
                            best_price = price
                            best_match = product_title
                            
                            # Buscar precio original (tachado)
                            original_elem = product.find(['span', 'div'], class_=re.compile(r'original|before|old', re.I))
                            if original_elem:
                                original_text = original_elem.get_text(strip=True)
                                original_match = re.search(r'[\d,]+\.?\d*', original_text.replace(',', ''))
                                if original_match:
                                    best_original_price = float(original_match.group().replace(',', ''))
                            
                            break
                    except ValueError:
                        continue
        
        if best_price:
            return {
                'price': best_price,
                'original_price': best_original_price if best_original_price and best_original_price > best_price else None,
                'source': 'cyberpuerta',
                'url': search_url
            }
        
        return None
    except Exception as e:
        print(f"  ⚠️  Error buscando en Cyberpuerta: {e}")
        return None

def get_price_from_syscom_web(sku: str) -> Optional[Dict]:
    """Busca precio en Syscom.mx por SKU"""
    try:
        # Construir URL de búsqueda
        search_url = f"https://www.syscom.mx/search?q={quote_plus(sku)}"
        
        response = requests.get(search_url, headers=BROWSER_HEADERS, timeout=15)
        
        if response.status_code != 200:
            return None
        
        if not HAS_BS4:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar productos en los resultados
        products = soup.find_all(['div', 'article'], class_=re.compile(r'product|item', re.I))
        
        for product in products[:3]:  # Revisar primeros 3 resultados
            # Buscar SKU o título
            title_elem = product.find(['h2', 'h3', 'a', 'span'], class_=re.compile(r'title|name|sku', re.I))
            if not title_elem:
                continue
            
            product_text = title_elem.get_text(strip=True).upper()
            sku_upper = sku.upper()
            
            if sku_upper not in product_text:
                continue
            
            # Buscar precio
            price_elem = product.find(['span', 'div', 'p'], class_=re.compile(r'price|precio', re.I))
            if not price_elem:
                price_elem = product.find(attrs={'data-price': True})
            
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
                if price_match:
                    try:
                        price = float(price_match.group().replace(',', ''))
                        if price > 0:
                            return {
                                'price': price,
                                'original_price': None,
                                'source': 'syscom_web',
                                'url': search_url
                            }
                    except ValueError:
                        continue
        
        return None
    except Exception as e:
        print(f"  ⚠️  Error buscando en Syscom web: {e}")
        return None

def get_price_from_mercadolibre(sku: str) -> Optional[Dict]:
    """Busca precio en MercadoLibre por SKU"""
    try:
        search_url = f"https://listado.mercadolibre.com.mx/{quote_plus(sku)}"
        
        response = requests.get(search_url, headers=BROWSER_HEADERS, timeout=15)
        
        if response.status_code != 200:
            return None
        
        if not HAS_BS4:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar precio en resultados
        price_elem = soup.find('span', class_=re.compile(r'price|precio', re.I))
        if not price_elem:
            price_elem = soup.find(attrs={'data-price': True})
        
        if price_elem:
            price_text = price_elem.get_text(strip=True)
            price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
            if price_match:
                try:
                    price = float(price_match.group().replace(',', ''))
                    if price > 0:
                        return {
                            'price': price,
                            'original_price': None,
                            'source': 'mercadolibre',
                            'url': search_url
                        }
                except ValueError:
                    pass
        
        return None
    except Exception as e:
        print(f"  ⚠️  Error buscando en MercadoLibre: {e}")
        return None

def find_price_by_sku(sku: str, title: str = "", external_code: str = "") -> Optional[Dict]:
    """
    Busca precio por SKU en múltiples fuentes
    Retorna el mejor precio encontrado
    """
    if not sku:
        return None
    
    print(f"  🔍 Buscando precio para SKU: {sku}")
    
    # Orden de prioridad: Cyberpuerta > Syscom Web > MercadoLibre
    sources = [
        ('Cyberpuerta', lambda: get_price_from_cyberpuerta(sku, title)),
        ('Syscom Web', lambda: get_price_from_syscom_web(sku)),
        ('MercadoLibre', lambda: get_price_from_mercadolibre(sku)),
    ]
    
    for source_name, search_func in sources:
        try:
            result = search_func()
            if result and result.get('price', 0) > 0:
                print(f"    ✅ Precio encontrado en {source_name}: ${result['price']:,.2f}")
                return result
            time.sleep(0.5)  # Rate limiting
        except Exception as e:
            print(f"    ⚠️  Error en {source_name}: {e}")
            continue
    
    print(f"    ❌ No se encontró precio para SKU: {sku}")
    return None

def update_prices_for_zero_products(limit: int = 100, execute: bool = False):
    """
    Busca y actualiza precios para productos con precio 0
    """
    print("=" * 80)
    print("BÚSQUEDA DE PRECIOS POR SKU")
    print("=" * 80)
    print()
    
    if not execute:
        print("⚠️  MODO DRY-RUN: No se actualizará la base de datos")
        print("   Usa --execute para aplicar cambios")
        print()
    
    # Obtener productos con precio 0 que tengan SKU
    print("🔍 Obteniendo productos con precio 0...")
    try:
        response = supabase.table('marketplace_products').select('id,sku,title,price,external_code').eq('price', 0).not_.is_('sku', 'null').limit(limit).execute()
        products = response.data if response.data else []
        
        print(f"✅ Encontrados {len(products)} productos con precio 0 y SKU")
        print()
        
        if not products:
            print("✅ No hay productos para actualizar")
            return
        
    except Exception as e:
        print(f"❌ Error obteniendo productos: {e}")
        return
    
    # Procesar productos
    updated = 0
    not_found = 0
    errors = 0
    
    print("📊 Procesando productos...")
    print()
    
    for idx, product in enumerate(products, 1):
        sku = product.get('sku', '').strip()
        title = product.get('title', '').strip()
        product_id = product.get('id')
        external_code = product.get('external_code', '')
        
        if not sku:
            continue
        
        print(f"[{idx}/{len(products)}] {title[:50]}... (SKU: {sku})")
        
        # Buscar precio
        price_data = find_price_by_sku(sku, title, external_code)
        
        if price_data and price_data.get('price', 0) > 0:
            new_price = price_data['price']
            new_original_price = price_data.get('original_price')
            
            if execute:
                try:
                    update_data = {'price': new_price}
                    if new_original_price and new_original_price > new_price:
                        update_data['original_price'] = new_original_price
                    
                    supabase.table('marketplace_products').update(update_data).eq('id', product_id).execute()
                    updated += 1
                    print(f"  ✅ Actualizado: ${new_price:,.2f}")
                except Exception as e:
                    errors += 1
                    print(f"  ❌ Error actualizando: {e}")
            else:
                updated += 1
                print(f"  ✅ [DRY-RUN] Se actualizaría a: ${new_price:,.2f}")
        else:
            not_found += 1
        
        # Rate limiting
        time.sleep(1)
        
        # Mostrar progreso cada 10 productos
        if idx % 10 == 0:
            print()
            print(f"📊 Progreso: {idx}/{len(products)}")
            print(f"   ✅ Actualizados: {updated} | ⚠️  No encontrados: {not_found} | ❌ Errores: {errors}")
            print()
    
    print()
    print("=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    print(f"✅ Actualizados: {updated}")
    print(f"⚠️  No encontrados: {not_found}")
    print(f"❌ Errores: {errors}")
    print()
    
    if execute:
        print("✅ Cambios aplicados a la base de datos")
    else:
        print("💡 Para aplicar cambios, ejecuta con --execute")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Buscar precios por SKU y actualizar BD')
    parser.add_argument('--limit', type=int, default=100, help='Límite de productos a procesar')
    parser.add_argument('--execute', action='store_true', help='Aplicar cambios a la BD')
    
    args = parser.parse_args()
    
    update_prices_for_zero_products(limit=args.limit, execute=args.execute)

