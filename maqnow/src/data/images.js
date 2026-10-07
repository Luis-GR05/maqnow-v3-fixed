// Fotografías de Unsplash (licencia libre de uso, sin atribución obligatoria).
// Se sirven desde su servidor, que las recorta y las entrega en AVIF o WebP según el navegador.
// Para alojarlas en local, descárgalas en public/img y cambia `u`.
const BASE = 'https://images.unsplash.com/photo-';
const Q = 55; // con AVIF, 55 no se distingue de 72 y pesa un tercio menos

// w: ancho en píxeles; ratio: alto / ancho del recorte (sin ratio se respeta el original)
export const photo = (id, w, ratio) => `${BASE}${id}?auto=format&fit=crop&w=${w}${ratio ? `&h=${Math.round(w * ratio)}` : ''}&q=${Q}`;
export const photoSet = (id, widths, ratio) => widths.map((w) => `${photo(id, w, ratio)} ${w}w`).join(', ');
const u = (id, w = 1400) => photo(id, w);

// Portada: recorte vertical para móvil y apaisado para escritorio, cada uno con sus anchos.
// index.html precarga la primera con estos mismos valores: si cambias uno, cambia el otro.
export const HERO_IDS = ['1642927778267-4e8b787b325a', '1756402751986-15f343b1437f', '1644221150167-fb4fafa7f411'];
export const HERO_TALL = { media: '(max-aspect-ratio: 4/5)', widths: [480, 640, 828, 1080], ratio: 16 / 9 };
export const HERO_WIDE = { widths: [960, 1280, 1600, 1920], ratio: 9 / 16 };

export const IMG = {
  hero: u(HERO_IDS[0], 1800), // fila de máquinas en un parque
  problem: u('1504307651254-35680f356dfd'), // dos operarios en obra
  companies: u('1694521787162-5373b598945c'), // equipo en una obra
  providers: u(HERO_IDS[1]), // plataformas aparcadas en un parque
  auth: u('1575281923032-f40d94ef6160'), // excavadora cargando un dumper
  cta: u(HERO_IDS[2], 1800), // edificio en construcción con grúa
};

export const FAMILY_IMG = {
  elevacion: u('1771793307225-f92a984b3d00', 900),
  tierras: u('1649807479468-40011b31ee09', 900),
  manutencion: u('1740914994657-f1cdffdc418e', 900),
  compactacion: u('1782442002533-1aec0cf5a9d8', 900),
  herramientas: u('1625562888409-14b30c2b17b5', 900),
  demolicion: u('1677588508537-5106322c2d40', 900),
};
