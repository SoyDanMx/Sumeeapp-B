#!/usr/bin/env python3
"""
Script para descargar reporte de productos de Syscom.mx
"""

import requests
import json
import csv
from datetime import datetime
from pathlib import Path
import time
from bs4 import BeautifulSoup
import re

# Configuración
REPORT_URL = "https://www.syscom.mx/principal/reporte_art_hora"
REPORT_PARAMS = {
    "cadena1": "104560873",
    "cadena2": "872f3291e35cff2fe2933f1c7a85e29f",
    "all": "1",
    "cadena3": "1",
    "alm": "1",
    "img": "1",
    "obs": "1",
    "tc": "1",
    "ctg": "8",
    "lnk": "1",
    "idc": "1",
    "idp": "1",
    "clear": "1",
    "sel": "0"
}

# Headers para simular un navegador
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# Directorio de salida
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "syscom_reports"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def download_report(max_retries=3, wait_time=60):
    """Descarga el reporte de Syscom con reintentos automáticos"""
    print("🔄 Descargando reporte de Syscom.mx...")
    print(f"📎 URL: {REPORT_URL}")
    print(f"📋 Parámetros: {REPORT_PARAMS}")
    print()
    
    # Crear sesión para mantener cookies
    session = requests.Session()
    session.headers.update(HEADERS)
    
    try:
        # Deshabilitar verificación SSL si hay problemas (solo para desarrollo)
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        # Primero intentar acceder a la página principal para obtener cookies
        print("🍪 Obteniendo cookies de sesión...")
        try:
            main_page = session.get("https://www.syscom.mx", timeout=30, verify=False)
            print(f"   Status: {main_page.status_code}")
        except:
            print("   ⚠️ No se pudo obtener cookies, continuando sin ellas...")
        
        # Intentar descargar el reporte con reintentos
        for attempt in range(1, max_retries + 1):
            print()
            print(f"📥 Intento {attempt}/{max_retries} - Descargando reporte...")
            
            response = session.get(
                REPORT_URL,
                params=REPORT_PARAMS,
                timeout=120,  # Timeout más largo para reportes grandes
                allow_redirects=True,
                verify=False  # Deshabilitar verificación SSL
            )
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"📏 Tamaño de respuesta: {len(response.content)} bytes")
            
            if response.status_code == 200:
                # Verificar si el reporte está listo o requiere espera
                if "Intente mas tarde" in response.text or "tiempo de espera" in response.text:
                    if attempt < max_retries:
                        print()
                        print(f"⏳ El reporte requiere tiempo de espera...")
                        print(f"💤 Esperando {wait_time} segundos antes del siguiente intento...")
                        time.sleep(wait_time)
                        continue
                    else:
                        print()
                        print("⚠️ El reporte aún requiere tiempo de espera después de todos los intentos")
                        print("💡 Guardando el HTML actual para revisión...")
                
                # Guardar respuesta HTML
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                html_file = OUTPUT_DIR / f"syscom_report_{timestamp}.html"
                
                with open(html_file, "wb") as f:
                    f.write(response.content)
                
                print(f"✅ HTML guardado en: {html_file}")
                
                # Intentar parsear el HTML
                parse_html_report(html_file, response.text)
                
                return html_file
            else:
                print(f"❌ Error: Status code {response.status_code}")
                if attempt < max_retries:
                    print(f"💤 Reintentando en {wait_time} segundos...")
                    time.sleep(wait_time)
                else:
                    print(f"📄 Respuesta: {response.text[:500]}")
                    return None
            
    except requests.exceptions.Timeout:
        print("❌ Error: Timeout al descargar el reporte")
        print("💡 El servidor de Syscom puede estar procesando la solicitud")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al descargar: {e}")
        return None


