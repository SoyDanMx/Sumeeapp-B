# 📊 Análisis de Precios de Plomería - HomePRO vs Sumee

## 🔍 Fuente de Información
- **HomePRO Blog**: https://homepro.com.mx/blog/costos-proyectos-plomeria-cdmx
- **Búsqueda Web**: Precios promedio de plomería en CDMX 2025
- **Fecha de Análisis**: Enero 2025

## 📋 Comparativa de Precios

### 1. **Reparación de Fugas**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $500 - $3,500 MXN | Rango amplio según complejidad |
| **Web Search** | $1,909 - $2,864 MXN | Promedio del mercado |
| **Sumee (Antes)** | $550 starting_at | ❌ Muy bajo, no competitivo |
| **Sumee (Actualizado)** | $500 - $2,000 MXN | ✅ Competitivo y realista |

**Factores que afectan el precio:**
- Ubicación de la fuga (visible vs. oculta)
- Tipo de material (cobre, PVC, termofusión)
- Complejidad de acceso
- Urgencia del servicio

---

### 2. **Desatascar/Destape de Drenajes**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $300 - $1,000 MXN | Servicio básico |
| **Web Search** | $2,029 - $3,043 MXN | Con máquina eléctrica |
| **Sumee (Antes)** | $950 starting_at | ⚠️ Solo precio mínimo |
| **Sumee (Actualizado)** | $800 - $2,500 MXN | ✅ Incluye servicio con máquina |

**Nota**: El precio varía significativamente si se usa máquina eléctrica (K-50) vs. método manual.

---

### 3. **Cambio de Llaves y Grifos**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $600 - $2,000 MXN | Según tipo de grifo |
| **Sumee (Antes)** | $450 fixed | ❌ Muy bajo |
| **Sumee (Actualizado)** | $600 - $2,000 MXN | ✅ Alineado con mercado |

**Tipos de grifos:**
- Mezcladora simple: $600 - $1,200
- Monomando: $800 - $1,500
- Mezcladora de lujo: $1,200 - $2,000

---

### 4. **Instalación de Sanitarios (WC)**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $1,500 - $3,500 MXN | Instalación completa |
| **Sumee (Antes)** | $800 fixed | ❌ Muy bajo, no realista |
| **Sumee (Actualizado)** | $1,500 - $3,500 MXN | ✅ Precio competitivo |

**Incluye:**
- Desmontaje de anterior (si aplica)
- Instalación con brida/cuello de cera
- Conexiones de agua y drenaje
- Sellado antihongos

---

### 5. **Instalación de Lavabos y Fregaderos**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $1,200 - $2,800 MXN | Según tipo y complejidad |
| **Sumee (Antes)** | $450 fixed | ❌ Extremadamente bajo |
| **Sumee (Actualizado)** | $1,200 - $2,800 MXN | ✅ Precio de mercado |

**Factores:**
- Tipo de lavabo/fregadero
- Complejidad de conexiones
- Necesidad de modificaciones estructurales

---

### 6. **Instalación de Regaderas y Tinas**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $3,000 - $7,000 MXN | Instalación completa |
| **Sumee (Antes)** | $650 starting_at | ❌ Extremadamente bajo |
| **Sumee (Actualizado)** | $3,000 - $7,000 MXN | ✅ Precio realista |

**Incluye:**
- Conexiones de agua caliente y fría
- Drenaje
- Ajustes necesarios
- Pruebas de funcionamiento

---

### 7. **Instalación de Calentadores de Agua**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $3,000 - $8,000 MXN | Paso o depósito |
| **Sumee (Antes)** | $1,100 starting_at | ❌ Muy bajo |
| **Sumee (Actualizado)** | $3,000 - $8,000 MXN | ✅ Competitivo |

**Tipos:**
- Calentador de paso: $3,000 - $5,000
- Calentador de depósito: $4,000 - $8,000
- Calentador solar: $5,000 - $12,000

---

### 8. **Instalación de Tinacos**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **HomePRO** | $1,000 - $2,500 MXN | Según capacidad |
| **Sumee (Antes)** | $2,200 starting_at | ⚠️ Solo precio mínimo |
| **Sumee (Actualizado)** | $1,000 - $2,500 MXN | ✅ Rango completo |

**Por capacidad:**
- 450-750L: $1,000 - $1,800
- 1,100-1,200L: $1,800 - $2,500

**Incluye:**
- Subida (hasta 2 pisos)
- Instalación hidráulica
- Jarro de aire y válvula check
- No incluye base de albañilería ni tinaco

---

### 9. **Instalación de Bombas de Agua**
| Fuente | Rango de Precio | Observaciones |
|--------|----------------|---------------|
| **Web Search** | $8,960 MXN | Promedio |
| **Sumee (Actualizado)** | $5,000 - $12,000 MXN | ✅ Rango competitivo |

**Tipos:**
- Bomba periférica: $5,000 - $8,000
- Bomba centrífuga: $7,000 - $12,000
- Presurizador: $3,000 - $6,000

---

## ✅ Cambios Implementados

### Migración SQL Creada
- **Archivo**: `supabase/migrations/20250118_update_plomeria_prices_realistic_cdmx.sql`
- **Objetivo**: Actualizar todos los precios de plomería según análisis de mercado

### Servicios Actualizados:
1. ✅ Reparación de Fugas: $500 - $2,000 MXN
2. ✅ Destape de Drenaje: $800 - $2,500 MXN
3. ✅ Cambio de Llaves/Grifos: $600 - $2,000 MXN
4. ✅ Instalación de Sanitarios: $1,500 - $3,500 MXN
5. ✅ Instalación de Lavabos: $1,200 - $2,800 MXN
6. ✅ Instalación de Regaderas/Tinas: $3,000 - $7,000 MXN
7. ✅ Instalación de Calentadores: $3,000 - $8,000 MXN
8. ✅ Instalación de Tinacos: $1,000 - $2,500 MXN
9. ✅ Instalación de Bombas: $5,000 - $12,000 MXN

## 🎯 Beneficios de la Actualización

1. **Competitividad**: Precios alineados con el mercado de CDMX
2. **Transparencia**: Rangos claros en lugar de precios fijos irreales
3. **Realismo**: Precios que reflejan la complejidad real de los trabajos
4. **Confianza**: Clientes verán precios profesionales y creíbles
5. **Sostenibilidad**: Precios que permiten cubrir costos y mantener calidad

## 📝 Notas Importantes

- **Materiales aparte**: La mayoría de servicios no incluyen materiales
- **Precios variables**: Los rangos reflejan diferentes niveles de complejidad
- **Evaluación en sitio**: Para trabajos complejos, el técnico evaluará y confirmará precio final
- **Garantía**: Todos los servicios incluyen garantía de mano de obra

## 🚀 Próximos Pasos

1. ✅ Migración SQL creada
2. ⏳ Ejecutar migración en base de datos
3. ⏳ Verificar que los precios se muestren correctamente en la UI
4. ⏳ Probar el flujo completo de cotización
5. ⏳ Monitorear feedback de clientes

## 📚 Referencias

- [HomePRO - Costos de Plomería CDMX](https://homepro.com.mx/blog/costos-proyectos-plomeria-cdmx)
- [Mexico City Tribune - Costos de Plomería](https://www.mexicocitytribune.com/article/865835510-costos-de-plomer-a-en-la-ciudad-de-m-xico-homepro-reporta-tendencias-de-precios-para-noviembre-de-2025)
- [Habitissimo - Presupuestos Plomeros CDMX](https://www.habitissimo.com.mx/presupuesto/plomeros/ciudad-de-mexico)


