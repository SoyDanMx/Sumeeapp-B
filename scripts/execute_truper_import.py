#!/usr/bin/env python3
"""
Ejecuta el SQL de importación de TRUPER en Supabase
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client

# Leer variables de entorno
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Variables de entorno no encontradas")
    print("   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Crear cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Leer archivo SQL
SQL_FILE = Path("supabase/migrations/20250120_import_truper_full_catalog.sql")

if not SQL_FILE.exists():
    print(f"❌ Error: No se encontró el archivo {SQL_FILE}")
    sys.exit(1)

print(f"📖 Leyendo archivo SQL: {SQL_FILE}")
with open(SQL_FILE, "r", encoding="utf-8") as f:
    sql_content = f.read()

print(f"📊 Tamaño del SQL: {len(sql_content):,} caracteres")
print(f"📝 Líneas: {sql_content.count(chr(10)):,}")

# Dividir en chunks si es muy grande (Supabase tiene límites)
# Ejecutar en partes si es necesario
MAX_CHUNK_SIZE = 1000000  # 1MB por chunk

if len(sql_content) > MAX_CHUNK_SIZE:
    print(f"\n⚠️ El SQL es muy grande, dividiendo en chunks...")
    chunks = []
    current_chunk = ""
    
    for line in sql_content.split("\n"):
        if len(current_chunk) + len(line) > MAX_CHUNK_SIZE and current_chunk:
            chunks.append(current_chunk)
            current_chunk = line + "\n"
        else:
            current_chunk += line + "\n"
    
    if current_chunk:
        chunks.append(current_chunk)
    
    print(f"   Dividido en {len(chunks)} chunks")
    
    for i, chunk in enumerate(chunks, 1):
        print(f"\n🔄 Ejecutando chunk {i}/{len(chunks)}...")
        try:
            result = supabase.rpc("exec_sql", {"sql": chunk}).execute()
            print(f"   ✅ Chunk {i} ejecutado exitosamente")
        except Exception as e:
            print(f"   ❌ Error en chunk {i}: {e}")
            # Intentar ejecutar directamente con postgrest
            try:
                # Usar la API REST directamente
                response = supabase.postgrest.session.post(
                    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
                    json={"sql": chunk},
                    headers={"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
                )
                if response.status_code == 200:
                    print(f"   ✅ Chunk {i} ejecutado exitosamente (método alternativo)")
                else:
                    print(f"   ❌ Error: {response.status_code} - {response.text}")
            except Exception as e2:
                print(f"   ❌ Error alternativo: {e2}")
else:
    print("\n🔄 Ejecutando SQL completo...")
    try:
        # Intentar ejecutar usando RPC si existe la función
        result = supabase.rpc("exec_sql", {"sql": sql_content}).execute()
        print("✅ SQL ejecutado exitosamente")
    except Exception as e:
        print(f"❌ Error ejecutando SQL: {e}")
        print("\n💡 Nota: Necesitas ejecutar este SQL manualmente en Supabase SQL Editor")
        print(f"   Archivo: {SQL_FILE}")
        sys.exit(1)

print("\n✨ ¡Proceso completado!")


