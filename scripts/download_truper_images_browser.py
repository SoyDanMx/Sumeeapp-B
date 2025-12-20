#!/usr/bin/env python3
"""
Descargador de Imágenes TRUPER usando Navegador
Interactúa con el banco de contenido digital de TRUPER para descargar imágenes
"""

import csv
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuration
CSV_FILE = Path("data/truper_catalog_full.csv")
IMAGE_DIR = Path("public/images/marketplace/truper")
LOG_FILE = Path("scripts/truper_download_log.json")
TRUPER_BANK_URL = "https://www.truper.com/BancoContenidoDigital/index.php?r=site/index"
BATCH_SIZE = 100  # Guardar progreso cada N productos
DELAY_BETWEEN_SEARCHES = 2  # Segundos entre búsquedas

class TruperBrowserDownloader:
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
                self.stats = data.get("stats", self.stats)

    def save_log(self):
        """Guardar log"""
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "downloaded": self.downloaded,
                "skipped": self.skipped,
                "failed": self.failed,
                "stats": self.stats,
            }, f, indent=2, ensure_ascii=False)

    def check_image_exists_local(self, codigo: str, clave: str) -> Optional[str]:
        """Verifica si la imagen ya existe localmente"""
        image_key = clave if clave else codigo
        
        variations = [
            f"{image_key}.jpg",
            f"{codigo}.jpg",
            f"{image_key}.webp",
            f"{codigo}.webp",
        ]
        
        for var in variations:
            local_path = IMAGE_DIR / var
            if local_path.exists():
                return f"/images/marketplace/truper/{var}"
        return None

    def download_from_url(self, url: str, filename: str) -> bool:
        """Descarga una imagen desde una URL"""
        try:
            import urllib.request
            urllib.request.urlretrieve(url, IMAGE_DIR / filename)
            return True
        except Exception as e:
            print(f"      Error descargando: {e}")
            return False

    def search_and_download(self, page, codigo: str, clave: str) -> tuple[bool, Optional[str]]:
        """Busca un producto en el banco y descarga su imagen"""
        # Verificar si ya existe localmente
        existing = self.check_image_exists_local(codigo, clave)
        if existing:
            self.stats["already_exists"] += 1
            return True, existing
        
        # Intentar URL directa primero (más rápido)
        image_key = clave if clave else codigo
        direct_url = f"https://www.truper.com/media/import/imagenes/{codigo}.jpg"
        
        try:
            import urllib.request
            import urllib.error
            
            req = urllib.request.Request(direct_url, method="HEAD")
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    # Descargar imagen
                    filename = f"{image_key}.jpg"
                    urllib.request.urlretrieve(direct_url, IMAGE_DIR / filename)
                    self.downloaded.append({
                        "codigo": codigo,
                        "clave": clave,
                        "filename": filename,
                        "method": "direct_url",
                    })
                    self.stats["downloaded"] += 1
                    return True, f"/images/marketplace/truper/{filename}"
        except:
            pass
        
        # Si la URL directa no funciona, buscar en el banco
        try:
            # Navegar al banco
            page.goto(TRUPER_BANK_URL, wait_until="domcontentloaded", timeout=30000)
            time.sleep(1)
            
            # Buscar por código o clave
            search_term = clave if clave else codigo
            
            # Buscar campo de búsqueda
            try:
                search_input = page.locator("input[type='text'], input[name*='search'], input[id*='search'], #buscador").first
                if search_input.count() > 0:
                    search_input.fill(search_term)
                    time.sleep(0.5)
                    
                    # Buscar botón de búsqueda
                    search_button = page.locator("button[type='submit'], button.btn-primary, input[type='submit']").first
                    if search_button.count() > 0:
                        search_button.click()
                        time.sleep(2)
                        
                        # Buscar imagen en los resultados
                        # Intentar encontrar imagen o link de descarga
                        img_selectors = [
                            "img[src*='imagenes']",
                            "img[src*='truper']",
                            ".product-image img",
                            "a[href*='download'] img",
                        ]
                        
                        for selector in img_selectors:
                            images = page.locator(selector).all()
                            if len(images) > 0:
                                img_src = images[0].get_attribute("src")
                                if img_src:
                                    # Construir URL completa si es relativa
                                    if img_src.startswith("http"):
                                        img_url = img_src
                                    else:
                                        img_url = f"https://www.truper.com{img_src}" if img_src.startswith("/") else f"{TRUPER_BANK_URL.rsplit('/', 1)[0]}/{img_src}"
                                    
                                    # Descargar imagen
                                    filename = f"{image_key}.jpg"
                                    if self.download_from_url(img_url, filename):
                                        self.downloaded.append({
                                            "codigo": codigo,
                                            "clave": clave,
                                            "filename": filename,
                                            "method": "bank_search",
                                        })
                                        self.stats["downloaded"] += 1
                                        return True, f"/images/marketplace/truper/{filename}"
            
            except Exception as e:
                pass
            
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

            header_line_idx = None
            for i, line in enumerate(lines):
                if "código" in line.lower() and "clave" in line.lower():
                    header_line_idx = i
                    break

            if header_line_idx is None:
                raise ValueError("No se encontró la línea de headers en el CSV")

            reader = csv.DictReader(lines[header_line_idx:])
            for row in reader:
                if any(row.values()):
                    rows.append(row)
        return rows

    def process_all(self, start_from: int = 0, limit: Optional[int] = None):
        """Procesa todos los productos del CSV"""
        print("📖 Leyendo CSV...")
        rows = self.read_csv()
        total = len(rows)
        
        # Filtrar productos ya procesados
        processed_codes = {item.get("codigo") for item in self.downloaded + self.skipped}
        rows_to_process = [r for r in rows if r.get("código", "").strip() not in processed_codes]
        
        if limit:
            rows_to_process = rows_to_process[start_from:start_from + limit]
        else:
            rows_to_process = rows_to_process[start_from:]
        
        remaining = len(rows_to_process)
        print(f"   Total en CSV: {total}")
        print(f"   Ya procesados: {len(processed_codes)}")
        print(f"   Por procesar: {remaining}")
        print(f"\n🚀 Iniciando descarga con Playwright...")
        print("   (Esto puede tardar varias horas)\n")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            )
            page = context.new_page()
            
            try:
                for i, row in enumerate(rows_to_process):
                    codigo = row.get("código", "").strip()
                    clave = row.get("clave", "").strip()
                    
                    if not codigo:
                        continue
                    
                    current = start_from + i + 1
                    print(f"[{current}/{start_from + remaining}] {codigo} ({clave})...", end=" ")
                    
                    success, image_path = self.search_and_download(page, codigo, clave)
                    
                    if success:
                        print(f"✅ {image_path}")
                    else:
                        print("❌ No encontrada")
                        self.skipped.append({
                            "codigo": codigo,
                            "clave": clave,
                            "reason": "not_found",
                        })
                    
                    self.stats["total_processed"] += 1
                    
                    # Guardar log periódicamente
                    if (i + 1) % BATCH_SIZE == 0:
                        self.save_log()
                        print(f"\n💾 Progreso guardado ({i + 1}/{remaining} procesados)\n")
                    
                    # Delay entre búsquedas
                    if i < len(rows_to_process) - 1:
                        time.sleep(DELAY_BETWEEN_SEARCHES)
            
            finally:
                browser.close()
        
        # Guardar log final
        self.save_log()
        
        # Mostrar estadísticas
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
    import sys
    
    print("🚀 Descargador de Imágenes TRUPER (Navegador)")
    print("=" * 60)
    print(f"📁 Directorio: {IMAGE_DIR}")
    print(f"📄 CSV: {CSV_FILE}")
    print("=" * 60)
    
    if not CSV_FILE.exists():
        print(f"❌ Error: No se encontró el archivo CSV: {CSV_FILE}")
        return
    
    # Verificar que Playwright esté instalado
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Error: Playwright no está instalado")
        print("   Instala con: pip install playwright")
        print("   Luego ejecuta: playwright install chromium")
        return
    
    downloader = TruperBrowserDownloader()
    
    # Opciones de línea de comandos
    start_from = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    if limit:
        print(f"⚠️ Modo limitado: procesando {limit} productos desde el índice {start_from}")
    
    try:
        downloader.process_all(start_from=start_from, limit=limit)
        print("\n✨ ¡Proceso completado!")
        print(f"\n📋 Próximos pasos:")
        print(f"   1. Revisar imágenes en: {IMAGE_DIR}")
        print(f"   2. Ejecutar: python3 scripts/import_truper_fast.py")
        print(f"   3. Ejecutar SQL generado en Supabase")
    except KeyboardInterrupt:
        print("\n\n⚠️ Proceso interrumpido")
        print("   El progreso se ha guardado")
        downloader.save_log()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        downloader.save_log()


if __name__ == "__main__":
    main()


