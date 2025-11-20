# Pre-commit Verification

## 🔒 Protección Automática

Se ha configurado un **pre-commit hook** que automáticamente verifica que el proyecto compile sin errores antes de permitir cualquier commit.

## ✅ ¿Qué hace?

1. **Ejecuta `npm run build`** antes de cada commit
2. **Verifica que no haya errores de TypeScript**
3. **Bloquea el commit** si hay errores
4. **Permite el commit** solo si el build es exitoso

## 🚀 Uso Normal

Simplemente haz commit como siempre:

```bash
git add .
git commit -m "tu mensaje"
```

El hook se ejecutará automáticamente. Si hay errores, verás un mensaje y el commit será bloqueado.

## 🔧 Verificación Manual

Si quieres verificar antes de hacer commit manualmente:

```bash
./scripts/pre-commit-check.sh
```

O simplemente:

```bash
npm run build
```

## 📝 Notas

- El hook solo se ejecuta en commits locales (no en push)
- Si necesitas hacer commit sin verificación (NO recomendado), usa: `git commit --no-verify`
- Los logs del build se guardan en `/tmp/build-output.log` para debugging

## ⚠️ Importante

**NUNCA uses `--no-verify` a menos que sea absolutamente necesario.** Esto puede causar que código con errores llegue a producción.

