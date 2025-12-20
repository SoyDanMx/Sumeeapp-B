#!/bin/bash

echo "🔍 Monitoreo continuo del push de Git"
echo "Presiona Ctrl+C para detener"
echo ""

while true; do
    clear
    echo "═══════════════════════════════════════════════════════════"
    echo "  MONITOREO DE PUSH - $(date '+%H:%M:%S')"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    
    # Verificar si el proceso de push está ejecutándose
    PUSH_PID=$(ps aux | grep "git push" | grep -v grep | awk '{print $2}')
    
    if [ -z "$PUSH_PID" ]; then
        echo "⚠️  Proceso de push NO está ejecutándose"
        echo ""
        echo "Verificando estado final..."
        LOCAL_COMMIT=$(git log -1 --format='%h %s' HEAD)
        REMOTE_COMMIT=$(git log -1 origin/main --format='%h %s' 2>/dev/null || echo "No disponible")
        PENDING_COUNT=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
        
        echo ""
        echo "📊 Estado final:"
        echo "   Último commit local:  $LOCAL_COMMIT"
        echo "   Último commit remoto: $REMOTE_COMMIT"
        echo "   Commits pendientes:   $PENDING_COUNT"
        echo ""
        
        if [ "$PENDING_COUNT" -eq "0" ]; then
            echo "✅ ¡Push completado exitosamente!"
        else
            echo "❌ Push falló o fue cancelado"
            echo ""
            echo "Commits pendientes:"
            git log --oneline origin/main..HEAD | head -5
        fi
        break
    else
        echo "✅ Proceso de push ejecutándose (PID: $PUSH_PID)"
        echo ""
        
        # Mostrar estado actual
        LOCAL_COMMIT=$(git log -1 --format='%h %s' HEAD)
        REMOTE_COMMIT=$(git log -1 origin/main --format='%h %s' 2>/dev/null || echo "No disponible")
        PENDING_COUNT=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
        
        echo "📊 Estado actual:"
        echo "   Último commit local:  $LOCAL_COMMIT"
        echo "   Último commit remoto: $REMOTE_COMMIT"
        echo "   Commits pendientes:   $PENDING_COUNT"
        echo ""
        
        # Mostrar últimos logs si existen
        if [ -f /tmp/push_output.log ]; then
            echo "📝 Últimas líneas del log:"
            tail -3 /tmp/push_output.log | sed 's/^/   /'
        fi
        
        echo ""
        echo "⏳ Esperando 5 segundos..."
    fi
    
    sleep 5
done


