# 💰 Sistema Profesional de Contabilidad y Nómina - Freedom Labs Admin

## Versión 2.0.7 - Build 29

---

## 🎯 RESUMEN DE TODAS LAS FUNCIONALIDADES

### ✅ Sistema Anti-Zombie (CRÍTICO)
- **Detecta conexiones "fantasma"** (PC apagada pero muestra online)
- **Verificación automática**: Si `lastSeen` > 2 minutos → Fuerza offline
- **NO cuenta horas** de sesiones zombie
- **Protección de pagos**: Solo cuenta horas reales trabajadas

### 💰 Sistema de Contabilidad Profesional (NUEVO)
El sistema más completo para gestión de nómina y pagos.

#### Dashboard Financiero
- **Resumen visual** con 3 métricas principales:
  - 💰 **Por Pagar**: Total pendiente de pago
  - ✅ **Pagado**: Total ya pagado en el período
  - 📊 **Total**: Suma completa

#### Gestión de Nómina
- **Tabla completa** de todos los asistentes con:
  - Nombre y email
  - Horas trabajadas en el período
  - Tarifa por hora
  - **Total a pagar calculado automáticamente**
  - Estado: Pendiente / Pagado
  - Botones de acción

#### Filtros Avanzados
- **Esta Semana**: Domingo a hoy
- **Este Mes**: Primer día del mes hasta hoy
- **Rango Personalizado**: Selecciona fechas inicio y fin

#### Reportes Detallados
- **Ver Detalle** por asistente:
  - Resumen con horas, tarifa y total
  - **Desglose día por día**
  - Sesiones individuales con horarios
  - Cálculo de pago por día

#### Gestión de Pagos
- **Marcar como "Pagado"** con un clic
- **Confirmación** mostrando:
  - Monto total
  - Período exacto
  - Horas trabajadas
- **Registro permanente** en Firestore
- **Histórico** de todos los pagos

#### Exportación
- **Exportar a CSV** con un clic
- Incluye:
  - Nombre, email
  - Horas, tarifa/hora
  - Total a pagar
  - Estado (Pagado/Pendiente)
- **Nombre automático** del archivo con fechas

### 📊 Cálculos de Pago (Mejorado)
En detalles de asistente, ahora muestra:
- **4 tarjetas** con horas Y pagos:
  - Hoy: Horas + $Pago
  - Esta Semana: Horas + $Pago
  - Este Mes: Horas + $Pago
  - Total: Horas + $Pago

### 📅 Horas Trabajadas por Día
- **Agrupación automática** por fecha
- **Total en grande** por cada día
- **Desglose** de sesiones individuales
- Muestra últimos 30 días

### 🕐 Información de Conexión
- **Última Conexión**: Fecha y hora exacta
- **Tiempo Conectado Hoy**: Solo si está realmente online
- **Sesión Actual**: Hora de inicio si está conectado

### 💵 Salario por Hora Flexible
- **Acepta cualquier decimal**: 1.25, 2.75, 3.33, etc.
- Antes solo permitía incrementos de 0.50

---

## 📖 CÓMO USAR EL SISTEMA DE CONTABILIDAD

### 1. Acceder al Sistema
1. Abre la app admin
2. Haz clic en **"💰 Contabilidad"** en el menú lateral
3. El sistema carga automáticamente

### 2. Seleccionar Período
- **Esta Semana**: Automático, de domingo a hoy
- **Este Mes**: Automático, día 1 hasta hoy
- **Rango Personalizado**:
  1. Selecciona "Rango Personalizado"
  2. Aparecen dos calendarios
  3. Elige fecha inicio y fin
  4. Se actualiza automáticamente

### 3. Ver Resumen General
En la parte superior verás 3 tarjetas:
- **💰 Por Pagar**: Cuánto debes en total (pendientes)
- **✅ Pagado**: Cuánto ya pagaste
- **📊 Total**: Suma de ambos

### 4. Revisar Nómina por Asistente
La tabla muestra TODOS los asistentes con horas en el período:
- **Verde** ($): Total a pagar
- **Naranja** (h): Horas trabajadas
- **Estado**: Pendiente (rojo) o Pagado (verde)

### 5. Ver Detalles de un Asistente
1. Haz clic en **"👁 Ver Detalle"**
2. Se abre modal con:
   - Resumen: Horas, tarifa, total
   - **Desglose día por día**:
     - Fecha en grande
     - Total de horas el día = $ cantidad
     - Sesiones individuales con horarios exactos

### 6. Marcar Como Pagado
1. Haz clic en **"✓ Pagado"** en un asistente **pendiente**
2. Confirma el pago:
   - Verifica monto, período, horas
3. Clic en **"Aceptar"**
4. ✅ Se marca como pagado
5. **Se guarda en Firestore** para siempre
6. El botón desaparece (ya está pagado)

### 7. Exportar Reporte
1. Haz clic en **"📥 Exportar CSV"**
2. Se descarga automáticamente
3. **Nombre del archivo**: `nomina_YYYY-MM-DD_YYYY-MM-DD.csv`
4. Abre con Excel/Google Sheets

---

## 🔧 ESTRUCTURA TÉCNICA

### Colección en Fire store: `payments`
```javascript
{
  assistantId: "user123",
  assistantName: "Juan Pérez",
  startDate: Timestamp,
  endDate: Timestamp,
  hours: 25.5,
  hourlyRate: 1.50,
  totalAmount: 38.25,
  createdAt: Timestamp,
  createdBy: "admin"
}
```

### Archivos del Sistema
- `accounting-system.js`: Lógica completa del sistema
- `index.html`: Vista de contabilidad
- `app.js`: Integración

