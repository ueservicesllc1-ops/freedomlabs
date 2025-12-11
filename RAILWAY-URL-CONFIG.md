# Configuración de URL de Railway

## Importante: Actualizar la URL de Railway

Las apps de escritorio están configuradas para usar el servidor desplegado en Railway. Necesitas actualizar la URL de Railway en los siguientes archivos:

1. `assistant-app/firebase-config-web.js` - Línea ~196
2. `admin-app/firebase-config-web.js` - Línea ~186

Busca esta línea:
```javascript
const RAILWAY_URL = 'https://freedomlabs-production.up.railway.app'; // Update this with your actual Railway URL
```

Y reemplázala con tu URL real de Railway. Puedes encontrarla en:
- Tu dashboard de Railway → Settings → Domains
- O en la URL que aparece cuando haces deploy

## Cómo funciona

Las apps intentarán conectarse primero a Railway, y si no está disponible, intentarán localhost como fallback. Esto significa que:

- ✅ Si Railway está desplegado y funcionando, las apps lo usarán automáticamente
- ✅ Si Railway no está disponible, intentarán usar localhost:3001 (útil para desarrollo)
- ❌ Si ninguno está disponible, mostrará un error claro

## Verificar que funciona

1. Asegúrate de que `server-railway.js` esté desplegado en Railway
2. Verifica que la ruta `/health` responda: `https://tu-url.railway.app/health`
3. Actualiza la URL en los archivos mencionados arriba
4. Recompila las apps de escritorio

