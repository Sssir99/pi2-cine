import { useState } from 'react'
import { iniciales } from '../utils/formato'

// Portada de la fila: imagen si hay url; si no (o si la url está rota), recuadro
// con las iniciales del título. Una imagen rota no puede dejar un hueco vacío.
export default function Portada({ url, titulo }) {
  // Se guarda la url que falló, no un booleano: si el registro se edita y cambia
  // la portada, la nueva se vuelve a intentar sin remontar el componente.
  const [urlFallida, setUrlFallida] = useState(null)
  const mostrarImagen = url && url !== urlFallida

  return (
    <div className="portada" aria-hidden="true">
      {mostrarImagen ? (
        <img src={url} alt="" loading="lazy" onError={() => setUrlFallida(url)} />
      ) : (
        iniciales(titulo)
      )}
    </div>
  )
}
