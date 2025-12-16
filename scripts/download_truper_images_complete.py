#!/usr/bin/env python3
"""
Descargador Completo de Imágenes TRUPER
Descarga todas las imágenes disponibles desde el banco de contenido digital
"""

import csv
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlencode
import os

# Configuration
CSV_FILE = Path("data/truper_catalog_full.csv")
IMAGE_DIR = Path("public/images/marketplace/truper")
LOG_FILE = Path("scripts/truper_download_log.json")
BATCH_SIZE = 50  # Procesar en lotes para no sobrecargar
DELAY_BETWEEN_REQUESTS = 0.5  # Segundos entre requests

# URL base del banco de imágenes
TRUPER_IMAGE_BASE_URL = "https://www.truper.com/media/import/imagenes/{codigo}.jpg"
TRUPER_SEARCH_URL = "https://www.truper.com/BancoContenidoDigital/index.php?r=site/search"

class TruperImageDownloader:
    def __init__(self):
        self.downloaded = []
        self.skipped = []
        self.failed = []
        self.stats = {
            "total_processed": 0,
            "downloaded": 0,
            "already_exists": 0,
            "not_found": 0,
            "errors": 0,
        }
        
        # Crear directorio si no existe
        IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        
        # Cargar log previo si existe
        self.load_log()

    def load_log(self):
        """Cargar log previo"""
        if LOG_FILE.exists():
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.downloaded = data.get("downloaded", [])
                self.skipped = data.get("skipped", [])
                self.failed = data.get("failed", [])

    def save_log(self):
        """Guardar log"""
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "downloaded": self.downloaded,
                "skipped": self.skipped,
                "failed": self.failed,
                "stats": self.stats,
            }, f, indent=2, ensure_ascii=False)

    def download_image(self, codigo: str, clave: str) -> tuple[bool, Optional[str]]:
        """Descarga una imagen para un código/clave dado"""
        # Verificar si ya existe
        image_key = clave if clave else codigo
        
        # Intentar diferentes variaciones de nombre
        variations = [
            f"{image_key}.jpg",
            f"{codigo}.jpg",
            f"{image_key}.webp",
            f"{codigo}.webp",
        ]
        
        # Verificar si ya existe localmente
        for var in variations:
            local_path = IMAGE_DIR / var
            if local_path.exists():
                self.stats["already_exists"] += 1
                return True, f"/images/marketplace/truper/{var}"
        
        # Intentar descargar desde URL directa
        # TRUPER usa el código para las imágenes
        image_url = TRUPER_IMAGE_BASE_URL.format(codigo=codigo)
        
        try:
            response = requests.get(image_url, timeout=10, stream=True)
            if response.status_code == 200:
                # Verificar que sea una imagen válida
                content_type = response.headers.get('content-type', '')
                if 'image' in content_type:
                    # Guardar imagen
                    filename = f"{image_key}.jpg"
                    filepath = IMAGE_DIR / filename
                    
                    with open(filepath, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    self.downloaded.append({
                        "codigo": codigo,
                        "clave": clave,
                        "filename": filename,
                        "url": image_url,
                    })
                    self.stats["downloaded"] += 1
                    return True, f"/images/marketplace/truper/{filename}"
                else:
                    self.stats["not_found"] += 1
                    return False, None
            else:
                self.stats["not_found"] += 1
                return False, None
                
        except Exception as e:
            self.stats["errors"] += 1
            self.failed.append({
                "codigo": codigo,
                "clave": clave,
                "error": str(e),
            })
            return False, None

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

    def process_all(self):
        """Procesa todos los productos del CSV"""
        print("📖 Leyendo CSV...")
        rows = self.read_csv()
        total = len(rows)
        print(f"   Encontradas {total} filas")
        
        print(f"\n🔄 Procesando productos en lotes de {BATCH_SIZE}...")
        print("   (Esto puede tardar varias horas para todos los productos)\n")
        
        processed = 0
        for i, row in enumerate(rows):
            codigo = row.get("código", "").strip()
            clave = row.get("clave", "").strip()
            
            if not codigo:
                continue
            
            # Saltar si ya está descargado
            if any(item.get("codigo") == codigo for item in self.downloaded):
                continue
            
            # Descargar imagen
            success, image_path = self.download_image(codigo, clave)
            
            processed += 1
            self.stats["total_processed"] += 1
            
            # Mostrar progreso cada 10 productos
            if processed % 10 == 0:
                print(f"   Procesados: {processed}/{total} ({processed*100//total}%) | "
                      f"Descargadas: {self.stats['downloaded']} | "
                      f"Existentes: {self.stats['already_exists']} | "
                      f"No encontradas: {self.stats['not_found']}")
            
            # Guardar log cada 50 productos
            if processed % 50 == 0:
                self.save_log()
            
            # Delay para no sobrecargar el servidor
            time.sleep(DELAY_BETWEEN_REQUESTS)
        
        # Guardar log final
        self.save_log()
        
        # Mostrar estadísticas finales
        print("\n" + "=" * 60)
        print("📊 ESTADÍSTICAS DE DESCARGA")
        print("=" * 60)
        print(f"Total procesados: {self.stats['total_processed']}")
        print(f"Descargadas nuevas: {self.stats['downloaded']}")
        print(f"Ya existían: {self.stats['already_exists']}")
        print(f"No encontradas: {self.stats['not_found']}")
        print(f"Errores: {self.stats['errors']}")
        print(f"\n📝 Log guardado: {LOG_FILE}")
        print("=" * 60)


def main():
    """Función principal"""
    print("🚀 Descargador Completo de Imágenes TRUPER")
    print("=" * 60)
    print(f"📁 Directorio de imágenes: {IMAGE_DIR}")
    print(f"📄 CSV fuente: {CSV_FILE}")
    print("=" * 60)
    
    if not CSV_FILE.exists():
        print(f"❌ Error: No se encontró el archivo CSV: {CSV_FILE}")
        return
    
    downloader = TruperImageDownloader()
    
    try:
        downloader.process_all()
        print("\n✨ ¡Proceso completado!")
        print(f"\n📋 Próximos pasos:")
        print(f"   1. Revisar imágenes descargadas en: {IMAGE_DIR}")
        print(f"   2. Ejecutar script de importación nuevamente para incluir nuevas imágenes")
        print(f"   3. Verificar log de descargas: {LOG_FILE}")
    except KeyboardInterrupt:
        print("\n\n⚠️ Proceso interrumpido por el usuario")
        print("   El progreso se ha guardado en el log")
        downloader.save_log()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        downloader.save_log()


if __name__ == "__main__":
    main()

