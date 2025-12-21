#!/bin/bash
# Script para monitorear el progreso de la importación de Syscom

LOG_FILE="/tmp/syscom_import.log"
CHECK_INTERVAL=30  # Verificar cada 30 segundos

echo "🔍 Monitoreando importación de productos Syscom..."
echo "📝 Log: $LOG_FILE"
echo ""

while true; do
    if [ -f "$LOG_FILE" ]; then
        echo "=== $(date '+%H:%M:%S') ==="
        tail -20 "$LOG_FILE" | grep -E "(📄|✅|❌|RESUMEN|Importados|Omitidos|Errores)" || echo "Esperando progreso..."
        echo ""
    else
        echo "Esperando que se cree el archivo de log..."
    fi
    
    sleep $CHECK_INTERVAL
done

