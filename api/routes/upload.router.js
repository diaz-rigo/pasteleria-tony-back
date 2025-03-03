const express = require("express");
const router = express.Router();

const upload = require('../middlewares/upload');
const upload_controller = require('../controllers/upload.controller');

router.post("/upload-images", upload.array('images', 10), upload_controller.uploadImagesToCloudinary);

module.exports = router;
