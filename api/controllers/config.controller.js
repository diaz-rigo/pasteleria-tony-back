const Config = require('../models/SystemConfig');

// Obtener configuración actual (asume solo una)
exports.getConfig = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ error: 'No se encontró configuración' });
    }
    res.json(config);
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

// Crear configuración inicial
exports.createConfig = async (req, res) => {
  try {
    const existing = await Config.findOne();
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una configuración' });
    }

    const config = new Config(req.body);
    await config.save();
    res.status(201).json(config);
  } catch (err) {
    console.error('Error al crear configuración:', err);
    res.status(400).json({ error: 'Error al crear configuración' });
  }
};

// Actualizar configuración por ID
exports.updateConfig = async (req, res) => {
  try {
    const config = await Config.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    res.json(config);
  } catch (err) {
    console.error('Error al actualizar configuración:', err);
    res.status(400).json({ error: 'Error al actualizar configuración' });
  }
};
