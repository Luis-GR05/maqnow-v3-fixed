// Fotografías de Unsplash (licencia libre de uso, sin atribución obligatoria).
// Se cargan desde su servidor; para alojarlas en local, descárgalas en public/img y cambia `u`.
const u = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

export const IMG = {
  hero: u('1642927778267-4e8b787b325a', 1800), // fila de máquinas en un parque
  problem: u('1504307651254-35680f356dfd'), // dos operarios en obra
  companies: u('1694521787162-5373b598945c'), // equipo en una obra
  providers: u('1756402751986-15f343b1437f'), // plataformas aparcadas en un parque
  auth: u('1575281923032-f40d94ef6160'), // excavadora cargando un dumper
  cta: u('1644221150167-fb4fafa7f411', 1800), // edificio en construcción con grúa
};

export const FAMILY_IMG = {
  elevacion: u('1771793307225-f92a984b3d00', 900),
  tierras: u('1649807479468-40011b31ee09', 900),
  manutencion: u('1740914994657-f1cdffdc418e', 900),
  compactacion: u('1782442002533-1aec0cf5a9d8', 900),
  herramientas: u('1625562888409-14b30c2b17b5', 900),
  demolicion: u('1677588508537-5106322c2d40', 900),
};
