#!/usr/bin/env python3
"""
Script avanzado para actualizar precios de productos Syscom
Combina múltiples fuentes: API Syscom, Web Scraping, y comparación con otras tiendas
"""

import os
import sys
import time
import re
import requests
from pathlib import Path
from supabase import create_client, Client
from typing import Dict, Optional
from datetime import datetime

# Intentar importar BeautifulSoup (opcional)
try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("⚠️  BeautifulSoup4 no instalado. Web scraping deshabilitado.")
    print("💡 Instalar con: pip3 install beautifulsoup4 lxml")

# Cargar variables de entorno manualmente desde .env.local
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
else:
    print(f"⚠️  Archivo .env.local no encontrado en: {env_file}")

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SYSCOM_CLIENT_ID = os.environ.get('SYSCOM_CLIENT_ID')
SYSCOM_CLIENT_SECRET = os.environ.get('SYSCOM_CLIENT_SECRET')

if not all([SUPABASE_URL, SUPABASE_KEY, SYSCOM_CLIENT_ID, SYSCOM_CLIENT_SECRET]):
    print("❌ Error: Variables de entorno no configuradas")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SYSCOM_OAUTH_URL = "https://developers.syscom.mx/oauth/token"
SYSCOM_API_BASE = "https://developers.syscom.mx/api/v1"
RATE_LIMIT_DELAY = 1.1

access_token = None
token_expiry = 0

def get_access_token() -> str:
    global access_token, token_expiry
    if access_token and token_expiry > (time.time() * 1000) - 3600000:
        return access_token
    
    print("🔐 Obteniendo token de acceso...")
    response = requests.post(
        SYSCOM_OAUTH_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": SYSCOM_CLIENT_ID,
            "client_secret": SYSCOM_CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    
    if response.status_code != 200:
        print(f"❌ Error obteniendo token: {response.status_code}")
        sys.exit(1)
    
    data = response.json()
    access_token = data["access_token"]
    token_expiry = (time.time() * 1000) + (data["expires_in"] * 1000)
    return access_token

# Headers para simular navegador en web scraping
BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
}

