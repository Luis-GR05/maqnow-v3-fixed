# MAQNOW — Marketplace B2B de maquinaria

MVP frontend diseñado a partir del brief funcional de mercado. La aplicación representa el concepto: una solicitud, múltiples proveedores, comparación y contratación.

## Stack
- React + Vite
- Three.js / React Three Fiber / Drei
- Lucide
- CSS responsive sin framework

## Arranque
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Imágenes
Los archivos `public/*-placeholder.svg` son placeholders locales. Sustitúyelos por fotografías reales manteniendo los nombres o actualiza las rutas en React.

## SEO
Incluye title, description, canonical, Open Graph, Twitter cards, JSON-LD, robots.txt, sitemap.xml y manifest. Antes de producción sustituir `https://maqnow.es` por el dominio definitivo.

## DNS / despliegue
Para un despliegue típico en Vercel/Netlify: crear el proyecto, apuntar el dominio raíz mediante los registros indicados por el proveedor y `www` mediante CNAME, activar HTTPS y mantener una sola URL canónica. No se incluyen valores DNS inventados: el proveedor de hosting debe proporcionar los destinos exactos.

## Backend futuro
Separar Cliente / Alquilador / Logística / Motor Central. Sustituir mocks por API, base de datos, autenticación, disponibilidad, pagos, documentación, incidencias e integraciones ERP.
