import { describe, expect, it } from 'vitest'
import { formatearFecha, iniciales, textoEstado } from './formato'

describe('formatearFecha', () => {
  it('convierte el ISO de la API en dd/mm/aaaa hh:mm', () => {
    // Sin zona horaria a propósito: así la prueba no depende del huso del equipo.
    expect(formatearFecha('2026-11-20T15:04:00')).toBe('20/11/2026 15:04')
  })

  it('devuelve un guion cuando no hay fecha', () => {
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha('')).toBe('—')
    expect(formatearFecha(undefined)).toBe('—')
  })

  it('devuelve un guion cuando el texto no es una fecha', () => {
    expect(formatearFecha('no es una fecha')).toBe('—')
  })
})

describe('iniciales', () => {
  it('usa las tres primeras letras de una sola palabra', () => {
    expect(iniciales('Interestelar')).toBe('INT')
  })

  it('usa la inicial de cada palabra cuando hay varias', () => {
    expect(iniciales('Dune: Parte dos')).toBe('DP')
    expect(iniciales('Warner Bros')).toBe('WB')
  })

  it('conserva tildes y eñes', () => {
    expect(iniciales('Ñandú')).toBe('ÑAN')
  })

  it('devuelve un guion sin texto', () => {
    expect(iniciales('')).toBe('—')
    expect(iniciales(null)).toBe('—')
    expect(iniciales('   ')).toBe('—')
  })
})

describe('textoEstado', () => {
  it('pone en mayúscula los dos estados del contrato', () => {
    expect(textoEstado('activo')).toBe('Activo')
    expect(textoEstado('inactivo')).toBe('Inactivo')
  })

  it('no inventa nada con un estado desconocido', () => {
    expect(textoEstado('pendiente')).toBe('pendiente')
    expect(textoEstado(undefined)).toBe('—')
  })
})
