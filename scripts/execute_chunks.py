#!/usr/bin/env python3
"""
Ejecuta todos los chunks de importación TRUPER secuencialmente
Requiere: psql y credenciales de Supabase
"""

import os
import subprocess
from pathlib import Path

CHUNKS_DIR = Path("supabase/migrations/truper_chunks")

# Obtener credenciales de entorno o pedirlas
def get_db_connection_string():
    """Obtiene la cadena de conexión de Supabase"""
    
    # Intentar desde variables de entorno
    db_password = os.getenv("SUPABASE_DB_PASSWORD")
    project_ref = os.getenv("SUPABASE_PROJECT_REF", "jkdvrwmanmwoyyoixmnt")
    
    if not db_password:
        print("⚠️  Variable SUPABASE_DB_PASSWORD no encontrada")
        print("\n📋 Para ejecutar automáticamente, configura:")
        print("   export SUPABASE_DB_PASSWORD='tu_password'")
        print("   export SUPABASE_PROJECT_REF='jkdvrwmanmwoyyoixmnt'")
        print("\n💡 Obtén el password en:")
        print("   https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/settings/database")
        print("\n📋 Alternativa: Ejecuta manualmente cada chunk en SQL Editor")
        return None
    
    return f"postgresql://postgres:{db_password}@db.{project_ref}.supabase.co:5432/postgres"

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
    
    # Obtener conexión
    conn_string = get_db_connection_string()
    
    if not conn_string:
        print("\n📋 INSTRUCCIONES PARA EJECUCIÓN MANUAL:")
        print("=" * 60)
        for i, chunk_file in enumerate(chunks, 1):
            print(f"\nChunk {i}/{len(chunks)}: {chunk_file.name}")
            print(f"   Archivo: {chunk_file}")
            print(f"   Tamaño: {chunk_file.stat().st_size:,} bytes")
        print("\n" + "=" * 60)
        print("\n💡 Ejecuta cada chunk en orden en Supabase SQL Editor:")
        print("   https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/sql")
        return
    
    # Verificar que psql está disponible
    try:
        subprocess.run(["psql", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: psql no está instalado o no está en PATH")
        print("   Instala PostgreSQL para obtener psql")
        return
    
    # Ejecutar cada chunk
    print("🚀 Ejecutando chunks con psql...\n")
    
    for i, chunk_file in enumerate(chunks, 1):
        print(f"[{i}/{len(chunks)}] Ejecutando {chunk_file.name}...", end=" ")
        
        try:
            result = subprocess.run(
                ["psql", conn_string, "-f", str(chunk_file)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos por chunk
            )
            
            if result.returncode == 0:
                print("✅ Completado")
            else:
                print(f"❌ Error (código {result.returncode})")
                print(f"   {result.stderr[:200]}")
                print("\n⚠️  Deteniendo ejecución debido a error")
                return
                
        except subprocess.TimeoutExpired:
            print("⏱️  Timeout (puede estar ejecutándose)")
        except Exception as e:
            print(f"❌ Error: {e}")
            return
    
    print("\n✨ ¡Todos los chunks ejecutados exitosamente!")
    print("\n📊 Verifica la importación:")
    print("   SELECT COUNT(*) FROM public.marketplace_products")
    print("   WHERE seller_id IS NULL AND contact_phone = '5636741156';")

if __name__ == "__main__":
    execute_chunks()

