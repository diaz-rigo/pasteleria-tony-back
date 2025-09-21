// routes/orders.js
const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');

// --- Middlewares de ejemplo ---
function optionalAuth(req, _res, next) {
  const userId = req.header('x-user-id');
  if (userId) req.user = { _id: userId, role: 'admin' }; // mock
  next();
}
function basicCreateOrderValidation(req, res, next) {
  const { nombre, telefono, email, metodoEntrega, fecha, modo, productId, size, quantity, unitPrice } = req.body;
  const errs = [];
  if (!nombre || nombre.trim().length < 3) errs.push('nombre inválido');
  if (!telefono || !/^\d{10}$/.test(telefono)) errs.push('telefono debe ser 10 dígitos (MX)');
  if (!email) errs.push('email requerido');
  if (!['RECOGER', 'DOMICILIO'].includes(metodoEntrega)) errs.push('metodoEntrega inválido');
  if (!fecha) errs.push('fecha requerida (YYYY-MM-DD)');
  if (!['APARTAR', 'PEDIR'].includes(modo)) errs.push('modo inválido');
  if (!productId) errs.push('productId requerido');
  if (typeof size !== 'number') errs.push('size numérico requerido');
  if (typeof quantity !== 'number' || quantity < 1) errs.push('quantity >= 1 requerido');
  if (typeof unitPrice !== 'number' || unitPrice < 0) errs.push('unitPrice >= 0 requerido');
  if (metodoEntrega === 'DOMICILIO' && !req.body.direccion) errs.push('direccion requerida para DOMICILIO');
  if (errs.length) return res.status(400).json({ ok: false, msg: 'Validación', errors: errs });
  next();
}
// function requireAdmin(req, res, next) {
//   if (!req.user) return res.status(401).json({ ok: false, msg: 'No autenticado' });
//   // if (req.user.role !== 'admin') return res.status(403).json({ ok:false, msg:'No autorizado' });
//   next();
// }

/* ====== Admin primero (evita colisiones con /:id) ====== */
// GET /orders/admin?q=&status=&metodo=&modo=&startDate=&endDate=&sortBy=&page=&pageSize=
// router.get('/admin', optionalAuth, requireAdmin, orderCtrl.adminList);

// // GET /orders/admin/summary? (mismos filtros)
// router.get('/admin/summary', optionalAuth, requireAdmin, orderCtrl.adminSummary);
router.get('/admin', optionalAuth,  orderCtrl.adminList);
// routes/orders.js
router.get('/admin/top-products', optionalAuth, orderCtrl.adminTopProducts);

// GET /orders/admin/summary? (mismos filtros)
router.get('/admin/summary', optionalAuth,  orderCtrl.adminSummary);

/* ====== Crear ====== */
router.post('/', optionalAuth, basicCreateOrderValidation, orderCtrl.createOrder);

/* ====== Obtener por código (colocar ANTES de /:id) ====== */
router.get('/code/:orderCode', optionalAuth, async (req, res) => {
  const Order = require('../models/order');
  try {
    const row = await Order.findOne({ orderCode: req.params.orderCode });
    if (!row) return res.status(404).json({ ok:false, msg:'No encontrado' });
    res.json({ ok:true, data: row });
  } catch (e) {
    res.status(500).json({ ok:false, msg:'Error', error: e.message });
  }
});

/* ====== Acciones ====== */
// router.patch('/:id/status',  optionalAuth, requireAdmin, orderCtrl.updateStatus);
// router.patch('/:id/payment', optionalAuth, requireAdmin, orderCtrl.updatePayment);
// router.patch('/:id/note',    optionalAuth, requireAdmin, orderCtrl.addAdminNote);
router.patch('/:id/status',  optionalAuth,  orderCtrl.updateStatus);
router.patch('/:id/payment', optionalAuth,  orderCtrl.updatePayment);
router.patch('/:id/note',    optionalAuth,  orderCtrl.addAdminNote);

/* ====== Obtener por id (después de las rutas específicas) ====== */
router.get('/:id', optionalAuth, async (req, res) => {
  const Order = require('../models/order');
  try {
    const row = await Order.findById(req.params.id);
    if (!row) return res.status(404).json({ ok:false, msg:'No encontrado' });
    res.json({ ok:true, data: row });
  } catch (e) {
    res.status(500).json({ ok:false, msg:'Error', error: e.message });
  }
});

/* ====== Lista usuario/guest ====== */
router.get('/', optionalAuth, async (req, res) => {
  const Order = require('../models/order');
  const { guestId, status } = req.query;
  const q = {};
  if (req.user?._id) q['customer.userId'] = req.user._id;
  if (guestId) q['customer.guestId'] = guestId;
  if (status) q['meta.status'] = status;
  try {
    const rows = await Order.find(q).sort({ createdAt: -1 }).limit(50);
    res.json({ ok:true, data: rows });
  } catch (e) {
    res.status(500).json({ ok:false, msg:'Error', error: e.message });
  }
});

module.exports = router;
