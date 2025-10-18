# Configuración de Railway para Freedom Labs

## 1. Variables de Entorno en Railway

Copia y pega estas variables en tu dashboard de Railway:

```json
{
  "FIREBASE_API_KEY": "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "FIREBASE_AUTH_DOMAIN": "freedomlabs-xxxxx.firebaseapp.com",
  "FIREBASE_PROJECT_ID": "freedomlabs-xxxxx",
  "FIREBASE_STORAGE_BUCKET": "freedomlabs-xxxxx.appspot.com",
  "FIREBASE_MESSAGING_SENDER_ID": "123456789012",
  "FIREBASE_APP_ID": "1:123456789012:web:abcdef1234567890",
  "FIREBASE_MEASUREMENT_ID": "G-XXXXXXXXXX",
  "NODE_ENV": "production",
  "PORT": "3000"
}
```

## 2. Configurar Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto Freedom Labs
3. Ve a **Authentication** → **Settings** → **Authorized domains**
4. Agrega estos dominios:
   - `tu-proyecto.railway.app` (tu dominio de Railway)
   - `localhost:3000` (para desarrollo local)
   - `localhost:5173` (para Vite dev server)

## 3. Obtener las credenciales de Firebase

1. En Firebase Console, ve a **Project Settings** (⚙️)
2. Scroll down hasta **Your apps**
3. Si no tienes una app web, haz clic en **Add app** → **Web**
4. Copia las credenciales y reemplaza los valores en `railway-env-variables.json`

## 4. Dominios autorizados en Firebase

Agrega estos dominios en Firebase Authentication:
- `tu-proyecto.railway.app`
- `localhost:3000`
- `localhost:5173`

## 5. Deploy en Railway

1. Conecta tu repositorio de GitHub a Railway
2. Agrega las variables de entorno desde el archivo JSON
3. Railway automáticamente detectará y desplegará tu aplicación

## 6. Verificar el deploy

Una vez desplegado, verifica que:
- La aplicación carga correctamente
- Firebase Authentication funciona
- Los formularios de login/registro funcionan
- El panel de administración es accesible
