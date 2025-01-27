const express = require("express");

const router = express.Router();

const KitchenController = require("../controllers/addKitchen");

router.post("/addkitchen", KitchenController.addKitchen);
router.get("/getkitchen", KitchenController.getKitchen);
router.delete("/deletekitchen/:kitchenid", KitchenController.deleteKitchenById);
router.put("/update/:kitchenId", KitchenController.updateKitchenByKitchenId);

module.exports = router;
