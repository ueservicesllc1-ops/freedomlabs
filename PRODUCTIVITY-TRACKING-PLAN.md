# Plan de Implementación: Sistema de Productividad

## 🎯 Objetivo
Implementar un sistema completo de monitoreo de productividad para controlar mejor las horas de trabajo de los asistentes.

## 📦 Funcionalidades a Implementar

### 1. ✅ Monitoreo de Aplicaciones Activas
**Qué hace:**
- Detecta qué aplicación/ventana está usando el asistente
- Registra el nombre de la app y el título de la ventana
- Guarda cada 30 segundos en Firestore

**Datos a guardar:**
```javascript
{
  userId: "xxx",
  timestamp: "2025-12-13T16:30:00Z",
  appName: "Google Chrome",
  windowTitle: "YouTube - Broadcast Yourself",
  category: "unproductive" // productive, neutral, unproductive
}
```

**Colección Firestore:** `activityLogs`

---

### 2. ✅ Tracking de Actividad Mejorado
**Qué hace:**
- Cuenta teclas presionadas por minuto
- Cuenta clicks del mouse por minuto
- Calcula nivel de actividad

**Datos a guardar:**
```javascript
{
  userId: "xxx",
  timestamp: "2025-12-13T16:30:00Z",
  keysPerMinute: 85,
  clicksPerMinute: 12,
  activityLevel: "high" // high, medium, low, inactive
}
```

**Colección Firestore:** `activityMetrics`

---

### 3. ✅ Capturas de Pantalla Aleatorias
**Qué hace:**
- Toma screenshot cada 5-15 minutos (aleatorio)
- Sube a Firebase Storage
- Guarda referencia en Firestore

**Datos a guardar:**
```javascript
{
  userId: "xxx",
  timestamp: "2025-12-13T16:30:00Z",
  screenshotUrl: "https://storage.../screenshot.jpg",
  thumbnailUrl: "https://storage.../thumb.jpg"
}
```

**Colección Firestore:** `screenshots`
**Storage:** `screenshots/{userId}/{timestamp}.jpg`

---

### 4. ✅ Monitoreo de Sitios Web
**Qué hace:**
- Detecta cuando usan navegador
- Extrae URL del título de la ventana
- Clasifica como productivo/improductivo

**Lista de clasificación:**
```javascript
productive: ['figma.com', 'canva.com', 'github.com', 'drive.google.com']
neutral: ['google.com', 'gmail.com']
unproductive: ['youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com']
```

**Datos a guardar:**
```javascript
{
  userId: "xxx",
  timestamp: "2025-12-13T16:30:00Z",
  url: "youtube.com",
  category: "unproductive",
  duration: 1800 // segundos
}
```

**Colección Firestore:** `webActivity`

---

### 5. ✅ Sistema de Categorización de Tiempo
**Qué hace:**
- Analiza todos los logs
- Calcula tiempo por categoría
- Genera resumen diario

**Categorías:**
- 🟢 Productivo (apps de trabajo)
- 🟡 Neutral (navegador sin clasificar)
- 🔴 Improductivo (redes sociales, YouTube)
- ⚪ Inactivo (sin actividad)

**Datos a guardar:**
```javascript
{
  userId: "xxx",
  date: "2025-12-13",
  productive: 18720, // segundos (5.2 hrs)
  neutral: 5400,     // 1.5 hrs
  unproductive: 2880, // 0.8 hrs
  inactive: 1800,     // 0.5 hrs
  totalTime: 28800,   // 8 hrs
  productivityScore: 65 // porcentaje
}
```

**Colección Firestore:** `dailySummary`

---

### 6. ✅ Alertas en Tiempo Real
**Qué hace:**
- Detecta comportamientos sospechosos
- Envía notificación al admin
- Guarda en log de alertas

**Tipos de alertas:**
- 🚨 Tiempo prolongado en sitio improductivo (>30 min)
- 🚨 Inactividad prolongada (>20 min)
- 🚨 Uso de apps no autorizadas
- 🚨 Trabajo fuera de horario laboral

**Datos a guardar:**
```javascript
{
  userId: "xxx",
  timestamp: "2025-12-13T16:30:00Z",
  type: "unproductive_site",
  severity: "medium", // low, medium, high
  message: "Luis lleva 35 minutos en YouTube",
  details: {
    site: "youtube.com",
    duration: 2100
  }
}
```

**Colección Firestore:** `alerts`

---

### 10. ✅ Dashboard de Productividad Mejorado
**Qué muestra:**
- Resumen diario/semanal/mensual
- Gráficos de productividad
- Top apps usadas
- Top sitios visitados
- Alertas recientes
- Screenshots del día
- Comparativa entre asistentes

