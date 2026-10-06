# MAQNOW

Web y aplicación (adaptada a móvil) para pedir, comparar y gestionar alquileres de maquinaria.

## Arrancar

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera dist/ para publicar en cualquier hosting estático
```

## Estructura

- **Web pública** (`src/pages/Landing.jsx`): portada, cómo funciona, demostración del comparativo, maquinaria, empresas, proveedores, preguntas.
- **Acceso y registro** (`src/pages/Auth.jsx`): cuentas de cliente o proveedor, y entrada como invitado.
- **Aplicación** (`#/app/...`, menú lateral en `src/components/AppShell.jsx`):
  - Cliente (`src/pages/Client.jsx`): inicio, nueva solicitud, solicitudes y comparativo, ofertas, alquileres, obras, entregas, averías, documentación (pasaporte digital), facturas, maquinaria habitual, informes, mi empresa.
  - Proveedor (`src/pages/Provider.jsx`): inicio, solicitudes y ofertar, mis ofertas, alquileres, flota, entregas, incidencias, facturación y comisiones, ficha.
  - Equipo MAQNOW (`src/pages/Admin.jsx`): panel, agente comercial, solicitudes (tablero y registro), clientes y riesgo, proveedores, alquileres, incidencias, comisiones y cobros, ajustes.

## Demo sin servidor

Todo se guarda en el navegador (`localStorage`): datos, cuentas y sesión. Las respuestas de los
proveedores se simulan (se desactiva en Ajustes para ofertar a mano). Precios, valoraciones, tiempos,
flota y contactos son inventados; solo los nombres y la cobertura de los proveedores salen de la
revisión de mercado. Para pasar a datos y usuarios reales, sustituir `src/lib/store.js` por un backend.

## Personalizar

- Fotos: `src/data/images.js` (ahora enlazadas desde Unsplash).
- Teléfono, WhatsApp y email de atención: `CONTACT` en `src/data/providers.js`.
- Familias, tipos y preguntas de cada máquina: `src/data/catalog.js`.
- Colores y tipografía: variables al inicio de `src/styles.css`.
