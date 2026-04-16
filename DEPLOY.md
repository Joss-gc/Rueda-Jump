# Despliegue Rueda Jump

## Backend en Render

1. Crea un servicio nuevo en Render conectando este repositorio.
2. Render detectará `render.yaml` y configurará el servicio `rueda-jump-api`.
3. En variables de entorno agrega:
   - `MONGO_URI`: la cadena de conexión de MongoDB Atlas.
   - `FRONTEND_URL`: tu URL final de Netlify, por ejemplo `https://tu-sitio.netlify.app`.
   - `CORS_ORIGINS`: opcional, para dominios extra separados por comas.
4. Despliega y copia la URL pública de Render.

## Frontend en Netlify

1. Conecta este repositorio a Netlify.
2. Netlify usará `netlify.toml`.
3. Antes del deploy final, actualiza [environment.production.ts](/C:/Users/jairh/OneDrive/Documentos/GitHub/Rueda-Jump/rueda-jump-v2/src/environments/environment.production.ts) con la URL real del backend de Render.
4. Vuelve a desplegar el frontend.

## MongoDB Atlas

1. Crea un usuario de base de datos.
2. En `Network Access`, agrega `0.0.0.0/0` para pruebas.
3. Copia la URI de conexión y úsala como `MONGO_URI` en Render.

## Orden recomendado

1. Atlas
2. Render
3. Netlify
