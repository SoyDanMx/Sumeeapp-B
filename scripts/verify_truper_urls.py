#!/usr/bin/env python3
"""
Verifica que las URLs de TRUPER funcionan correctamente
Prueba algunas URLs para asegurar que el dominio está accesible
"""

import urllib.request
import urllib.error
from typing import List, Tuple

TRUPER_URL_PATTERN = "https://www.truper.com/media/import/imagenes/{identifier}.jpg"

# Ejemplos de productos para probar
TEST_PRODUCTS = [
    "PET-15X",
    "REP-CUT-5X",
    "100048",
    "100049",
]

def verify_url(url: str, timeout: int = 5) -> Tuple[bool, str]:
    """Verifica si una URL está accesible"""
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                return True, "OK"
            else:
                return False, f"Status: {response.status}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error: {e.code}"
    except urllib.error.URLError as e:
        return False, f"URL Error: {e.reason}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("🔍 Verificando URLs de imágenes TRUPER...")
    print(f"   Patrón: {TRUPER_URL_PATTERN}")
    print()
    
    results = []
    
    for identifier in TEST_PRODUCTS:
        url = TRUPER_URL_PATTERN.format(identifier=identifier)
        print(f"📸 Probando: {identifier}")
        print(f"   URL: {url}")
        
        is_ok, message = verify_url(url)
        
        if is_ok:
            print(f"   ✅ OK - Imagen accesible")
            results.append((identifier, True))
        else:
            print(f"   ❌ Error - {message}")
            results.append((identifier, False))
        
        print()
    
    # Resumen
    print("=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    
    successful = sum(1 for _, ok in results if ok)
    total = len(results)
    
    print(f"✅ URLs exitosas: {successful}/{total}")
    print(f"❌ URLs con error: {total - successful}/{total}")
    print()
    
    if successful == total:
        print("🎉 Todas las URLs funcionan correctamente!")
        print("   Puedes proceder con la migración.")
    elif successful > 0:
        print("⚠️  Algunas URLs funcionan, otras no.")
        print("   Verifica los identificadores que fallaron.")
        print("   Algunos productos pueden usar código numérico en lugar de clave.")
    else:
        print("❌ Ninguna URL funciona.")
        print("   Verifica:")
        print("   1. Conexión a internet")
        print("   2. El dominio www.truper.com está accesible")
        print("   3. Los identificadores son correctos")

if __name__ == "__main__":
    main()


