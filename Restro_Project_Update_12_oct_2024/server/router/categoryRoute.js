const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const dataController = require("../controllers/addCategory");
const auth =require("../middleware/authicantejwt")
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "asset/category");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: multerStorage,
});

router.get("/data", dataController.getCategory);
router.post("/data", upload.single("image"),auth,dataController.addCategory);
router.delete("/data/:id", dataController.deletCategory);
router.put("/data/:id", upload.single("image"),auth,dataController.updateCategory);

module.exports = router;
