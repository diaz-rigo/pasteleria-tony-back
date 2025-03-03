const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dfpdb2cdl', 
  api_key: '211988337328655', 
  api_secret: 'g-Llv_MtEA8dRDXkZkg2BqzY-DE' 
});
module.exports = cloudinary;