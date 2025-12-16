# Sistema de Actualizaciones desde Google Drive

## Configuración Necesaria

Para que el sistema de actualizaciones funcione completamente, necesitas crear un archivo `version.json` en Google Drive con el siguiente formato:

```json
{
  "version": "1.0.1",
  "build": 2,
  "url": "https://drive.google.com/uc?export=download&id=1j_cwLaJkfgoimdzt7n7ecGvMfoCpW9_9",
  "releaseDate": "2024-01-15",
  "releaseNotes": "Nueva versión con mejoras"
}
```

## Pasos para Configurar

1. **Crear archivo version.json**:
   - Crea un archivo `version.json` en Google Drive
   - Compártelo como "Cualquiera con el enlace puede ver"
   - Copia el ID del archivo (de la URL)

2. **Actualizar el código**:
   - Reemplaza `VERSION_FILE_ID` en `main.js` con el ID del archivo version.json
   - Reemplaza `DRIVE_FILE_ID` con el ID del instalador actualizado

3. **Cuando subas una nueva versión**:
   - Sube el nuevo instalador a Google Drive
   - Actualiza el archivo `version.json` con la nueva versión y build
   - La app detectará automáticamente la nueva versión

## Cómo Funciona

1. La app verifica `version.json` al iniciar
2. Compara la versión actual con la versión en Drive
3. Si hay una nueva versión, muestra un diálogo al usuario
4. El usuario puede descargar e instalar la actualización

## Enlaces Actuales

- **Instalador**: https://drive.google.com/file/d/1j_cwLaJkfgoimdzt7n7ecGvMfoCpW9_9/view?usp=sharing
- **ID del archivo**: `1j_cwLaJkfgoimdzt7n7ecGvMfoCpW9_9`

