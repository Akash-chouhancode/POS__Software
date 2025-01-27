const express = require("express");
const router = express.Router();
const auth=require("../middleware/authicantejwt")
const printController = require("../controllers/addPrinter");


router.post("/addprinter",auth, printController.addPrinter);
router.get("/getprinter", printController.getPrinter);
router.get('/printer/:id', printController.getPrinterById);
router.put('/printer/:id', printController.updatePrinter);
router.delete('/printer/:id', printController.deletePrinter);
module.exports = router;