### Funciones Principales
- `initializeView()`: Carga inicial
- `calculateAssistantPayroll()`: Calcula nómina
- `renderDashboard()`: Renderiza interfaz
- `markAsPaid()`: Marca pago
- `exportToCSV()`: Exporta datos

---

## 📝 CASOS DE USO

### Caso 1: Cierre Semanal
```
1. Cada domingo o lunes
2. Ir a Contabilidad
3. Seleccionar "Esta Semana"
4. Revisar tabla de asistentes
5. Ver detalle de cada uno
6. Exportar CSV para registros
7. Marcar todos como "Pagado"
8. ¡Listo!
```

### Caso 2: Verificar Pago Individual
```
1. Asistente pregunta cuánto le deben
2. Ir a Contabilidad
3. Buscar su nombre en la tabla
4. Ver su total en verde
5. Clic en "Ver Detalle"
6. Mostrarle el desglose día por día
```

### Caso 3: Exportar Para Contabilidad Externa
```
1. Ir a Contabilidad
2. Seleccionar período (mes completo)
3. Clic en "Exportar CSV"
4. Enviar archivo al contador
5. Archivo tiene todo: nombres, horas, pagos
```

### Caso 4: Auditoría de Pagos
```
1. ¿Pagamos a alguien dos veces?
2. Los pagos se guardan en Firestore
3. No se puede marcar como pagado dos veces
4. Histórico permanente
```

---

## 🎨 CARACTERÍSTICAS VISUALES

### Colores del Sistema
- **Morado**: Pendiente de pagar (importante)
- **Verde**: Pagado (éxito)
- **Naranja**: Total general (neutral)
- **Rojo**: Pendiente (alerta)

### Iconos
- 💰 = Por pagar
- ✅ = Pagado
- 📊 = Total
- 👁 = Ver detalle
- ✓ = Marcar pagado
- 📥 = Exportar

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Detección de Zombies
El sistema contable **NO cuenta** horas de usuarios "zombie":
- Si un usuario aparece online pero `lastSeen` > 2 min
- Se marca automáticamente como offline
- Sus horas actuales NO se suman

### 2. Precisión de Horas
- Las horas se guardan con 2 decimales
- Ejemplo: 8.50 horas = 8 horas 30 minutos
- Los pagos se calculan con centavos: $12.75

### 3. Períodos de Pago
- **Semana**: Siempre empieza en domingo
- **Mes**: Siempre día 1 hasta hoy
- **Custom**: Tú eliges ambas fechas

### 4. Estado de Pago
- **Una vez marcado como "Pagado"**:
  - No se puede desmarcar
  - El botón desaparece
  - Queda registrado para siempre

---

## 🚀 INSTALACIÓN DE LA NUEVA VERSIÓN

### Paso a Paso
1. **Desinstala** todas las versiones anteriores:
   - "Freedom Labs Admin" (vieja)
   - "Freedom Labs Admin v2" (si existe)

2. **Opcional pero recomendado**: Borra caché
   ```
   C:\Users\TuUsuario\AppData\Roaming\freedomlabs-admin-app
   ```

3. **Instala** la nueva versión:
   - Ubicación: `e:\freedomlabs\admin-app\dist\`
   - Archivo: `Freedom Labs Admin v2 Setup.exe`
   - Versión: **2.0.7, Build 29**

4. **Abre** la aplicación
5. **Ingresa PIN**: 1619
6. **Accede a Contabilidad**: Click en menú lateral

---

## 📊 COMPARATIVA DE VERSIONES

| Funcionalidad | Versión Anterior | Versión 2.0.7 |
|--------------|------------------|---------------|
| Sistema Anti-Zombie | ❌ No | ✅ Sí |
| Cálculo de Pagos | ❌ No | ✅ Sí |
| Horas por Día | ❌ No | ✅ Sí |
| Sistema Contable | ❌ No | ✅ **NUEVO** |
| Exportar CSV | ❌ No | ✅ Sí |
| Marcar Pagados | ❌ No | ✅ Sí |
| Reportes Detallados | ❌ No | ✅ Sí |
| Histórico de Pagos | ❌ No | ✅ Sí |
| Salario Flexible | ❌ Solo 0.5 | ✅ Cualquier decimal |

---

## 🎯 BENEFICIOS

### Para el Administrador
- ✅ **Ahorra tiempo**: Todo automatizado
- ✅ **Sin errores**: Cálculos exactos
- ✅ **Transparencia**: Todo registrado
- ✅ **Exportable**: Para contabilidad

### Para los Asistentes
- ✅ **Claridad**: Ven exactamente sus horas
- ✅ **Confianza**: Desglose día por día
- ✅ **Justicia**: No se cuentan conexiones falsas

### Para la Empresa
- ✅ **Profesional**: Sistema completo
- ✅ **Auditable**: Histórico permanente
- ✅ **Escalable**: Funciona con 1 o 100 asistentes

---

## 🔜 PRÓXIMAS MEJORAS SUGERIDAS

1. **Imprimir recibos PDF** por pago
2. **Gráficas** de costos mensuales
3. **Alertas** cuando un pago está pendiente >7 días
4. **Bonos** y deducciones
5. **Múltiples tarifas** por rol

---

## 📞 SOPORTE

Si tienes problemas:
1. Abre DevTools (F12)
2. Ve a Console
3. Copia errores en rojo
4. Reporta con captura de pantalla

---

**Creado por:** Antigravity AI  
**Fecha:** 20 de Diciembre, 2025  
**Versión:** 2.0.7, Build 29
