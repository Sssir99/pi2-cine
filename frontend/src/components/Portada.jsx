import { iniciales } from '../utils/formato'

// Portada de la fila: imagen si hay url; si no, recuadro con las iniciales del título.
export default function Portada({ url, titulo }) {
  return (
    <div className="portada" aria-hidden="true">
      {url ? <img src={url} alt="" loading="lazy" /> : iniciales(titulo)}
    </div>
  )
}
