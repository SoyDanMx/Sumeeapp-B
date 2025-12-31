# 🔍 Proceso de Pre-verificación antes de Commit

## ⚠️ IMPORTANTE
**NUNCA hacer commit sin verificar errores primero.** Todos los commits deben pasar las verificaciones antes de ser pusheados a producción.

## Proceso Obligatorio

### 1. Verificar Linting
```bash
npm run lint
```
- Debe ejecutarse sin errores
- Solo warnings son aceptables si no afectan funcionalidad

### 2. Verificar TypeScript
```bash
npx tsc --noEmit
```
- Debe ejecutarse sin errores de tipo
- Todos los tipos deben estar correctamente definidos

### 3. Verificar Archivos Modificados
```bash
git status
```
- Revisar que solo se están commitando los archivos necesarios
- Verificar que no hay archivos grandes sin gitignore

### 4. Ejecutar Script de Pre-verificación
```bash
./scripts/pre-commit-check.sh
```
- Ejecuta todas las verificaciones automáticamente
- Debe pasar antes de hacer commit

## Comandos Prohibidos

### ❌ NO USAR:
```bash
git commit --no-verify -m "..."
```
**Solo usar en casos excepcionales y con aprobación explícita.**

### ✅ USAR SIEMPRE:
```bash
# Verificar primero
npm run lint
npx tsc --noEmit

# Si todo está bien, hacer commit
git add .
git commit -m "[tipo] descripción"
```

## Script de Pre-verificación

El script `scripts/pre-commit-check.sh` verifica automáticamente:
- ✅ TypeScript (sin errores de tipo)
- ✅ ESLint (sin errores de linting)
- ✅ Archivos grandes (verificar gitignore)
- ✅ Archivos modificados (revisar cambios)

### Uso:
```bash
./scripts/pre-commit-check.sh
```

Si el script pasa, puedes hacer commit con confianza.

## Git Hook Pre-commit

Se ha creado un hook de git que ejecuta automáticamente las verificaciones antes de cada commit.

### Instalación:
```bash
chmod +x .git/hooks/pre-commit
```

### Desactivar temporalmente (NO RECOMENDADO):
```bash
git commit --no-verify -m "..."
```

## Checklist Antes de Commit

- [ ] Ejecutar `npm run lint` - Sin errores
- [ ] Ejecutar `npx tsc --noEmit` - Sin errores
- [ ] Ejecutar `./scripts/pre-commit-check.sh` - Pasa todas las verificaciones
- [ ] Revisar `git status` - Solo archivos necesarios
- [ ] Revisar cambios con `git diff` - Cambios correctos
- [ ] Hacer commit sin `--no-verify`

## Errores Comunes

### Error: "Type error: Property 'X' does not exist"
**Solución:** Corregir el error de TypeScript antes de commitear

### Error: "ESLint: Parsing error"
**Solución:** Corregir el error de sintaxis antes de commitear

### Error: "File is too large"
**Solución:** Agregar archivo a `.gitignore` o usar Git LFS

## Excepciones

Solo se permite `--no-verify` en casos excepcionales:
1. Fixes de emergencia críticos (con aprobación)
2. Cambios de documentación sin código
3. Cambios de configuración que no afectan código

**Siempre documentar por qué se usó `--no-verify` en el mensaje del commit.**

## Mejores Prácticas

1. **Hacer commits pequeños y frecuentes** - Más fácil verificar
2. **Verificar antes de cada commit** - No acumular errores
3. **Corregir errores inmediatamente** - No dejarlos para después
4. **Usar mensajes de commit descriptivos** - Facilita debugging
5. **Revisar cambios antes de commitear** - `git diff` antes de `git commit`

## Referencias

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

