# Freedom Labs - Desktop Apps

Aplicaciones de escritorio para gestionar ayudantes y administración de Freedom Labs.

## Estructura del Proyecto

```
freedomlabs/
├── assistant-app/          # App para ayudantes
│   ├── main.js            # Proceso principal de Electron
│   ├── preload.js         # Script de preload
│   ├── index.html         # Interfaz de usuario
│   ├── app.js             # Lógica de la aplicación
│   ├── firebase-config.js # Configuración de Firebase
│   ├── styles.css         # Estilos
│   └── package.json       # Dependencias
│
└── admin-app/             # App para administrador
    ├── main.js            # Proceso principal de Electron
    ├── preload.js         # Script de preload
    ├── index.html         # Interfaz de usuario
    ├── app.js             # Lógica de la aplicación
    ├── firebase-config.js # Configuración de Firebase
    ├── styles.css         # Estilos
    └── package.json       # Dependencias
```

## Instalación Rápida

### Windows
```bash
install-apps.bat
```

### Linux/macOS
```bash
chmod +x install-apps.sh
./install-apps.sh
```

### Instalación Manual

#### App de Ayudantes

```bash
cd assistant-app
npm install
npm start
```

#### App de Administrador

```bash
cd admin-app
npm install
npm start
```

## Configuración Inicial

### Logos

Antes de usar las aplicaciones, reemplaza los logos:

1. **App de Ayudantes**: Coloca tu logo en `assistant-app/assets/logo.png` (recomendado: 80x80px o más)
2. **App de Administrador**: Coloca tu logo en `admin-app/assets/logo.png` (recomendado: 80x80px o más)

Si no tienes logos, puedes usar los logos existentes del proyecto web en `public/images/`.

## Funcionalidades

### App de Ayudantes

- ✅ Autenticación con Firebase
- ✅ Registro de nuevos ayudantes con rol (Diseñador, Community Manager, Digitador)
- ✅ Panel de proyectos asignados
- ✅ Subida de archivos (fotos, videos, audio) por proyecto
- ✅ Visualización de archivos subidos
- ✅ Estadísticas personales (horas trabajadas, proyectos, archivos)
- ✅ Tracking automático de tiempo de trabajo
- ✅ Indicador de estado en línea/offline

### App de Administrador

- ✅ Autenticación con Firebase
- ✅ Vista en tiempo real de todos los ayudantes
- ✅ Monitoreo de estado en línea/offline
- ✅ Visualización de horas trabajadas por ayudante
- ✅ Historial de sesiones de trabajo
- ✅ Analíticas y reportes
- ✅ Gestión de proyectos
- ✅ Actualización automática configurable

## Estructura de Datos en Firestore

### Colección: `assistants`
```javascript
{
  userId: string,
  email: string,
  username: string,
  role: 'designer' | 'community_manager' | 'digitizer',
  isOnline: boolean,
  lastSeen: timestamp,
  totalHoursWorked: number,
  createdAt: timestamp
}
```

### Colección: `workSessions`
```javascript
{
  userId: string,
  startTime: timestamp,
  endTime: timestamp,
  hoursWorked: number,
  date: string,
  createdAt: timestamp
}
```

### Colección: `projectFiles`
```javascript
{
  projectId: string,
  userId: string,
  fileName: string,
  fileType: 'photo' | 'video' | 'audio',
  storagePath: string,
  downloadURL: string,
  size: number,
  uploadedAt: timestamp
}
```

### Colección: `projects`
```javascript
{
  name: string,
  description: string,
  status: string,
  assignedAssistants: array<string>, // Array de userIds
  createdAt: timestamp
}
```

## Build para Producción

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

Los ejecutables se generarán en la carpeta `dist/` de cada aplicación.

## Configuración de Firebase

Ambas aplicaciones usan la misma configuración de Firebase. Asegúrate de que:

1. Firebase Authentication esté habilitado
2. Firestore esté configurado con las reglas apropiadas
3. Firebase Storage esté habilitado para la subida de archivos

### Reglas de Firestore (Ejemplo)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Assistants - solo lectura para ayudantes, lectura/escritura para admin
    match /assistants/{assistantId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/assistants/$(assistantId)).data.userId == request.auth.uid;
    }
    
    // Work Sessions - lectura/escritura para el propio usuario
    match /workSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Project Files - lectura/escritura para usuarios asignados
    match /projectFiles/{fileId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Projects - lectura para todos, escritura para admin
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo admin puede escribir (configurar según necesidad)
    }
  }
}
```

## Notas Importantes

1. **Seguridad**: Asegúrate de configurar las reglas de Firestore apropiadamente
2. **Roles**: Los roles de ayudantes son: `designer`, `community_manager`, `digitizer`
3. **Tracking de Tiempo**: El sistema registra automáticamente las sesiones cuando el usuario inicia y cierra sesión
4. **Estado en Línea**: Se actualiza cada 30 segundos mientras la app está abierta
5. **Archivos**: Los archivos se suben a Firebase Storage en la ruta `projects/{projectId}/{fileType}/{fileName}`

## Desarrollo

Para desarrollo con hot-reload, puedes usar:

```bash
# En desarrollo, las apps abrirán DevTools automáticamente
NODE_ENV=development npm start
```

## Soporte

Para problemas o preguntas, contacta al equipo de Freedom Labs.

