# Terreno

Web app de gestión en terreno (entregas y retiros) con login por usuario, roles y asignaciones.

- Código: `index.ts` (un solo archivo; Railway Function con Bun + Postgres).
- Sitio en vivo: https://terreno-app-production-5d74.up.railway.app
- Variables de entorno: `DATABASE_URL` (Postgres), `ACCESS_CODE` (clave inicial del usuario `admin`), `PORT`.

## Cambios recientes

- Paleta Azul marino (modo claro y oscuro), colores centralizados en variables CSS en `:root`.
- Selector de tema Auto / Claro / Oscuro en el encabezado; la elección se guarda por dispositivo.
