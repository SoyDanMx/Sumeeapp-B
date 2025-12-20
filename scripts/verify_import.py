#!/usr/bin/env python3
"""
Verifica que los productos TRUPER se importaron correctamente
"""

import os
import psycopg2

def verify_import():
    """Verifica la importación"""
    
    # Credenciales
    db_password = os.getenv("SUPABASE_DB_PASSWORD", "C4pr12025$#")
    project_ref = os.getenv("SUPABASE_PROJECT_REF", "jkdvrwmanmwoyyoixmnt")
    
    # Conectar
    conn_string = f"host=db.{project_ref}.supabase.co port=5432 dbname=postgres user=postgres password={db_password}"
    
    try:
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor()
        
        # Verificar total
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM public.marketplace_products 
            WHERE seller_id IS NULL AND contact_phone = '5636741156';
        """)
        total = cursor.fetchone()[0]
        
        # Verificar con imágenes
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as con_imagenes,
                COUNT(CASE WHEN images IS NULL OR array_length(images, 1) = 0 THEN 1 END) as sin_imagenes
            FROM public.marketplace_products 
            WHERE seller_id IS NULL AND contact_phone = '5636741156';
        """)
        stats = cursor.fetchone()
        
        # Ver algunos ejemplos
        cursor.execute("""
            SELECT title, price, images 
            FROM public.marketplace_products 
            WHERE seller_id IS NULL 
              AND images IS NOT NULL 
              AND array_length(images, 1) > 0
            LIMIT 5;
        """)
        examples = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Mostrar resultados
        print("=" * 60)
        print("📊 VERIFICACIÓN DE IMPORTACIÓN")
        print("=" * 60)
        print(f"✅ Total productos importados: {total:,}")
        print(f"✅ Productos con imágenes: {stats[1]:,}")
        print(f"⚠️  Productos sin imágenes: {stats[2]:,}")
        print("\n📦 Ejemplos de productos importados:")
        for title, price, images in examples:
            print(f"   - {title[:50]}... | ${price} | {len(images)} imagen(es)")
        
        print("\n✨ ¡Importación verificada exitosamente!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    verify_import()


