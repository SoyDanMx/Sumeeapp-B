#!/usr/bin/env python3
"""
Importador Completo de Catálogo TRUPER
Lee el CSV completo y genera script SQL para insertar todos los productos con imágenes
"""

import csv
import json
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional

# Configuration
CSV_FILE = Path("data/truper_catalog_full.csv")
SQL_OUTPUT_FILE = Path("supabase/migrations/20250120_import_truper_full_catalog.sql")
IMAGE_URL_PATTERN = "https://www.truper.com/media/import/imagenes/{codigo}.jpg"
LOCAL_IMAGE_PATTERN = "/images/marketplace/truper/{codigo}.jpg"
MAX_WORKERS = 10  # Concurrent image checks
TIMEOUT = 5  # Seconds
LOG_FILE = Path("scripts/truper_import_log.json")

# Mapeo de familias TRUPER a categorías normalizadas
FAMILY_TO_CATEGORY = {
    "P085": "plomeria",  # Llaves ajustables
    "P049": "varios",  # Cutters y exactos
    "P129": "construccion",  # Discos de sierra
    "P216": "jardineria",  # Serruchos jardineros
    "P515": "construccion",  # Discos de lija
    "P402": "jardineria",  # Cavadores
    # Agregar más mapeos según sea necesario
}

# Mapeo de descripciones de familia a categorías
FAMILY_DESC_TO_CATEGORY = {
    "llaves": "plomeria",
    "cutters": "varios",
    "sierra": "construccion",
    "serrucho": "jardineria",
    "lija": "construccion",
    "cavador": "jardineria",
    "electric": "electricidad",
    "eléctrica": "electricidad",
    "construccion": "construccion",
    "construcción": "construccion",
    "plomeria": "plomeria",
    "plomería": "plomeria",
    "mecanica": "mecanica",
    "mecánica": "mecanica",
    "pintura": "pintura",
    "jardineria": "jardineria",
    "jardinería": "jardineria",
}


