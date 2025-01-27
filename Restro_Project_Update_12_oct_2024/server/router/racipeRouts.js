const express = require("express");
const auth=require("../middleware/authicantejwt")
const router = express.Router();
const recipecontroller= require("../controllers/recipemanagement")
router.get("/productionsetlist",recipecontroller.getalldetailsProductiondetails)
router.get("/variantdata", recipecontroller.foodWithVariant);
router.get('/foodname', recipecontroller.foodNameFetchApi);
router.post('/productiondata',auth, recipecontroller.createProduction);
//Supplier Ledger get route

router.get("/supplierledger",recipecontroller.getPurchaseTransactions)

// Set production Unit
router.get("/productionunitingredients", recipecontroller.getAllStockIngredients);
router.get("/productionunitingredientss", recipecontroller.getAllStockIngredientswithone);
router.get('/priceperitem/:id', recipecontroller.getPerItemPrice)

router.post('/productiondetail',auth,recipecontroller.createproduction);
// get details by id for edit
router.get('/productiondetail/:foodid/:pvarientid',recipecontroller.findbyIdProductiondetails);
router.get('/viewproductiondetail/:foodid/:pvarientid',recipecontroller.viewProductiondetails);
router.put('/productiondetail/:foodnameid/:pvarientnameid',recipecontroller.updateProductionDetail)

// to show data in below
router.get('/productiondetails',recipecontroller.getProductionDetails)
module.exports = router;