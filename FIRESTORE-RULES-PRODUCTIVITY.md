# Reglas de Firestore para Sistema de Productividad

## Reglas a agregar en Firebase Console

Ve a: https://console.firebase.google.com/project/freedomlabs-6a666/firestore/rules

Agrega estas reglas a las existentes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... reglas existentes ...
    
    // Activity Logs - Solo el usuario puede escribir, admin puede leer
    match /activityLogs/{logId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Activity Metrics - Solo el usuario puede escribir, admin puede leer
    match /activityMetrics/{metricId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Screenshots - Solo el usuario puede escribir, admin puede leer
    match /screenshots/{screenshotId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Web Activity - Solo el usuario puede escribir, admin puede leer
    match /webActivity/{activityId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // App Sessions - Solo el usuario puede escribir, admin puede leer
    match /appSessions/{sessionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Alerts - Solo el usuario puede escribir, admin puede leer y actualizar
    match /alerts/{alertId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.token.email == 'ueservicesllc1@gmail.com';
    }
    
    // Daily Summary - Solo el sistema puede escribir, todos pueden leer sus propios datos
    match /dailySummary/{summaryId} {
      allow read: if request.auth != null && 
        (summaryId.matches('^' + request.auth.uid + '_.*') || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow write: if request.auth != null;
    }
  }
}
```

## Reglas de Storage para Screenshots

Ve a: https://console.firebase.google.com/project/freedomlabs-6a666/storage/rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ... reglas existentes ...
    
    // Screenshots - Solo el usuario puede subir, admin puede leer
    match /screenshots/{userId}/{fileName} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.email == 'ueservicesllc1@gmail.com');
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Índices Necesarios

Estos índices se crearán automáticamente cuando se intente hacer la primera consulta.
Si aparecen errores, Firebase te dará un link para crearlos automáticamente.

### activityLogs
- userId (Ascending) + timestamp (Descending)

### activityMetrics
- userId (Ascending) + timestamp (Descending)

### screenshots
- userId (Ascending) + timestamp (Descending)

### webActivity
- userId (Ascending) + timestamp (Descending)
- userId (Ascending) + category (Ascending) + timestamp (Descending)

### appSessions
- userId (Ascending) + startTime (Descending)
- userId (Ascending) + category (Ascending) + startTime (Descending)

### alerts
- userId (Ascending) + read (Ascending) + timestamp (Descending)
- userId (Ascending) + severity (Ascending) + timestamp (Descending)

---

## Cómo Aplicar las Reglas

1. Ve a Firebase Console
2. Selecciona tu proyecto: freedomlabs-6a666
3. Ve a Firestore Database → Rules
4. Copia y pega las reglas de arriba
5. Haz clic en "Publicar"

6. Ve a Storage → Rules
7. Copia y pega las reglas de Storage
8. Haz clic en "Publicar"

---

## Verificación

Después de aplicar las reglas, verifica que:

- ✅ Los asistentes pueden escribir en sus propias colecciones
- ✅ El admin puede leer todas las colecciones
- ✅ Los asistentes NO pueden leer datos de otros asistentes
- ✅ Los screenshots se suben correctamente a Storage

---

**Importante:** Estas reglas asumen que el admin tiene el email `ueservicesllc1@gmail.com`.
Si usas otro email de admin, actualiza las reglas en consecuencia.
