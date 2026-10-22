// Modelo Director: director principal de una producción (nombres, estado).
// fechaCreacion y fechaActualizacion se generan automáticamente (timestamps de Mongoose).
const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema(
  {
    nombres: {
      type: String,
      required: [true, 'Los nombres del director son obligatorios'],
      trim: true
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo'
    }
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }
  }
);

module.exports = mongoose.model('Director', directorSchema);
