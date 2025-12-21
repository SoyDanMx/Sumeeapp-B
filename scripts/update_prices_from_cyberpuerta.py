#!/usr/bin/env python3
"""
Script para actualizar precios de productos desde Cyberpuerta.mx
Busca productos por SKU y actualiza precios en la base de datos
"""

import os
import sys
import time
import re
from typing import Optional, Dict, List
from urllib.parse import quote, urljoin
from dotenv import load_dotenv

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    print("❌ Error: Se requiere beautifulsoup4 y requests")
    print("   Instalar con: pip install beautifulsoup4 requests lxml")
    sys.exit(1)

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    print("❌ Error: Se requiere supabase-py")
    print("   Instalar con: pip install supabase")
    sys.exit(1)

# Cargar variables de entorno desde .env.local
load_dotenv('.env.local')

# Configuración
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno no configuradas")
    print("   Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY")
    print("   Asegúrate de tener un archivo .env.local en la raíz del proyecto")
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
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
}

CYBERPUERTA_BASE = "https://www.cyberpuerta.mx"
CYBERPUERTA_SEARCH = f"{CYBERPUERTA_BASE}/Buscar/"

def search_product_by_sku(sku: str) -> Optional[Dict]:
    """
    Busca un producto en Cyberpuerta por SKU y retorna información del precio
    
    Args:
        sku: SKU del producto a buscar
        
    Returns:
        Dict con price, original_price (si hay descuento), y fuente, o None
    """
    if not sku or not sku.strip():
        return None
    
    try:
        # Limpiar SKU: remover espacios extra, caracteres especiales problemáticos
        clean_sku = sku.strip()
        
        # URL de búsqueda en Cyberpuerta
        # Cyberpuerta usa: /Buscar/?q=SKU
        search_url = f"{CYBERPUERTA_SEARCH}?q={quote(clean_sku)}"
        
        print(f"  🔍 Buscando en Cyberpuerta: {search_url}")
        
        response = requests.get(search_url, headers=BROWSER_HEADERS, timeout=15)
        
        if response.status_code != 200:
            print(f"  ⚠️  Status code: {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Cyberpuerta tiene diferentes estructuras, intentar múltiples selectores
        # Basado en la estructura HTML típica de e-commerce
        
        # Opción 1: Buscar contenedores de productos
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
                print(f"  ✅ Encontrados {len(products)} productos con selector: {selector}")
                break
        
        # Si no encontramos con selectores específicos, buscar por estructura común
        if not products_found:
            # Buscar elementos que contengan el SKU en el texto o atributos
            all_elements = soup.find_all(['div', 'article', 'li', 'a'], 
                                        class_=lambda x: x and ('product' in str(x).lower() or 'item' in str(x).lower()))
            products_found = [elem for elem in all_elements if clean_sku.lower() in elem.get_text().lower()][:5]
            if products_found:
                print(f"  ✅ Encontrados {len(products_found)} productos por búsqueda de texto")
        
        if not products_found:
            print(f"  ⚠️  No se encontraron productos en los resultados")
            return None
        
        # Buscar el producto más relevante (que contenga el SKU exacto)
        best_match = None
        best_score = 0
        
        for product in products_found[:5]:  # Revisar primeros 5 resultados
            product_text = product.get_text().lower()
            product_html = str(product).lower()
            
            # Calcular score de relevancia
            score = 0
            sku_lower = clean_sku.lower()
            
            # SKU exacto en el texto
            if sku_lower in product_text:
                score += 10
            
            # SKU en atributos (data-sku, data-product-id, etc.)
            for attr in ['data-sku', 'data-product-id', 'data-id', 'id']:
                attr_value = product.get(attr, '')
                if sku_lower in str(attr_value).lower():
                    score += 5
            
            # Buscar enlaces que contengan el SKU
            links = product.find_all('a', href=True)
            for link in links:
                if sku_lower in link.get('href', '').lower():
                    score += 3
            
            if score > best_score:
                best_score = score
                best_match = product
        
        if not best_match:
            print(f"  ⚠️  No se encontró un producto que coincida con el SKU")
            return None
        
        print(f"  ✅ Producto encontrado con score: {best_score}")
        
        # Extraer precio del producto
        price_selectors = [
            '.price',
            '.precio',
            '.product-price',
            '[data-price]',
            '.price-current',
            '.precio-actual',
            '.price-now',
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
                # Buscar patrón de precio: $X,XXX.XX o $XXXX.XX
                price_match = re.search(r'\$?\s*([\d,]+\.?\d*)', price_text.replace(',', ''))
                if price_match:
                    try:
                        precio_actual = float(price_match.group(1).replace(',', ''))
                        print(f"  💰 Precio encontrado: ${precio_actual:,.2f}")
                        break
                    except ValueError:
                        continue
        
        # Si no encontramos precio con selectores, buscar en todo el texto del producto
        if precio_actual is None:
            product_text = best_match.get_text()
            # Buscar todos los precios en el texto
            price_matches = re.findall(r'\$?\s*([\d,]+\.?\d*)', product_text.replace(',', ''))
            prices = []
            for match in price_matches:
                try:
                    price_val = float(match.replace(',', ''))
                    if 10 < price_val < 1000000:  # Rango razonable
                        prices.append(price_val)
                except ValueError:
                    continue
            
            if prices:
                # El menor precio suele ser el precio actual (si hay descuento)
                precio_actual = min(prices)
                if len(prices) > 1:
                    precio_original = max(prices)
                print(f"  💰 Precio encontrado en texto: ${precio_actual:,.2f}")
        
        # Buscar precio original (tachado) si hay descuento
        if precio_actual:
            # Buscar elementos con precio tachado o "antes"
            original_selectors = [
                '.price-original',
                '.precio-original',
                '.price-before',
                '.precio-antes',
                'del',
                's',
                '[class*="original"]',
                '[class*="before"]',
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
                                print(f"  💰 Precio original: ${precio_original:,.2f}")
                                break
                        except ValueError:
                            continue
        
        if precio_actual and precio_actual > 0:
            return {
                "price": precio_actual,
                "original_price": precio_original if precio_original and precio_original > precio_actual else None,
                "fuente": "cyberpuerta"
            }
        else:
            print(f"  ⚠️  No se pudo extraer precio válido")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error de conexión: {str(e)[:100]}")
        return None
    except Exception as e:
        print(f"  ❌ Error inesperado: {str(e)[:100]}")
        return None

def update_prices_from_cyberpuerta(limit: int = 100, execute: bool = False):
    """
    Actualiza precios de productos desde Cyberpuerta usando SKU
    
    Args:
        limit: Número máximo de productos a procesar
        execute: Si es True, actualiza la BD. Si es False, solo muestra resultados
    """
    print("=" * 80)
    print("ACTUALIZACIÓN DE PRECIOS DESDE CYBERPUERTA.MX")
    print("=" * 80)
    print()
    
    if not execute:
        print("⚠️  MODO DRY-RUN: No se actualizará la base de datos")
        print("   Usa --execute para aplicar cambios")
        print()
    
    # Obtener productos con SKU y precio 0 o null
    print("🔍 Buscando productos con SKU y precio 0 o null...")
    
    try:
        response = supabase.table('marketplace_products').select(
            'id,title,price,original_price,sku,external_code'
        ).not_.is_('sku', 'null').or_('price.is.null,price.eq.0').limit(limit).execute()
        
        if not response.data:
            print("✅ No hay productos con SKU y precio 0 o null")
            return
        
        productos = response.data
        print(f"📦 Encontrados {len(productos)} productos para actualizar")
        print()
        
    except Exception as e:
        print(f"❌ Error obteniendo productos: {e}")
        return
    
    updated = 0
    errors = 0
    no_price = 0
    skipped = 0
    
    for idx, producto in enumerate(productos, 1):
        sku = producto.get('sku')
        current_price = producto.get('price', 0)
        product_id = producto.get('id')
        title = producto.get('title', 'N/A')
        
        if idx % 10 == 0:
            print(f"\n📊 Progreso: {idx}/{len(productos)}")
            print(f"   ✅ Actualizados: {updated} | ❌ Errores: {errors} | ⚠️  Sin precio: {no_price} | ⏭️  Omitidos: {skipped}\n")
        
        if not sku:
            skipped += 1
            continue
        
        print(f"\n[{idx}/{len(productos)}] {title[:60]}...")
        print(f"  SKU: {sku}")
        
        # Buscar precio en Cyberpuerta
        price_info = search_product_by_sku(sku)
        
        if price_info and price_info.get('price', 0) > 0:
            precio = price_info['price']
            precio_original = price_info.get('original_price')
            
            print(f"  ✅ Precio encontrado: ${precio:,.2f}")
            if precio_original:
                print(f"  💰 Precio original: ${precio_original:,.2f}")
            
            if execute:
                try:
                    update_data = {
                        "price": precio,
                    }
                    if precio_original:
                        update_data["original_price"] = precio_original
                    
                    supabase.table('marketplace_products').update(update_data).eq('id', product_id).execute()
                    updated += 1
                    print(f"  ✅ Actualizado en BD")
                except Exception as e:
                    errors += 1
                    print(f"  ❌ Error actualizando BD: {str(e)[:100]}")
            else:
                updated += 1
                print(f"  📝 (No actualizado - modo dry-run)")
        else:
            no_price += 1
            print(f"  ⚠️  No se encontró precio en Cyberpuerta")
        
        # Rate limit: ser respetuoso con Cyberpuerta
        time.sleep(2)  # 2 segundos entre requests
    
    print("\n" + "=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    print(f"✅ Precios encontrados: {updated}")
    print(f"❌ Errores: {errors}")
    print(f"⚠️  Sin precio: {no_price}")
    print(f"⏭️  Omitidos (sin SKU): {skipped}")
    print()
    
    if not execute:
        print("💡 Para aplicar cambios, ejecuta con --execute")
    else:
        print("✅ Cambios aplicados a la base de datos")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Actualizar precios desde Cyberpuerta.mx')
    parser.add_argument('--limit', type=int, default=100, help='Número máximo de productos a procesar')
    parser.add_argument('--execute', action='store_true', help='Aplicar cambios a la base de datos')
    
    args = parser.parse_args()
    
    update_prices_from_cyberpuerta(limit=args.limit, execute=args.execute)

