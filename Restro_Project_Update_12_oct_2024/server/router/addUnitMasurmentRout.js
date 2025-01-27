const express = require("express");
const router = express.Router();
const UnitMasurmentController = require("../controllers/addUnitMasurment");

router.post("/addmasurmentunit", UnitMasurmentController.createUnitMeasurement);
router.get("/getmasurmentunit", UnitMasurmentController.getUnitMeasurements);
router.delete(
  "/deletemasurmentunit/:id",
  UnitMasurmentController.deleteUnitMeasurement
);

router.get('/units/:id', UnitMasurmentController.getUnitMeasurementById);
router.put(
  "/updatemasurmentunit/:id",
  UnitMasurmentController.updateUnitMeasurement
);


module.exports = router;
