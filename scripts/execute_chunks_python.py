#!/usr/bin/env python3
"""
Ejecuta todos los chunks de importación TRUPER usando Python
Conecta directamente a PostgreSQL usando psycopg2
"""

import os
import sys
from pathlib import Path

# Intentar importar psycopg2
try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("❌ Error: psycopg2 no está instalado")
    print("\n📦 Instala con:")
    print("   pip install psycopg2-binary")
    print("\n💡 O ejecuta manualmente en Supabase SQL Editor")
    sys.exit(1)

CHUNKS_DIR = Path("supabase/migrations/truper_chunks")

def get_db_connection():
    """Crea conexión a la base de datos"""
    
    # Obtener credenciales
    db_password = os.getenv("SUPABASE_DB_PASSWORD", "C4pr12025$#")
    project_ref = os.getenv("SUPABASE_PROJECT_REF", "jkdvrwmanmwoyyoixmnt")
    
    # Construir connection string
    conn_string = f"host=db.{project_ref}.supabase.co port=5432 dbname=postgres user=postgres password={db_password}"
    
    try:
        conn = psycopg2.connect(conn_string)
        return conn
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        return None

def execute_chunks():
    """Ejecuta todos los chunks en orden"""
    
    # Verificar que existe el directorio
    if not CHUNKS_DIR.exists():
        print(f"❌ Error: No se encontró el directorio {CHUNKS_DIR}")
        print("   Ejecuta primero: python3 scripts/split_truper_sql.py")
        return
    
    # Obtener lista de chunks ordenados
    chunks = sorted(CHUNKS_DIR.glob("20250120_import_truper_chunk_*.sql"))
    
    if not chunks:
        print(f"❌ Error: No se encontraron chunks en {CHUNKS_DIR}")
        return
    
    print(f"📦 Encontrados {len(chunks)} chunks para ejecutar")
    print(f"📁 Directorio: {CHUNKS_DIR}\n")
    
    # Conectar a la base de datos
    print("🔌 Conectando a Supabase...")
    conn = get_db_connection()
    
    if not conn:
        print("\n📋 INSTRUCCIONES PARA EJECUCIÓN MANUAL:")
        print("=" * 60)
        for i, chunk_file in enumerate(chunks, 1):
            print(f"\nChunk {i}/{len(chunks)}: {chunk_file.name}")
            print(f"   Archivo: {chunk_file}")
        print("\n💡 Ejecuta cada chunk en orden en Supabase SQL Editor:")
        print("   https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/sql")
        return
    
    print("✅ Conectado exitosamente\n")
    
    # Ejecutar cada chunk
    print("🚀 Ejecutando chunks...\n")
    
    success_count = 0
    error_count = 0
    
    for i, chunk_file in enumerate(chunks, 1):
        print(f"[{i}/{len(chunks)}] Ejecutando {chunk_file.name}...", end=" ")
        
        try:
            # Leer contenido del chunk
            with open(chunk_file, "r", encoding="utf-8") as f:
                sql_content = f.read()
            
            # Ejecutar SQL
            cursor = conn.cursor()
            cursor.execute(sql_content)
            conn.commit()
            cursor.close()
            
            print("✅ Completado")
            success_count += 1
            
        except Exception as e:
            error_msg = str(e)[:100]
            print(f"❌ Error: {error_msg}")
            conn.rollback()
            error_count += 1
            
            # Preguntar si continuar
            if error_count >= 3:
                print("\n⚠️  Demasiados errores. Deteniendo ejecución.")
                break
    
    # Cerrar conexión
    conn.close()
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    print(f"✅ Chunks ejecutados exitosamente: {success_count}/{len(chunks)}")
    print(f"❌ Chunks con errores: {error_count}")
    
    if success_count == len(chunks):
        print("\n✨ ¡Todos los chunks ejecutados exitosamente!")
        print("\n📊 Verifica la importación:")
        print("   SELECT COUNT(*) FROM public.marketplace_products")
        print("   WHERE seller_id IS NULL AND contact_phone = '5636741156';")
    elif success_count > 0:
        print(f"\n⚠️  Se ejecutaron {success_count} chunks exitosamente")
        print("   Puedes ejecutar los chunks restantes manualmente en SQL Editor")
    else:
        print("\n❌ No se pudo ejecutar ningún chunk")
        print("   Ejecuta manualmente en Supabase SQL Editor")

if __name__ == "__main__":
    # Configurar variables de entorno si no están configuradas
    if not os.getenv("SUPABASE_DB_PASSWORD"):
        os.environ["SUPABASE_DB_PASSWORD"] = "C4pr12025$#"
    if not os.getenv("SUPABASE_PROJECT_REF"):
        os.environ["SUPABASE_PROJECT_REF"] = "jkdvrwmanmwoyyoixmnt"
    
    execute_chunks()


