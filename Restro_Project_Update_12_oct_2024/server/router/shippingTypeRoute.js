const express = require("express");
const router = express.Router();


const shippingControllers = require("../controllers/shippingType");


router.get('/shippingtype', shippingControllers.getAllShippingMethods);
router.post('/shippingtype', shippingControllers.createShippingMethod);
router.get('/shippingmethod/:id', shippingControllers.getShippingMethodById);
router.delete('/shippingmethod/:id', shippingControllers.deleteShippingMethod)
router.put("/shippingmethod/:id",shippingControllers.updateShippingMethod);
module.exports = router;