const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

mongoose.set('bufferCommands', false);

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

const carpetasRequeridas = ['public/img', 'public/perfiles', 'public/comprobantes'];
carpetasRequeridas.forEach(carpeta => {
  const rutaCompleta = path.join(__dirname, carpeta);
  if (!fs.existsSync(rutaCompleta)) {
    fs.mkdirSync(rutaCompleta, { recursive: true });
    console.log(`Carpeta creada automaticamente: ${carpeta}`);
  }
});

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
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/perfiles', express.static(path.join(__dirname, 'public/perfiles')));
app.use('/comprobantes', express.static(path.join(__dirname, 'public/comprobantes')));

app.use('/api/equipos', equipoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
  res.json({ servicio: 'Rueda Jump API', estado: 'ok' });
});

app.get('/health', (_req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  res.status(mongoConnected ? 200 : 503).json({
    status: mongoConnected ? 'ok' : 'degraded',
    mongoConnected,
  });
});

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

if (!mongoURI) {
  console.error('Falta configurar la variable de entorno MONGO_URI.');
  process.exit(1);
}

async function startServer() {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log('Conectado a MongoDB Atlas.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor Rueda Jump corriendo en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error critico en MongoDB:', err.message);
    process.exit(1);
  }
}

startServer();
