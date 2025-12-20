#!/usr/bin/env python3
"""
Ejecuta el SQL de importación de TRUPER en Supabase dividiéndolo en chunks
Usa la API REST de Supabase para ejecutar el SQL
"""

import os
import sys
import requests
from pathlib import Path

# Leer variables de entorno
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Variables de entorno no encontradas")
    print("   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY")
    print("   Ejecuta: export NEXT_PUBLIC_SUPABASE_URL=...")
    print("   Ejecuta: export SUPABASE_SERVICE_ROLE_KEY=...")
    sys.exit(1)

SQL_FILE = Path("supabase/migrations/20250120_import_truper_full_catalog.sql")

if not SQL_FILE.exists():
    print(f"❌ Error: No se encontró el archivo {SQL_FILE}")
    sys.exit(1)

print(f"📖 Leyendo archivo SQL: {SQL_FILE}")
with open(SQL_FILE, "r", encoding="utf-8") as f:
    sql_content = f.read()

print(f"📊 Tamaño del SQL: {len(sql_content):,} caracteres")
print(f"📝 Líneas: {sql_content.count(chr(10)):,}")

# El SQL Editor de Supabase puede manejar archivos grandes
# Pero para ejecutarlo programáticamente, necesitamos dividirlo
# Cada INSERT puede ejecutarse por separado

print("\n⚠️  IMPORTANTE:")
print("   Este archivo SQL es muy grande (449,714 líneas)")
print("   La mejor opción es ejecutarlo manualmente en Supabase SQL Editor")
print("")
print("📋 Instrucciones:")
print(f"   1. Ve a: {SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/').split('.supabase.co')[0]}/sql")
print(f"   2. Abre el archivo: {SQL_FILE}")
print(f"   3. Copia TODO el contenido")
print(f"   4. Pégalo en el SQL Editor de Supabase")
print(f"   5. Haz clic en 'Run' o presiona Cmd+Enter")
print("")
print("💡 Alternativa: Ejecutar con psql si tienes credenciales de DB")
print(f"   psql 'postgresql://postgres:[PASSWORD]@db.{SUPABASE_URL.split('//')[1].split('.')[0]}.supabase.co:5432/postgres' -f {SQL_FILE}")
print("")

# Intentar ejecutar usando la API REST (puede fallar por tamaño)
print("🔄 Intentando ejecutar usando API REST...")
print("   (Esto puede fallar si el SQL es muy grande)")

# Dividir en statements individuales (cada INSERT)
statements = []
current_statement = ""

for line in sql_content.split("\n"):
    current_statement += line + "\n"
    # Detectar fin de statement (INSERT seguido de ;)
    if line.strip().endswith(";") and "INSERT INTO" in current_statement:
        statements.append(current_statement.strip())
        current_statement = ""

if current_statement.strip():
    statements.append(current_statement.strip())

print(f"   Encontrados {len(statements)} statements INSERT")
print(f"   Ejecutando en lotes de 100...")

# Ejecutar en lotes
batch_size = 100
total_batches = (len(statements) + batch_size - 1) // batch_size

for batch_num in range(total_batches):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, len(statements))
    batch = statements[start_idx:end_idx]
    
    # Combinar statements del batch
    batch_sql = "\n".join(batch)
    
    print(f"   Procesando batch {batch_num + 1}/{total_batches} (statements {start_idx}-{end_idx})...", end=" ")
    
    # Intentar ejecutar usando RPC (puede no existir)
    try:
        # Nota: Supabase no tiene una función RPC para ejecutar SQL arbitrario por seguridad
        # Necesitamos usar psql o el SQL Editor manualmente
        print("❌ No se puede ejecutar automáticamente")
        print("   Supabase no permite ejecutar SQL arbitrario vía API por seguridad")
        break
    except Exception as e:
        print(f"❌ Error: {e}")
        break

print("\n✅ Mejor opción: Ejecutar manualmente en Supabase SQL Editor")
print("   El archivo está listo para copiar y pegar")


