# Taller QR

Panel para generar QRs dinámicos de tarjetas PVC. El código impreso apunta siempre a `{APP_BASE_URL}/r/{codigo}`. El destino (Maps u otro) se cambia desde el panel, sin reimprimir.

## Arranque local

1. Copiá `.env.example` a `.env` y completá:

```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/qr_generator"
APP_BASE_URL="http://localhost:3000"
ADMIN_PASSWORD="tu-clave"
AUTH_SECRET="un-secreto-largo"
```

2. Creá la base en MySQL:

```sql
CREATE DATABASE qr_generator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Instalá dependencias, generá el client y corré la migración:

```bash
npm install
npx prisma migrate dev
npm run dev
```

El panel queda en [http://localhost:3000/admin](http://localhost:3000/admin) (inventario) y [http://localhost:3000/admin/generar](http://localhost:3000/admin/generar). El login usa `ADMIN_PASSWORD` y deja un JWT httpOnly que vence a las 8 horas.

## Scripts

- `npm run dev` — servidor local
- `npm run db:migrate` — `prisma migrate dev`
- `npm run db:push` — empuja el schema sin archivo de migración
- `npm run db:studio` — Prisma Studio

## Cómo funciona un escaneo

1. La tarjeta lleva `{APP_BASE_URL}/r/{codigo}`.
2. El server busca el código, suma 1 a `scanCount` y redirige al `destinationUrl`.
3. Si no hay código o no hay link, muestra “QR sin destino”.

## Bloque 7 (cuando tengas dominio y MySQL remoto)

No hace falta código nuevo. En el hosting cambiá:

- `DATABASE_URL` a tu MySQL remoto
- `APP_BASE_URL` a `https://tudominio.com`

Después corré `npx prisma migrate deploy` contra esa base. Recién ahí el QR impreso funciona fuera de tu máquina. No reimprimas tarjetas generadas con `localhost`.