def parse_html_report(html_file, html_content):
    """Parsea el HTML del reporte y extrae información"""
    print()
    print("🔍 Analizando contenido HTML...")
    
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Buscar mensajes de error o espera
        error_messages = soup.find_all(string=re.compile("Intente mas tarde|tiempo de espera|No se ha alcanzado", re.I))
        if error_messages:
            print("⚠️ El reporte requiere tiempo de espera:")
            for msg in error_messages:
                print(f"   - {msg.strip()}")
            print()
            print("💡 Este reporte puede requerir autenticación o tiempo de procesamiento")
            return
        
        # Buscar tablas con productos
        tables = soup.find_all("table")
        print(f"📊 Tablas encontradas: {len(tables)}")
        
        # Buscar listas de productos
        product_lists = soup.find_all(["ul", "ol", "div"], class_=re.compile("product|item|articulo", re.I))
        print(f"📦 Listas de productos encontradas: {len(product_lists)}")
        
        # Buscar enlaces a productos
        product_links = soup.find_all("a", href=re.compile("producto|articulo|item", re.I))
        print(f"🔗 Enlaces a productos encontrados: {len(product_links)}")
        
        # Buscar información de categorías
        categories = soup.find_all(string=re.compile("Videovigilancia|Control de Acceso|Energía|Detección|Alarmas", re.I))
        if categories:
            print(f"📂 Categorías mencionadas: {len(categories)}")
            unique_categories = set([cat.strip() for cat in categories if len(cat.strip()) > 3])
            print(f"   Categorías únicas: {', '.join(list(unique_categories)[:10])}")
        
        # Extraer texto estructurado
        text_content = soup.get_text(separator="\n", strip=True)
        
        # Guardar texto extraído
        text_file = html_file.with_suffix(".txt")
        with open(text_file, "w", encoding="utf-8") as f:
            f.write(text_content)
        
        print(f"✅ Texto extraído guardado en: {text_file}")
        
        # Intentar extraer datos estructurados (JSON si existe)
        scripts = soup.find_all("script")
        json_data = []
        for script in scripts:
            if script.string:
                # Buscar JSON en scripts
                json_matches = re.findall(r'\{[^{}]*"producto"[^{}]*\}', script.string, re.DOTALL)
                json_data.extend(json_matches)
        
        if json_data:
            json_file = html_file.with_suffix(".json")
            with open(json_file, "w", encoding="utf-8") as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Datos JSON encontrados guardados en: {json_file}")
        
        # Generar resumen
        generate_summary(html_file, soup)
        
    except Exception as e:
        print(f"❌ Error al parsear HTML: {e}")
        import traceback
        traceback.print_exc()


def generate_summary(html_file, soup):
    """Genera un resumen del reporte"""
    print()
    print("📝 Generando resumen...")
    
    summary = {
        "fecha_descarga": datetime.now().isoformat(),
        "url": REPORT_URL,
        "parametros": REPORT_PARAMS,
        "estadisticas": {}
    }
    
    # Contar elementos
    summary["estadisticas"]["tablas"] = len(soup.find_all("table"))
    summary["estadisticas"]["enlaces"] = len(soup.find_all("a"))
    summary["estadisticas"]["imagenes"] = len(soup.find_all("img"))
    summary["estadisticas"]["formularios"] = len(soup.find_all("form"))
    
    # Buscar texto clave
    text = soup.get_text()
    summary["estadisticas"]["palabra_productos"] = text.lower().count("producto")
    summary["estadisticas"]["palabra_precio"] = text.lower().count("precio")
    summary["estadisticas"]["palabra_stock"] = text.lower().count("stock")
    summary["estadisticas"]["palabra_disponible"] = text.lower().count("disponible")
    
    # Guardar resumen
    summary_file = html_file.with_suffix(".summary.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Resumen guardado en: {summary_file}")
    print()
    print("📊 Estadísticas del reporte:")
    for key, value in summary["estadisticas"].items():
        print(f"   - {key}: {value}")


def main():
    """Función principal"""
    print("=" * 80)
    print("📥 DESCARGADOR DE REPORTE SYSCOM.MX")
    print("=" * 80)
    print()
    
    # Descargar reporte
    html_file = download_report()
    
    if html_file:
        print()
        print("=" * 80)
        print("✅ DESCARGA COMPLETADA")
        print("=" * 80)
        print()
        print(f"📁 Archivos guardados en: {OUTPUT_DIR}")
        print()
        print("💡 Próximos pasos:")
        print("   1. Revisa el archivo HTML para ver el contenido completo")
        print("   2. Revisa el archivo .txt para ver el texto extraído")
        print("   3. Revisa el archivo .summary.json para ver las estadísticas")
        print()
        print("⚠️ NOTA: Este reporte puede requerir autenticación o tiempo de procesamiento")
        print("   Si el reporte muestra un mensaje de espera, intenta nuevamente más tarde")
    else:
        print()
        print("=" * 80)
        print("❌ ERROR EN LA DESCARGA")
        print("=" * 80)
        print()
        print("💡 Posibles causas:")
        print("   1. El enlace requiere autenticación activa")
        print("   2. Los tokens (cadena1, cadena2) han expirado")
        print("   3. El servidor está procesando la solicitud (timeout)")
        print("   4. Se requiere una sesión activa en el navegador")
        print()
        print("🔧 Soluciones:")
        print("   1. Obtén un nuevo enlace desde Syscom.mx mientras estás autenticado")
        print("   2. Usa las herramientas de desarrollador del navegador para copiar")
        print("      los headers de autenticación (cookies, tokens)")
        print("   3. Considera usar Selenium para automatizar el navegador")


if __name__ == "__main__":
    main()

