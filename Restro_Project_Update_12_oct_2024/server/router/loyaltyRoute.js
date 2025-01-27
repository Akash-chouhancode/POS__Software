const express = require("express");

const router = express.Router();

const pointcontroller= require("../controllers/loyalty");



router.post("/loyaltypoint", pointcontroller.createLoyaltyPoint);

// Get all loyalty point settings or search by amount/earn_point
router.get("/loyaltypoints", pointcontroller.getLoyaltyPoints);
router.delete("/loyaltypoint/:id", pointcontroller.deleteLoyaltyPoint);
router.put("/loyaltypoint/:id", pointcontroller.updateLoyaltyPoint);
router.get("/loyaltypoint/:id", pointcontroller.getLoyaltyPointById)
// for the show customer point list
router.get("/customerpoints", pointcontroller.getCustomerBillDetails);
module.exports=router;