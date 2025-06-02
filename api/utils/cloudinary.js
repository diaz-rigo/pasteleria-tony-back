const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'deoqcgh3e', 
  api_key: '612357659575656', 
  api_secret: 'jPvtyttBrGRNADTwEki-_Cfwmzc' 
});
// cloudinary.config({ 
//   cloud_name: 'dfpdb2cdl', 
//   api_key: '211988337328655', 
//   api_secret: 'g-Llv_MtEA8dRDXkZkg2BqzY-DE' 
// });
module.exports = cloudinary;