const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // 🚩 NUEVO: Herramienta para leer/crear carpetas
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');
const clienteRoutes = require('./routes/clienteRoutes'); 
const reservaRoutes = require('./routes/reservaRoutes'); 
const authRoutes = require('./routes/authRoutes'); 

const app = express();
const configuredOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(','),
]
  .map(origin => origin && origin.trim())
  .filter(Boolean);

const allowNetlifyPreviews = process.env.ALLOW_NETLIFY_PREVIEWS === 'true';

// 🚩 BLINDAJE: Crear carpetas automáticamente si no existen
// Esto evita el 99% de los errores al subir archivos o comprobantes
const carpetasRequeridas = ['public/img', 'public/perfiles', 'public/comprobantes'];
carpetasRequeridas.forEach(carpeta => {
  const rutaCompleta = path.join(__dirname, carpeta);
  if (!fs.existsSync(rutaCompleta)) {
    fs.mkdirSync(rutaCompleta, { recursive: true });
    console.log(`📁 Carpeta creada automáticamente: ${carpeta}`);
  }
});

// Configuración de CORS para Angular
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (allowNetlifyPreviews && /^https:\/\/.*\.netlify\.app$/i.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/perfiles', express.static(path.join(__dirname, 'public/perfiles')));
app.use('/comprobantes', express.static(path.join(__dirname, 'public/comprobantes')));

// Rutas de la API
app.use('/api/equipos', equipoRoutes);
app.use('/api/clientes', clienteRoutes); 
app.use('/api/reservas', reservaRoutes); 
app.use('/api/auth', authRoutes); 
app.get('/', (_req, res) => {
  res.json({ servicio: 'Rueda Jump API', estado: 'ok' });
});
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://jairher79_db_user:lbcR7DFyrjMRdS15@cluster0.hxhqufv.mongodb.net/?appName=Cluster0'; 

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('✅ ¡Conectado a MongoDB (127.0.0.1)!'))
  .catch(err => {
    console.error('❌ Error crítico en MongoDB:', err.message);
  });

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Rueda Jump corriendo en http://127.0.0.1:${PORT}`);
});
