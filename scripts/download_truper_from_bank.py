#!/usr/bin/env python3
"""
Descargador de Imágenes desde Banco TRUPER
Usa Playwright para interactuar con el banco de contenido digital
"""

import csv
import json
import time
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuration
CSV_FILE = Path("data/truper_catalog_full.csv")
IMAGE_DIR = Path("public/images/marketplace/truper")
LOG_FILE = Path("scripts/truper_bank_download_log.json")
TRUPER_BANK_URL = "https://www.truper.com/BancoContenidoDigital/index.php?r=site/index"
BATCH_SIZE = 50  # Guardar progreso cada N productos
DELAY_BETWEEN_SEARCHES = 3  # Segundos entre búsquedas (respetar servidor)

class TruperBankDownloader:
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

    def download_image_from_url(self, url: str, filename: str) -> bool:
        """Descarga una imagen desde una URL"""
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'image' in content_type:
                        with open(IMAGE_DIR / filename, 'wb') as f:
                            f.write(response.read())
                        return True
        except Exception as e:
            print(f"      Error descargando imagen: {e}")
        return False

    def search_and_download(self, page, codigo: str, clave: str) -> tuple[bool, Optional[str]]:
        """Busca un producto en el banco y descarga su imagen"""
        # Verificar si ya existe localmente
        existing = self.check_local(codigo, clave)
        if existing:
            self.stats["already_exists"] += 1
            return True, existing
        
        image_key = clave if clave else codigo
        search_term = clave if clave else codigo
        
        try:
            # Navegar al banco
            page.goto(TRUPER_BANK_URL, wait_until="networkidle", timeout=30000)
            time.sleep(1)
            
            # Buscar campo de búsqueda
            # El banco tiene un campo de búsqueda, intentar diferentes selectores
            search_selectors = [
                'input[name="BuscadorForm[codigo]"]',
                'input[id="buscador"]',
                'input[type="text"]',
                'input[placeholder*="código"]',
                'input[placeholder*="clave"]',
            ]
            
            search_input = None
            for selector in search_selectors:
                try:
                    search_input = page.locator(selector).first
                    if search_input.count() > 0:
                        break
                except:
                    continue
            
            if not search_input or search_input.count() == 0:
                print(f"      ⚠️ No se encontró campo de búsqueda")
                self.stats["errors"] += 1
                return False, None
            
            # Limpiar y escribir término de búsqueda
            search_input.clear()
            search_input.fill(search_term)
            time.sleep(0.5)
            
            # Buscar botón de búsqueda
            button_selectors = [
                'button[type="submit"]',
                'button.btn-primary',
                'input[type="submit"]',
                'button:has-text("Buscar")',
            ]
            
            search_button = None
            for selector in button_selectors:
                try:
                    search_button = page.locator(selector).first
                    if search_button.count() > 0:
                        break
                except:
                    continue
            
            if not search_button or search_button.count() == 0:
                print(f"      ⚠️ No se encontró botón de búsqueda")
                self.stats["errors"] += 1
                return False, None
            
            # Hacer clic en buscar
            search_button.click()
            time.sleep(2)  # Esperar resultados
            
            # Buscar imágenes en los resultados
            # Intentar diferentes selectores para encontrar la imagen
            img_selectors = [
                'img[src*="imagenes"]',
                'img[src*="truper"]',
                '.product-image img',
                '.resultado img',
                'img[alt*="' + search_term + '"]',
                'img',
            ]
            
            image_url = None
            for selector in img_selectors:
                try:
                    images = page.locator(selector).all()
                    for img in images:
                        src = img.get_attribute("src")
                        if src and ("imagenes" in src.lower() or "truper" in src.lower()):
                            # Construir URL completa
                            if src.startswith("http"):
                                image_url = src
                            elif src.startswith("/"):
                                image_url = f"https://www.truper.com{src}"
                            else:
                                image_url = f"{TRUPER_BANK_URL.rsplit('/', 1)[0]}/{src}"
                            break
                    if image_url:
                        break
                except:
                    continue
            
            if not image_url:
                # Intentar buscar enlaces de descarga
                link_selectors = [
                    'a[href*="download"]',
                    'a[href*="imagenes"]',
                    'a:has-text("Descargar")',
                ]
                
                for selector in link_selectors:
                    try:
                        links = page.locator(selector).all()
                        if len(links) > 0:
                            href = links[0].get_attribute("href")
                            if href:
                                if href.startswith("http"):
                                    image_url = href
                                elif href.startswith("/"):
                                    image_url = f"https://www.truper.com{href}"
                                break
                    except:
                        continue
            
            if image_url:
                # Descargar imagen
                filename = f"{image_key}.jpg"
                if self.download_image_from_url(image_url, filename):
                    self.downloaded.append({
                        "codigo": codigo,
                        "clave": clave,
                        "filename": filename,
                        "url": image_url,
                    })
                    self.stats["downloaded"] += 1
                    return True, filename
                else:
                    self.stats["not_found"] += 1
                    return False, None
            else:
                self.stats["not_found"] += 1
                return False, None
                
        except PlaywrightTimeout:
            self.stats["errors"] += 1
            self.failed.append({
                "codigo": codigo,
                "clave": clave,
                "error": "Timeout esperando respuesta",
            })
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

    def process_all(self, start_from: int = 0, limit: Optional[int] = None):
        """Procesa todos los productos"""
        print("📖 Leyendo CSV...")
        rows = self.read_csv()
        total = len(rows)
        
        # Filtrar productos ya procesados
        processed_codes = {item.get("codigo") for item in self.downloaded + self.skipped}
        rows_to_process = [
            r for r in rows 
            if r.get("código", "").strip() and r.get("código", "").strip() not in processed_codes
        ]
        
        if limit:
            rows_to_process = rows_to_process[start_from:start_from + limit]
        else:
            rows_to_process = rows_to_process[start_from:]
        
        remaining = len(rows_to_process)
        print(f"   Total en CSV: {total}")
        print(f"   Ya procesados: {len(processed_codes)}")
        print(f"   Por procesar: {remaining}")
        print(f"\n🌐 Iniciando descarga desde banco TRUPER...")
        print(f"   (Esto puede tardar varias horas - {remaining * DELAY_BETWEEN_SEARCHES / 60:.1f} minutos mínimo)\n")
        
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
                    
                    success, filename = self.search_and_download(page, codigo, clave)
                    
                    if success:
                        if filename:
                            print(f"✅ {filename}")
                        else:
                            print("✅ Ya existe")
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
        
        self.save_log()
        
        print("\n" + "=" * 60)
        print("📊 ESTADÍSTICAS FINALES")
        print("=" * 60)
        print(f"Total procesados: {self.stats['total_processed']}")
        print(f"Descargadas nuevas: {self.stats['downloaded']}")
        print(f"Ya existían: {self.stats['already_exists']}")
        print(f"No encontradas: {self.stats['not_found']}")
        print(f"Errores: {self.stats['errors']}")
        print(f"\n📝 Log: {LOG_FILE}")
        print("=" * 60)


def main():
    import sys
    
    print("🌐 Descargador de Imágenes desde Banco TRUPER")
    print("=" * 60)
    
    downloader = TruperBankDownloader()
    
    start_from = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    if limit:
        print(f"⚠️ Modo limitado: {limit} productos desde índice {start_from}")
    
    try:
        downloader.process_all(start_from=start_from, limit=limit)
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


