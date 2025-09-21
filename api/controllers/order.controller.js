// controllers/order.controller.js (ejemplo rápido)
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/order');
const Product = require('../models/Product');



/* =========================
   HELPERS
========================= */
function mapSort(sortBy = 'createdAt_desc') {
  switch (sortBy) {
    case 'createdAt_asc':  return { createdAt: 1 };
    case 'total_desc':     return { 'payment.total': -1, createdAt: -1 };
    case 'total_asc':      return { 'payment.total': 1, createdAt: -1 };
    case 'createdAt_desc':
    default:               return { createdAt: -1 };
  }
}

function buildFindQuery(params = {}) {
  const {
    q,                       // texto búsqueda (código, cliente, email, tel, producto, sabor)
    status,                  // CREADO | PENDIENTE_PAGO | ...
    metodo,                  // RECOGER | DOMICILIO
    modo,                    // PEDIR | APARTAR
    startDate,               // YYYY-MM-DD
    endDate                  // YYYY-MM-DD
  } = params;

  const find = {};

  if (status)       find['meta.status'] = status;
  if (metodo)       find['delivery.metodoEntrega'] = metodo;
  if (modo)         find['meta.mode'] = modo;

  // Rango de fecha en createdAt
  if (startDate || endDate) {
    find.createdAt = {};
    if (startDate) find.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate)   find.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
  }

  if (q && q.trim()) {
    const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    find.$or = [
      { orderCode: rx },
      { 'customer.nombre': rx },
      { 'customer.email': rx },
      { 'customer.telefono': rx },
      { 'items.productName': rx },
      { 'items.flavor': rx }
    ];
  }

  return find;
}

const VALID_STATUSES = [
  'CREADO','PENDIENTE_PAGO','CONFIRMADO','PREPARACION','LISTO','EN_CAMINO','ENTREGADO','CANCELADO'
];

function canTransition(from, to) {
  if (!VALID_STATUSES.includes(to)) return false;
  if (from === to) return true;
  const order = [
    'CREADO',
    'PENDIENTE_PAGO',
    'CONFIRMADO',
    'PREPARACION',
    'LISTO',
    'EN_CAMINO',
    'ENTREGADO'
  ];
  // Permitir CANCELADO desde casi cualquiera previo a ENTREGADO
  if (to === 'CANCELADO' && from !== 'ENTREGADO') return true;
  // Avances hacia delante
  const iFrom = order.indexOf(from);
  const iTo   = order.indexOf(to);
  return iTo >= iFrom && iFrom !== -1; // no retrocesos “duros”
}

// controllers/order.controller.js
exports.adminTopProducts = async (req, res) => {
  try {
    const match = buildFindQuery(req.query);
    const { limit = 5 } = req.query;

    const rows = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: {
          _id: {
            productId: '$items.productId',
            productName: '$items.productName'
          },
          ventas: { $sum: '$items.quantity' },
          // precio representativo (si varía por pedido, usa el máximo)
          precio: { $max: '$items.unitPrice' },
          // tomar una imagen representativa del item (primer elemento del array images)
          img: { $first: { $arrayElemAt: ['$items.images', 0] } }
      }},
      { $sort: { ventas: -1 } },
      { $limit: Number(limit) },
      { $project: {
          _id: 0,
          name: '$_id.productName',
          ventas: 1,
          precio: 1,
          img: 1
      }}
    ]);

    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, msg:'Error top productos', error: e.message });
  }
};


/* =========================
   LISTADO ADMIN CON FILTROS
========================= */
exports.adminList = async (req, res) => {
  try {
    const {
      q,
      status,
      metodo,
      modo,
      startDate,
      endDate,
      sortBy = 'createdAt_desc',
      page = 1,
      pageSize = 12
    } = req.query;

    const find = buildFindQuery({ q, status, metodo, modo, startDate, endDate });
    const sort = mapSort(sortBy);
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 12));

    const [items, total] = await Promise.all([
      Order.find(find).sort(sort).skip((p - 1) * ps).limit(ps).lean(),
      Order.countDocuments(find)
    ]);

    return res.json({
      ok: true,
      data: {
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.max(1, Math.ceil(total / ps)),
        items
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, msg: 'Error listando pedidos', error: e.message });
  }
};

/* =========================
   RESUMEN (chips/estadísticas)
========================= */
exports.adminSummary = async (req, res) => {
  try {
    const match = buildFindQuery(req.query);

    const [byStatus, byMetodo, byModo, totals] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$meta.status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$delivery.metodoEntrega', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$meta.mode', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: match },
        { $group: {
          _id: null,
          subtotal: { $sum: '$payment.subtotal' },
          deliveryFee: { $sum: '$payment.deliveryFee' },
          discount: { $sum: '$payment.discount' },
          total: { $sum: '$payment.total' }
        } }
      ])
    ]);

    res.json({
      ok: true,
      data: {
        byStatus,
        byMetodo,
        byModo,
        totals: totals[0] || { subtotal: 0, deliveryFee: 0, discount: 0, total: 0 }
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: 'Error generando resumen', error: e.message });
  }
};

