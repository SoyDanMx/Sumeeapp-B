#!/usr/bin/env python3
"""
Helper para cargar variables de entorno desde .env.local
"""
import os
from pathlib import Path

def load_env_from_file(env_file='.env.local'):
    """Carga variables de entorno desde un archivo"""
    env_path = Path(__file__).parent.parent / env_file
    
    if not env_path.exists():
        print(f"⚠️  Archivo {env_file} no encontrado en: {env_path}")
        return False
    
    loaded_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            # Ignorar comentarios y líneas vacías
            if not line or line.startswith('#'):
                continue
            
            # Parsear KEY=VALUE
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Remover comillas si existen
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                
                os.environ[key] = value
                loaded_vars[key] = value
    
    print(f"✅ Cargadas {len(loaded_vars)} variables desde {env_file}")
    return True

if __name__ == "__main__":
    if load_env_from_file():
        # Verificar variables críticas
        required = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'SYSCOM_CLIENT_ID',
            'SYSCOM_CLIENT_SECRET'
        ]
        
        missing = [var for var in required if not os.environ.get(var)]
        if missing:
            print(f"❌ Variables faltantes: {', '.join(missing)}")
        else:
            print("✅ Todas las variables críticas están presentes")
            print(f"   - SUPABASE_URL: {os.environ['NEXT_PUBLIC_SUPABASE_URL'][:30]}...")
            print(f"   - SERVICE_KEY: {os.environ['SUPABASE_SERVICE_ROLE_KEY'][:30]}...")
            print(f"   - SYSCOM_ID: {os.environ['SYSCOM_CLIENT_ID']}")

