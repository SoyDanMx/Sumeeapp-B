#!/usr/bin/env python3
"""
Descargador de Imágenes desde Banco de Contenido Digital TRUPER
Usa Playwright para interactuar con el banco y descargar imágenes en batch
"""

import csv
import json
import time
import base64
from pathlib import Path
from typing import Dict, List, Optional
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuration
CSV_FILE = Path("data/truper_catalog_full.csv")
TRUPER_BANK_URL = "https://www.truper.com/BancoContenidoDigital/index.php?r=site/index"
OUTPUT_DIR = Path("public/images/marketplace/truper")
LOG_FILE = Path("scripts/truper_bank_download_log.json")
MAX_WORKERS = 1  # Playwright no es thread-safe, procesar secuencialmente
WAIT_TIME = 2  # Segundos entre búsquedas para no sobrecargar el servidor
BATCH_SIZE = 50  # Procesar en lotes para guardar progreso

class TruperBankDownloader:
    def __init__(self):
        self.output_dir = OUTPUT_DIR
        self.log_file = LOG_FILE
        self.results = {
            "downloaded": [],
            "failed": [],
            "skipped": [],
            "not_found": [],
            "errors": []
        }
        
        # Crear directorio de salida
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Cargar log previo si existe
        if self.log_file.exists():
            with open(self.log_file, 'r', encoding='utf-8') as f:
                self.results = json.load(f)
    
    def save_log(self):
        """Guardar log de descargas"""
        with open(self.log_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
    
    def read_csv_claves(self) -> List[Dict[str, str]]:
        """Lee el CSV y extrae códigos y claves"""
        rows = []
        with open(CSV_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
            # Buscar línea de headers
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
                    codigo = row.get("código", "").strip()
                    clave = row.get("clave", "").strip()
                    if codigo and clave:
                        rows.append({"codigo": codigo, "clave": clave})
        
        return rows
    
    def search_and_download_image(self, page, clave: str, codigo: str) -> Dict:
        """Busca un producto en el banco y descarga su imagen"""
        # Verificar si ya existe
        image_path_jpg = self.output_dir / f"{clave}.jpg"
        image_path_webp = self.output_dir / f"{clave}.webp"
        
        if image_path_jpg.exists() or image_path_webp.exists():
            return {
                "clave": clave,
                "codigo": codigo,
                "status": "skipped",
                "reason": "already_exists"
            }
        
        try:
            # Navegar al banco
            page.goto(TRUPER_BANK_URL, wait_until="domcontentloaded", timeout=30000)
            time.sleep(1)
            
            # Buscar el producto por clave o código
            search_box = page.locator("#buscador, input[name='search'], input[type='text']").first
            if search_box.count() > 0:
                search_box.fill(clave)
                time.sleep(0.5)
                
                # Buscar botón de búsqueda
                search_button = page.locator("button.btn-primary, button[type='submit'], input[type='submit']").first
                if search_button.count() > 0:
                    search_button.click()
                    time.sleep(2)
                else:
                    # Intentar presionar Enter
                    search_box.press("Enter")
                    time.sleep(2)
            
            # Buscar imagen del producto en los resultados
            # Intentar diferentes selectores comunes
            image_selectors = [
                "img.product-image",
                "img[src*='truper']",
                ".product img",
                "img[alt*='{}']".format(clave),
                "img"
            ]
            
            image_url = None
            for selector in image_selectors:
                try:
                    images = page.locator(selector).all()
                    if images:
                        # Buscar la imagen que corresponde al producto
                        for img in images[:5]:  # Revisar primeras 5 imágenes
                            src = img.get_attribute("src") or ""
                            alt = img.get_attribute("alt") or ""
                            
                            # Verificar si la imagen parece ser del producto buscado
                            if clave.lower() in alt.lower() or clave.lower() in src.lower():
                                image_url = src
                                break
                        
                        if image_url:
                            break
                except:
                    continue
            
            # Si no encontramos imagen en la página, intentar URL directa
            if not image_url:
                # Patrón común de URLs de imágenes TRUPER
                possible_urls = [
                    f"https://www.truper.com/media/import/imagenes/{clave}.jpg",
                    f"https://www.truper.com/media/import/imagenes/{codigo}.jpg",
                    f"https://www.truper.com/BancoContenidoDigital/uploads/{clave}.jpg",
                ]
                
                for url in possible_urls:
                    try:
                        response = page.request.get(url)
                        if response.status == 200:
                            image_url = url
                            break
                    except:
                        continue
            
            if not image_url:
                return {
                    "clave": clave,
                    "codigo": codigo,
                    "status": "not_found",
                    "reason": "no_image_in_results"
                }
            
            # Descargar la imagen
            try:
                # Asegurar que la URL sea absoluta
                if image_url.startswith("//"):
                    image_url = "https:" + image_url
                elif image_url.startswith("/"):
                    image_url = "https://www.truper.com" + image_url
                
                response = page.request.get(image_url)
                if response.status == 200:
                    image_data = response.body()
                    
                    # Verificar que sea una imagen válida
                    if image_data[:2] == b'\xff\xd8':  # JPEG
                        image_path = self.output_dir / f"{clave}.jpg"
                    elif image_data[:4] == b'\x89PNG':  # PNG
                        image_path = self.output_dir / f"{clave}.png"
                    elif image_data[:6] in [b'GIF87a', b'GIF89a']:  # GIF
                        image_path = self.output_dir / f"{clave}.gif"
                    else:
                        return {
                            "clave": clave,
                            "codigo": codigo,
                            "status": "failed",
                            "reason": "invalid_image_format"
                        }
                    
                    # Guardar imagen
                    with open(image_path, 'wb') as f:
                        f.write(image_data)
                    
                    return {
                        "clave": clave,
                        "codigo": codigo,
                        "status": "downloaded",
                        "path": str(image_path),
                        "url": image_url
                    }
                else:
                    return {
                        "clave": clave,
                        "codigo": codigo,
                        "status": "failed",
                        "reason": f"http_{response.status}"
                    }
            except Exception as e:
                return {
                    "clave": clave,
                    "codigo": codigo,
                    "status": "failed",
                    "reason": str(e)[:100]
                }
                
        except PlaywrightTimeout:
            return {
                "clave": clave,
                "codigo": codigo,
                "status": "failed",
                "reason": "timeout"
            }
        except Exception as e:
            return {
                "clave": clave,
                "codigo": codigo,
                "status": "error",
                "reason": str(e)[:100]
            }
    
    def process_batch(self, products: List[Dict[str, str]], start_idx: int = 0):
        """Procesa un lote de productos"""
        print(f"\n🔄 Procesando lote desde índice {start_idx}...")
        
        with sync_playwright() as p:
            # Lanzar navegador (headless=False para debugging, cambiar a True para producción)
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            total = len(products)
            for i, product in enumerate(products):
                clave = product["clave"]
                codigo = product["codigo"]
                idx = start_idx + i + 1
                
                # Saltar si ya fue procesado
                already_processed = (
                    clave in [r.get("clave") for r in self.results["downloaded"]]
                    or clave in [r.get("clave") for r in self.results["skipped"]]
                    or clave in [r.get("clave") for r in self.results["not_found"]]
                )
                
                if already_processed:
                    print(f"[{idx}/{total}] ⏭️  {clave} - Ya procesado")
                    continue
                
                print(f"[{idx}/{total}] 🔍 Buscando {clave}...", end=" ", flush=True)
                
                result = self.search_and_download_image(page, clave, codigo)
                
                # Clasificar resultado
                if result["status"] == "downloaded":
                    print(f"✅ Descargado")
                    self.results["downloaded"].append(result)
                elif result["status"] == "skipped":
                    print(f"⏭️  Omitido")
                    self.results["skipped"].append(result)
                elif result["status"] == "not_found":
                    print(f"❌ No encontrado")
                    self.results["not_found"].append(result)
                else:
                    print(f"❌ Error: {result.get('reason', 'unknown')}")
                    self.results["failed"].append(result)
                
                # Guardar log cada 10 productos
                if (i + 1) % 10 == 0:
                    self.save_log()
                
                # Esperar entre búsquedas
                if i < len(products) - 1:
                    time.sleep(WAIT_TIME)
            
            browser.close()
        
        # Guardar log final del lote
        self.save_log()
    
    def download_all(self):
        """Descarga todas las imágenes del catálogo"""
        print("🚀 Descargador de Imágenes TRUPER desde Banco de Contenido Digital")
        print("=" * 70)
        
        # Leer productos del CSV
        print("📖 Leyendo CSV...")
        products = self.read_csv_claves()
        print(f"   Encontrados {len(products)} productos")
        
        # Filtrar productos que ya tienen imágenes
        products_to_process = []
        for product in products:
            clave = product["clave"]
            image_path_jpg = self.output_dir / f"{clave}.jpg"
            image_path_webp = self.output_dir / f"{clave}.webp"
            
            if not image_path_jpg.exists() and not image_path_webp.exists():
                products_to_process.append(product)
        
        print(f"   Productos sin imagen: {len(products_to_process)}")
        print(f"   Productos con imagen: {len(products) - len(products_to_process)}")
        
        if not products_to_process:
            print("\n✅ Todos los productos ya tienen imágenes descargadas!")
            return
        
        # Procesar en lotes
        total_batches = (len(products_to_process) + BATCH_SIZE - 1) // BATCH_SIZE
        
        for batch_num in range(total_batches):
            start_idx = batch_num * BATCH_SIZE
            end_idx = min(start_idx + BATCH_SIZE, len(products_to_process))
            batch = products_to_process[start_idx:end_idx]
            
            print(f"\n{'='*70}")
            print(f"📦 Lote {batch_num + 1}/{total_batches} ({len(batch)} productos)")
            print(f"{'='*70}")
            
            self.process_batch(batch, start_idx)
            
            # Mostrar estadísticas después de cada lote
            print(f"\n📊 Estadísticas después del lote {batch_num + 1}:")
            print(f"   ✅ Descargados: {len(self.results['downloaded'])}")
            print(f"   ⏭️  Omitidos: {len(self.results['skipped'])}")
            print(f"   ❌ No encontrados: {len(self.results['not_found'])}")
            print(f"   ❌ Fallidos: {len(self.results['failed'])}")
        
        # Resumen final
        print(f"\n{'='*70}")
        print("📊 RESUMEN FINAL")
        print(f"{'='*70}")
        print(f"Total procesados: {len(products_to_process)}")
        print(f"✅ Descargados: {len(self.results['downloaded'])}")
        print(f"⏭️  Omitidos: {len(self.results['skipped'])}")
        print(f"❌ No encontrados: {len(self.results['not_found'])}")
        print(f"❌ Fallidos: {len(self.results['failed'])}")
        print(f"\n📝 Log guardado en: {self.log_file}")
        print(f"📁 Imágenes guardadas en: {self.output_dir.absolute()}")


def main():
    """Función principal"""
    if not CSV_FILE.exists():
        print(f"❌ Error: No se encontró el archivo CSV: {CSV_FILE}")
        return
    
    downloader = TruperBankDownloader()
    downloader.download_all()
    
    print("\n✨ ¡Proceso completado!")
    print("\n📋 Próximos pasos:")
    print("   1. Revisar imágenes descargadas en public/images/marketplace/truper/")
    print("   2. Ejecutar nuevamente el script de importación para generar SQL con todas las imágenes")
    print("   3. Ejecutar el SQL en Supabase para importar todos los productos")


if __name__ == "__main__":
    main()

