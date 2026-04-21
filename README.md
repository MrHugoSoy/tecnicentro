# 🟡 Tecnicentro — App Web

Aplicación web para llantera Goodyear en Irapuato, Guanajuato.  
Stack: **Next.js 14 · Supabase · Tailwind CSS · TypeScript · Vercel**

---

## 🚀 Setup en 5 pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.local.example .env.local
```
Edita `.env.local` con tus credenciales de Supabase (las encuentras en **Supabase → Settings → API**):
```
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

### 3. Crear la base de datos
En **Supabase → SQL Editor**, pega y ejecuta el contenido de `supabase-schema.sql`

### 4. Crear tu primer admin
Después de registrarte en Supabase Auth, corre en el SQL Editor (reemplaza los valores):
```sql
INSERT INTO admins (id, nombre, email, rol) 
VALUES ('TU_UUID_DE_AUTH', 'Tu Nombre', 'tu@email.com', 'superadmin');
```
Tu UUID lo encuentras en **Supabase → Authentication → Users**

### 5. Correr en desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del proyecto

```
tecnicentro/
├── app/
│   ├── page.tsx                  # Landing / Home
│   ├── catalogo/page.tsx         # Catálogo público de llantas
│   ├── cotizador/page.tsx        # Formulario de cotización
│   ├── citas/page.tsx            # Agenda de citas
│   ├── admin/
│   │   ├── layout.tsx            # Guard de auth para admin
│   │   ├── page.tsx              # Dashboard
│   │   ├── citas/page.tsx        # Gestión de citas
│   │   ├── cotizaciones/page.tsx # Gestión de cotizaciones
│   │   ├── productos/page.tsx    # CRUD de productos
│   │   ├── inventario/page.tsx   # Ajuste rápido de stock
│   │   └── login/page.tsx        # Login admin
│   └── auth/callback/route.ts   # OAuth callback
├── components/
│   ├── layout/                   # Navbar, Footer
│   ├── catalog/                  # CatalogoGrid
│   ├── booking/                  # AgendarForm
│   ├── quote/                    # CotizadorForm
│   └── admin/                    # AdminSidebar, CitasTable, ProductosAdmin, InventarioAdmin, CotizacionesTable
├── lib/
│   ├── supabase.ts               # Cliente browser
│   └── supabase-server.ts        # Cliente servidor
├── types/index.ts                # Tipos TypeScript
└── supabase-schema.sql           # Schema completo de base de datos
```

---

## 🌐 Deploy en Vercel

1. Sube el proyecto a un repo en GitHub
2. Importa en [vercel.com/new](https://vercel.com/new)
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy → tu URL pública ya estará lista

En **Supabase → Authentication → URL Configuration** agrega:
- Site URL: `https://tudominio.vercel.app`
- Redirect URLs: `https://tudominio.vercel.app/auth/callback`

---

## 🔑 Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page pública |
| `/catalogo` | Catálogo de llantas (filtrable) |
| `/cotizador` | Formulario de cotización |
| `/citas` | Agenda de citas |
| `/admin` | Dashboard (requiere auth) |
| `/admin/citas` | Gestión de citas con cambio de estado |
| `/admin/cotizaciones` | Lista de cotizaciones recibidas |
| `/admin/productos` | CRUD completo de productos |
| `/admin/inventario` | Ajuste rápido de stock |
| `/admin/login` | Login del panel admin |
