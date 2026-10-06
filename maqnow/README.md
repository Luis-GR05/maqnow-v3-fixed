# MAQNOW

Web y aplicación (adaptada a móvil) para pedir, comparar y gestionar alquileres de maquinaria.

## Arrancar

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera dist/ para publicar en cualquier hosting estático
```

## Estructura

- **Web pública** (`src/pages/Landing.jsx`): portada, cómo funciona, demostración del comparativo, maquinaria por sector, empresas, proveedores, preguntas.
- **Acceso y registro** (`src/pages/Auth.jsx`): cuentas de cliente o proveedor con validación, y entrada como invitado.
- **Aplicación** (`#/app/...`, menú lateral en `src/components/AppShell.jsx`):
  - Cliente (`src/pages/Client.jsx`), Proveedor (`src/pages/Provider.jsx`) y equipo MAQNOW (`src/pages/Admin.jsx`).

## Roles y permisos

Definidos en `src/lib/roles.js` y replicados con políticas RLS en `supabase/schema.sql`.

| Rol | Entra en | Puede |
| --- | --- | --- |
| Cliente | Su área | Pedir ofertas, comparar, contratar, bajas, averías, informes |
| Proveedor | Su portal | Ofertar, entregas y recogidas, flota, incidencias (tras ser homologado) |
| Agente comercial | CRM | Lanzar peticiones, reclamar respuestas, homologar proveedores, gestionar incidencias |
| Administración | CRM | Riesgo de clientes, cobros y liquidación de comisiones |
| Superadmin | CRM | Todo, más usuarios, roles y ajustes |

Clientes y proveedores se registran desde la web. El equipo interno lo da de alta un superadmin
en **Usuarios y roles**. Un proveedor recién registrado queda *pendiente* y no recibe solicitudes
hasta que un agente lo homologa.

## Base de datos (Supabase / PostgreSQL)

1. Crea un proyecto en Supabase y ejecuta en el SQL Editor `supabase/schema.sql` y después `supabase/seed.sql`.
2. Copia `.env.example` como `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Regístrate desde la web y hazte superadmin una vez:
   `update public.profiles set role = 'superadmin' where email = 'tu@email.com';`

Con esas variables, **registro, inicio de sesión y rol** usan Supabase Auth y la tabla `profiles`.
Los datos de negocio (solicitudes, ofertas, alquileres…) siguen en el navegador hasta migrar
`src/lib/store.js` a consultas contra estas tablas: el esquema, las políticas y las funciones
(`dispatch_request`, `accept_offer`, `confirm_delivery`, `request_baja`, `confirm_pickup`) ya están listos para ello.

Para publicar con Supabase en GitHub Pages, añade esas dos variables como *secrets* del repositorio
y pásalas al paso de build del workflow (`env:`).

## Sin servidor (modo demostración)

Sin `.env`, todo se guarda en el navegador (`localStorage`): datos, cuentas y sesión. Las respuestas de los
proveedores se simulan (se desactiva en Ajustes). Precios, valoraciones, tiempos, flota y contactos son inventados;
solo los nombres y la cobertura de los proveedores salen de la revisión de mercado.

## SEO y metadatos

- `index.html`: título, descripción, canonical, Open Graph, Twitter, datos estructurados y contenido de respaldo sin JavaScript.
- `public/`: `sitemap.xml`, `robots.txt`, `site.webmanifest`, iconos y `og-image.png`.
- **Si cambias de dominio**, sustituye `https://luis-gr05.github.io/maqnow-v3-fixed/` en `index.html`, `public/sitemap.xml`, `public/robots.txt` y `src/data/site.js`.
- La aplicación usa rutas con `#`, así que los buscadores indexan una sola URL (la portada). El área privada lleva `noindex`.

## Personalizar

- Fotos: `src/data/images.js` (enlazadas desde Unsplash).
- Teléfono, WhatsApp y email de atención: `CONTACT` en `src/data/providers.js`.
- Familias, tipos y preguntas de cada máquina: `src/data/catalog.js` (y vuelve a generar `supabase/seed.sql`).
- Textos de preguntas frecuentes y sectores: `src/data/site.js`.
- Colores y tipografía: variables al inicio de `src/styles.css`.
