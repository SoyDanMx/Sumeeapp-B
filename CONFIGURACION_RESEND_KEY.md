# 🔑 Configuración de RESEND_API_KEY

## ✅ API Key Obtenida
Tu API Key de Resend es: `re_EUgVj1XE_GmA4LpmdkV1wQak5Qnp3m5Mp`

---

## 📝 PASO 1: Agregar a .env.local

Abre tu archivo `.env.local` y agrega al final:

```env
# Variables de entorno para Resend (Notificaciones por Email)
RESEND_API_KEY=re_EUgVj1XE_GmA4LpmdkV1wQak5Qnp3m5Mp
```

**⚠️ IMPORTANTE:**
- Esta variable NO debe tener el prefijo `NEXT_PUBLIC_`
- Guarda el archivo después de agregarlo
- No subas este archivo a Git (debe estar en `.gitignore`)

---

## 🔧 PASO 2: Configurar en Supabase Edge Functions

1. Ve a **Supabase Dashboard**
2. Ve a **Edge Functions** (en el menú lateral)
3. Haz clic en la pestaña **"Secrets"** o busca **"Manage secrets"**
4. Haz clic en **"Add new secret"** o **"New secret"**
5. En el campo **"Name"**, escribe exactamente: `RESEND_API_KEY`
6. En el campo **"Value"**, pega: `re_EUgVj1XE_GmA4LpmdkV1wQak5Qnp3m5Mp`
7. Haz clic en **"Save"** o **"Add"**
8. Verifica que aparezca en la lista de secrets

---

## ✅ Verificación

Después de configurar en ambos lugares, verifica:

### En .env.local:
- [ ] La línea `RESEND_API_KEY=re_EUgVj1XE_GmA4LpmdkV1wQak5Qnp3m5Mp` está presente
- [ ] El archivo está guardado

### En Supabase:
- [ ] El secret `RESEND_API_KEY` existe en Edge Functions Secrets
- [ ] El valor es correcto

---

## 🚀 Siguiente Paso

Una vez configurada la API Key en ambos lugares, continúa con:
- **PASO 3**: Extraer valores de Supabase (PROJECT_REF y Service Role Key)
- **PASO 5**: Ejecutar el Script SQL

Consulta `GUIA_PASO_A_PASO_DETALLADA.md` para los pasos completos.

