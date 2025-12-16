#!/usr/bin/env python3
"""
Descargador Optimizado de Imágenes TRUPER
Estrategia híbrida: URL directa primero, luego banco si es necesario
"""

import csv
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from playwright.sync_api import sync_playwright

# Configuration
CSV_FILE = Path("data/truper_catalog_full.csv")
IMAGE_DIR = Path("public/images/marketplace/truper")
LOG_FILE = Path("scripts/truper_download_log.json")
TRUPER_IMAGE_BASE_URL = "https://www.truper.com/media/import/imagenes/{codigo}.jpg"
TRUPER_BANK_URL = "https://www.truper.com/BancoContenidoDigital/index.php?r=site/index"
MAX_WORKERS = 20  # Descargas concurrentes
DELAY_BETWEEN_BATCHES = 1  # Segundos entre lotes

class TruperImageDownloader:
    def __init__(self):
        self.downloaded = []
        self.skipped = []
        self.failed = []
        self.stats = {
            "total_processed": 0,
            "downloaded_direct": 0,
            "downloaded_bank": 0,
            "already_exists": 0,
            "not_found": 0,
            "errors": 0,
        }
        
        IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        self.load_log()

    def load_log(self):
        """Cargar log previo"""
        if LOG_FILE.exists():
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.downloaded = data.get("downloaded", [])
                self.skipped = data.get("skipped", [])
                self.failed = data.get("failed", [])
                if "stats" in data:
                    self.stats.update(data["stats"])

    def save_log(self):
        """Guardar log"""
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "downloaded": self.downloaded,
                "skipped": self.skipped,
                "failed": self.failed,
                "stats": self.stats,
            }, f, indent=2, ensure_ascii=False)

    def check_local(self, codigo: str, clave: str) -> Optional[str]:
        """Verifica si la imagen ya existe localmente"""
        image_key = clave if clave else codigo
        variations = [
            f"{image_key}.jpg",
            f"{codigo}.jpg",
            f"{image_key}.webp",
            f"{codigo}.webp",
        ]
        for var in variations:
            if (IMAGE_DIR / var).exists():
                return var
        return None

    def download_direct(self, codigo: str, clave: str) -> tuple[bool, Optional[str]]:
        """Intenta descargar directamente desde URL conocida"""
        image_key = clave if clave else codigo
        url = TRUPER_IMAGE_BASE_URL.format(codigo=codigo)
        filename = f"{image_key}.jpg"
        filepath = IMAGE_DIR / filename
        
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'image' in content_type:
                        with open(filepath, 'wb') as f:
                            f.write(response.read())
                        return True, filename
        except:
            pass
        return False, None

    def process_product(self, codigo: str, clave: str) -> tuple[bool, Optional[str], str]:
        """Procesa un producto y descarga su imagen"""
        # Verificar si ya existe
        existing = self.check_local(codigo, clave)
        if existing:
            self.stats["already_exists"] += 1
            return True, existing, "exists"
        
        # Intentar descarga directa
        success, filename = self.download_direct(codigo, clave)
        if success:
            self.downloaded.append({
                "codigo": codigo,
                "clave": clave,
                "filename": filename,
                "method": "direct",
            })
            self.stats["downloaded_direct"] += 1
            return True, filename, "direct"
        
        # No encontrada
        self.stats["not_found"] += 1
        self.skipped.append({
            "codigo": codigo,
            "clave": clave,
            "reason": "not_found",
        })
        return False, None, "not_found"

    def read_csv(self) -> List[Dict[str, str]]:
        """Lee el CSV"""
        rows = []
        with open(CSV_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
            header_line_idx = None
            for i, line in enumerate(lines):
                if "código" in line.lower() and "clave" in line.lower():
                    header_line_idx = i
                    break
            if header_line_idx is None:
                raise ValueError("No se encontró la línea de headers")
            reader = csv.DictReader(lines[header_line_idx:])
            for row in reader:
                if any(row.values()):
                    rows.append(row)
        return rows

    def process_batch(self, rows: List[Dict[str, str]], start_idx: int = 0):
        """Procesa un lote de productos"""
        processed_codes = {item.get("codigo") for item in self.downloaded + self.skipped}
        rows_to_process = [
            r for r in rows 
            if r.get("código", "").strip() and r.get("código", "").strip() not in processed_codes
        ]
        
        total = len(rows_to_process)
        print(f"📦 Procesando {total} productos...\n")
        
        # Procesar en paralelo
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {}
            for i, row in enumerate(rows_to_process):
                codigo = row.get("código", "").strip()
                clave = row.get("clave", "").strip()
                if codigo:
                    futures[executor.submit(self.process_product, codigo, clave)] = (codigo, clave, i)
            
            completed = 0
            for future in as_completed(futures):
                codigo, clave, idx = futures[future]
                try:
                    success, filename, method = future.result()
                    completed += 1
                    self.stats["total_processed"] += 1
                    
                    if completed % 50 == 0:
                        print(f"   Progreso: {completed}/{total} ({completed*100//total}%) | "
                              f"Descargadas: {self.stats['downloaded_direct']} | "
                              f"Existentes: {self.stats['already_exists']}")
                        self.save_log()
                except Exception as e:
                    self.stats["errors"] += 1
                    self.failed.append({
                        "codigo": codigo,
                        "clave": clave,
                        "error": str(e),
                    })
        
        self.save_log()

    def run(self, limit: Optional[int] = None):
        """Ejecuta el proceso completo"""
        print("📖 Leyendo CSV...")
        rows = self.read_csv()
        total_rows = len(rows)
        print(f"   Total productos en CSV: {total_rows}")
        
        if limit:
            rows = rows[:limit]
            print(f"   Procesando primeros {limit} productos")
        
        self.process_batch(rows)
        
        print("\n" + "=" * 60)
        print("📊 ESTADÍSTICAS FINALES")
        print("=" * 60)
        print(f"Total procesados: {self.stats['total_processed']}")
        print(f"Descargadas (directa): {self.stats['downloaded_direct']}")
        print(f"Descargadas (banco): {self.stats['downloaded_bank']}")
        print(f"Ya existían: {self.stats['already_exists']}")
        print(f"No encontradas: {self.stats['not_found']}")
        print(f"Errores: {self.stats['errors']}")
        print(f"\n📝 Log: {LOG_FILE}")
        print("=" * 60)


def main():
    import sys
    
    print("🚀 Descargador Optimizado de Imágenes TRUPER")
    print("=" * 60)
    
    downloader = TruperImageDownloader()
    
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    if limit:
        print(f"⚠️ Modo limitado: {limit} productos")
    
    try:
        downloader.run(limit=limit)
        print("\n✨ ¡Completado!")
        print("\n📋 Próximos pasos:")
        print("   1. Ejecutar: python3 scripts/import_truper_fast.py")
        print("   2. Ejecutar SQL generado en Supabase")
    except KeyboardInterrupt:
        print("\n⚠️ Interrumpido - progreso guardado")
        downloader.save_log()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        downloader.save_log()


if __name__ == "__main__":
    main()
