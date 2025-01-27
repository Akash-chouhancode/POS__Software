const express = require("express");

const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth=require("../middleware/authicantejwt")
const addfoodController = require("../controllers/addFood");

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

// Route for creating an item food
router.post(
  "/itemfood",
  upload.single("ProductImage"),auth,
  addfoodController.createItemFood
);

router.delete("/itemfood/:ProductsID", addfoodController.deleteItemFood);

router.get("/itemfood",addfoodController.getAllItemFoodDetails);
router.get("/itemfooddetail/:ProductID", addfoodController.getItemFoodDetails);
router.put(
  "/updateItemfood/:ProductID",
  upload.single("ProductImage"),auth,
  addfoodController.updateItemFood
);
module.exports = router;