class TruperImporter:
    def __init__(self):
        self.sql_statements = []
        self.stats = {
            "total_rows": 0,
            "with_images": 0,
            "without_images": 0,
            "skipped": 0,
            "errors": 0,
        }
        self.log_data = {
            "imported": [],
            "skipped": [],
            "errors": [],
        }

    def check_image_exists(self, codigo: str) -> tuple[bool, str]:
        """Verifica si existe imagen para un código"""
        # Primero verificar imagen local
        local_path = Path(f"public/images/marketplace/truper/{codigo}.jpg")
        if local_path.exists():
            return True, LOCAL_IMAGE_PATTERN.format(codigo=codigo)

        # Si no existe local, verificar URL remota
        remote_url = IMAGE_URL_PATTERN.format(codigo=codigo)
        try:
            req = urllib.request.Request(remote_url, method="HEAD")
            with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
                if response.status == 200:
                    return True, remote_url
        except (urllib.error.HTTPError, urllib.error.URLError, Exception):
            pass

        return False, ""

    def map_category(self, familia: str, desc_familia: str) -> str:
        """Mapea familia TRUPER a categoría normalizada"""
        # Buscar por código de familia
        if familia and familia in FAMILY_TO_CATEGORY:
            return FAMILY_TO_CATEGORY[familia]

        # Buscar por descripción de familia
        desc_lower = desc_familia.lower() if desc_familia else ""
        for key, category in FAMILY_DESC_TO_CATEGORY.items():
            if key in desc_lower:
                return category

        # Por defecto: varios
        return "varios"

    def determine_power_type(self, descripcion: str, clave: str) -> Optional[str]:
        """Determina el tipo de potencia basado en descripción y clave"""
        desc_lower = descripcion.lower() if descripcion else ""
        clave_lower = clave.lower() if clave else ""

        text = f"{desc_lower} {clave_lower}"

        if any(word in text for word in ["inalámbrico", "inalambrico", "bateria", "batería", "cordless"]):
            return "cordless"
        elif any(word in text for word in ["electric", "eléctrico", "eléctrica", "enchufe"]):
            return "electric"
        elif any(word in text for word in ["manual", "mango", "mano"]):
            return "manual"

        return None

    def process_row(self, row: Dict[str, str]) -> Optional[str]:
        """Procesa una fila del CSV y genera SQL si tiene imagen"""
        codigo = row.get("código", "").strip()
        clave = row.get("clave", "").strip()
        descripcion = row.get("descripción", "").strip()
        precio_publico = row.get("precio público con IVA", "").strip()
        precio_distribuidor = row.get("precio distribuidor con IVA", "").strip()
        familia = row.get("Familia", "").strip()
        desc_familia = row.get("Descripción Familia", "").strip()

        if not codigo or not descripcion:
            return None

        # Verificar si tiene imagen
        has_image, image_url = self.check_image_exists(codigo)
        if not has_image:
            self.stats["without_images"] += 1
            self.log_data["skipped"].append({
                "codigo": codigo,
                "clave": clave,
                "reason": "no_image",
            })
            return None

        # Determinar precio (usar precio público, si no existe usar distribuidor)
        try:
            price = float(precio_publico.replace(",", "")) if precio_publico else None
            if not price and precio_distribuidor:
                price = float(precio_distribuidor.replace(",", ""))
            if not price:
                self.stats["skipped"] += 1
                return None
        except (ValueError, AttributeError):
            self.stats["skipped"] += 1
            return None

        # Mapear categoría
        category_slug = self.map_category(familia, desc_familia)

        # Determinar power_type
        power_type = self.determine_power_type(descripcion, clave)

        # Generar SQL INSERT
        # Nota: seller_id será NULL para productos oficiales de Sumee
        # Usar clave como título si es más descriptivo, sino usar descripción
        title = descripcion[:200]  # Limitar longitud del título
        
        sql = f"""INSERT INTO public.marketplace_products (
    seller_id,
    title,
    description,
    price,
    original_price,
    condition,
    category_id,
    images,
    location_city,
    location_zone,
    status,
    contact_phone,
    power_type,
    created_at,
    updated_at
) VALUES (
    NULL, -- Producto oficial de Sumee
    {self.escape_sql(title)},
    {self.escape_sql(descripcion[:1000])}, -- Limitar descripción a 1000 caracteres
    {price},
    NULL,
    'nuevo',
    (SELECT id FROM public.marketplace_categories WHERE slug = '{category_slug}' LIMIT 1),
    ARRAY[{self.escape_sql(image_url)}],
    'CDMX',
    'Entrega Inmediata',
    'active',
    '5636741156',
    {self.escape_sql_nullable(power_type)},
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
"""

        self.stats["with_images"] += 1
        self.log_data["imported"].append({
            "codigo": codigo,
            "clave": clave,
            "title": descripcion[:50],
            "price": price,
            "category": category_slug,
            "power_type": power_type,
            "image": image_url,
        })

        return sql

    def escape_sql(self, value: str) -> str:
        """Escapa valores SQL"""
        if not value:
            return "NULL"
        # Escapar comillas simples
        escaped = value.replace("'", "''")
        return f"'{escaped}'"

    def escape_sql_nullable(self, value: Optional[str]) -> str:
        """Escapa valores SQL nullable"""
        if not value:
            return "NULL"
        return self.escape_sql(value)

    def read_csv(self) -> List[Dict[str, str]]:
        """Lee el CSV y retorna lista de diccionarios"""
        rows = []
        with open(CSV_FILE, "r", encoding="utf-8") as f:
            # Leer todas las líneas
            lines = f.readlines()
            
            # Buscar la línea que contiene los headers (buscar "código")
            header_line_idx = None
            for i, line in enumerate(lines):
                if "código" in line.lower() and "clave" in line.lower():
                    header_line_idx = i
                    break
            
            if header_line_idx is None:
                raise ValueError("No se encontró la línea de headers en el CSV")
            
            # Leer desde la línea de headers
            reader = csv.DictReader(lines[header_line_idx:])
            for row in reader:
                # Filtrar filas vacías
                if any(row.values()):
                    rows.append(row)
        return rows

    def check_images_batch(self, codigos: List[str]) -> Dict[str, tuple[bool, str]]:
        """Verifica imágenes en batch usando threads"""
        results = {}

        def check_one(codigo: str):
            return codigo, self.check_image_exists(codigo)

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(check_one, codigo): codigo for codigo in codigos}
            for future in as_completed(futures):
                codigo, result = future.result()
                results[codigo] = result

        return results

    def generate_sql(self):
        """Genera el script SQL completo"""
        print("📖 Leyendo CSV...")
        rows = self.read_csv()
        self.stats["total_rows"] = len(rows)

        print(f"✅ Leídas {len(rows)} filas del CSV")
        print("🔍 Verificando imágenes disponibles...")

        # Extraer códigos únicos
        codigos = [row.get("código", "").strip() for row in rows if row.get("código", "").strip()]
        codigos = list(set(codigos))

        print(f"📦 Verificando {len(codigos)} productos únicos...")

        # Verificar imágenes en batch
        image_results = self.check_images_batch(codigos)

        # Procesar filas y generar SQL
        print("⚙️ Generando SQL...")
        for i, row in enumerate(rows):
            if (i + 1) % 100 == 0:
                print(f"   Procesando {i + 1}/{len(rows)}...")

            codigo = row.get("código", "").strip()
            if not codigo:
                continue

            # Verificar si tiene imagen
            has_image, image_url = image_results.get(codigo, (False, ""))
            if not has_image:
                continue

            # Procesar fila
            sql = self.process_row(row)
            if sql:
                self.sql_statements.append(sql)

        # Generar archivo SQL
        print("💾 Generando archivo SQL...")
        sql_content = f"""-- =========================================================================
-- Importación Completa de Catálogo TRUPER
-- =========================================================================
-- Este script importa todos los productos de TRUPER que tienen imágenes disponibles
-- Generado automáticamente desde: {CSV_FILE.name}
-- Fecha: {Path(__file__).stat().st_mtime}
-- =========================================================================

-- Verificar que exista al menos una categoría
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.marketplace_categories LIMIT 1) THEN
        RAISE EXCEPTION 'No hay categorías en marketplace_categories. Ejecuta primero la migración de normalización de categorías.';
    END IF;
END $$;

-- Insertar productos
{chr(10).join(self.sql_statements)}

-- Verificación final
DO $$
DECLARE
    total_imported INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_imported 
    FROM public.marketplace_products 
    WHERE seller_id IS NULL AND contact_phone = '5636741156';
    
    RAISE NOTICE '✅ Importación completada: % productos de TRUPER importados', total_imported;
END $$;
"""

        with open(SQL_OUTPUT_FILE, "w", encoding="utf-8") as f:
            f.write(sql_content)

        # Guardar log
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(self.log_data, f, indent=2, ensure_ascii=False)

        # Mostrar estadísticas
        print("\n" + "=" * 60)
        print("📊 ESTADÍSTICAS DE IMPORTACIÓN")
        print("=" * 60)
        print(f"Total de filas en CSV: {self.stats['total_rows']}")
        print(f"Productos con imágenes: {self.stats['with_images']}")
        print(f"Productos sin imágenes: {self.stats['without_images']}")
        print(f"Productos omitidos: {self.stats['skipped']}")
        print(f"Errores: {self.stats['errors']}")
        print(f"\n✅ Script SQL generado: {SQL_OUTPUT_FILE}")
        print(f"📝 Log guardado: {LOG_FILE}")
        print("=" * 60)


def main():
    """Función principal"""
    print("🚀 Importador Completo de Catálogo TRUPER")
    print("=" * 60)

    if not CSV_FILE.exists():
        print(f"❌ Error: No se encontró el archivo CSV: {CSV_FILE}")
        return

    importer = TruperImporter()
    importer.generate_sql()

    print("\n✨ ¡Proceso completado!")
    print(f"\n📋 Próximos pasos:")
    print(f"   1. Revisar el script SQL generado: {SQL_OUTPUT_FILE}")
    print(f"   2. Ejecutar en Supabase Dashboard → SQL Editor")
    print(f"   3. Verificar productos importados en la tabla marketplace_products")


if __name__ == "__main__":
    main()