/* =========================
   ACTUALIZAR ESTADO (acciones del Drawer)
========================= */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { nextStatus } = req.body;

    const row = await Order.findById(id);
    if (!row) return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });

    const from = row.meta?.status || 'CREADO';
    if (!canTransition(from, nextStatus)) {
      return res.status(400).json({ ok: false, msg: `Transición inválida: ${from} → ${nextStatus}` });
    }

    row.meta.status = nextStatus;

    // Si pasa a CONFIRMADO y era APARTAR, puedes limpiar holdUntil
    if (nextStatus === 'CONFIRMADO' && row.meta?.mode === 'APARTAR') {
      row.meta.holdUntil = undefined;
    }

    await row.save();
    res.json({ ok: true, data: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: 'Error actualizando estado', error: e.message });
  }
};

/* =========================
   AGREGAR NOTA ADMIN
========================= */
exports.addAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const row = await Order.findById(id);
    if (!row) return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });

    row.meta = row.meta || {};
    row.meta.notesAdmin = note || '';
    await row.save();

    res.json({ ok: true, data: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: 'Error guardando nota', error: e.message });
  }
};

/* =========================
   ACTUALIZAR PAGO
========================= */
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      method,        // 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'ONLINE' | 'NO_APLICA'
      status,        // 'PENDIENTE' | 'AUTORIZADO' | 'RECHAZADO' | 'REEMBOLSADO' | 'NO_APLICA'
      deliveryFee,   // number
      discount,      // number
      depositRequired, // boolean
      depositAmount    // number
    } = req.body;

    const row = await Order.findById(id);
    if (!row) return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });

    if (!row.payment) row.payment = {};
    if (method) row.payment.method = method;
    if (status) row.payment.status = status;
    if (typeof deliveryFee === 'number') row.payment.deliveryFee = Math.max(0, deliveryFee);
    if (typeof discount === 'number') row.payment.discount = Math.max(0, discount);
    if (typeof depositRequired === 'boolean') row.payment.depositRequired = depositRequired;
    if (typeof depositAmount === 'number') row.payment.depositAmount = Math.max(0, depositAmount);

    // Recalcula totales (hook pre('validate') también lo hace, pero así te aseguras)
    const subtotal = (row.items || []).reduce((acc, it) => acc + (it.lineTotal || 0), 0);
    row.payment.subtotal = subtotal;
    row.payment.total = Math.max(0, subtotal + (row.payment.deliveryFee || 0) - (row.payment.discount || 0));

    await row.save();
    res.json({ ok: true, data: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, msg: 'Error actualizando pago', error: e.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      // Datos del form:
      nombre, telefono, email,
      metodoEntrega, direccion, fecha, hora,
      dedicatoria, decoracion, nota,
      modo,            // 'APARTAR' | 'PEDIR'
      productId,
      variant,         // { flavor, color, texture, shape }
      size,            // Number (kg)
      quantity,        // Number
      unitPrice,       // Number (precio capturado)
      images           // [urls] opcional
    } = req.body;

    const isLoggedIn = !!req.user; // según tu auth middleware
    const userId = isLoggedIn ? req.user._id : undefined;

    // Opcional: validar disponibilidad en vivo
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ ok:false, msg:'Producto no encontrado' });

    // Opcional: localizar la variante exacta para snapshot de availability
    const matchedVariant = (product.variants || []).find(v =>
      v.flavor === variant?.flavor &&
      v.color === variant?.color &&
      v.texture === variant?.texture &&
      v.shape === variant?.shape
    );

    const availabilityStatus = matchedVariant?.availabilityStatus || product.availabilityStatus || 'available';
    const productName = product.name;

    // Build del pedido
    const order = new Order({
      orderCode: `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random()*900000)}`,
      customer: {
        isGuest: !isLoggedIn,
        userId,
        guestId: !isLoggedIn ? uuidv4() : undefined,
        nombre,
        telefono,
        email
      },
      delivery: {
        metodoEntrega,
        address: metodoEntrega === 'DOMICILIO' ? {
          linea1: direccion, // puedes desglosar si tu form lo separa
        } : undefined,
        schedule: {
          fecha: new Date(`${fecha}T${hora || '00:00'}:00`),
          horaStr: hora
        }
      },
      customization: { dedicatoria, decoracion, nota },
      items: [{
        productId,
        productName,
        brand: product.brand,
        category: product.category,
        flavor: variant?.flavor,
        color: variant?.color,
        texture: variant?.texture,
        shape: variant?.shape,
        size,
        unitPrice,
        quantity,
        availabilityStatus,
        images: Array.isArray(images) ? images : (matchedVariant?.images || product.images || [])
      }],
      payment: {
        method: 'NO_APLICA',     // ajusta según flujo
        status: 'PENDIENTE',
        currency: 'MXN',
        deliveryFee: metodoEntrega === 'DOMICILIO' ? 0 : 0, // calcula si aplica
        discount: 0
      },
      meta: {
        mode: modo, // 'APARTAR'|'PEDIR'
        status: 'CREADO',
        source: 'web',
        holdUntil: modo === 'APARTAR' ? new Date(Date.now() + 1000*60*60*12) : undefined // ej. 12h
      }
    });

    await order.validate(); // lanzará si algo importante falta
    await order.save();

    res.json({ ok:true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, msg:'Error creando pedido', error: err.message });
  }
};
