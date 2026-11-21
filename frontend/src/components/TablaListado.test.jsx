import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TablaListado from './TablaListado'

const columnas = [
  { clave: 'nombre', encabezado: 'Nombre', ordenable: true },
  { clave: 'estado', encabezado: 'Estado' },
]

const filas = [
  { _id: '1', nombre: 'drama', estado: 'activo' },
  { _id: '2', nombre: 'terror', estado: 'inactivo' },
]

const props = {
  caption: 'Géneros registrados',
  columnas,
  filas,
  nombreRegistro: (fila) => fila.nombre,
}

describe('TablaListado', () => {
  it('mientras carga dibuja el esqueleto y no la tabla', () => {
    const { container } = render(<TablaListado {...props} cargando />)
    expect(container.querySelectorAll('.esqueleto-fila')).toHaveLength(4)
    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando')
  })

  it('con error muestra el mensaje y reintenta', async () => {
    const onReintentar = vi.fn()
    render(<TablaListado {...props} error="No se pudo conectar con la API" onReintentar={onReintentar} />)
    expect(screen.getByText('No se pudo cargar la información')).toBeInTheDocument()
    expect(screen.getByText('No se pudo conectar con la API')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })

  it('sin registros ofrece crear el primero', async () => {
    const onAccion = vi.fn()
    render(
      <TablaListado
        {...props}
        filas={[]}
        total={0}
        vacio={{ titulo: 'Todavía no hay géneros.', texto: 'Agrega el primero.', textoAccion: '+ Nuevo género', onAccion }}
      />,
    )
    expect(screen.getByText('Todavía no hay géneros.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '+ Nuevo género' }))
    expect(onAccion).toHaveBeenCalledTimes(1)
  })

  it('distingue "no hay nada" de "los filtros no dejan pasar nada"', () => {
    render(
      <TablaListado
        {...props}
        filas={[]}
        total={5}
        sinResultados={{ titulo: 'Ningún género coincide.', texto: 'Prueba con otro nombre.' }}
      />,
    )
    expect(screen.getByText('Ningún género coincide.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Nuevo/ })).toBeNull()
  })

  it('cada fila lleva editar y eliminar con el nombre del registro', async () => {
    const onEditar = vi.fn()
    const onEliminar = vi.fn()
    render(<TablaListado {...props} onEditar={onEditar} onEliminar={onEliminar} />)

    await userEvent.click(screen.getByRole('button', { name: 'Editar drama' }))
    expect(onEditar).toHaveBeenCalledWith(filas[0])

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar terror' }))
    expect(onEliminar).toHaveBeenCalledWith(filas[1])
  })

  it('las columnas ordenables avisan con aria-sort', async () => {
    const onOrdenar = vi.fn()
    render(<TablaListado {...props} orden={{ campo: 'nombre', direccion: 'desc' }} onOrdenar={onOrdenar} />)

    expect(screen.getByRole('columnheader', { name: /Nombre/ })).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getByRole('columnheader', { name: 'Estado' })).not.toHaveAttribute('aria-sort')

    await userEvent.click(screen.getByRole('button', { name: /Nombre/ }))
    expect(onOrdenar).toHaveBeenCalledWith(columnas[0])
  })
})
