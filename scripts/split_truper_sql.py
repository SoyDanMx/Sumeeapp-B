#!/usr/bin/env python3
"""
Divide el archivo SQL de importación TRUPER en chunks ejecutables
Cada chunk contiene aproximadamente 1000 productos
"""

from pathlib import Path

SQL_FILE = Path("supabase/migrations/20250120_import_truper_full_catalog.sql")
OUTPUT_DIR = Path("supabase/migrations/truper_chunks")

# Configuración
PRODUCTS_PER_CHUNK = 1000  # Productos por archivo
CHUNK_PREFIX = "20250120_import_truper_chunk"

def split_sql_file():
    """Divide el archivo SQL en chunks más pequeños"""
    
    # Crear directorio de salida
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"📖 Leyendo archivo SQL: {SQL_FILE}")
    with open(SQL_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Dividir en líneas
    lines = content.split("\n")
    
    # Encontrar el inicio de los INSERT statements
    # El archivo tiene headers y luego INSERT statements
    insert_start_idx = None
    for i, line in enumerate(lines):
        if "INSERT INTO public.marketplace_products" in line:
            insert_start_idx = i
            break
    
    if insert_start_idx is None:
        print("❌ Error: No se encontró el inicio de los INSERT statements")
        return
    
    # Separar headers y INSERT statements
    headers = lines[:insert_start_idx]
    insert_lines = lines[insert_start_idx:]
    
    # Contar productos (cada INSERT es un producto)
    product_count = sum(1 for line in insert_lines if "INSERT INTO" in line)
    print(f"📊 Total productos: {product_count}")
    print(f"📦 Dividiendo en chunks de ~{PRODUCTS_PER_CHUNK} productos...")
    
    # Dividir en chunks (solo después de completar cada INSERT)
    chunks = []
    current_chunk = []
    current_count = 0
    in_insert = False
    
    for line in insert_lines:
        current_chunk.append(line)
        
        # Detectar inicio de INSERT
        if "INSERT INTO" in line:
            in_insert = True
        
        # Detectar fin de INSERT (termina con ;)
        if in_insert and line.strip().endswith(";"):
            current_count += 1
            in_insert = False
            
            # Si llegamos al límite, guardar chunk
            if current_count >= PRODUCTS_PER_CHUNK:
                chunks.append(current_chunk)
                current_chunk = []
                current_count = 0
    
    # Agregar último chunk si tiene contenido
    if current_chunk:
        chunks.append(current_chunk)
    
    print(f"✅ Dividido en {len(chunks)} chunks")
    
    # Escribir cada chunk
    for i, chunk_lines in enumerate(chunks, 1):
        chunk_file = OUTPUT_DIR / f"{CHUNK_PREFIX}_{i:03d}.sql"
        
        # Contar productos en este chunk
        chunk_product_count = sum(1 for line in chunk_lines if "INSERT INTO" in line)
        
        # Crear contenido del chunk
        chunk_content = "\n".join(headers)
        chunk_content += "\n"
        chunk_content += f"-- Chunk {i} de {len(chunks)}\n"
        chunk_content += f"-- Productos: {chunk_product_count}\n"
        chunk_content += "\n"
        chunk_content += "\n".join(chunk_lines)
        
        # Agregar verificación al final del último chunk
        if i == len(chunks):
            chunk_content += "\n\n"
            chunk_content += "-- Verificación final\n"
            chunk_content += "DO $$\n"
            chunk_content += "DECLARE\n"
            chunk_content += "    total_imported INTEGER;\n"
            chunk_content += "BEGIN\n"
            chunk_content += "    SELECT COUNT(*) INTO total_imported \n"
            chunk_content += "    FROM public.marketplace_products \n"
            chunk_content += "    WHERE seller_id IS NULL AND contact_phone = '5636741156';\n"
            chunk_content += "    \n"
            chunk_content += "    RAISE NOTICE '✅ Importación completada: % productos de TRUPER importados', total_imported;\n"
            chunk_content += "END $$;\n"
        
        # Escribir archivo
        with open(chunk_file, "w", encoding="utf-8") as f:
            f.write(chunk_content)
        
        print(f"   ✅ Chunk {i}: {chunk_file.name} ({chunk_product_count} productos, {len(chunk_content):,} caracteres)")
    
    print(f"\n✨ ¡Proceso completado!")
    print(f"📁 Archivos generados en: {OUTPUT_DIR}")
    print(f"\n📋 Próximos pasos:")
    print(f"   1. Ejecuta cada chunk en orden en Supabase SQL Editor")
    print(f"   2. O ejecuta todos con: python3 scripts/execute_chunks.py")
    print(f"\n📝 Archivos generados:")
    for i in range(1, len(chunks) + 1):
        chunk_file = OUTPUT_DIR / f"{CHUNK_PREFIX}_{i:03d}.sql"
        print(f"   - {chunk_file.name}")

if __name__ == "__main__":
    split_sql_file()

