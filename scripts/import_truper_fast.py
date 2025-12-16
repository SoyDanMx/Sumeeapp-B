#!/usr/bin/env python3
"""
Importador Rápido de Catálogo TRUPER
Versión optimizada que asume que las imágenes existen localmente
"""

import csv
import json
from pathlib import Path
from typing import Dict, List, Optional

# Configuration
CSV_FILE = Path("data/truper_catalog_full.csv")
SQL_OUTPUT_FILE = Path("supabase/migrations/20250120_import_truper_full_catalog.sql")
LOCAL_IMAGE_PATTERN = "/images/marketplace/truper/{codigo}.jpg"
LOG_FILE = Path("scripts/truper_import_log.json")

# Mapeo de familias TRUPER a categorías normalizadas
FAMILY_TO_CATEGORY = {
    "P085": "plomeria",
    "P049": "varios",
    "P129": "construccion",
    "P216": "jardineria",
    "P515": "construccion",
    "P402": "jardineria",
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
    "eléctrico": "electricidad",
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
    "herramienta": "herramienta-manual",
    "taladro": "electricidad",
    "rotomartillo": "electricidad",
    "esmeril": "electricidad",
    "pulidora": "electricidad",
    "sierra": "electricidad",
    "lijadora": "electricidad",
    "atornillador": "electricidad",
    "destornillador": "electricidad",
}


class TruperFastImporter:
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

    def map_category(self, familia: str, desc_familia: str) -> str:
        """Mapea familia TRUPER a categoría normalizada"""
        if familia and familia in FAMILY_TO_CATEGORY:
            return FAMILY_TO_CATEGORY[familia]

        desc_lower = (desc_familia or "").lower()
        for key, category in FAMILY_DESC_TO_CATEGORY.items():
            if key in desc_lower:
                return category

        return "varios"

    def determine_power_type(self, descripcion: str, clave: str) -> Optional[str]:
        """Determina el tipo de potencia basado en descripción y clave"""
        text = f"{(descripcion or '').lower()} {(clave or '').lower()}"

        if any(word in text for word in ["inalámbrico", "inalambrico", "bateria", "batería", "cordless", "battery"]):
            return "cordless"
        elif any(word in text for word in ["electric", "eléctrico", "eléctrica", "enchufe", "cable"]):
            return "electric"
        elif any(word in text for word in ["manual", "mango", "mano"]):
            return "manual"

        return None

    def escape_sql(self, value: str) -> str:
        """Escapa valores SQL"""
        if not value:
            return "NULL"
        escaped = value.replace("'", "''")
        return f"'{escaped}'"

    def escape_sql_nullable(self, value: Optional[str]) -> str:
        """Escapa valores SQL nullable"""
        if not value:
            return "NULL"
        return self.escape_sql(value)

    def process_row(self, row: Dict[str, str]) -> Optional[str]:
        """Procesa una fila del CSV y genera SQL"""
        codigo = row.get("código", "").strip()
        clave = row.get("clave", "").strip()
        descripcion = row.get("descripción", "").strip()
        precio_publico = row.get("precio público con IVA", "").strip()
        precio_distribuidor = row.get("precio distribuidor con IVA", "").strip()
        familia = row.get("Familia", "").strip()
        desc_familia = row.get("Descripción Familia", "").strip()

        if not codigo or not descripcion:
            return None

        # Usar la CLAVE para buscar la imagen (no el código numérico)
        # La clave es el identificador del producto (ej: DES-520, ESR-314)
        image_key = clave if clave else codigo
        
        # Verificar si existe imagen local
        # Intentar primero con la clave, luego con el código
        local_path_jpg = Path(f"public/images/marketplace/truper/{image_key}.jpg")
        local_path_webp = Path(f"public/images/marketplace/truper/{image_key}.webp")
        local_path_codigo_jpg = Path(f"public/images/marketplace/truper/{codigo}.jpg")
        local_path_codigo_webp = Path(f"public/images/marketplace/truper/{codigo}.webp")
        
        image_url = None
        if local_path_jpg.exists():
            image_url = f"/images/marketplace/truper/{image_key}.jpg"
        elif local_path_webp.exists():
            image_url = f"/images/marketplace/truper/{image_key}.webp"
        elif local_path_codigo_jpg.exists():
            image_url = f"/images/marketplace/truper/{codigo}.jpg"
        elif local_path_codigo_webp.exists():
            image_url = f"/images/marketplace/truper/{codigo}.webp"
        
        if not image_url:
            self.stats["without_images"] += 1
            return None

        # Determinar precio
        try:
            price = None
            if precio_publico:
                price = float(precio_publico.replace(",", "").replace("$", "").strip())
            if not price and precio_distribuidor:
                price = float(precio_distribuidor.replace(",", "").replace("$", "").strip())
            if not price or price <= 0:
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
        title = descripcion[:200]
        description = descripcion[:1000]

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
    NULL,
    {self.escape_sql(title)},
    {self.escape_sql(description)},
    {price},
    NULL,
    'nuevo',
    (SELECT id FROM public.marketplace_categories WHERE slug = {self.escape_sql(category_slug)} LIMIT 1),
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
            "title": title[:50],
            "price": price,
            "category": category_slug,
            "power_type": power_type,
            "image": image_url,
        })

        return sql

    def read_csv(self) -> List[Dict[str, str]]:
        """Lee el CSV y retorna lista de diccionarios"""
        rows = []
        with open(CSV_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()

            # Buscar la línea que contiene los headers
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
                if any(row.values()):
                    rows.append(row)
        return rows

    def generate_sql(self):
        """Genera el script SQL completo"""
        print("📖 Leyendo CSV...")
        rows = self.read_csv()
        self.stats["total_rows"] = len(rows)
        print(f"   Encontradas {len(rows)} filas")

        print("🔄 Procesando productos...")
        processed = 0
        for row in rows:
            try:
                sql = self.process_row(row)
                if sql:
                    self.sql_statements.append(sql)
                processed += 1
                if processed % 100 == 0:
                    print(f"   Procesados: {processed}/{len(rows)} ({processed*100//len(rows)}%)")
            except Exception as e:
                self.stats["errors"] += 1
                self.log_data["errors"].append({
                    "row": row.get("código", "unknown"),
                    "error": str(e),
                })

        # Generar archivo SQL
        print("💾 Generando archivo SQL...")
        sql_content = f"""-- =========================================================================
-- Importación Completa de Catálogo TRUPER
-- =========================================================================
-- Este script importa todos los productos de TRUPER que tienen imágenes disponibles
-- Generado automáticamente desde: {CSV_FILE.name}
-- Total productos procesados: {self.stats['total_rows']}
-- Productos con imágenes: {self.stats['with_images']}
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
        print(f"\n📝 Archivo SQL generado: {SQL_OUTPUT_FILE}")
        print(f"📝 Log guardado: {LOG_FILE}")
        print("=" * 60)


def main():
    """Función principal"""
    print("🚀 Importador Rápido de Catálogo TRUPER")
    print("=" * 60)

    if not CSV_FILE.exists():
        print(f"❌ Error: No se encontró el archivo CSV: {CSV_FILE}")
        return

    importer = TruperFastImporter()
    importer.generate_sql()

    print("\n✨ ¡Proceso completado!")
    print(f"\n📋 Próximos pasos:")
    print(f"   1. Revisar el script SQL generado: {SQL_OUTPUT_FILE}")
    print(f"   2. Ejecutar en Supabase Dashboard → SQL Editor")
    print(f"   3. Verificar productos importados en la tabla marketplace_products")


if __name__ == "__main__":
    main()

