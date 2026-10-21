const mongoose = require('mongoose');

const generoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del género es obligatorio'],
      unique: true,
      trim: true
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo'
    },
    descripcion: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }
  }
);

module.exports = mongoose.model('Genero', generoSchema);
