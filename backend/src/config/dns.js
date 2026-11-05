// Resolvedor de Node (c-ares) y la lista de servidores DNS del sistema.
//
// c-ares no usa el resolvedor de Windows: pide la lista de servidores al sistema y
// hace sus propias consultas. En este equipo esa lista sale como 127.0.0.1 porque
// los únicos servidores IPv6 configurados son fec0:0:0:ffff::1/2/3 (adaptadores
// virtuales) y ninguno responde. Resultado: cualquier consulta SRV/TXT falla con
// ECONNREFUSED, y con ella mongodb+srv://.
//
// Arreglo por proceso, sin tocar el sistema: si la lista está inservible, se fuerzan
// servidores IPv4 conocidos. En una máquina con DNS sano no hace nada.
// Se puede sobreescribir con DNS_SERVERS="9.9.9.9,1.1.1.1".
const dns = require('dns');

const FALLBACK = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const listos = dns.getServers();
const inservible = listos.length === 0 || listos.every((s) => s === '127.0.0.1' || s === '::1');

if (inservible && FALLBACK.length > 0) {
  dns.setServers(FALLBACK);
  console.log(
    `DNS de Node ajustado (${listos.join(', ') || 'lista vacía'} -> ${FALLBACK.join(', ')})`
  );
}

module.exports = dns;
