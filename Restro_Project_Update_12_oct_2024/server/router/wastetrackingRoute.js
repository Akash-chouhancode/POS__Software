const express = require("express");
const auth=require("../middleware/authicantejwt")
const router = express.Router();
const wastetrackingcontroller=require("../controllers/wastetracking")
router.get('/packagingwaste', wastetrackingcontroller.getPackagingWasteDetails);
router.post('/packagepost',auth, wastetrackingcontroller.insertPackageInformation);

// Purchase food Waste
router.get('/foodwaste', wastetrackingcontroller.getPackageFoodWasteDetails);
// price accourding to incrident
router.get('/lprice/:id', wastetrackingcontroller.getTotalPrice);
router.post('/foodwaste', auth,wastetrackingcontroller.insertingRdInformation);

// making food waste
router.get('/makefoods',wastetrackingcontroller.showItemsFoodWaste)
// get price accourding food name and variant
router.get('/getlostprice',wastetrackingcontroller.getalldetailsProductiondetails);
// post 
router.post('/makeingfoodwaste',auth,wastetrackingcontroller.insertFoodInformation);

module.exports= router