**Vista para Admin:**
```
┌─────────────────────────────────────────────┐
│ Luis - Community Manager                    │
├─────────────────────────────────────────────┤
│ 📊 Hoy: 6.5 hrs | Productividad: 78%       │
│                                             │
│ Distribución de Tiempo:                     │
│ 🟢 Productivo    5.2 hrs (65%) ████████▓░  │
│ 🟡 Neutral       1.5 hrs (19%) ███░░░░░░░  │
│ 🔴 Improductivo  0.8 hrs (10%) ██░░░░░░░░  │
│ ⚪ Inactivo      0.5 hrs (6%)  █░░░░░░░░░  │
│                                             │
│ Apps más usadas:                            │
│ 1. 🎨 Canva          3.2 hrs (49%)         │
│ 2. 🌐 Chrome         2.1 hrs (32%)         │
│ 3. 📷 Instagram      0.8 hrs (12%)         │
│                                             │
│ Sitios visitados:                           │
│ 1. canva.com         45%                    │
│ 2. instagram.com     20%                    │
│ 3. facebook.com      15%                    │
│                                             │
│ ⚠️ Alertas (2):                             │
│ • 25 min en YouTube (11:30 AM)             │
│ • Inactividad 22 min (2:15 PM)             │
│                                             │
│ 📸 Screenshots: [Ver 12 capturas]          │
└─────────────────────────────────────────────┘
```

---

## 🔧 Cambios en el Código

### Assistant App:
1. **Nuevo archivo:** `productivity-tracker.js`
   - Monitoreo de apps activas
   - Tracking de teclado/mouse
   - Screenshots
   - Detección de sitios web

2. **Modificar:** `app.js`
   - Integrar productivity tracker
   - Enviar datos a Firestore

3. **Modificar:** `firebase-config-web.js`
   - Nuevas funciones para guardar logs

### Admin App:
1. **Nueva vista:** `productivity-dashboard.html`
   - Dashboard completo de productividad

2. **Modificar:** `app.js`
   - Nueva sección en sidebar
   - Funciones para cargar datos
   - Gráficos y visualizaciones

3. **Modificar:** `firebase-config.js`
   - Funciones para leer logs
   - Generar reportes

---

## 📊 Estructura de Firestore

```
freedomlabs-6a666/
├── assistants/
├── projects/
├── workSessions/
├── activityLogs/          ← NUEVO
│   └── {logId}
├── activityMetrics/       ← NUEVO
│   └── {metricId}
├── screenshots/           ← NUEVO
│   └── {screenshotId}
├── webActivity/           ← NUEVO
│   └── {activityId}
├── dailySummary/          ← NUEVO
│   └── {userId}_{date}
└── alerts/                ← NUEVO
    └── {alertId}
```

---

## ⚙️ Configuración

### Intervalos de Monitoreo:
- **Aplicación activa:** Cada 30 segundos
- **Actividad teclado/mouse:** Cada 60 segundos
- **Screenshots:** Cada 5-15 minutos (aleatorio)
- **Resumen diario:** Cada hora

### Categorización de Apps:
```javascript
const appCategories = {
  productive: [
    'photoshop', 'illustrator', 'figma', 'canva',
    'vscode', 'sublime', 'atom',
    'excel', 'word', 'powerpoint'
  ],
  neutral: [
    'chrome', 'firefox', 'edge', 'safari',
    'explorer', 'finder'
  ],
  unproductive: [
    'spotify', 'vlc', 'steam', 'discord'
  ]
};
```

---

## ⚠️ Consideraciones

### Privacidad:
- ✅ Informar a los empleados del monitoreo
- ✅ Solo monitorear durante horas laborales
- ✅ No capturar información sensible (contraseñas, etc.)
- ✅ Dar acceso a los empleados a sus propias métricas

### Performance:
- ✅ Batch writes a Firestore (no escribir cada segundo)
- ✅ Comprimir screenshots antes de subir
- ✅ Limpiar logs antiguos (>30 días)

### Legal:
- ✅ Incluir cláusula en contrato
- ✅ Consentimiento explícito
- ✅ Cumplir con leyes locales de privacidad

---

## 📅 Tiempo Estimado de Implementación

| Funcionalidad | Tiempo |
|---------------|--------|
| 1. Monitoreo de Apps | 2 horas |
| 2. Tracking Actividad | 1 hora |
| 3. Screenshots | 2 horas |
| 4. Monitoreo Web | 1.5 horas |
| 5. Categorización | 2 horas |
| 6. Alertas | 1.5 horas |
| 10. Dashboard | 4 horas |
| **TOTAL** | **14 horas** |

---

## 🚀 Orden de Implementación

1. ✅ Instalar dependencias
2. ✅ Crear `productivity-tracker.js`
3. ✅ Implementar monitoreo de apps
4. ✅ Implementar tracking de actividad
5. ✅ Implementar screenshots
6. ✅ Implementar monitoreo web
7. ✅ Implementar categorización
8. ✅ Implementar alertas
9. ✅ Actualizar Firebase functions
10. ✅ Crear dashboard en Admin
11. ✅ Testing completo
12. ✅ Documentación

---

**Inicio:** 13 de Diciembre 2025, 4:33 PM
**Estimado de finalización:** 14 de Diciembre 2025, 6:30 AM
