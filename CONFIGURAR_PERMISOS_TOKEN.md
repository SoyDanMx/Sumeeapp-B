# 🔧 Configurar Permisos del Token Fine-Grained

El token que creaste es un **Fine-grained token** y necesita permisos específicos configurados.

## ⚙️ Pasos para Configurar Permisos

1. **En la página del token** (donde estás ahora), busca la sección **"Permissions"**
2. **Expande la sección "Permissions"**
3. **Configura estos permisos**:

### Repository Permissions (Necesarios para Push):

- **Contents**: `Read and write` ✅ (ESENCIAL para hacer push)
- **Metadata**: `Read-only` (automático)

### Account Permissions (Opcional):

- No necesarios para hacer push básico

4. **Click en "Update"** al final de la página
5. **Espera unos segundos** para que los cambios se apliquen

## 🔄 Después de Configurar Permisos

Una vez configurados los permisos, ejecuta:

```bash
git push origin main
```

Cuando te pida credenciales:
- **Username**: `SoyDanMx`
- **Password**: Pega el token completo: `github_pat_11B0KPU6Y00mebWKfzpyoD_C0CPM0qTgUw3MP5b15Z41yEItng7Wlhee96tgKnmMWX`

## 🔐 Alternativa: Usar Token Classic (Más Simple)

Si prefieres evitar configurar permisos, usa un **Token (classic)**:

1. Ve a: https://github.com/settings/tokens
2. Click en **"Tokens (classic)"** (no Fine-grained)
3. **"Generate new token (classic)"**
4. Nombre: `SumeeApp Push`
5. Selecciona scope: **`repo`** (todo)
6. Genera y copia el token
7. Úsalo para hacer push

## 🚀 Alternativa: SSH (Más Seguro)

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Copiar clave
cat ~/.ssh/id_ed25519.pub

# Agregar en: https://github.com/settings/keys

# Cambiar remote
git remote set-url origin git@github.com:SoyDanMx/Sumeeapp-B.git

# Push
git push origin main
```

