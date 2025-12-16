#!/usr/bin/env python3
"""
Migra rutas locales de imágenes TRUPER a URLs directas de truper.com
Actualiza la base de datos para usar URLs remotas en lugar de rutas locales
"""

import os
import re
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

# Patrones de URLs
TRUPER_URL_PATTERN = "https://www.truper.com/media/import/imagenes/{identifier}.jpg"
LOCAL_PATTERN = "/images/marketplace/truper/"

def extract_identifier(image_path: str) -> str:
    """Extrae el identificador (clave o código) de una ruta de imagen"""
    # Ejemplo: /images/marketplace/truper/PET-15X.jpg -> PET-15X
    match = re.search(r'/truper/([^/]+)\.(jpg|webp|png)', image_path)
    if match:
        return match.group(1)
    return None

def migrate_product_images(supabase: Client, batch_size: int = 100):
    """Migra imágenes de productos TRUPER a URLs directas"""
    
    print("🔄 Iniciando migración de imágenes TRUPER a URLs directas...")
    print(f"   Patrón URL: {TRUPER_URL_PATTERN}")
    print()
    
    updated_count = 0
    error_count = 0
    skipped_count = 0
    
    # Obtener todos los productos con imágenes locales
    # Nota: No podemos usar ilike directamente en arrays, así que obtenemos todos y filtramos
    offset = 0
    while True:
        try:
            # Obtener productos en lotes
            response = supabase.table('marketplace_products').select(
                'id, title, images'
            ).range(offset, offset + batch_size - 1).execute()
            
            products = response.data
            
            if not products:
                break
            
            # Filtrar solo productos con imágenes locales de TRUPER
            truper_products = [
                p for p in products 
                if p.get('images') and 
                any(img.startswith(LOCAL_PATTERN) for img in p.get('images', []))
            ]
            
            if not truper_products:
                offset += batch_size
                if len(products) < batch_size:
                    break
                continue
            
            print(f"📦 Procesando lote {offset // batch_size + 1} ({len(truper_products)} productos TRUPER de {len(products)} totales)...")
            
            for product in truper_products:
                product_id = product['id']
                images = product.get('images', [])
                
                if not images:
                    skipped_count += 1
                    continue
                
                # Convertir cada imagen local a URL de TRUPER
                new_images = []
                for img_path in images:
                    if img_path.startswith(LOCAL_PATTERN):
                        identifier = extract_identifier(img_path)
                        if identifier:
                            new_url = TRUPER_URL_PATTERN.format(identifier=identifier)
                            new_images.append(new_url)
                        else:
                            # Si no se puede extraer identificador, mantener original
                            new_images.append(img_path)
                    else:
                        # Si ya es URL externa, mantenerla
                        new_images.append(img_path)
                
                # Actualizar producto en BD
                try:
                    supabase.table('marketplace_products').update({
                        'images': new_images
                    }).eq('id', product_id).execute()
                    
                    updated_count += 1
                    
                    if updated_count % 50 == 0:
                        print(f"   ✅ {updated_count} productos actualizados...")
                        
                except Exception as e:
                    error_count += 1
                    print(f"   ❌ Error actualizando producto {product_id}: {e}")
            
            offset += batch_size
            
            # Si hay menos productos que el batch_size, terminamos
            if len(products) < batch_size:
                break
                
        except Exception as e:
            print(f"❌ Error en lote {offset // batch_size + 1}: {e}")
            break
    
    print()
    print("=" * 60)
    print("📊 RESUMEN DE MIGRACIÓN")
    print("=" * 60)
    print(f"✅ Productos actualizados: {updated_count}")
    print(f"⏭️  Productos omitidos: {skipped_count}")
    print(f"❌ Errores: {error_count}")
    print()
    print("🎉 Migración completada!")
    print()
    print("📝 PRÓXIMOS PASOS:")
    print("1. Verificar que next.config.ts permite el dominio 'www.truper.com'")
    print("2. Probar carga de imágenes en producción")
    print("3. Verificar que las URLs funcionan correctamente")

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: Variables de entorno SUPABASE no configuradas")
        print("   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local")
        return
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Confirmar antes de ejecutar
    print("⚠️  ADVERTENCIA: Este script actualizará las rutas de imágenes en la base de datos")
    print("   Las rutas locales se convertirán a URLs de TRUPER")
    print()
    response = input("¿Continuar? (s/n): ")
    
    if response.lower() != 's':
        print("❌ Migración cancelada")
        return
    
    migrate_product_images(supabase)

if __name__ == "__main__":
    main()

