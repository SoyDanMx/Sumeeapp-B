#!/usr/bin/env python3
"""
Script para descargar reporte de Syscom.mx usando Selenium (requiere navegador)
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from datetime import datetime
from pathlib import Path
import time
import json

# Configuración
REPORT_URL = "http://www.syscom.mx/principal/reporte_art_hora?cadena1=104560873&cadena2=872f3291e35cff2fe2933f1c7a85e29f&all=1&cadena3=1&alm=1&img=1&obs=1&tc=1&ctg=8&lnk=1&idc=1&idp=1&clear=1&sel=0"

# Directorio de salida
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "syscom_reports"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def setup_driver(headless=True):
    """Configura el driver de Selenium"""
    chrome_options = Options()
    
    if headless:
        chrome_options.add_argument("--headless")
    
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Error al configurar Chrome: {e}")
        print("💡 Asegúrate de tener ChromeDriver instalado")
        print("   Instalación: brew install chromedriver (macOS)")
        return None


def download_report_with_selenium():
    """Descarga el reporte usando Selenium"""
    print("=" * 80)
    print("📥 DESCARGADOR DE REPORTE SYSCOM.MX (SELENIUM)")
    print("=" * 80)
    print()
    print("🔄 Iniciando navegador...")
    
    driver = setup_driver(headless=False)  # No headless para ver el proceso
    
    if not driver:
        return None
    
    try:
        print(f"🌐 Navegando a: {REPORT_URL}")
        driver.get(REPORT_URL)
        
        # Esperar a que la página cargue
        print("⏳ Esperando a que la página cargue...")
        time.sleep(5)
        
        # Verificar si hay mensaje de espera
        page_source = driver.page_source
        
        if "Intente mas tarde" in page_source or "tiempo de espera" in page_source:
            print("⚠️ El reporte requiere tiempo de espera")
            print("💡 Esperando 60 segundos...")
            time.sleep(60)
            
            # Recargar la página
            driver.refresh()
            time.sleep(5)
            page_source = driver.page_source
        
        # Guardar el HTML
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        html_file = OUTPUT_DIR / f"syscom_report_selenium_{timestamp}.html"
        
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(page_source)
        
        print(f"✅ HTML guardado en: {html_file}")
        
        # Guardar screenshot
        screenshot_file = OUTPUT_DIR / f"syscom_report_selenium_{timestamp}.png"
        driver.save_screenshot(str(screenshot_file))
        print(f"📸 Screenshot guardado en: {screenshot_file}")
        
        # Extraer información
        extract_info_from_page(driver, html_file)
        
        return html_file
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None
        
    finally:
        print()
        print("🔒 Cerrando navegador...")
        driver.quit()


def extract_info_from_page(driver, html_file):
    """Extrae información de la página"""
    print()
    print("🔍 Extrayendo información...")
    
    try:
        # Buscar tablas
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"📊 Tablas encontradas: {len(tables)}")
        
        # Buscar enlaces
        links = driver.find_elements(By.TAG_NAME, "a")
        print(f"🔗 Enlaces encontrados: {len(links)}")
        
        # Buscar imágenes
        images = driver.find_elements(By.TAG_NAME, "img")
        print(f"🖼️ Imágenes encontradas: {len(images)}")
        
        # Extraer texto
        body_text = driver.find_element(By.TAG_NAME, "body").text
        
        # Guardar texto
        text_file = html_file.with_suffix(".txt")
        with open(text_file, "w", encoding="utf-8") as f:
            f.write(body_text)
        print(f"✅ Texto extraído guardado en: {text_file}")
        
        # Generar resumen
        summary = {
            "fecha_descarga": datetime.now().isoformat(),
            "url": REPORT_URL,
            "estadisticas": {
                "tablas": len(tables),
                "enlaces": len(links),
                "imagenes": len(images),
                "tamaño_texto": len(body_text),
            }
        }
        
        summary_file = html_file.with_suffix(".summary.json")
        with open(summary_file, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Resumen guardado en: {summary_file}")
        
    except Exception as e:
        print(f"⚠️ Error al extraer información: {e}")


def main():
    """Función principal"""
    html_file = download_report_with_selenium()
    
    if html_file:
        print()
        print("=" * 80)
        print("✅ DESCARGA COMPLETADA")
        print("=" * 80)
        print()
        print(f"📁 Archivos guardados en: {OUTPUT_DIR}")
    else:
        print()
        print("=" * 80)
        print("❌ ERROR EN LA DESCARGA")
        print("=" * 80)


if __name__ == "__main__":
    main()

