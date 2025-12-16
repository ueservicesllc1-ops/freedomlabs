# Nueva Funcionalidad: Rastreo de Ubicación

## 📍 ¿Qué se implementó?

Se agregó un sistema de rastreo de ubicación que permite al administrador ver desde dónde cada asistente abre su aplicación de escritorio.

## 🎯 Beneficios

1. **Control de Ubicación**: Saber desde dónde trabajan tus empleados
2. **Detección de Compartición de Cuentas**: Si la misma cuenta se usa desde diferentes ubicaciones
3. **Estadísticas Geográficas**: Análisis de dónde se concentra tu equipo
4. **Seguridad**: Detectar accesos sospechosos desde ubicaciones inusuales

## 🔧 Cómo Funciona

### En la App del Asistente:
1. Cuando el asistente inicia sesión, la app obtiene automáticamente:
   - 🌐 Dirección IP pública
   - 📍 Ciudad y región
   - 🌍 País
   - 🏢 Proveedor de Internet (ISP)
   - 🕐 Zona horaria
   - 📊 Coordenadas (latitud/longitud)

2. Esta información se guarda en Firestore en el perfil del asistente

3. Se actualiza cada vez que el asistente inicia sesión

### En la App del Admin:
1. Al ver los detalles de un asistente, verás una nueva sección con:
   - 📍 **Ubicación**: Ciudad, Región, País
   - 🌐 **IP**: Dirección IP pública
   - 🏢 **ISP**: Proveedor de internet
   - 🕐 **Zona Horaria**: Zona horaria local
   - 🔄 **Última actualización**: Cuándo se obtuvo esta información

## 📊 Información que se Muestra

```
📍 Ubicación: Santo Domingo, Distrito Nacional, República Dominicana
🌐 IP: 190.xxx.xxx.xxx
🏢 ISP: Altice Dominicana
🕐 Zona Horaria: America/Santo_Domingo
🔄 Última actualización: 13/12/2025, 15:50:00
```

## 🔒 Privacidad y Seguridad

- ✅ Solo se obtiene la ubicación aproximada (ciudad/región)
- ✅ No se rastrea GPS ni ubicación exacta
- ✅ La información solo es visible para el administrador
- ✅ Se usa un servicio gratuito y confiable (ipapi.co)
- ✅ Si falla la obtención de ubicación, la app sigue funcionando normalmente

## 📝 Estructura de Datos en Firestore

En la colección `assistants`, cada documento ahora incluye:

```javascript
{
  // ... campos existentes ...
  location: {
    ip: "190.xxx.xxx.xxx",
    city: "Santo Domingo",
    region: "Distrito Nacional",
    country: "República Dominicana",
    countryCode: "DO",
    latitude: 18.4861,
    longitude: -69.9312,
    timezone: "America/Santo_Domingo",
    org: "Altice Dominicana",
    lastUpdated: "2025-12-13T20:50:00.000Z"
  },
  lastLocation: { /* mismo formato */ }
}
```

## 🧪 Cómo Probar

1. **Cierra y vuelve a abrir la Assistant App**
2. **Inicia sesión** (o si ya estás logueado, cierra sesión y vuelve a entrar)
3. **En la Admin App**, ve a "Ayudantes"
4. **Haz clic en "Detalles"** de cualquier asistente
5. **Verás la nueva sección de ubicación** con toda la información

## ⚠️ Notas Importantes

### Limitaciones del Servicio Gratuito:
- **ipapi.co** permite hasta 1,000 solicitudes por día gratis
- Para equipos grandes (>100 empleados con múltiples logins diarios), considera:
  - Usar un servicio pago
  - Implementar caché de ubicación (no consultar en cada login)

### Si No Aparece la Ubicación:
1. El asistente debe **cerrar sesión y volver a entrar** para que se obtenga la ubicación
2. Si la API falla, aparecerá "No disponible"
3. La app sigue funcionando normalmente sin la ubicación

## 🚀 Mejoras Futuras Posibles

1. **Historial de Ubicaciones**: Guardar todas las ubicaciones desde donde se ha conectado
2. **Alertas de Ubicación**: Notificar si alguien se conecta desde una ubicación nueva
3. **Mapa Visual**: Mostrar en un mapa dónde está cada asistente
4. **Geofencing**: Restringir acceso solo desde ciertas ubicaciones
5. **Detección de VPN**: Identificar si el usuario está usando VPN

## 📞 Soporte

Si tienes alguna pregunta o problema con esta funcionalidad, revisa:
1. La consola de DevTools para ver si hay errores
2. Firestore para verificar que se está guardando la ubicación
3. Que el asistente haya iniciado sesión después de la actualización

---

**Implementado**: 2025-12-13
**Versión**: 1.0.0
**Estado**: ✅ Funcional
