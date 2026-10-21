const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    serial: {
      type: String,
      required: [true, 'El serial es obligatorio'],
      unique: true,
      trim: true
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true
    },
    sinopsis: {
      type: String
    },
    url: {
      type: String,
      required: [true, 'La URL es obligatoria'],
      unique: true,
      trim: true,
      match: [/^https?:\/\/.+/i, 'La URL debe empezar por http:// o https://']
    },
    imagenPortada: {
      type: String,
      trim: true
    },
    anioEstreno: {
      type: Number,
      min: [1888, 'El año de estreno no puede ser menor a 1888'],
      max: [2100, 'El año de estreno no puede ser mayor a 2100'],
      validate: {
        validator: Number.isInteger,
        message: 'El año de estreno debe ser un número entero'
      }
    },
    genero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genero',
      required: [true, 'El género es obligatorio']
    },
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Director',
      required: [true, 'El director es obligatorio']
    },
    productora: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Productora',
      required: [true, 'La productora es obligatoria']
    },
    tipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tipo',
      required: [true, 'El tipo es obligatorio']
    }
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }
  }
);

module.exports = mongoose.model('Media', mediaSchema);
