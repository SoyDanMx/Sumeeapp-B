#!/bin/bash

echo "🔍 Monitoreando progreso del push de Git..."
echo ""

LOCAL_COMMIT=$(git log -1 --format='%h %s' HEAD)
REMOTE_COMMIT=$(git log -1 origin/main --format='%h %s' 2>/dev/null || echo "No disponible")
PENDING_COUNT=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")

echo "📊 Estado actual:"
echo "   Último commit local:  $LOCAL_COMMIT"
echo "   Último commit remoto: $REMOTE_COMMIT"
echo "   Commits pendientes:   $PENDING_COUNT"
echo ""

if [ "$PENDING_COUNT" -eq "0" ]; then
    echo "✅ ¡Push completado exitosamente!"
    exit 0
else
    echo "⏳ Push en progreso o pendiente..."
    echo ""
    echo "Commits pendientes de subir:"
    git log --oneline origin/main..HEAD
    exit 1
fi

