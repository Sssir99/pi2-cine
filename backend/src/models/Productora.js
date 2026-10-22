// Modelo Productora: empresa productora (nombre único, estado, slogan, descripción).
// fechaCreacion y fechaActualizacion se generan automáticamente (timestamps de Mongoose).
const mongoose = require('mongoose');

const productoraSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la productora es obligatorio'],
      unique: true,
      trim: true
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo'
    },
    slogan: {
      type: String,
      trim: true
    },
    descripcion: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }
  }
);

module.exports = mongoose.model('Productora', productoraSchema);
