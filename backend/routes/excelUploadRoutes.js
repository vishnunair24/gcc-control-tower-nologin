const express = require("express");
const multer = require("multer");
const router = express.Router();
const excelUploadController = require("../controllers/excelUploadController");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/replace",
  upload.single("file"),
  excelUploadController.replaceAll
);

module.exports = router;
