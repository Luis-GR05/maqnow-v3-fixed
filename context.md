MAQNOW: web + app móvil para pedir, comparar y gestionar alquiler maquinaria (Málaga, ~28-30 proveedores).
código en maqnow/. stack: React + Vite (JS), Supabase, lucide; fuentes Barlow. Deploy estático (GitHub Pages workflow static.yml)
páginas: Landing, Auth (cliente/proveedor/invitado), app #/app: Client, Provider, Admin; AppShell menú lateral
roles (src/lib/roles.js + RLS supabase/schema.sql): cliente, proveedor (requiere homologación), agente comercial, administración, superadmin
db: supabase/schema.sql + seed.sql + ofertas_reales.sql (enlace #/oferta/:token para que proveedor responda sin cuenta)
datos: invitado = demo local (localStorage); cuenta Supabase = datos reales (src/lib/remote.js)
env: VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY
cmd: cd maqnow && npm run dev|build
