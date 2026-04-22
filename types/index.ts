export type Producto = {
  id: number
  nombre: string
  marca: string
  medida: string
  descripcion: string | null
  precio: number
  precio_instalacion: number
  stock: number
  imagen_url: string | null
  origen: string | null
  categoria: 'llanta' | 'rin' | 'accesorio'
  activo: boolean
  created_at: string
  updated_at: string
}

export type Servicio = {
  id: number
  nombre: string
  descripcion: string | null
  duracion_minutos: number
  precio: number
  activo: boolean
}

export type Cita = {
  id: number
  nombre_cliente: string
  telefono: string
  email: string | null
  vehiculo: string
  placa: string | null
  servicio_id: number | null
  notas: string | null
  fecha: string
  hora: string
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  created_at: string
  updated_at: string
  servicios?: Servicio
}

export type Cotizacion = {
  id: number
  nombre_cliente: string
  telefono: string
  email: string | null
  vehiculo: string
  medida_llanta: string
  cantidad: number
  productos_seleccionados: ProductoSeleccionado[] | null
  total_estimado: number | null
  estado: 'nueva' | 'enviada' | 'convertida'
  notas: string | null
  created_at: string
}

export type ProductoSeleccionado = {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

export type Admin = {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'superadmin'
}

export type EstadoCita = Cita['estado']
