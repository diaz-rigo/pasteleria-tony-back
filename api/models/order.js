// models/order.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

/** ========== Subesquemas reutilizables ========== */

// Identidad del cliente (logueado o visitante)
const customerInfoSchema = new Schema({
  isGuest: { type: Boolean, default: true, index: true },

  // Si viene logueado
  userId: { type: Types.ObjectId, ref: 'User', index: true },

  // Para visitante: datos mínimos del formulario
  guestId: { type: String, index: true }, // p.ej., uuid v4 o shortid para tracking
  nombre: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true }, // valida 10 dígitos en capa svc
  email:    { type: String, required: true, trim: true, lowercase: true },

  // Flags simples por si haces verificación
  emailVerificado: { type: Boolean, default: false },
  telefonoVerificado: { type: Boolean, default: false }
}, { _id: false });

// Dirección solo si entrega a domicilio
const addressSchema = new Schema({
  linea1: { type: String, trim: true },     // calle y número
  linea2: { type: String, trim: true },     // interior, referencias
  colonia: { type: String, trim: true },
  ciudad:  { type: String, trim: true },
  estado:  { type: String, trim: true },
  cp:      { type: String, trim: true },
  notasMensajeria: { type: String, trim: true }
}, { _id: false });

// Programación de entrega/recogida
const scheduleSchema = new Schema({
  fecha: { type: Date, required: true }, // combina fecha+hora para precisión
  // Si prefieres almacenar hora aparte, agrega un string "HH:mm"
  horaStr: { type: String }              // opcional, “14:30”
}, { _id: false });

// Ítem del pedido: snapshot del producto/variante/talla seleccionados
const orderItemSchema = new Schema({
  productId: { type: Types.ObjectId, ref: 'Product', required: true, index: true },

  // Snapshot de nombres/atributos para factura/visualización histórica
  productName: { type: String, required: true },
  brand: { type: String },
  category: { type: String },

  // Atributos de la variante elegida (del form)
  flavor:  { type: String },
  color:   { type: String },
  texture: { type: String },
  shape:   { type: String },

  // Talla/medida seleccionada
  size: { type: Number, required: true, min: 0 },

  // Precio y stock al momento (snapshot)
  unitPrice: { type: Number, required: true, min: 0 },
  quantity:  { type: Number, required: true, min: 1 },
  lineTotal: { type: Number, required: true, min: 0 },

  // Estado de disponibilidad en el instante de crear el pedido
  availabilityStatus: {
    type: String,
    enum: ['available', 'on_demand', 'out_of_stock'],
    default: 'available'
  },

  // Imágenes para ticket/confirmación
  images: [String]
}, { _id: false });

// Preferencias/observaciones del cliente para pasteles
const customizationSchema = new Schema({
  dedicatoria: { type: String, trim: true },
  decoracion:  { type: String, trim: true },
  nota:        { type: String, trim: true }
}, { _id: false });

// Método de entrega
const deliverySchema = new Schema({
  metodoEntrega: { type: String, enum: ['RECOGER', 'DOMICILIO'], required: true },
  address: { type: addressSchema },  // requerido si DOMICILIO (valida en servicio)
  schedule: { type: scheduleSchema, required: true }
}, { _id: false });

// Información de pago y estados
const paymentSchema = new Schema({
  method:  { type: String, enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'ONLINE', 'NO_APLICA'], default: 'NO_APLICA' },
  status:  { type: String, enum: ['PENDIENTE', 'AUTORIZADO', 'RECHAZADO', 'REEMBOLSADO', 'NO_APLICA'], default: 'PENDIENTE' },
  currency:{ type: String, default: 'MXN' },
  subtotal:{ type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  total:   { type: Number, required: true, min: 0 },

  // Si manejas apartados con anticipo
  depositRequired: { type: Boolean, default: false },
  depositAmount: { type: Number, default: 0, min: 0 },

  // Integraciones (ej. stripe/mercado pago)
  provider: { type: String },           // 'stripe' | 'mp' | ...
  providerIntentId: { type: String },
  providerChargeId: { type: String }
}, { _id: false });

// Metadatos, tracking y auditoría
const metaSchema = new Schema({
  mode: { type: String, enum: ['APARTAR', 'PEDIR'], required: true },
  status: { 
    type: String,
    enum: [
      'CREADO',          // recibido
      'PENDIENTE_PAGO',  // si aplica
      'CONFIRMADO',      // pago o validación manual OK
      'PREPARACION',     // en cocina/taller
      'LISTO',           // listo para recoger/salir
      'EN_CAMINO',       // si domicilio
      'ENTREGADO',
      'CANCELADO'
    ],
    default: 'CREADO',
    index: true
  },
  source: { type: String, enum: ['web', 'app', 'whatsapp', 'admin'], default: 'web' },
  notesAdmin: { type: String, trim: true },

  // Validez de apartado (si se requiere confirmar con pago antes de X)
  holdUntil: { type: Date } // si es APARTAR con vencimiento
}, { _id: false });

/** ========== Esquema principal del pedido ========== */

const orderSchema = new Schema({
  // consecutivo corto amigable (p.ej., ORD-2025-000123)
  orderCode: { type: String, unique: true, index: true },

  customer: { type: customerInfoSchema, required: true },
  delivery: { type: deliverySchema, required: true },
  customization: { type: customizationSchema },

  items: {
    type: [orderItemSchema],
    validate: v => Array.isArray(v) && v.length > 0
  },

  payment: { type: paymentSchema, required: true },
  meta: { type: metaSchema, required: true },

  // Relaciones
  // Mantén referencias sueltas por si quieres denormalizar luego
  tiendaId: { type: Types.ObjectId, ref: 'Store' } // opcional multi-sucursal

}, {
  timestamps: true
});

/** ========== Índices sugeridos ========== */
orderSchema.index({ 'customer.userId': 1, createdAt: -1 });
orderSchema.index({ 'customer.guestId': 1, createdAt: -1 });
orderSchema.index({ 'meta.status': 1, createdAt: -1 });
orderSchema.index({ 'delivery.schedule.fecha': 1 });
// Búsquedas por método de entrega y modo
orderSchema.index({ 'delivery.metodoEntrega': 1, createdAt: -1 });
orderSchema.index({ 'meta.mode': 1, createdAt: -1 });

// Campos usados en búsqueda libre
orderSchema.index({ orderCode: 1 });
orderSchema.index({ 'customer.nombre': 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ 'customer.telefono': 1 });
orderSchema.index({ 'items.productName': 1 });
orderSchema.index({ 'items.flavor': 1 });

/** ========== Hooks útiles ========== */
// Asegura totales coherentes si no los calculas antes de guardar
orderSchema.pre('validate', function(next) {
  if (!this.items || this.items.length === 0) return next(new Error('El pedido debe tener al menos un artículo.'));

  // Recalcula líneas y totales si vinieron incompletos
  let subtotal = 0;
  this.items = this.items.map(it => {
    const lineTotal = (it.unitPrice ?? 0) * (it.quantity ?? 0);
    it.lineTotal = lineTotal;
    subtotal += lineTotal;
    return it;
  });

  if (!this.payment) this.payment = {};
  this.payment.subtotal = subtotal;
  const deliveryFee = this.payment.deliveryFee || 0;
  const discount = this.payment.discount || 0;
  this.payment.total = Math.max(0, subtotal + deliveryFee - discount);

  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
