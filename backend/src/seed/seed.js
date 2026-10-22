// Seed: carga los datos iniciales (5 géneros y 2 tipos).
// Idempotente: usa findOneAndUpdate con upsert, se puede ejecutar varias veces sin duplicar.
require('dotenv').config();

const mongoose = require('mongoose');
const Genero = require('../models/Genero');
const Tipo = require('../models/Tipo');

const generosIniciales = [
  { nombre: 'acción' },
  { nombre: 'aventura' },
  { nombre: 'ciencia ficción' },
  { nombre: 'drama' },
  { nombre: 'terror' }
];

const tiposIniciales = [
  { nombre: 'película' },
  { nombre: 'serie' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    for (const genero of generosIniciales) {
      await Genero.findOneAndUpdate(
        { nombre: genero.nombre },
        genero,
        { upsert: true, new: true }
      );
    }

    for (const tipo of tiposIniciales) {
      await Tipo.findOneAndUpdate(
        { nombre: tipo.nombre },
        tipo,
        { upsert: true, new: true }
      );
    }

    console.log('Seed completado: 5 géneros y 2 tipos cargados');
    process.exit(0);
  } catch (error) {
    console.error('Error en el seed:', error.message);
    process.exit(1);
  }
};

seed();