def get_price_from_api(producto_id: str) -> Optional[Dict]:
    """Intenta obtener precio desde la API de Syscom"""
    try:
        token = get_access_token()
        if not token:
            return None
            
        response = requests.get(
            f"{SYSCOM_API_BASE}/productos/{producto_id}",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            precio_data = data.get("precio")
            
            if precio_data:
                if isinstance(precio_data, dict):
                    precio_lista = precio_data.get("precio_lista")
                    precio_especial = precio_data.get("precio_especial") or precio_data.get("precio_descuento")
                    
                    if precio_especial and precio_especial > 0:
                        precio = float(precio_especial)
                    elif precio_lista and precio_lista > 0:
                        precio = float(precio_lista)
                    else:
                        return None
                    
                    original_price = None
                    if precio_especial and precio_lista and precio_especial > 0 and precio_lista > 0:
                        if precio_especial < precio_lista:
                            original_price = float(precio_lista)
                    
                    return {
                        "price": float(precio),
                        "original_price": float(original_price) if original_price and original_price > 0 else None,
                        "fuente": "api"
                    }
                elif isinstance(precio_data, (int, float)):
                    return {
                        "price": float(precio_data),
                        "original_price": None,
                        "fuente": "api"
                    }
    except Exception as e:
        pass  # Silenciar errores, intentar siguiente fuente
    
    return None

def get_price_from_syscom_web(producto_id: str) -> Optional[Dict]:
    """Obtiene precio desde la página web de Syscom (web scraping)"""
    if not HAS_BS4:
        return None
        
    try:
        url = f"https://www.syscom.mx/products/{producto_id}"
        response = requests.get(url, headers=BROWSER_HEADERS, timeout=15)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Buscar precios usando múltiples patrones
            precio_patterns = [
                r'\$[\s]*([\d,]+\.?\d*)',
                r'precio[:\s]*\$?[\s]*([\d,]+\.?\d*)',
                r'[\$]?([\d,]+\.?\d*)\s*MXN',
            ]
            
            # Buscar en elementos comunes de precio
            price_selectors = [
                '.price', '.precio', '.product-price', 
                '[data-price]', '.price-current'
            ]
            
            precios_encontrados = []
            
            for selector in price_selectors:
                elements = soup.select(selector)
                for elem in elements:
                    text = elem.get_text(strip=True)
                    for pattern in precio_patterns:
                        matches = re.findall(pattern, text, re.IGNORECASE)
                        for match in matches:
                            try:
                                precio = float(match.replace(',', ''))
                                if 100 < precio < 1000000:  # Rango razonable
                                    precios_encontrados.append(precio)
                            except:
                                pass
            
            if precios_encontrados:
                precio_actual = min(precios_encontrados)
                precio_lista = max(precios_encontrados) if len(precios_encontrados) > 1 else None
                
                return {
                    "price": precio_actual,
                    "original_price": precio_lista if precio_lista and precio_lista > precio_actual else None,
                    "fuente": "syscom_web"
                }
    except Exception as e:
        pass  # Silenciar errores
    
    return None

def search_product_in_cyberpuerta(product_title: str, sku: str = None) -> Optional[Dict]:
    """
    Busca producto en Cyberpuerta y obtiene precio (comparación de mercado)
    Versión mejorada con búsqueda por SKU y múltiples selectores
    """
    if not HAS_BS4:
        return None
    
    try:
        # Priorizar SKU sobre título
        search_query = sku if sku else product_title[:50]
        if not search_query:
            return None
        
        from urllib.parse import quote
        search_url = f"https://www.cyberpuerta.mx/Buscar/?q={quote(search_query)}"
        
        response = requests.get(search_url, headers=BROWSER_HEADERS, timeout=15)
        
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Múltiples selectores para encontrar productos
        product_selectors = [
            'article.product',
            'div.product',
            'li.product-item',
            '.product-list-item',
            '[data-product-id]',
            '.product-card',
            '.item-product',
        ]
        
        products_found = []
        for selector in product_selectors:
            products = soup.select(selector)
            if products:
                products_found = products
                break
        
        # Si no encontramos con selectores específicos, buscar por texto
        if not products_found:
            all_elements = soup.find_all(['div', 'article', 'li', 'a'], 
                                        class_=lambda x: x and ('product' in str(x).lower() or 'item' in str(x).lower()))
            products_found = [elem for elem in all_elements if search_query.lower() in elem.get_text().lower()][:5]
        
        if not products_found:
            return None
        
        # Buscar el producto más relevante
        best_match = None
        best_score = 0
        
        for product in products_found[:5]:
            product_text = product.get_text().lower()
            score = 0
            
            # Si tenemos SKU, buscar coincidencia exacta
            if sku:
                sku_lower = sku.lower()
                if sku_lower in product_text:
                    score += 10
                # Buscar en atributos
                for attr in ['data-sku', 'data-product-id', 'data-id']:
                    if sku_lower in str(product.get(attr, '')).lower():
                        score += 5
            else:
                # Si no hay SKU, usar título
                if product_title and product_title.lower()[:30] in product_text:
                    score += 5
            
            if score > best_score:
                best_score = score
                best_match = product
        
        if not best_match or best_score == 0:
            return None
        
        # Extraer precio
        price_selectors = [
            '.price',
            '.precio',
            '.product-price',
            '[data-price]',
            '.price-current',
            '.precio-actual',
            'span[class*="price"]',
            'div[class*="price"]',
        ]
        
        precio_actual = None
        precio_original = None
        
        # Buscar precio actual
        for selector in price_selectors:
            price_elem = best_match.select_one(selector)
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price_match = re.search(r'\$?\s*([\d,]+\.?\d*)', price_text.replace(',', ''))
                if price_match:
                    try:
                        precio_actual = float(price_match.group(1).replace(',', ''))
                        if 10 < precio_actual < 1000000:
                            break
                    except ValueError:
                        continue
        
        # Si no encontramos con selectores, buscar en texto
        if precio_actual is None:
            product_text = best_match.get_text()
            price_matches = re.findall(r'\$?\s*([\d,]+\.?\d*)', product_text.replace(',', ''))
            prices = []
            for match in price_matches:
                try:
                    price_val = float(match.replace(',', ''))
                    if 10 < price_val < 1000000:
                        prices.append(price_val)
                except ValueError:
                    continue
            if prices:
                precio_actual = min(prices)
                if len(prices) > 1:
                    precio_original = max(prices)
        
        # Buscar precio original (descuento)
        if precio_actual:
            original_selectors = [
                '.price-original',
                '.precio-original',
                '.price-before',
                'del',
                's',
                '[class*="original"]',
            ]
            
            for selector in original_selectors:
                original_elem = best_match.select_one(selector)
                if original_elem:
                    original_text = original_elem.get_text(strip=True)
                    original_match = re.search(r'\$?\s*([\d,]+\.?\d*)', original_text.replace(',', ''))
                    if original_match:
                        try:
                            precio_original = float(original_match.group(1).replace(',', ''))
                            if precio_original > precio_actual:
                                break
                        except ValueError:
                            continue
        
        if precio_actual and precio_actual > 0:
            return {
                "price": precio_actual,
                "original_price": precio_original if precio_original and precio_original > precio_actual else None,
                "fuente": "cyberpuerta"
            }
    
    except Exception as e:
        pass  # Silenciar errores
    
    return None

def get_product_price(producto_id: str, product_title: str = "", sku: str = None) -> Optional[Dict]:
    """
    Obtiene precio de un producto usando múltiples fuentes en orden de prioridad:
    1. API de Syscom
    2. Web scraping de Syscom
    3. Comparación con Cyberpuerta
    """
    # 1. Intentar API de Syscom
    price_info = get_price_from_api(producto_id)
    if price_info and price_info.get("price"):
        return price_info
    
    # 2. Intentar scraping de Syscom web
    price_info = get_price_from_syscom_web(producto_id)
    if price_info and price_info.get("price"):
        return price_info
    
    # 3. Intentar buscar en Cyberpuerta (solo si tenemos título o SKU)
    if product_title or sku:
        price_info = search_product_in_cyberpuerta(product_title, sku)
        if price_info and price_info.get("price"):
            return price_info
    
    return None

def update_prices(limit: int = 100):
    """Actualiza precios de productos Syscom usando múltiples fuentes"""
    print("=" * 80)
    print("ACTUALIZACIÓN DE PRECIOS MULTI-FUENTE")
    print("=" * 80)
    print("Fuentes: API Syscom → Web Syscom → Cyberpuerta")
    print()
    
    # Obtener productos Syscom con precio 0 o null
    print("🔍 Buscando productos con precio 0 o null...")
    response = supabase.table('marketplace_products').select(
        'id,title,price,original_price,external_code,sku'
    ).not_.is_('external_code', 'null').or_('price.is.null,price.eq.0').limit(limit).execute()
    
    if not response.data:
        print("✅ No hay productos con precio 0 o null")
        return
    
    productos = response.data
    print(f"📦 Encontrados {len(productos)} productos para actualizar")
    print()
    
    updated = 0
    errors = 0
    no_price = 0
    
    for idx, producto in enumerate(productos, 1):
        external_code = producto.get('external_code')
        current_price = producto.get('price', 0)
        
        if idx % 50 == 0:
            print(f"\n📊 Progreso: {idx}/{len(productos)} productos procesados...")
            print(f"   ✅ Actualizados: {updated} | ❌ Errores: {errors} | ⚠️  Sin precio: {no_price}\n")
        
        if not external_code:
            continue
        
        # Obtener precio usando múltiples fuentes
        title = producto.get('title', '')
        sku = producto.get('sku')
        price_info = get_product_price(str(external_code), title, sku)
        
        if price_info and price_info.get('price', 0) > 0:
            # Actualizar en base de datos
            try:
                update_data = {
                    "price": price_info['price'],
                }
                if price_info.get('original_price'):
                    update_data["original_price"] = price_info['original_price']
                
                    supabase.table('marketplace_products').update(update_data).eq('id', producto['id']).execute()
                    updated += 1
                    
                    fuente = price_info.get('fuente', 'desconocida')
                    if idx <= 10:  # Mostrar primeros 10
                        print(f"  ✅ {producto.get('title', 'N/A')[:50]}... - ${price_info['price']:,.2f} (fuente: {fuente})")
            except Exception as e:
                errors += 1
                if idx <= 10:
                    print(f"  ❌ Error actualizando {external_code}: {str(e)[:100]}")
        else:
            no_price += 1
            if idx <= 10:
                print(f"  ⚠️  Sin precio disponible para {external_code}")
        
        # Rate limit (más tiempo para web scraping)
        time.sleep(2)  # 2 segundos entre requests para ser respetuosos
    
    print("\n" + "=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    print(f"✅ Actualizados: {updated}")
    print(f"❌ Errores: {errors}")
    print(f"⚠️  Sin precio disponible: {no_price}")
    print("=" * 80)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Actualizar precios usando múltiples fuentes')
    parser.add_argument('--execute', action='store_true', help='Ejecutar actualización (por defecto es dry-run)')
    parser.add_argument('--limit', type=int, default=100, help='Límite de productos a procesar (default: 100)')
    args = parser.parse_args()
    
    if not args.execute:
        print("⚠️  Modo DRY RUN - No se realizarán cambios")
        print("💡 Usa --execute para actualizar precios")
        print()
    
    if args.execute:
        update_prices(limit=args.limit)
    else:
        print("💡 Para ejecutar la actualización:")
        print("   python3 scripts/update_syscom_prices.py --execute --limit 100")
        print()
        print("📋 Fuentes disponibles:")
        print("   1. API de Syscom (si disponible)")
        print("   2. Web scraping de Syscom.com.mx")
        print("   3. Comparación con Cyberpuerta.mx")

