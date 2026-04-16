const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const equipoRoutes = require('./routes/equipoRoutes');
const clienteRoutes = require('./routes/clienteRoutes'); 
const reservaRoutes = require('./routes/reservaRoutes'); 
const authRoutes = require('./routes/authRoutes'); 

const app = express();

// 🚩 ARREGLO DE CORS: Configuración robusta y flexible
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'https://darling-sawine-c79d9f.netlify.app', // Tu URL real de Netlify
  process.env.FRONTEND_URL
].filter(Boolean); // Elimina valores nulos o indefinidos

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman o apps móviles)
    if (!origin) return callback(null, true);
    
    // Si el origen está en nuestra lista o es una vista previa de Netlify, permitir
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      console.log("🚫 Origen bloqueado por CORS:", origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 🚩 BLINDAJE: Carpetas automáticas (Sin cambios, esto está perfecto)
const carpetasRequeridas = ['public/img', 'public/perfiles', 'public/comprobantes'];
carpetasRequeridas.forEach(carpeta => {
  const rutaCompleta = path.join(__dirname, carpeta);
  if (!fs.existsSync(rutaCompleta)) {
    fs.mkdirSync(rutaCompleta, { recursive: true });
    console.log(`📁 Carpeta creada automáticamente: ${carpeta}`);
  }
});

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
  res.json({ servicio: 'Rueda Jump API', estado: 'ok', version: '1.0.1' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rueda_jump'; 

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('✅ ¡Conectado a MongoDB exitosamente!'))
  .catch(err => {
    console.error('❌ Error crítico en MongoDB:', err.message);
  });

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Rueda Jump corriendo en el puerto ${PORT}`);
});